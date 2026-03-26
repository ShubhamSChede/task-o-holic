import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

export async function POST(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params
  const supabaseUser = await createClient()
  const supabaseAdmin = createAdminClient()

  const {
    data: { session },
  } = await supabaseUser.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    data: member,
  } = await supabaseUser
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const fileBlob = formData.get('file')

  if (!fileBlob || !(fileBlob instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const assetKey = randomUUID()
  const fileWithName = fileBlob as Blob & { name?: string }
  const fileName = fileWithName.name ? String(fileWithName.name) : 'asset'
  const contentType = fileBlob.type || 'application/octet-stream'

  // Supabase Storage keys are sensitive to invalid/unicode characters and percent-encoding.
  // We generate a safe filename for the storage object.
  const extMatch = fileName.match(/\.[a-zA-Z0-9]+$/)
  const ext = extMatch ? extMatch[0].toLowerCase() : ''
  const safeFileName = `asset${ext}`

  const storagePath = `${orgId}/${assetKey}/${safeFileName}`

  const buffer = Buffer.from(await fileBlob.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('tldraw-assets')
    .upload(storagePath, buffer, { contentType, upsert: false })

  if (uploadError) {
    const uploadErrExtras = uploadError as unknown as {
      code?: string
      details?: unknown
    }
    const uploadDetails =
      uploadErrExtras.details !== undefined ? uploadErrExtras.details : null
    const uploadCode = uploadErrExtras.code ? String(uploadErrExtras.code) : null

    console.error('[tldraw assets upload] storage upload failed', {
      orgId,
      bucket: 'tldraw-assets',
      storagePath,
      fileName,
      contentType,
      sizeBytes: buffer.byteLength,
      message: uploadError.message,
      code: uploadCode,
      details: uploadDetails,
    })

    const details =
      uploadDetails !== null ? ` - ${String(uploadDetails)}` : ''
    const code = uploadCode ? ` (code: ${uploadCode})` : ''
    return NextResponse.json(
      { error: `${uploadError.message}${code}${details}` },
      { status: 500 }
    )
  }

  const sizeBytes = buffer.byteLength

  const { error: assetInsertError } = await supabaseAdmin
    .from('tldraw_assets')
    .insert({
      org_id: orgId,
      asset_key: assetKey,
      file_path: storagePath,
      mime_type: contentType,
      size_bytes: sizeBytes,
      created_by: session.user.id,
    })

  if (assetInsertError) {
    const insertErrExtras = assetInsertError as unknown as {
      code?: string
      details?: unknown
    }
    const insertDetails =
      insertErrExtras.details !== undefined ? insertErrExtras.details : null
    const insertCode = insertErrExtras.code
      ? String(insertErrExtras.code)
      : null

    console.error('[tldraw assets upload] asset insert failed', {
      orgId,
      assetKey,
      storagePath,
      message: assetInsertError.message,
      code: insertCode,
      details: insertDetails,
    })

    const details =
      insertDetails !== null ? ` - ${String(insertDetails)}` : ''
    const code = insertCode ? ` (code: ${insertCode})` : ''
    return NextResponse.json(
      { error: `${assetInsertError.message}${code}${details}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    src: `/api/tldraw/orgs/${orgId}/assets/resolve?assetKey=${assetKey}`,
  })
}


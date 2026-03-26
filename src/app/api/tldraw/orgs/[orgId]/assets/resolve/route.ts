import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
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
    console.error('[tldraw assets resolve] unauthorized', { orgId })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const assetKey = searchParams.get('assetKey')

  if (!assetKey) {
    console.error('[tldraw assets resolve] missing assetKey', { orgId })
    return NextResponse.json({ error: 'Missing assetKey' }, { status: 400 })
  }

  const { data: member } = await supabaseUser
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!member) {
    console.error('[tldraw assets resolve] forbidden', {
      orgId,
      userId: session.user.id,
      assetKey,
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: asset, error: assetError } = await supabaseAdmin
    .from('tldraw_assets')
    .select('file_path')
    .eq('org_id', orgId)
    .eq('asset_key', assetKey)
    .maybeSingle()

  if (assetError) {
    console.error('[tldraw assets resolve] asset select failed', {
      orgId,
      assetKey,
      message: assetError.message,
      code: assetError.code,
    })
    return NextResponse.json({ error: assetError.message }, { status: 500 })
  }

  if (!asset?.file_path) {
    console.error('[tldraw assets resolve] asset not found', {
      orgId,
      assetKey,
    })
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
    .from('tldraw-assets')
    .createSignedUrl(asset.file_path, 60 * 60)

  if (signError || !signedUrlData?.signedUrl) {
    const signErrExtras = signError as unknown as { details?: unknown; code?: unknown }
    const signDetailsValue =
      signErrExtras.details !== undefined ? signErrExtras.details : null
    const signCodeValue =
      signErrExtras.code !== undefined ? String(signErrExtras.code) : null

    console.error('[tldraw assets resolve] signed url failed', {
      orgId,
      assetKey,
      storagePath: asset.file_path,
      message: signError?.message ?? null,
      code: signCodeValue,
      details: signDetailsValue,
    })
    return NextResponse.json(
      { error: signError?.message ?? 'Failed to create signed URL' },
      { status: 500 }
    )
  }

  // Helps confirm the endpoint is being hit and generating the final URL.
  console.log('[tldraw assets resolve] ok', {
    orgId,
    assetKey,
    storagePath: asset.file_path,
  })
  return NextResponse.redirect(signedUrlData.signedUrl)
}


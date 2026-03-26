import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
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

  const { data: member } = await supabaseUser
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('tldraw_room_state')
    .select('snapshot')
    .eq('org_id', orgId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ snapshot: data?.snapshot ?? null })
}

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

  const body = await request.json().catch(() => null)
  const snapshot = body?.snapshot

  if (!snapshot) {
    return NextResponse.json({ error: 'Missing snapshot' }, { status: 400 })
  }

  const { data: member } = await supabaseUser
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('tldraw_room_state')
    .upsert(
      {
        org_id: orgId,
        snapshot,
      },
      { onConflict: 'org_id' }
    )

  if (error) {
    let snapshotSize = 0
    try {
      snapshotSize = Buffer.byteLength(JSON.stringify(snapshot))
    } catch {
      snapshotSize = -1
    }

    const errorExtras = error as unknown as { details?: unknown }
    const detailsValue = errorExtras.details !== undefined ? errorExtras.details : null

    console.error('[tldraw snapshot] upsert failed', {
      orgId,
      message: error.message,
      code: error.code,
      details: detailsValue,
      snapshotSizeBytes: snapshotSize,
    })

    const details =
      detailsValue !== null ? ` - ${String(detailsValue)}` : ''
    const code = error.code ? ` (code: ${error.code})` : ''
    const extended = `${error.message}${code}${details}`

    return NextResponse.json(
      { error: extended, snapshotSizeBytes: snapshotSize },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}


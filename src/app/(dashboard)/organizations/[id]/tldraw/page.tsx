import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import OrganizationTldraw from '@/components/tldraw/organization-tldraw'
import type { TLEditorSnapshot } from 'tldraw'

export default async function OrganizationTldrawPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: orgId } = await params
  const supabaseUser = await createClient()
  const supabaseAdmin = createAdminClient()

  const {
    data: { session },
  } = await supabaseUser.auth.getSession()

  if (!session) return null

  const { data: member } = await supabaseUser
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!member) notFound()

  // Latest-only snapshot per org
  const { data: stateData } = await supabaseAdmin
    .from('tldraw_room_state')
    .select('snapshot')
    .eq('org_id', orgId)
    .maybeSingle()

  const initialSnapshot = (stateData?.snapshot ?? null) as
    | TLEditorSnapshot
    | null

  return <OrganizationTldraw orgId={orgId} initialSnapshot={initialSnapshot} />
}


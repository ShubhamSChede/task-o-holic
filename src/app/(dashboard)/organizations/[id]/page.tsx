// src/app/(dashboard)/organizations/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MembersList from '@/components/organization/members-list';
import OrganizationTasks from '@/components/organization/organization-tasks';
import type { Todo, FrequentTask, Organization } from '@/types/supabase';
import OrganizationTldrawMiniPreview from '@/components/tldraw/organization-tldraw-mini-preview'
import type { TLEditorSnapshot } from 'tldraw'
import OrganizationChat from '@/components/organization/organization-chat'
import FrequentTaskTemplatesCard from '@/components/organization/frequent-task-templates-card'



type TodoWithProfile = Todo & {
  profiles?: {
    full_name: string | null;
  } | null;
};

type OrgMessageWithProfile = {
  id: string
  organization_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: { full_name: string | null } | null
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }

  // Await the params to get the id
  const { id } = await params;
  
  // Check if user is a member of this organization
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id, role')
    .eq('organization_id', id)
    .eq('user_id', session.user.id)
    .single();
  
  if (membershipError || !membership) {
    notFound();
  }
  
  // Fetch organization details
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (orgError || !organization) {
    notFound();
  }

  const org = organization as Organization;
  
  // Check if user is the creator
  const isCreator = org.created_by === session.user.id;
  
  // Fetch organization members
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        full_name
      )
    `)
    .eq('organization_id', id)
    .order('joined_at');
  
  if (membersError) {
    console.error('Error fetching members:', membersError);
  }
  
  // Fetch organization todos
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*, profiles(full_name)')
    .eq('organization_id', id)
    .order('created_at', { ascending: false });
  
  if (todosError) {
    console.error('Error fetching todos:', todosError);
  }
  
  // Fetch frequent tasks for this organization
  const { data: frequentTasks } = await supabase
    .from('frequent_tasks')
    .select('*')
    .eq('organization_id', id)
    .order('created_at', { ascending: false });

  const { data: initialMessages } = await supabase
    .from('organization_messages')
    .select('*, profiles(full_name)')
    .eq('organization_id', id)
    .order('created_at', { ascending: true })
    .limit(50)

  // Latest-only tldraw snapshot for mini preview
  const { data: stateData } = await supabaseAdmin
    .from('tldraw_room_state')
    .select('snapshot')
    .eq('org_id', id)
    .maybeSingle()

  const initialSnapshot = (stateData?.snapshot ?? null) as
    | TLEditorSnapshot
    | null
  
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 sm:px-0">
      {/* Breadcrumb + sticky header */}
      <div className="sticky top-0 z-30 -mx-2 border-b border-slate-900/70 bg-slate-950/70 px-2 py-4 backdrop-blur sm:rounded-2xl sm:border sm:border-slate-900/70 sm:bg-slate-950/50 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/organizations" className="hover:text-slate-200">
                Organizations
              </Link>
              <span className="text-slate-600">/</span>
              <span className="truncate text-slate-300">{org.name}</span>
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold text-slate-50 sm:text-3xl">
              {org.name}
            </h1>
            {org.description ? (
              <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-slate-300">
                {org.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/todo/create?org=${id}`}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Create task
            </Link>
            <Link
              href={`/organizations/${id}/tldraw`}
              className="rounded-full border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/60 hover:bg-slate-800/60"
            >
              Open canvas
            </Link>
            {isCreator ? (
              <Link
                href={`/organizations/${id}/edit`}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
              >
                Edit
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/90" />
            Member
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-200">
            Members: <span className="ml-1 font-semibold">{members?.length || 0}</span>
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-200">
            Tasks: <span className="ml-1 font-semibold">{todos?.length || 0}</span>
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-200">
            Templates:{' '}
            <span className="ml-1 font-semibold">{frequentTasks?.length || 0}</span>
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Primary work area */}
        <div className="lg:col-span-8 space-y-6">
          <div id="canvas" className="scroll-mt-28 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-medium text-slate-50 sm:text-lg">
                  Canvas
                </h2>
                <p className="text-sm text-slate-400">
                  A quick preview of the latest saved board.
                </p>
              </div>
              <Link
                href={`/organizations/${id}/tldraw`}
                className="rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/60 hover:bg-slate-800/60"
              >
                View full canvas
              </Link>
            </div>
            <OrganizationTldrawMiniPreview snapshot={initialSnapshot} />
          </div>

          <div id="tasks" className="scroll-mt-28">
            <OrganizationTasks
              organizationId={id}
              userId={session.user.id}
              initialTodos={(todos || []) as TodoWithProfile[]}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <MembersList 
            members={members || []} 
            organizationId={id}
            isCreator={isCreator}
            currentUserId={session.user.id}
          />

          <div id="chat" className="scroll-mt-28">
            <OrganizationChat
              organizationId={id}
              currentUserId={session.user.id}
              initialMessages={(initialMessages || []) as OrgMessageWithProfile[]}
            />
          </div>
          
          <div id="templates" className="scroll-mt-28">
            <FrequentTaskTemplatesCard
              organizationId={id}
              frequentTasks={(frequentTasks || []) as FrequentTask[]}
              isCreator={isCreator}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
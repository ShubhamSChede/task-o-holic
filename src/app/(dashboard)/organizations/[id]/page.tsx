// src/app/(dashboard)/organizations/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MembersList from '@/components/organization/members-list';
import OrganizationTasks from '@/components/organization/organization-tasks';
import type { Todo, FrequentTask, Organization, OrganizationMember } from '@/types/supabase';



type TodoWithProfile = Todo & {
  profiles?: {
    full_name: string | null;
  } | null;
};

type MemberWithProfile = OrganizationMember & {
  profiles?: {
    id: string;
    full_name: string | null;
  } | null;
};

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
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
  console.log('Fetching members for organization:', id);
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
  
  console.log('Members query result:', { members, membersError });
  
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
  
  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header - Responsive layout for small screens */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">{org.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/todo/create?org=${id}`}
            className="mt-2 rounded-full bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 sm:px-4 sm:py-2"
          >
            Create Task
          </Link>
          {isCreator && (
            <Link
              href={`/organizations/${id}/edit`}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-800 sm:px-4 sm:py-2"
            >
              Edit Organization
            </Link>
          )}
        </div>
      </div>
      
      {/* Organization Details */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] sm:p-6">
        {org.description && (
          <div className="mb-4">
            <h2 className="mb-2 text-lg font-medium text-slate-50">Description</h2>
            <p className="text-sm text-slate-300 sm:text-base">{org.description}</p>
          </div>
        )}
        
          <div className="flex flex-col gap-y-2 sm:flex-row sm:gap-x-6">
          <div>
            <span className="text-sm text-slate-500">Created by:</span>{' '}
            <span className="font-medium text-slate-100">
              {org.created_by === session.user.id 
                ? 'You' 
                : ((members || []) as MemberWithProfile[]).find(
                    (m) => m.user_id === org.created_by,
                  )?.profiles?.full_name || 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-sm text-slate-500">Members:</span>{' '}
            <span className="font-medium text-slate-100">{members?.length || 0}</span>
          </div>
          <div>
            <span className="text-sm text-slate-500">Tasks:</span>{' '}
            <span className="font-medium text-slate-100">{todos?.length || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Responsive grid layout - Tasks on left, Members & Templates on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Tasks Column - Scrollable on left, 2/3 width on desktop */}
        <div className="lg:col-span-2 flex">
          <OrganizationTasks
            organizationId={id}
            userId={session.user.id}
            initialTodos={(todos || []) as TodoWithProfile[]}
          />
        </div>
        
        {/* Right Column - Members & Frequent Tasks, 1/3 width on desktop */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          {/* Members */}
          <MembersList 
            members={members || []} 
            organizationId={id}
            isCreator={isCreator}
            currentUserId={session.user.id}
          />
          
          {/* Frequent Tasks Templates */}
          <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-base font-medium text-slate-50 sm:text-lg">Frequent task templates</h2>
              {isCreator && (
                <Link
                  href={`/frequent-tasks/create?org=${id}`}
                  className="text-xs font-medium text-cyan-300 hover:text-cyan-200 sm:text-sm"
                >
                  Add Template
                </Link>
              )}
            </div>
            
            {frequentTasks && frequentTasks.length > 0 ? (
              <ul className="divide-y divide-slate-800/80">
                {frequentTasks.map((task: FrequentTask) => (
                  <li key={task.id} className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-50">{task.title}</p>
                        {task.description && (
                          <p className="mt-1 text-xs text-slate-300 sm:text-sm">{task.description}</p>
                        )}
                        <div className="flex flex-wrap mt-2 gap-1 sm:gap-2">
                          {task.priority && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                task.priority === 'high'
                                  ? 'bg-red-500/15 text-red-300 border border-red-500/40'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-400/10 text-amber-200 border border-amber-300/40'
                                  : 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/40'
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                          {task.tags && task.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-slate-200 ring-1 ring-slate-700/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Mobile-friendly link */}
                      <Link
                        href={`/todo/create?template=${task.id}`}
                        className="inline-block rounded-md border border-slate-700 px-2 py-1 text-xs text-cyan-300 hover:bg-slate-900 hover:text-cyan-200 sm:text-sm"
                      >
                        Use Template
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-4 text-center text-sm text-slate-400 sm:px-6">
                No frequent task templates yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// src/app/(dashboard)/frequent-tasks/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import FrequentTaskItem from '@/components/frequent-task/frequent-task-item';
import type { FrequentTask } from '@/types/supabase';

// Extended type for joined data
type FrequentTaskWithOrg = FrequentTask & {
  organizations?: {
    name: string;
  };
};

export default async function FrequentTasksPage() {
  // Add 'await' to fix the Promise issue
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Fetch organizations created by the user
  const { data: createdOrganizationsData } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('created_by', session.user.id);
  
  const createdOrganizations = (createdOrganizationsData as { id: string; name: string }[] | null);
  
  // If user hasn't created any organizations, show appropriate message
  if (!createdOrganizations || createdOrganizations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Frequent Task Templates</h1>
        
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">You haven&apos;t created any organizations yet.</p>
          <p className="text-gray-500">Only organization creators can manage frequent task templates.</p>
          <Link href="/organizations/create" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Create Organization
          </Link>
        </div>
      </div>
    );
  }
  
  // Get organization IDs
  const orgIds = createdOrganizations.map((org) => org.id);
  
  // Fetch frequent tasks for all organizations created by the user
  const { data: frequentTasks } = await supabase
    .from('frequent_tasks')
    .select(`
      *,
      organizations (
        name
      )
    `)
    .in('organization_id', orgIds)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Frequent task templates</h1>
        <Link
          href="/frequent-tasks/create"
          className="mt-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
        >
          Create template
        </Link>
      </div>
      
      {/* Explanation */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
        <p>
          Frequent task templates let you spin up common workflows in a click. Define rituals and checklists once, reuse them across
          your organizations.
        </p>
      </div>
      
      {/* List of templates by organization */}
      {createdOrganizations.map((org) => {
        const orgTasks = frequentTasks?.filter((task: FrequentTaskWithOrg) => task.organization_id === org.id) || [];
        
        return (
          <div key={org.id} className="space-y-4">
            <h2 className="flex items-center text-xl font-semibold text-slate-50">
              <span>{org.name}</span>
              <Link
                href={`/frequent-tasks/create?org=${org.id}`}
                className="ml-3 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              >
                Add template
              </Link>
            </h2>
            
            {orgTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orgTasks.map((task: FrequentTaskWithOrg) => (
                  <FrequentTaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 text-center text-sm text-slate-400 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
                <p>No templates for this organization yet.</p>
                <Link
                  href={`/frequent-tasks/create?org=${org.id}`}
                  className="mt-2 inline-block text-cyan-300 hover:text-cyan-200"
                >
                  Create first template
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
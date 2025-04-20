// src/app/(dashboard)/frequent-tasks/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import FrequentTaskItem from '@/components/frequent-task/frequent-task-item';

// Define types to fix the 'any' type errors
type Organization = {
  id: string;
  name: string;
  created_by?: string;
};

type FrequentTask = {
  id: string;
  title: string;
  description: string | null;
  organization_id: string;
  created_at: string;
  created_by: string;
  priority: string | null;
  tags: string[] | null;
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
  const { data: createdOrganizations } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('created_by', session.user.id);
  
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
  
  // Get organization IDs - Add type annotation to 'org' parameter
  const orgIds = createdOrganizations.map((org: Organization) => org.id);
  
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
        <h1 className="text-2xl font-bold text-purple-800">Frequent Task Templates</h1>
        <Link href="/frequent-tasks/create" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
          Create Template
        </Link>
      </div>
      
      {/* Explanation */}
      <div className="bg-purple-50 text-purple-800 p-4 rounded-xl border border-purple-200">
        <p>
          Frequent task templates allow you to quickly create common tasks in your organizations.
          As an organization creator, you can define templates that will be available for all members.
        </p>
      </div>
      
      {/* List of templates by organization - Add type annotation to 'org' parameter */}
      {createdOrganizations.map((org: Organization) => {
        const orgTasks = frequentTasks?.filter((task: FrequentTask) => task.organization_id === org.id) || [];
        
        return (
          <div key={org.id} className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center text-purple-800">
              <span>{org.name}</span>
              <Link 
                href={`/frequent-tasks/create?org=${org.id}`} 
                className="ml-3 text-sm text-purple-600 hover:text-purple-800"
              >
                Add Template
              </Link>
            </h2>
            
            {orgTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orgTasks.map((task: FrequentTask) => (
                  <FrequentTaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 text-center">
                <p className="text-purple-500">No templates for this organization yet.</p>
                <Link 
                  href={`/frequent-tasks/create?org=${org.id}`} 
                  className="mt-2 inline-block text-purple-600 hover:text-purple-800"
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
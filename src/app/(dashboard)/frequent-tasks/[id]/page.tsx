// src/app/(dashboard)/frequent-tasks/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import FrequentTaskForm from '@/components/frequent-task/frequent-task-form';
import { notFound, redirect } from 'next/navigation';

export default async function EditFrequentTaskPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Fetch the frequent task
  const { data: task, error } = await supabase
    .from('frequent_tasks')
    .select('*, organizations(created_by)')
    .eq('id', params.id)
    .single();
  
  if (error || !task) {
    notFound();
  }
  
  // Check if user is the organization creator
  if (task.organizations?.created_by !== session.user.id) {
    redirect('/frequent-tasks');
  }
  
  // Fetch organizations created by the user
  const { data: createdOrganizations } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('created_by', session.user.id);
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Frequent Task Template</h1>
      <FrequentTaskForm
        mode="edit"
        initialData={{
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority || '',
          tags: task.tags || [],
        }}
        organizations={createdOrganizations || []}
        preSelectedOrgId={task.organization_id}
      />
    </div>
  );
}
// src/app/(dashboard)/frequent-tasks/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import FrequentTaskForm from '@/components/frequent-task/frequent-task-form';
import { notFound, redirect } from 'next/navigation';
import type { FrequentTask } from '@/types/supabase';

// Extended type for joined data
type TaskWithOrg = FrequentTask & {
  organizations?: {
    created_by: string;
  };
};

export default async function EditFrequentTaskPage({
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
  
  // Fetch the frequent task
  const { data: task, error } = await supabase
    .from('frequent_tasks')
    .select('*, organizations(created_by)')
    .eq('id', id)
    .single();
  
  if (error || !task) {
    notFound();
  }
  
  const taskWithOrg = task as TaskWithOrg;
  
  // Check if user is the organization creator
  if (taskWithOrg.organizations?.created_by !== session.user.id) {
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
          id: taskWithOrg.id,
          title: taskWithOrg.title,
          description: taskWithOrg.description || '',
          priority: taskWithOrg.priority || '',
          tags: taskWithOrg.tags || [],
        }}
        organizations={createdOrganizations || []}
        preSelectedOrgId={taskWithOrg.organization_id}
      />
    </div>
  );
}
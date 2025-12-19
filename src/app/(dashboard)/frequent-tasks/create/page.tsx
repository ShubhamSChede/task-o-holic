// src/app/(dashboard)/frequent-tasks/create/page.tsx
import { createClient } from '@/lib/supabase/server';
import FrequentTaskForm from '@/components/frequent-task/frequent-task-form';
import { redirect } from 'next/navigation';
import type { Organization } from '@/types/supabase';

export default async function CreateFrequentTaskPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Get org ID from query param if available
  const orgId = typeof searchParams.org === 'string' ? searchParams.org : undefined;
  
  // Fetch organizations created by the user
  const { data: createdOrganizations } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('created_by', session.user.id);
  
  // If user hasn't created any organizations, redirect to create organization page
  if (!createdOrganizations || createdOrganizations.length === 0) {
    redirect('/organizations/create');
  }
  
  // If org ID is provided, check if user is the creator
  if (orgId) {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('created_by')
      .eq('id', orgId)
      .single();
    
    if (error || !org) {
      redirect('/frequent-tasks');
    }
    
    // Type assertion: TypeScript doesn't properly infer type when selecting specific fields
    const organization = org as Pick<Organization, 'created_by'>;
    
    if (organization.created_by !== session.user.id) {
      redirect('/frequent-tasks');
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Create Frequent Task Template</h1>
      <FrequentTaskForm
        mode="create"
        organizations={createdOrganizations || []}
        preSelectedOrgId={orgId}
      />
    </div>
  );
}
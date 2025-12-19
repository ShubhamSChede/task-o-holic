// src/app/(dashboard)/organizations/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import OrgForm from '@/components/organization/org-form';
import type { Organization } from '@/types/supabase';

export default async function EditOrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  // Add 'await' here to properly resolve the Promise
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Fetch organization
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error || !organization) {
    notFound();
  }
  
  // Type assertion: TypeScript doesn't recognize that notFound() throws
  const org = organization as Organization;
  
  // Check if user is the creator
  if (org.created_by !== session.user.id) {
    redirect(`/organizations/${params.id}`);
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Organization</h1>
      <OrgForm 
        mode="edit" 
        initialData={{
          id: org.id,
          name: org.name,
          description: org.description || '',
          password: org.password,
        }} 
      />
    </div>
  );
}
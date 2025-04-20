// src/app/(dashboard)/organizations/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import OrgForm from '@/components/organization/org-form';

// Define Organization type for better type safety
type Organization = {
  id: string;
  name: string;
  description: string | null;
  password?: string | null;
  created_by: string;
};

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
  
  // Check if user is the creator
  if (organization.created_by !== session.user.id) {
    redirect(`/organizations/${params.id}`);
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Organization</h1>
      <OrgForm 
        mode="edit" 
        initialData={{
          id: organization.id,
          name: organization.name,
          description: organization.description || '',
          password: organization.password,
        }} 
      />
    </div>
  );
}
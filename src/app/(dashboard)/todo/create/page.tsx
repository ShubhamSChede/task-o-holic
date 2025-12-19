// src/app/(dashboard)/todo/create/page.tsx
import { createClient } from '@/lib/supabase/server';
import TodoForm from '@/components/todo/todo-form';
import type { OrganizationMember } from '@/types/supabase';

// Extended type for joined data
type OrgMemberWithOrg = OrganizationMember & {
  organizations?: {
    id: string;
    name: string;
  };
};

export default async function CreateTodoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Add 'await' to fix Promise error
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Get the org parameter from URL
  const params = await searchParams;
  const orgId = typeof params.org === 'string' ? params.org : undefined;
  
  let organizations: { id: string; name: string }[] = [];
  
  if (orgId) {
    // If org parameter is provided, fetch only that specific organization
    const { data: specificOrg } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single();
    
    if (specificOrg) {
      organizations = [specificOrg];
    }
  } else {
    // If no org parameter, fetch all user's organizations
    const { data: userOrganizations } = await supabase
      .from('organization_members')
      .select(`
        organizations (
          id,
          name
        )
      `)
      .eq('user_id', session.user.id);
    
    organizations = userOrganizations?.map((org: OrgMemberWithOrg) => ({
      id: org.organizations?.id || '',
      name: org.organizations?.name || '',
    })) || [];
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Create New Task</h1>
      <TodoForm
        mode="create"
        organizations={organizations}
      />
    </div>
  );
}

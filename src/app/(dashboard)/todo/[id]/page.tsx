// src/app/(dashboard)/todo/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import TodoForm from '@/components/todo/todo-form';
import { notFound, redirect } from 'next/navigation';
import type { Todo, OrganizationMember } from '@/types/supabase';

// Extended type for joined data
type OrgMemberWithOrg = OrganizationMember & {
  organizations?: {
    id: string;
    name: string;
  };
};

export default async function EditTodoPage({
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

  // Fetch the todo
  const { data: todo, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !todo) {
    notFound();
  }
  
  // Type assertion: TypeScript doesn't recognize that notFound() throws
  const todoItem = todo as Todo;
  
  // Check if user is the creator
  if (todoItem.created_by !== session.user.id) {
    redirect('/todo');
  }
  
  // Fetch user's organizations
  const { data: userOrganizations } = await supabase
    .from('organization_members')
    .select(`
      organizations (
        id,
        name
      )
    `)
    .eq('user_id', session.user.id);
  
  const organizations = userOrganizations?.map((org: OrgMemberWithOrg) => ({
    id: org.organizations?.id || '',
    name: org.organizations?.name || '',
  })) || [];
  
  const transformedTodo = {
    id: todoItem.id,
    title: todoItem.title,
    description: todoItem.description ?? undefined,
    due_date: todoItem.due_date ?? undefined,
    priority: todoItem.priority ?? undefined,
    tags: todoItem.tags ?? undefined,
    organization_id: todoItem.organization_id ?? undefined,
    is_complete: todoItem.is_complete
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
      <TodoForm
        mode="edit"
        initialData={transformedTodo}
        organizations={organizations}
      />
    </div>
  );
}
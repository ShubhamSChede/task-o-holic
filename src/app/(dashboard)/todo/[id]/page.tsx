// src/app/(dashboard)/todos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import TodoForm from '@/components/todo/todo-form';
import { notFound, redirect } from 'next/navigation';

// Define types for organization data and todo
type OrgMember = {
  organizations?: {
    id: string;
    name: string;
  };
};

type Todo = {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string | null;
  tags?: string[] | null;
  organization_id?: string | null;
  is_complete: boolean;
  created_by: string;
};

export default async function EditTodoPage({
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
  
  // Fetch the todo
  const { data: todo, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error || !todo) {
    notFound();
  }
  
  // Check if user is the creator
  if (todo.created_by !== session.user.id) {
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
  
  // Add type annotation to 'org' parameter
  const organizations = userOrganizations?.map((org: OrgMember) => ({
    id: org.organizations?.id || '',
    name: org.organizations?.name || '',
  })) || [];
  
  const transformedTodo = {
    id: todo.id,
    title: todo.title,
    description: todo.description ?? undefined,
    due_date: todo.due_date ?? undefined,
    priority: todo.priority ?? undefined,
    tags: todo.tags ?? undefined,
    organization_id: todo.organization_id ?? undefined,
    is_complete: todo.is_complete
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
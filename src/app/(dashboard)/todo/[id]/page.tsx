// src/app/(dashboard)/todos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import TodoForm from '@/components/todo/todo-form';
import { notFound, redirect } from 'next/navigation';

export default async function EditTodoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
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
    redirect('/todos');
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
  
  const organizations = userOrganizations?.map(org => ({
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
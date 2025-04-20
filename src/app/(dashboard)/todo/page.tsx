// src/app/(dashboard)/todos/page.tsx
"use client"
import { createClient } from '@/lib/supabase/server';
import TodoItem from '@/components/todo/todo-item';
import Link from 'next/link';

export default async function TodosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null; // This shouldn't happen due to layout protection
  }
  
  // Get filter parameters
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const priority = typeof searchParams.priority === 'string' ? searchParams.priority : undefined;
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;
  
  // Build query
  let query = supabase
    .from('todos')
    .select(`
      *,
      organizations (
        name
      )
    `)
    .eq('created_by', session.user.id)
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (status === 'complete') {
    query = query.eq('is_complete', true);
  } else if (status === 'incomplete') {
    query = query.eq('is_complete', false);
  }
  
  if (priority) {
    query = query.eq('priority', priority);
  }
  
  if (tag) {
    query = query.contains('tags', [tag]);
  }
  
  // Execute query
  const { data: todos, error } = await query;
  
  if (error) {
    console.error('Error fetching todos:', error);
    return <div>Error loading tasks. Please try again.</div>;
  }
  
  // Get all unique tags for filter dropdown
  const uniqueTags = new Set<string>();
  todos?.forEach(todo => {
    if (todo.tags) {
      todo.tags.forEach(tag => uniqueTags.add(tag));
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-800">My Tasks</h1>
        <Link href="/todos/create" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
          Create Task
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-purple-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              defaultValue={status || ''}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.value) {
                  url.searchParams.set('status', e.target.value);
                } else {
                  url.searchParams.delete('status');
                }
                window.location.href = url.toString();
              }}
              className="px-3 py-2 border border-purple-200 rounded-md text-sm text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-purple-700 mb-1">
              Priority
            </label>
            <select
              id="priority-filter"
              defaultValue={priority || ''}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.value) {
                  url.searchParams.set('priority', e.target.value);
                } else {
                  url.searchParams.delete('priority');
                }
                window.location.href = url.toString();
              }}
              className="px-3 py-2 border border-purple-200 rounded-md text-sm text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {uniqueTags.size > 0 && (
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-purple-700 mb-1">
                Tag
              </label>
              <select
                id="tag-filter"
                defaultValue={tag || ''}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set('tag', e.target.value);
                  } else {
                    url.searchParams.delete('tag');
                  }
                  window.location.href = url.toString();
                }}
                className="px-3 py-2 border border-purple-200 rounded-md text-sm text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {Array.from(uniqueTags).map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Todos List */}
      {todos && todos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              userId={session.user.id}
              organizationName={todo.organizations?.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-200">
          <p className="text-purple-500">No tasks found.</p>
          <Link href="/todos/create" className="mt-2 inline-block text-purple-600 hover:text-purple-800">
            Create your first task
          </Link>
        </div>
      )}
    </div>
  );
}
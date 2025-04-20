// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: recentTodos } = await supabase
    .from('todos')
    .select('*')
    .eq('created_by', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: todoStats, error: todoStatsError } = await supabase
    .rpc('get_todo_stats', { user_id: session.user.id });

  let totalTodos = 0;
  let completedTodos = 0;
  let pendingTodos = 0;

  if (todoStatsError) {
    const { data: allTodos } = await supabase
      .from('todos')
      .select('is_complete')
      .eq('created_by', session.user.id);

    if (allTodos) {
      totalTodos = allTodos.length;
      completedTodos = allTodos.filter((todo: { is_complete: boolean }) => todo.is_complete).length;
      pendingTodos = totalTodos - completedTodos;
    }
  } else if (todoStats) {
    totalTodos = todoStats.total;
    completedTodos = todoStats.completed;
    pendingTodos = todoStats.pending;
  }

  const { data: organizations } = await supabase
    .from('organization_members')
    .select(`
      organizations (
        id,
        name
      )
    `)
    .eq('user_id', session.user.id)
    .limit(5);

  return (
    <div className="space-y-6 bg-purple-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-purple-800">Dashboard</h1>
        <Link
          href="/todo/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition"
        >
          Create Todo
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-700">Total Tasks</h2>
          <p className="mt-2 text-3xl text-purple-900 font-bold">{totalTodos}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-700">Completion Rate</h2>
          <div className="mt-2 flex items-end">
            <p className="text-3xl font-bold text-purple-800">{Math.round((completedTodos / totalTodos) * 100)}%</p>
            <div className="ml-4 h-2 bg-purple-100 rounded-full flex-1">
              <div
                className="h-2 bg-purple-500 rounded-full"
                style={{ width: `${Math.round((completedTodos / totalTodos) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-700">Tasks Status</h2>
          <div className="mt-2 flex items-center space-x-4">
            <div>
              <p className="text-sm text-purple-500">Completed</p>
              <p className="text-xl font-semibold text-green-600">{completedTodos}</p>
            </div>
            <div>
              <p className="text-sm text-purple-500">Pending</p>
              <p className="text-xl font-semibold text-orange-500">{pendingTodos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-medium text-lg text-purple-800">Recent Tasks</h2>
          <Link href="/todo" className="text-purple-600 hover:text-purple-800 text-sm">
            View All
          </Link>
        </div>

        <div className="divide-y divide-purple-100">
          {recentTodos && recentTodos.length > 0 ? (
            recentTodos.map((todo: any) => (
              <div key={todo.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    todo.is_complete ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <Link 
                    href={`/todo/${todo.id}`} 
                    className={`font-medium ${
                      todo.is_complete ? 'text-gray-500 line-through' : 'text-purple-900'
                    }`}
                  >
                    {todo.title}
                  </Link>
                </div>
                <div className="ml-6 mt-1 text-xs text-purple-500">
                  {todo.due_date && <span>Due: {new Date(todo.due_date).toLocaleDateString()} • </span>}
                  {todo.priority && <span className="capitalize">{todo.priority} priority</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-purple-500">
              No tasks yet. Create your first task!
            </div>
          )}
        </div>
      </div>

      {/* Organizations */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-medium text-lg text-purple-800">My Organizations</h2>
          <Link href="/organizations" className="text-purple-600 hover:text-purple-800 text-sm">
            View All
          </Link>
        </div>

        <div className="divide-y divide-purple-100">
          {organizations && organizations.length > 0 ? (
            organizations.map((org: any) => (
              <Link 
                key={org.organizations.id} 
                href={`/organizations/${org.organizations.id}`}
                className="px-6 py-4 hover:bg-purple-50 flex items-center transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center font-medium mr-3">
                  {org.organizations.name.charAt(0)}
                </div>
                <span className="font-medium text-purple-900">{org.organizations.name}</span>
              </Link>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-purple-500">
              You&apos;re not part of any organization yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
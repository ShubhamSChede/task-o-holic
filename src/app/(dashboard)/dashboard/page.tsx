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

  // Safe calculation to prevent NaN
  const completionRate = totalTodos > 0 
    ? Math.round((completedTodos / totalTodos) * 100) 
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-6 py-4 sm:py-6 bg-purple-50 min-h-screen">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">Dashboard</h1>
        <Link
          href="/todo/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition w-full sm:w-auto text-center mt-2"
        >
          Create Task
        </Link>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Total Tasks Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-base sm:text-lg font-semibold text-purple-700">Total Tasks</h2>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl text-purple-900 font-bold">{totalTodos}</p>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-base sm:text-lg font-semibold text-purple-700">Completion Rate</h2>
          <div className="mt-1 sm:mt-2 flex items-end">
            <p className="text-2xl sm:text-3xl font-bold text-purple-800">{completionRate}%</p>
            <div className="ml-3 sm:ml-4 h-2 bg-purple-100 rounded-full flex-1">
              <div
                className="h-2 bg-purple-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Status Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-purple-200 sm:col-span-2 lg:col-span-1">
          <h2 className="text-base sm:text-lg font-semibold text-purple-700">Tasks Status</h2>
          <div className="mt-1 sm:mt-2 flex items-center gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm text-purple-500">Completed</p>
              <p className="text-lg sm:text-xl font-semibold text-green-600">{completedTodos}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-purple-500">Pending</p>
              <p className="text-lg sm:text-xl font-semibold text-orange-500">{pendingTodos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-medium text-base sm:text-lg text-purple-800">Recent Tasks</h2>
          <Link href="/todo" className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm">
            View All
          </Link>
        </div>

        <div className="divide-y divide-purple-100">
          {recentTodos && recentTodos.length > 0 ? (
            recentTodos.map((todo: any) => (
              <div key={todo.id} className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center">
                  <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full mr-2 sm:mr-3 flex-shrink-0 ${
                    todo.is_complete ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <Link 
                    href={`/todo/${todo.id}`} 
                    className={`font-medium text-sm sm:text-base line-clamp-1 ${
                      todo.is_complete ? 'text-gray-500 line-through' : 'text-purple-900'
                    }`}
                  >
                    {todo.title}
                  </Link>
                </div>
                <div className="ml-5 sm:ml-6 mt-0.5 sm:mt-1 text-xs text-purple-500 flex flex-wrap gap-x-2">
                  {todo.due_date && <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>}
                  {todo.priority && <span className="capitalize">{todo.priority} priority</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 sm:px-6 py-4 text-center text-purple-500 text-sm">
              No tasks yet. Create your first task!
            </div>
          )}
        </div>
      </div>

      {/* Organizations - Responsive Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-medium text-base sm:text-lg text-purple-800">My Organizations</h2>
          <Link href="/organizations" className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm">
            View All
          </Link>
        </div>

        {organizations && organizations.length > 0 ? (
          <div className="sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-2 sm:p-2">
            {organizations.map((org: any) => (
              <Link 
                key={org.organizations.id} 
                href={`/organizations/${org.organizations.id}`}
                className="px-4 sm:px-3 py-3 hover:bg-purple-50 flex items-center transition-colors sm:rounded-lg"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
                  {org.organizations.name.charAt(0)}
                </div>
                <span className="font-medium text-sm sm:text-base text-purple-900 truncate">
                  {org.organizations.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-4 text-center text-purple-500 text-sm">
            You&apos;re not part of any organization yet.
          </div>
        )}
      </div>
    </div>
  );
}
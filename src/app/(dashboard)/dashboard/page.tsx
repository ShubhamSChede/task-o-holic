// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = createClient();
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
      completedTodos = allTodos.filter(todo => todo.is_complete).length;
      pendingTodos = totalTodos - completedTodos;
    }
  } else if (todoStats) {
    totalTodos = todoStats.total || 0;
    completedTodos = todoStats.completed || 0;
    pendingTodos = todoStats.pending || 0;
  }

  const { data: userOrganizations } = await supabase
    .from('organization_members')
    .select(`
      organizations (
        id,
        name,
        description
      )
    `)
    .eq('user_id', session.user.id)
    .limit(3);

  const completionRate = totalTodos > 0
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

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
            <p className="text-3xl font-bold text-purple-800">{completionRate}%</p>
            <div className="ml-4 h-2 bg-purple-100 rounded-full flex-1">
              <div
                className="h-2 bg-purple-500 rounded-full"
                style={{ width: `${completionRate}%` }}
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

      {/* Recent Todos */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-purple-800">Recent Tasks</h2>
          <Link href="/todos" className="text-purple-600 hover:text-purple-800 text-sm">
            View all
          </Link>
        </div>

        {recentTodos && recentTodos.length > 0 ? (
          <ul className="divide-y divide-purple-100">
            {recentTodos.map((todo) => (
              <li key={todo.id} className="px-6 py-4 hover:bg-purple-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.is_complete}
                    readOnly
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${todo.is_complete ? 'line-through text-purple-400' : 'text-purple-900'}`}>
                      {todo.title}
                    </p>
                    {todo.due_date && (
                      <p className="text-xs text-purple-500">
                        Due: {new Date(todo.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {todo.priority && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                      todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-purple-500">
            No tasks yet. Create your first task!
          </div>
        )}
      </div>

      {/* Organizations */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-purple-800">My Organizations</h2>
          <Link href="/organizations" className="text-purple-600 hover:text-purple-800 text-sm">
            View all
          </Link>
        </div>

        {userOrganizations && userOrganizations.length > 0 ? (
          <ul className="divide-y divide-purple-100">
            {userOrganizations.map((org) => (
              <li key={org.organizations?.id} className="px-6 py-4">
                <Link href={`/organizations/${org.organizations?.id}`} className="block hover:bg-purple-50">
                  <p className="text-sm font-semibold text-purple-900">{org.organizations?.name}</p>
                  {org.organizations?.description && (
                    <p className="text-sm text-purple-500 truncate">{org.organizations?.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-purple-500">
            <p className="text-purple-500">You&apos;re not part of any organization yet.</p>
            <div className="mt-2">
              <Link href="/organizations/create" className="text-purple-600 hover:text-purple-800 text-sm">
                Create Organization
              </Link>
              {' or '}
              <Link href="/organizations/join" className="text-purple-600 hover:text-purple-800 text-sm">
                Join Organization
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// This is a helper RPC function you'll need to create in Supabase
/*
CREATE OR REPLACE FUNCTION get_todo_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  pending_count INTEGER;
BEGIN
  SELECT 
    COUNT(*), 
    COUNT(*) FILTER (WHERE is_complete = true),
    COUNT(*) FILTER (WHERE is_complete = false)
  INTO 
    total_count, 
    completed_count,
    pending_count
  FROM todos 
  WHERE created_by = user_id;
  
  RETURN json_build_object(
    'total', total_count,
    'completed', completed_count,
    'pending', pending_count
  );
END;
$$ LANGUAGE plpgsql;
*/
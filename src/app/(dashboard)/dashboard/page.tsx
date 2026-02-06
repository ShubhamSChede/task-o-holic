// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Todo, OrganizationMember } from '@/types/supabase';

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

  // Type for RPC function result
  type TodoStats = {
    total: number;
    completed: number;
    pending: number;
  };

  const { data: todoStats, error: todoStatsError } = await supabase
    // @ts-expect-error - Supabase RPC type inference issue
    .rpc('get_todo_stats', { user_id: session.user.id });
  
  // Type assertion for RPC result
  const stats = todoStats as TodoStats | null;

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
      completedTodos = allTodos.filter((todo: Todo) => todo.is_complete).length;
      pendingTodos = totalTodos - completedTodos;
    }
  } else if (stats) {
    totalTodos = stats.total;
    completedTodos = stats.completed;
    pendingTodos = stats.pending;
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
    <div className="min-h-screen space-y-6 bg-transparent px-3 py-4 sm:space-y-8 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Mission Control
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            A snapshot of what matters today across your personal work and
            organizations.
          </p>
        </div>
        <Link
          href="/todo/create"
          className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(8,47,73,0.65)] transition hover:bg-cyan-300 sm:px-5"
        >
          New task
          <span className="ml-2 text-base leading-none">+</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        {/* Total Tasks */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" />
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Tasks
          </h2>
          <p className="mt-3 text-3xl font-semibold text-slate-50 sm:text-4xl">
            {totalTodos}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Everything assigned to you, across spaces.
          </p>
        </div>

        {/* Completion Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 sm:p-6">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-300" />
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Completion Rate
          </h2>
          <div className="mt-3 flex items-end gap-4">
            <p className="text-3xl font-semibold text-emerald-300 sm:text-4xl">
              {completionRate}%
            </p>
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                You&apos;re ahead of{' '}
                <span className="font-medium text-slate-200">most teams</span>{' '}
                when this is above 70%.
              </p>
            </div>
          </div>
        </div>

        {/* Status Split */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 sm:col-span-2 sm:p-6 lg:col-span-1">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300" />
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Status Split
          </h2>
          <div className="mt-3 flex items-center gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Completed
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-300">
                {completedTodos}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Pending
              </p>
              <p className="mt-1 text-xl font-semibold text-amber-300">
                {pendingTodos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-sm font-medium text-slate-50 sm:text-base">
              Recent tasks
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              The last few moves you or your team made.
            </p>
          </div>
          <Link
            href="/todo"
            className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentTodos && recentTodos.length > 0 ? (
            recentTodos.map((todo: Todo) => (
              <div key={todo.id} className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center">
                  <div
                    className={`mr-3 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      todo.is_complete ? 'bg-emerald-400' : 'bg-amber-300'
                    }`}
                  />
                  <Link
                    href={`/todo/${todo.id}`}
                    className={`line-clamp-1 text-sm font-medium ${
                      todo.is_complete
                        ? 'text-slate-500 line-through'
                        : 'text-slate-100'
                    }`}
                  >
                    {todo.title}
                  </Link>
                </div>
                <div className="ml-5 mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-400">
                  {todo.due_date && (
                    <span>
                      Due:{' '}
                      {new Date(todo.due_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  {todo.priority && (
                    <span className="capitalize">
                      {todo.priority} priority
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
              No tasks yet. Create your first task to see momentum build.
            </div>
          )}
        </div>
      </div>

      {/* Organizations */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-sm font-medium text-slate-50 sm:text-base">
              My organizations
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              Spaces where you collaborate and share execution.
            </p>
          </div>
          <Link
            href="/organizations"
            className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
          >
            Manage
          </Link>
        </div>

        {organizations && organizations.length > 0 ? (
          <div className="sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-2 sm:p-2">
            {organizations
              .filter(
                (
                  org: OrganizationMember & {
                    organizations?: { id: string; name: string };
                  },
                ) => org.organizations,
              )
              .map(
                (
                  org: OrganizationMember & {
                    organizations: { id: string; name: string };
                  },
                ) => (
                  <Link
                    key={org.organizations.id}
                    href={`/organizations/${org.organizations.id}`}
                    className="flex items-center px-4 py-3 transition-colors hover:bg-slate-900/80 sm:rounded-xl sm:px-3"
                  >
                    <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-cyan-200">
                      {org.organizations.name.charAt(0)}
                    </div>
                    <span className="truncate text-sm font-medium text-slate-100">
                      {org.organizations.name}
                    </span>
                  </Link>
                ),
              )}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
            You&apos;re not part of any organization yet. Create one to share
            recurring rituals and shared backlogs.
          </div>
        )}
      </div>
    </div>
  );
}
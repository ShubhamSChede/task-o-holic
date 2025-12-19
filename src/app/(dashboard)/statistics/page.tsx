// src/app/(dashboard)/statistics/page.tsx
import { createClient } from '@/lib/supabase/server';
import StatisticsCharts from '@/components/dashboard/statistics-charts';
import type { Todo } from '@/types/supabase';

export default async function StatisticsPage() {
  // Add 'await' here to fix Promise error
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Fetch all todos for the user
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('created_by', session.user.id);
  
  if (!todos || todos.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-purple-800">Statistics</h1>
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-200">
          <p className="text-purple-500">You don&apos;t have any tasks yet.</p>
          <p className="text-purple-500">Create tasks to see statistics.</p>
        </div>
      </div>
    );
  }
  
  // Calculate statistics
  
  // 1. Tasks by priority
  const priorityMap = new Map<string, number>();
  todos.forEach((todo: Todo) => {
    const priority = todo.priority || 'none';
    priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
  });
  
  const todosByPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
    priority: priority === 'none' ? 'No Priority' : priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
  }));
  
  // 2. Tasks by status
  const completedCount = todos.filter((todo: Todo) => todo.is_complete).length;
  const pendingCount = todos.length - completedCount;
  
  const todosByStatus = [
    { status: 'Completed', count: completedCount },
    { status: 'Pending', count: pendingCount },
  ];
  
  // 3. Tasks by tag
  const tagMap = new Map<string, number>();
  todos.forEach((todo: Todo) => {
    if (todo.tags && todo.tags.length > 0) {
      todo.tags.forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    } else {
      tagMap.set('untagged', (tagMap.get('untagged') || 0) + 1);
    }
  });
  
  const todosByTag = Array.from(tagMap.entries())
    .map(([tag, count]) => ({
      tag: tag === 'untagged' ? 'No Tag' : tag,
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count in descending order
  
  // 4. Completion rate over time
  // Group todos by date
  const dateMap = new Map<string, { completed: number; total: number }>();
  
  // Ensure we have data for the last 30 days (or as many days as we have data for)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { completed: 0, total: 0 });
  }
  
  // Populate with actual data
  todos.forEach((todo: Todo) => {
    const createdAt = new Date(todo.created_at);
    const dateStr = createdAt.toISOString().split('T')[0];
    
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { completed: 0, total: 0 });
    }
    
    const entry = dateMap.get(dateStr)!;
    entry.total += 1;
    if (todo.is_complete) {
      entry.completed += 1;
    }
  });
  
  const completionRateOverTime = Array.from(dateMap.entries())
    .map(([date, { completed, total }]) => ({
      date,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
  
  const statisticsData = {
    todosByPriority,
    todosByStatus,
    todosByTag,
    completionRateOverTime,
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-800">Statistics</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-medium text-purple-800">Total Tasks</h2>
          <p className="mt-2 text-3xl font-bold text-purple-900">{todos.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-medium text-purple-800">Completion Rate</h2>
          <div className="mt-2 flex items-end">
            <p className="text-3xl font-bold text-purple-900">
              {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-medium text-purple-800">Tasks Status</h2>
          <div className="mt-2 flex items-center space-x-4">
            <div>
              <p className="text-sm text-purple-500">Completed</p>
              <p className="text-xl font-semibold text-green-600">{completedCount}</p>
            </div>
            <div>
              <p className="text-sm text-purple-500">Pending</p>
              <p className="text-xl font-semibold text-orange-500">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <StatisticsCharts data={statisticsData} />
    </div>
  );
}
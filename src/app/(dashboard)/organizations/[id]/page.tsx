// src/app/(dashboard)/organizations/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MembersList from '@/components/organization/members-list';
import TodoItem from '@/components/todo/todo-item';

// Define types for better type safety
type Member = {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
  };
};

type Todo = {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  priority: string | null;
  is_complete: boolean;
  due_date: string | null;
  tags: string[] | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
  };
};

type FrequentTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  tags: string[] | null;
  organization_id: string;
  created_at: string;
  created_by: string;
};

export default async function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Check if user is a member of this organization
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id, role')
    .eq('organization_id', params.id)
    .eq('user_id', session.user.id)
    .single();
  
  if (membershipError || !membership) {
    notFound();
  }
  
  // Fetch organization details
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (orgError || !organization) {
    notFound();
  }
  
  // Check if user is the creator
  const isCreator = organization.created_by === session.user.id;
  
  // Fetch organization members
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        full_name
      )
    `)
    .eq('organization_id', params.id)
    .order('joined_at');
  
  // Fetch organization todos
  const { data: todos } = await supabase
    .from('todos')
    .select('*, profiles(full_name)')
    .eq('organization_id', params.id)
    .order('created_at', { ascending: false });
  
  // Fetch frequent tasks for this organization
  const { data: frequentTasks } = await supabase
    .from('frequent_tasks')
    .select('*')
    .eq('organization_id', params.id)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header - Responsive layout for small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-purple-800">{organization.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/todo/create" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm transition-colors"
          >
            Create Task
          </Link>
          {isCreator && (
            <Link 
              href={`/organizations/${params.id}/edit`} 
              className="bg-white hover:bg-gray-50 text-purple-800 border border-purple-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm transition-colors"
            >
              Edit Organization
            </Link>
          )}
        </div>
      </div>
      
      {/* Organization Details */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-purple-200">
        {organization.description && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2 text-purple-800">Description</h2>
            <p className="text-purple-600 text-sm sm:text-base">{organization.description}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:gap-x-6 gap-y-2">
          <div>
            <span className="text-sm text-purple-500">Created by:</span>{' '}
            <span className="font-medium text-purple-700">
              {organization.created_by === session.user.id 
                ? 'You' 
                : members?.find((m: Member) => m.user_id === organization.created_by)?.profiles?.full_name || 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-sm text-purple-500">Members:</span>{' '}
            <span className="font-medium text-purple-700">{members?.length || 0}</span>
          </div>
          <div>
            <span className="text-sm text-purple-500">Tasks:</span>{' '}
            <span className="font-medium text-purple-700">{todos?.length || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Responsive grid layout - Stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Column - Full width on mobile, 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200 flex justify-between items-center">
              <h2 className="font-medium text-base sm:text-lg text-purple-800">Organization Tasks</h2>
              <Link 
                href="/todo/create" 
                className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm"
              >
                Add Task
              </Link>
            </div>
            
            {todos && todos.length > 0 ? (
              <div className="p-3 sm:p-4 grid gap-3 sm:gap-4">
                {todos.map((todo: Todo) => (
                  <div key={todo.id} className="border border-purple-100 rounded-md p-3 sm:p-4">
                    <TodoItem
                      todo={todo}
                      userId={session.user.id}
                    />
                    <div className="mt-2 sm:mt-3 text-xs text-purple-500">
                      Created by: {todo.created_by === session.user.id ? 'You' : todo.profiles?.full_name || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 sm:px-6 py-4 text-center text-purple-500 text-sm">
                No tasks in this organization yet.
              </div>
            )}
          </div>
          
          {/* Frequent Tasks (Now visible to all members) */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200 flex justify-between items-center">
              <h2 className="font-medium text-base sm:text-lg text-purple-800">Frequent Tasks Templates</h2>
              {isCreator && (
                <Link 
                  href={`/frequent-tasks/create?org=${params.id}`} 
                  className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm"
                >
                  Add Template
                </Link>
              )}
            </div>
            
            {frequentTasks && frequentTasks.length > 0 ? (
              <ul className="divide-y divide-purple-100">
                {frequentTasks.map((task: FrequentTask) => (
                  <li key={task.id} className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium text-purple-900">{task.title}</p>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-purple-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex flex-wrap mt-2 gap-1 sm:gap-2">
                          {task.priority && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                          {task.tags && task.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Mobile-friendly link */}
                      <Link 
                        href={`/todo/create?template=${task.id}`}
                        className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm px-2 py-1 border border-purple-200 rounded-md inline-block"
                      >
                        Use Template
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 sm:px-6 py-4 text-center text-purple-500 text-sm">
                No frequent task templates yet.
              </div>
            )}
          </div>
        </div>
        
        {/* Members Column - Full width on mobile, 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <MembersList 
            members={members || []} 
            organizationId={params.id}
            isCreator={isCreator}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}
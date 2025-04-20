// src/app/(dashboard)/organizations/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MembersList from '@/components/organization/members-list';
import TodoItem from '@/components/todo/todo-item';

interface MembersListProps {
  members: {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
      id: string;
      full_name: string | null;
    };
  }[];
  organizationId: string;
  isCreator: boolean;
  currentUserId: string;
}

export default async function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
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
  
  // Fetch frequent tasks if user is creator
  const { data: frequentTasks } = isCreator
    ? await supabase
        .from('frequent_tasks')
        .select('*')
        .eq('organization_id', params.id)
        .order('created_at', { ascending: false })
    : { data: null };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-800">{organization.name}</h1>
        <div className="space-x-3">
          <Link 
            href="/todos/create" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Create Task
          </Link>
          {isCreator && (
            <Link 
              href={`/organizations/${params.id}/edit`} 
              className="bg-white hover:bg-gray-50 text-purple-800 border border-purple-200 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Edit Organization
            </Link>
          )}
        </div>
      </div>
      
      {/* Organization Details */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
        {organization.description && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2 text-purple-800">Description</h2>
            <p className="text-purple-600">{organization.description}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:gap-x-6 gap-y-2">
          <div>
            <span className="text-sm text-purple-500">Created by:</span>{' '}
            <span className="font-medium text-purple-700">
              {organization.created_by === session.user.id 
                ? 'You' 
                : members?.find(m => m.user_id === organization.created_by)?.profiles?.full_name || 'Unknown'}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-purple-200 flex justify-between items-center">
              <h2 className="font-medium text-lg text-purple-800">Organization Tasks</h2>
              <Link 
                href="/todos/create" 
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                Add Task
              </Link>
            </div>
            
            {todos && todos.length > 0 ? (
              <div className="p-4 grid gap-4">
                {todos.map((todo) => (
                  <div key={todo.id} className="border border-purple-100 rounded-md p-4">
                    <TodoItem
                      todo={todo}
                      userId={session.user.id}
                    />
                    <div className="mt-3 text-xs text-purple-500">
                      Created by: {todo.created_by === session.user.id ? 'You' : todo.profiles?.full_name || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-purple-500">
                No tasks in this organization yet.
              </div>
            )}
          </div>
          
          {/* Frequent Tasks (Only visible to creator) */}
          {isCreator && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-200 flex justify-between items-center">
                <h2 className="font-medium text-lg text-purple-800">Frequent Tasks Templates</h2>
                <Link 
                  href={`/frequent-tasks/create?org=${params.id}`} 
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  Add Template
                </Link>
              </div>
              
              {frequentTasks && frequentTasks.length > 0 ? (
                <ul className="divide-y divide-purple-100">
                  {frequentTasks.map((task) => (
                    <li key={task.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-purple-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-purple-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex mt-2">
                            {task.priority && (
                              <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                            {task.tags && task.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full mr-2">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button 
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Use Template
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-4 text-center text-purple-500">
                  No frequent task templates yet.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Members Column */}
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
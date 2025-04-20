// src/components/todo/todo-item.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type TodoItemProps = {
  todo: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: string | null;
    tags: string[] | null;
    created_by: string;
    organization_id: string | null;
    created_at: string;
    updated_at: string;
    is_complete: boolean;
  };
  userId: string;
  organizationName?: string;
};

export default function TodoItem({ todo, userId, organizationName }: TodoItemProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const isCreator = todo.created_by === userId;
  
  const handleToggleComplete = async () => {
    if (!isCreator) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !todo.is_complete })
        .eq('id', todo.id);
      
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error updating todo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isCreator) return;
    
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todo.id);
      
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error deleting todo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={todo.is_complete}
          onChange={handleToggleComplete}
          disabled={!isCreator || isLoading}
          className={`h-4 w-4 text-purple-600 rounded border-purple-200 focus:ring-purple-500 ${
            !isCreator ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        />
        <h3 className={`ml-3 font-medium text-lg ${
          todo.is_complete ? 'line-through text-purple-400' : 'text-purple-900'
        }`}>
          {todo.title}
        </h3>
        
        {todo.priority && (
          <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
            todo.priority === 'high' ? 'bg-red-100 text-red-800' : 
            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {todo.priority}
          </span>
        )}
      </div>
      
      {todo.description && (
        <p className="text-sm text-purple-500 mb-4">{todo.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {todo.tags && todo.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="text-xs text-purple-500 flex flex-wrap gap-x-4 gap-y-1">
        {todo.due_date && (
          <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
        )}
        
        {organizationName && (
          <span>Organization: {organizationName}</span>
        )}
        
        <span>Updated: {new Date(todo.updated_at).toLocaleDateString()}</span>
      </div>
      
      {isCreator && (
        <div className="mt-4 flex space-x-3 pt-4 border-t border-purple-200">
          <button 
            onClick={() => router.push(`/todo/${todo.id}`)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
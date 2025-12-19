// src/components/todo/todo-item.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Loader from '@/components/Loader';
import type { Todo } from '@/types/supabase';

type TodoItemProps = {
  todo: Todo;
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
    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-all duration-200 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
          <Loader />
        </div>
      )}
      {/* Header with Checkbox, Title and Priority - Responsive Layout */}
      <div className="flex items-start sm:items-center mb-3 sm:mb-4">
        <div className="flex-shrink-0 mt-1 sm:mt-0">
          <input
            type="checkbox"
            checked={todo.is_complete}
            onChange={handleToggleComplete}
            disabled={!isCreator || isLoading}
            className={`h-4 w-4 text-purple-600 rounded border-purple-200 focus:ring-purple-500 ${
              !isCreator ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          />
        </div>
        
        <h3 className={`ml-3 font-medium text-base sm:text-lg ${
          todo.is_complete ? 'line-through text-purple-400' : 'text-purple-900'
        } break-words`}>
          {todo.title}
        </h3>
        
        {todo.priority && (
          <span className={`ml-auto flex-shrink-0 px-2 py-0.5 sm:py-1 text-xs rounded-full ${
            todo.priority === 'high' ? 'bg-red-100 text-red-800' : 
            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {todo.priority}
          </span>
        )}
      </div>
      
      {/* Description - Improved text wrapping */}
      {todo.description && (
        <p className="text-xs sm:text-sm text-purple-500 mb-3 sm:mb-4 break-words line-clamp-3">
          {todo.description}
        </p>
      )}
      
      {/* Tags - Responsive with better wrapping */}
      {todo.tags && todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {todo.tags.map((tag) => (
            <span key={tag} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Meta Information - Stacked on mobile */}
      <div className="text-xs text-purple-500 flex flex-col sm:flex-row sm:flex-wrap gap-y-1 sm:gap-x-3 sm:gap-y-1">
        {todo.due_date && (
          <div className="flex items-center gap-1">
            <span className="text-purple-400">Due:</span>
            <span>{new Date(todo.due_date).toLocaleDateString()}</span>
          </div>
        )}
        
        {organizationName && (
          <div className="flex items-center gap-1">
            <span className="text-purple-400">Org:</span>
            <span className="truncate max-w-[200px]">{organizationName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span className="text-purple-400">Updated:</span>
          <span>{new Date(todo.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Actions - Easier to tap on mobile */}
      {isCreator && (
        <div className="mt-3 sm:mt-4 flex justify-between pt-3 sm:pt-4 border-t border-purple-200">
          {/* Status toggle button */}
          <button 
            onClick={handleToggleComplete}
            disabled={isLoading}
            className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50 px-2 py-1 -ml-2 rounded-md hover:bg-purple-50"
          >
            {todo.is_complete ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          
          <div className="flex gap-2 sm:gap-3">
            <Link 
              href={`/todo/${todo.id}`}
              className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors px-2 py-1 rounded-md hover:bg-purple-50"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
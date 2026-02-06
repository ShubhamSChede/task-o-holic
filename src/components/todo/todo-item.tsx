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
        // @ts-expect-error - Supabase type inference issue with .update()
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
    <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)] transition-all duration-200 hover:border-cyan-400/60 hover:shadow-[0_24px_70px_rgba(8,47,73,0.9)] sm:p-5 md:p-6">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/80">
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
            className={`h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400 ${
              !isCreator ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          />
        </div>
        
        <h3 className={`ml-3 font-medium text-base sm:text-lg ${
          todo.is_complete ? 'line-through text-slate-500' : 'text-slate-50'
        } break-words`}>
          {todo.title}
        </h3>
        
        {todo.priority && (
          <span
            className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${
              todo.priority === 'high'
                ? 'bg-red-500/15 text-red-300 border border-red-500/40'
                : todo.priority === 'medium'
                ? 'bg-amber-400/10 text-amber-200 border border-amber-300/40'
                : 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/40'
            }`}
          >
            {todo.priority}
          </span>
        )}
      </div>
      
      {/* Description - Improved text wrapping */}
      {todo.description && (
        <p className="mb-3 break-words text-xs text-slate-300 sm:mb-4 sm:text-sm line-clamp-3">
          {todo.description}
        </p>
      )}
      
      {/* Tags - Responsive with better wrapping */}
      {todo.tags && todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {todo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-900 px-1.5 py-0.5 text-xs text-slate-200 ring-1 ring-slate-700/80 sm:px-2 sm:py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Meta Information - Stacked on mobile */}
      <div className="flex flex-col gap-y-1 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1">
        {todo.due_date && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Due:</span>
            <span>{new Date(todo.due_date).toLocaleDateString()}</span>
          </div>
        )}
        
        {organizationName && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Org:</span>
            <span className="truncate max-w-[200px]">{organizationName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Updated:</span>
          <span>{new Date(todo.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Actions - Easier to tap on mobile */}
      {isCreator && (
        <div className="mt-3 flex justify-between border-t border-slate-800 pt-3 sm:mt-4 sm:pt-4">
          {/* Status toggle button */}
          <button 
            onClick={handleToggleComplete}
            disabled={isLoading}
            className="rounded-md px-2 py-1 text-xs font-medium text-cyan-300 transition-colors hover:bg-slate-900 sm:text-sm disabled:opacity-50"
          >
            {todo.is_complete ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          
          <div className="flex gap-2 sm:gap-3">
            <Link 
              href={`/todo/${todo.id}`}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-900 sm:text-sm"
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
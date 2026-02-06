// src/components/frequent-task/frequent-task-item.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/Loader';
import type { FrequentTask } from '@/types/supabase';

type FrequentTaskItemProps = {
  task: FrequentTask;
  onUseTemplate?: (task: FrequentTask) => void;
};

export default function FrequentTaskItem({ task, onUseTemplate }: FrequentTaskItemProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('frequent_tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(task);
    } else {
      // Navigate to create todo page with prefilled data
      router.push(`/todos/create?template=${task.id}`);
    }
  };
  
  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)] transition-shadow hover:border-cyan-400/60 hover:shadow-[0_24px_70px_rgba(8,47,73,0.9)]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/80">
          <Loader />
        </div>
      )}
      <h3 className="font-medium text-slate-50">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="mt-2 text-sm text-slate-300">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-3">
        {task.priority && (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              task.priority === 'high'
                ? 'bg-red-500/15 text-red-300 border border-red-500/40'
                : task.priority === 'medium'
                ? 'bg-amber-400/10 text-amber-200 border border-amber-300/40'
                : 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/40'
            }`}
          >
            {task.priority}
          </span>
        )}
        
        {task.tags && task.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-900 px-2 py-1 text-xs text-slate-200 ring-1 ring-slate-700/80"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="mt-4 flex space-x-3 border-t border-slate-800 pt-3">
        <button
          onClick={handleUseTemplate}
          className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          Use Template
        </button>
        <Link 
          href={`/frequent-tasks/${task.id}`}
          className="text-sm text-slate-300 hover:text-slate-100"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
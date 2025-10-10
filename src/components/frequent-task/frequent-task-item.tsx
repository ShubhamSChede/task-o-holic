// src/components/frequent-task/frequent-task-item.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/Loader';

type FrequentTaskItemProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: string | null;
    tags: string[] | null;
    organization_id: string;
  };
  onUseTemplate?: (task: any) => void;
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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
          <Loader />
        </div>
      )}
      <h3 className="font-medium text-purple-900">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="text-sm text-purple-500 mt-2">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-3">
        {task.priority && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' : 
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
        )}
        
        {task.tags && task.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="mt-4 flex space-x-3 pt-3 border-t border-purple-100">
        <button
          onClick={handleUseTemplate}
          className="text-sm text-purple-600 hover:text-purple-800"
        >
          Use Template
        </button>
        <Link 
          href={`/frequent-tasks/${task.id}`}
          className="text-sm text-purple-500 hover:text-purple-700"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
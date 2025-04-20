// src/components/organization/members-list.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type MembersListProps = {
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
};

export default function MembersList({ members, organizationId, isCreator, currentUserId }: MembersListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!isCreator || userId === currentUserId) return;
    
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-purple-100">
        <h2 className="font-medium text-lg text-purple-800">Members ({members.length})</h2>
      </div>
      
      <ul className="divide-y divide-purple-100">
        {members.map((member) => (
          <li key={member.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-purple-900">
                {member.profiles.full_name || 'Unknown User'}
                {member.user_id === currentUserId && ' (You)'}
              </p>
              <p className="text-sm text-purple-500">
                {member.role === 'admin' ? 'Admin' : 'Member'} · Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
            
            {isCreator && member.user_id !== currentUserId && (
              <button
                onClick={() => handleRemoveMember(member.id, member.user_id)}
                disabled={isLoading}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
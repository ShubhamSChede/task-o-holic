// src/components/organization/members-list.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/Loader';
import type { OrganizationMember, Profile } from '@/types/supabase';

type MembersListProps = {
  members: (OrganizationMember & {
    profiles: Profile;
  })[];
  organizationId: string;
  isCreator: boolean;
  currentUserId: string;
};

export default function MembersList({ members, organizationId, isCreator, currentUserId }: MembersListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('MembersList received members:', members);
  console.log('MembersList props:', { organizationId, isCreator, currentUserId });
  
  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!isCreator || userId === currentUserId) return;
    
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    setIsLoading(true);
    try {
    const deleteQuery = supabase
      .from('organization_members')
      .delete();
    const { error } = await deleteQuery
      
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/80">
          <Loader />
        </div>
      )}
      <div className="border-b border-slate-800 px-6 py-4">
        <h2 className="text-lg font-medium text-slate-50">
          Members ({members.length})
        </h2>
      </div>
      
      <ul className="divide-y divide-slate-800/80">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium text-slate-50">
                {member.profiles?.full_name || 'Unknown User'}
                {member.user_id === currentUserId && ' (You)'}
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                {member.role === 'admin' ? 'Admin' : 'Member'} · Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
            
            {isCreator && member.user_id !== currentUserId && (
              <button
                onClick={() => handleRemoveMember(member.id, member.user_id)}
                disabled={isLoading}
                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
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
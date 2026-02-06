// src/app/(dashboard)/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile/profile-form';
//import type { Profile } from '@/types/supabase';

export default async function ProfilePage() {
  // Add 'await' here to properly resolve the Promise
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-50">My profile</h1>
      
      <ProfileForm 
        initialData={profile || { id: session.user.id, full_name: null, avatar_url: null }}
        userEmail={session.user.email || ''}
      />
    </div>
  );
}
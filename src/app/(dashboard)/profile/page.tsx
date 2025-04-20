// src/app/(dashboard)/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile/profile-form';

// Define Profile type for better type safety
type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
};

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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">My Profile</h1>
      <ProfileForm 
        initialData={profile || { id: session.user.id, full_name: null, avatar_url: null }}
        userEmail={session.user.email || ''}
      />
      
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-purple-200">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-purple-700">Change Password</h3>
            <p className="text-sm text-purple-500 mt-1">
              To change your password, log out and use the &quot;Forgot Password&quot; option on the login page.
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-red-600">Delete Account</h3>
            <p className="text-sm text-purple-500 mt-1">
              Deleting your account is permanent and cannot be undone. All your data will be permanently deleted.
            </p>
            <button
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
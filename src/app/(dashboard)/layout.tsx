
// // src/app/(dashboard)/layout.tsx
// import { redirect } from 'next/navigation';
// import { createClient } from '@/lib/supabase/server';
// import Sidebar from '@/components/dashboard/sidebar';

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const supabase = createClient();
//   const { data: { session } } = await supabase.auth.getSession();

//   if (!session) {
//     redirect('/login');
//   }

//   // Fetch profile data
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('id', session.user.id)
//     .single();

//   // Fetch user's organizations
//   const { data: userOrganizations } = await supabase
//     .from('organization_members')
//     .select(`
//       organization_id,
//       role,
//       organizations (
//         id,
//         name
//       )
//     `)
//     .eq('user_id', session.user.id);

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <Sidebar 
//         user={profile} 
//         organizations={userOrganizations?.map(org => ({
//           id: org.organization_id,
//           name: org.organizations?.name || '',
//           role: org.role
//         })) || []} 
//       />
//       <main className="flex-1 p-6 overflow-auto">
//         {children}
//       </main>
//     </div>
//   );
// }
// src/app/(dashboard)/layout.tsx

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  }
  const [profile, setProfile] = useState<Profile | null>(null);
  interface Organization {
    id: string;
    name: string;
    role: string;
  }
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setProfile(profileData);
        
        // Fetch organizations
        const { data: orgsData } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            role,
            organizations (
              id,
              name
            )
          `)
          .eq('user_id', session.user.id);
          
        if (orgsData) {
          setOrganizations(orgsData.map(org => ({
            id: org.organization_id,
            name: org.organizations?.name || '',
            role: org.role
          })));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router, supabase]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        user={profile} 
        organizations={organizations} 
      />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
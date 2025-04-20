// src/app/(dashboard)/organizations/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function OrganizationsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Fetch user's organizations
  const { data: userOrganizations } = await supabase
    .from('organization_members')
    .select(`
      role,
      joined_at,
      organizations (
        id,
        name,
        description,
        created_by
      )
    `)
    .eq('user_id', session.user.id)
    .order('joined_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Organizations</h1>
        <div className="space-x-3">
          <Link href="/organizations/join" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-md text-sm">
            Join Organization
          </Link>
          <Link href="/organizations/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            Create Organization
          </Link>
        </div>
      </div>
      
      {userOrganizations && userOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userOrganizations.map((org) => (
            <Link 
              key={org.organizations?.id} 
              href={`/organizations/${org.organizations?.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">{org.organizations?.name}</h2>
                
                {org.organizations?.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{org.organizations?.description}</p>
                )}
                
                <div className="flex items-center text-xs text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {org.organizations?.created_by === session.user.id ? 'Creator' : 'Member'}
                  </span>
                  <span className="ml-2">
                    Joined {new Date(org.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">You're not part of any organization yet.</p>
          <div className="mt-2 space-x-4">
            <Link href="/organizations/create" className="text-blue-600 hover:text-blue-800">
              Create Organization
            </Link>
            <Link href="/organizations/join" className="text-blue-600 hover:text-blue-800">
              Join Organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
// src/app/(dashboard)/organizations/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { OrganizationMember, Organization } from '@/types/supabase';

// Extended type for joined data
type OrgMemberWithOrg = OrganizationMember & {
  organizations?: Organization;
};

export default async function OrganizationsPage() {
  const supabase = await createClient();
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
    <div className="space-y-6 px-2 sm:px-0">
      {/* Responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">My Organizations</h1>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/organizations/join" 
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm"
          >
            Join Organization
          </Link>
          <Link 
            href="/organizations/create" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm mt-2"
          >
            Create Organization
          </Link>
        </div>
      </div>
      
      {userOrganizations && userOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {userOrganizations.map((org: OrgMemberWithOrg) => (
            <Link 
              key={org.organizations?.id} 
              href={`/organizations/${org.organizations?.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{org.organizations?.name}</h2>
                
                {org.organizations?.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{org.organizations?.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {org.organizations?.created_by === session.user.id ? 'Creator' : 'Member'}
                  </span>
                  <span>
                    Joined {new Date(org.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm sm:text-base">You&apos;re not part of any organization yet.</p>
          <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
            <Link href="/organizations/create" className="bg-purple-500 hover:text-purple-800 text-sm sm:text-base">
              Create Organization
            </Link>
            <Link href="/organizations/join" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
              Join Organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
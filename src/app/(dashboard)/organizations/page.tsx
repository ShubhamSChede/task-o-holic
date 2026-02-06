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
        <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">My organizations</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/organizations/join"
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 sm:px-4 sm:py-2"
          >
            Join Organization
          </Link>
          <Link
            href="/organizations/create"
            className="mt-2 rounded-full bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 sm:px-4 sm:py-2"
          >
            Create Organization
          </Link>
        </div>
      </div>
      
      {userOrganizations && userOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {userOrganizations.map((org: OrgMemberWithOrg) => (
            <Link
              key={org.organizations?.id}
              href={`/organizations/${org.organizations?.id}`}
              className="block overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] transition-shadow hover:shadow-[0_24px_70px_rgba(15,23,42,0.95)] sm:p-6"
            >
              <h2 className="mb-2 text-base font-medium text-slate-50 sm:text-lg">
                {org.organizations?.name}
              </h2>
              
              {org.organizations?.description && (
                <p className="mb-3 line-clamp-2 text-xs text-slate-400 sm:mb-4 sm:text-sm">
                  {org.organizations?.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-200 ring-1 ring-slate-700/80">
                  {org.organizations?.created_by === session.user.id ? 'Creator' : 'Member'}
                </span>
                <span>
                  Joined {new Date(org.joined_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 py-8 text-center text-sm text-slate-400 shadow-[0_18px_45px_rgba(15,23,42,0.9)] sm:py-12">
          <p className="text-sm sm:text-base">
            You&apos;re not part of any organization yet.
          </p>
          <div className="mt-3 flex flex-col justify-center gap-2 sm:mt-4 sm:flex-row sm:gap-4">
            <Link
              href="/organizations/create"
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200 sm:text-base"
            >
              Create organization
            </Link>
            <Link
              href="/organizations/join"
              className="text-sm text-slate-300 hover:text-slate-100 sm:text-base"
            >
              Join organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
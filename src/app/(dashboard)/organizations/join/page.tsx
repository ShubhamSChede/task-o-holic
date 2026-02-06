// src/app/(dashboard)/organizations/join/page.tsx
import OrgJoinForm from '@/components/organization/org-join-form';

export default function JoinOrganizationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-slate-50">Join organization</h1>
      <OrgJoinForm />
    </div>
  );
}
// src/app/(dashboard)/organizations/join/page.tsx
import OrgJoinForm from '@/components/organization/org-join-form';

export default function JoinOrganizationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Join an Organization</h1>
      <OrgJoinForm />
    </div>
  );
}
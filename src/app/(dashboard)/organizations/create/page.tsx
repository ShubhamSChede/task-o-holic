// src/app/(dashboard)/organizations/create/page.tsx
import OrgForm from '@/components/organization/org-form';

export default function CreateOrganizationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Create New Organization</h1>
      <OrgForm mode="create" />
    </div>
  );
}

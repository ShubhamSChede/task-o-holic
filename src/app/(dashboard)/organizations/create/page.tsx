// src/app/(dashboard)/organizations/create/page.tsx
import OrgForm from '@/components/organization/org-form';

export default function CreateOrganizationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-slate-50">Create organization</h1>
      <OrgForm mode="create" />
    </div>
  );
}

'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { WorkspaceForm } from '../components/workspace-form';

// ----------------------------------------------------------------------

export function WorkspaceCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create workspace"
        backHref={paths.dashboard.workspace.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Workspaces', href: paths.dashboard.workspace.root },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <WorkspaceForm />
    </DashboardContent>
  );
}

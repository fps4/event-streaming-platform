'use client';

import { DashboardContent } from 'src/layouts/dashboard';

import { WorkspaceForm } from '../components/workspace-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

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

'use client';

import { useEffect, useState } from 'react';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { getWorkspace } from 'src/api/workspace';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { WorkspaceForm } from '../components/workspace-form';

// ----------------------------------------------------------------------

export function WorkspaceEditView() {
  const params = useParams();
  const { id } = params || {};

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    if (!id) return;
    setLoading(true);
    setError('');
    getWorkspace(id, controller.signal)
      .then((res) => setWorkspace(res))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        setError(err?.message || 'Failed to load workspace');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Edit workspace"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Workspaces', href: paths.dashboard.workspace.root },
            { name: 'Edit' },
          ]}
        />
        <p>Loading workspace...</p>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Edit workspace"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Workspaces', href: paths.dashboard.workspace.root },
            { name: 'Edit' },
          ]}
        />
        <p>{error}</p>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit workspace"
        backHref={paths.dashboard.workspace.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Workspaces', href: paths.dashboard.workspace.root },
          { name: workspace?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <WorkspaceForm currentWorkspace={workspace} />
    </DashboardContent>
  );
}

'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PipelineForm } from '../pipeline-form';

export function PipelineEditView({ pipeline }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit pipeline"
        backHref={paths.dashboard.pipeline.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Pipelines', href: paths.dashboard.pipeline.root },
          { name: pipeline?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PipelineForm currentPipeline={pipeline} />
    </DashboardContent>
  );
}

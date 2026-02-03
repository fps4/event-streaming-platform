'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PipelineForm } from '../pipeline-form';

export function PipelineNewView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create pipeline"
        backHref={paths.dashboard.pipeline.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Pipelines', href: paths.dashboard.pipeline.root },
          { name: 'New pipeline' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PipelineForm />
    </DashboardContent>
  );
}

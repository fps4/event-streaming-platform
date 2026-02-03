import { CONFIG } from 'src/global-config';

import { PipelineEditView } from 'src/sections/pipeline/view/pipeline-edit-view';

export const metadata = { title: `Edit Pipeline | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  // Placeholder; real fetching can be added when API ready
  const pipeline = { id };
  return <PipelineEditView pipeline={pipeline} />;
}

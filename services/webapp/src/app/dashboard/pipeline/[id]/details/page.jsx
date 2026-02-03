import { CONFIG } from 'src/global-config';

import { PipelineDetailsView } from 'src/sections/pipeline/view/pipeline-details-view';

export const metadata = { title: `Pipeline Details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <PipelineDetailsView pipelineId={id} />;
}

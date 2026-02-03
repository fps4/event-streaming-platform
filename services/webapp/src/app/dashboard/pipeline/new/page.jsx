import { CONFIG } from 'src/global-config';

import { PipelineNewView } from 'src/sections/pipeline/view/pipeline-new-view';

export const metadata = { title: `Create Pipeline | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PipelineNewView />;
}

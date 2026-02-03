import { CONFIG } from 'src/global-config';

import { PipelineListView } from 'src/sections/pipeline/view/pipeline-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Pipeline List | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PipelineListView />;
}

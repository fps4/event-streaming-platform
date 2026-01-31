import { CONFIG } from 'src/global-config';

import { WorkspacePipelineListView } from 'src/sections/workspace/view/workspace-pipeline-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Pipeline List | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <WorkspacePipelineListView />;
}

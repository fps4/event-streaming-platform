'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useParams, useSearchParams } from 'src/routes/hooks';

import { listPipelines } from 'src/api/pipeline';
import { getWorkspace } from 'src/api/workspace';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function WorkspacePipelineListView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params?.id;
  const [workspaceName, setWorkspaceName] = useState(() => searchParams?.get('name') || '');
  const [pipelines, setPipelines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workspaceId) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    listPipelines(workspaceId, controller.signal)
      .then((items) => setPipelines(items))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        setError(err?.message || 'Failed to load pipelines');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceName || !workspaceId) return undefined;
    const controller = new AbortController();
    getWorkspace(workspaceId, controller.signal)
      .then((ws) => setWorkspaceName(ws?.name || 'Workspace'))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        setWorkspaceName('Workspace');
      });
    return () => controller.abort();
  }, [workspaceId, workspaceName]);

  const renderCard = (p) => (
    <Card key={p.id} sx={{ minWidth: 240 }}>
      <CardActionArea
        onClick={() => setSelectedId(p.id)}
        data-active={selectedId === p.id ? '' : undefined}
        sx={{
          height: '100%',
          '&[data-active]': {
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: 'action.selectedHover',
            },
          },
        }}
      >
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={1}>
            <Typography variant="h5">{p.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {p.status || 'unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Source: {p.sourceTopic || 'n/a'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Target: {p.targetTopic || 'n/a'}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  const empty = !loading && !pipelines.length;
  const selectedPipeline = pipelines.find((p) => p.id === selectedId);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`${workspaceName || 'Workspace'} Pipelines`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Workspaces', href: paths.dashboard.workspace.root },
          { name: 'Pipelines', href: paths.dashboard.workspace.pipeline.list },
        ]}
        action={
          <Button 
            component={RouterLink} 
            href={paths.dashboard.workspace.pipeline.new} 
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            >
            Add Pipeline
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 3,
        }}
      >
        {pipelines.map(renderCard)}
        {empty && (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No pipelines yet.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <Card
        sx={{
          mt: 4,
          minHeight: 360,
          display: 'flex',
          backgroundColor: selectedPipeline ? 'action.selected' : 'background.paper',
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {selectedPipeline ? (
            <Stack spacing={1}>
              <Typography variant="h6">Pipeline: {selectedPipeline.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {selectedPipeline.status || 'unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Source: {selectedPipeline.sourceTopic || 'n/a'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Target: {selectedPipeline.targetTopic || 'n/a'}
              </Typography>
              {selectedPipeline.description ? (
                <Typography variant="body2" color="text.secondary">
                  {selectedPipeline.description}
                </Typography>
              ) : null}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a pipeline to view details.
            </Typography>
          )}
        </CardContent>
      </Card>
    </DashboardContent>
  );
}

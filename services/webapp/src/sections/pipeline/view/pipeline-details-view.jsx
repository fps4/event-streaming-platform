'use client';

import { useEffect, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getPipeline, updatePipeline } from 'src/api/pipeline';
import { getWorkspace, listWorkspaces } from 'src/api/workspace';

import { Form, Field } from 'src/components/hook-form';

export function PipelineDetailsView({ pipelineId }) {
  const [pipeline, setPipeline] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);


  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{pipeline?.name || 'Pipeline'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {workspaces.find((w) => w.id === (pipeline?.workspaceId || pipeline?.workspace))?.name ||
            'Workspace'}
        </Typography>
      </Stack>

      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          React Flow canvas placeholder
        </Typography>
      </Card>
    </Stack>
  );
}

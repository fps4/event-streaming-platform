'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { listWorkspaces } from 'src/api/workspace';
import { createPipeline, updatePipeline } from 'src/api/pipeline';

import { Form, Field } from 'src/components/hook-form';

const PipelineSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().optional(),
  status: zod.enum(['draft', 'active', 'paused', 'failed']).default('draft'),
  workspaceId: zod.string().min(1, { message: 'Workspace is required' }),
});

export function PipelineForm({ currentPipeline }) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceError, setWorkspaceError] = useState(null);

  const defaultValues = useMemo(
    () => ({
      name: '',
      description: '',
      status: 'draft',
      workspaceId: '',
    }),
    []
  );

  const methods = useForm({
    resolver: zodResolver(PipelineSchema),
    defaultValues,
    values: currentPipeline
      ? {
          ...defaultValues,
          ...currentPipeline,
        }
      : defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    const controller = new AbortController();
    setWorkspaceError(null);
    listWorkspaces(controller.signal)
      .then((items) => {
        setWorkspaces(items);
        if (!methods.getValues('workspaceId') && items.length) {
          setValue('workspaceId', items[0].id);
        }
      })
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        setWorkspaceError(err?.message || 'Failed to load workspaces');
        setWorkspaces([]);
      });
    return () => controller.abort();
  }, [methods, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      name: data.name,
      description: data.description ?? '',
      status: data.status,
      workspaceId: data.workspaceId,
    };

    if (currentPipeline?.id) {
      await updatePipeline(currentPipeline.id, payload);
    } else {
      await createPipeline(payload);
    }

    router.replace(paths.dashboard.pipeline.root);
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card>
          <CardHeader title="Pipeline details" />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.Text name="name" label="Name" placeholder="My pipeline" />
            <Field.Text name="description" label="Description" placeholder="My pipeline description" />
            <Field.Select name="status" label="Status">
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Field.Select>
            <TextField
              select
              label="Workspace"
              value={watch('workspaceId')}
              onChange={(event) => setValue('workspaceId', event.target.value)}
              helperText={workspaceError || 'Select workspace for this pipeline'}
              error={Boolean(workspaceError)}
            >
              {workspaces.map((ws) => (
                <MenuItem key={ws.id} value={ws.id}>
                  {ws.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button color="inherit" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {currentPipeline ? 'Save changes' : 'Create pipeline'}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}

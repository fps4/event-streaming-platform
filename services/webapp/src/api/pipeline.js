'use client';

import axiosInstance from 'src/lib/axios';

export async function listPipelines(signal) {
  try {
    const res = await axiosInstance.get('/api/pipelines', { signal });
    const items = Array.isArray(res.data?.items) ? res.data.items : [];
    return items.map((p) => ({
      id: p._id ?? p.id,
      name: p.name ?? 'Untitled pipeline',
      status: p.status ?? 'unknown',
      description: p.description ?? '',
      workspaceId: p.workspaceId ?? '',
    }));
  } catch (err) {
    if (err?.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

export async function createPipeline(payload) {
  const res = await axiosInstance.post('/api/pipelines', payload);
  return res.data;
}

export async function updatePipeline(id, payload) {
  if (!id) throw new Error('Pipeline id is required');
  const res = await axiosInstance.put(`/api/pipelines/${id}`, payload);
  return res.data;
}

export async function getPipeline(id, signal) {
  if (!id) throw new Error('Pipeline id is required');
  const items = await listPipelines(signal);
  const match = items.find((p) => p.id === id);
  if (!match) throw new Error('Pipeline not found');
  return match;
}

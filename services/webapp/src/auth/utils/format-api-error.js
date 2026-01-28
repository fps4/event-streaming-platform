'use client';

export function formatApiError(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.response?.data?.error;
  if (message) return message;
  if (status) return `Request failed with status ${status}`;
  return error?.message || 'Unable to reach server';
}

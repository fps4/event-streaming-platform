// ----------------------------------------------------------------------

export function getErrorMessage(error, fallback = 'An unexpected error occurred') {
  if (!error) return fallback;

  if (error instanceof Error) {
    return error.message || error.name || fallback;
  }

  if (typeof error === 'string') {
    return error || fallback;
  }

  if (typeof error === 'object') {
    if (typeof error.message === 'string' && error.message) {
      return error.message;
    }
    if (typeof error.error === 'string' && error.error) {
      return error.error;
    }
  }

  return fallback;
}

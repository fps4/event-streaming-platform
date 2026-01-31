import Link from 'next/link';
import Button from '@mui/material/Button';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function BackLink({ href, label }) {
  return (
    <Button
      component={Link}
      href={href}
      color="inherit"
      startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
    >
      {label}
    </Button>
  );
}

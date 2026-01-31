import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function MoreLinks({ links = [] }) {
  if (!links.length) {
    return null;
  }

  return (
    <Collapse in>
      <Alert
        severity="info"
        action={
          <IconButton color="inherit" size="small">
            <Iconify icon="eva:close-outline" />
          </IconButton>
        }
        sx={{
          bgcolor: 'unset',
          color: 'text.primary',
          '& .MuiAlert-icon': { display: 'none' },
        }}
      >
        <Stack spacing={1}>
          {links.map((link) => (
            <Stack key={link.name} direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
              {link.name}
            </Stack>
          ))}
        </Stack>
      </Alert>
    </Collapse>
  );
}

import Link from 'next/link';
import Stack from '@mui/material/Stack';
import LinkUI from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function BreadcrumbsLink({ linkProps, name, href, icon, disabled, moreProps }) {
  if (disabled) {
    return (
      <Stack spacing={1} direction="row" alignItems="center">
        {icon}
        <Typography variant="subtitle2" color="text.primary">
          {name}
        </Typography>
      </Stack>
    );
  }

  return (
    <LinkUI
      component={Link}
      color="text.primary"
      variant="subtitle2"
      href={href}
      {...linkProps}
      {...moreProps}
      sx={{ display: 'inline-flex', alignItems: 'center' }}
    >
      {icon}
      {name}
    </LinkUI>
  );
}

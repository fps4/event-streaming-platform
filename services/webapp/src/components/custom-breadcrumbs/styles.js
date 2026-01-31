import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function BreadcrumbsRoot({ children, sx, ...other }) {
  return (
    <Stack spacing={2} sx={sx} {...other}>
      {children}
    </Stack>
  );
}

export function BreadcrumbsContainer({ children, sx, ...other }) {
  return (
    <Stack
      spacing={2}
      alignItems="flex-start"
      direction="row"
      justifyContent="space-between"
      {...other}
      sx={{ flexWrap: 'wrap', ...sx }}
    >
      {children}
    </Stack>
  );
}

export function BreadcrumbsContent({ children, sx, ...other }) {
  return (
    <Stack spacing={1} alignItems="flex-start" sx={sx} {...other}>
      {children}
    </Stack>
  );
}

export function BreadcrumbsHeading({ children, sx, ...other }) {
  return (
    <Typography variant="h4" sx={sx} {...other}>
      {children}
    </Typography>
  );
}

export function BreadcrumbsSeparator({ sx, ...other }) {
  return (
    <Box
      component="span"
      sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: 'currentColor',
        ...sx,
      }}
      {...other}
    />
  );
}

export function BreadcrumbsHeadingLink({ disabled, ...other }) {
  return (
    <Stack
      component="span"
      alignItems="center"
      sx={{
        gap: 1,
        cursor: 'pointer',
        color: 'text.primary',
        display: 'inline-flex',
        ...(disabled && {
          pointerEvents: 'none',
          color: (theme) => alpha(theme.palette.text.disabled, 0.8),
        }),
      }}
      {...other}
    />
  );
}

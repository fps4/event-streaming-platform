'use client';

import { Controller, useFormContext } from 'react-hook-form';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';

export function RHFSelect({ name, label, helperText, children, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          {label && <InputLabel>{label}</InputLabel>}
          <Select {...field} label={label} {...other}>
            {children}
          </Select>
          <FormHelperText>{error ? error?.message : helperText}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

'use client';

import React from 'react';
import { Box, BoxProps, useTheme, useMediaQuery } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface ResponsiveContainerProps extends Omit<BoxProps, 'maxWidth' | 'sx'> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  sx?: SxProps<Theme>;
}

const MAX_WIDTHS = {
  xs: 444,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export function ResponsiveContainer({
  maxWidth = 'lg',
  disableGutters = false,
  children,
  sx = [],
  ...props
}: ResponsiveContainerProps) {
  const theme = useTheme();

  const containerStyles: SxProps<Theme> = [
    {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    ...(Array.isArray(sx) ? sx : [sx]),
    {
      ...(!disableGutters && {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      }),
      ...(maxWidth !== false && {
        maxWidth: MAX_WIDTHS[maxWidth],
        [theme.breakpoints.up('sm')]: {
          paddingLeft: disableGutters ? 0 : theme.spacing(3),
          paddingRight: disableGutters ? 0 : theme.spacing(3),
        },
        [theme.breakpoints.up('md')]: {
          paddingLeft: disableGutters ? 0 : theme.spacing(3),
          paddingRight: disableGutters ? 0 : theme.spacing(3),
        },
      }),
    },
  ];

  return (
    <Box sx={containerStyles} {...props}>
      {children}
    </Box>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ResponsiveGrid({
  children,
  spacing = 2,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}: ResponsiveGridProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const currentColumns = isXs ? columns.xs
    : isSm ? columns.sm
    : isMd ? columns.md
    : isLg ? columns.lg
    : columns.xl || 1;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
    gap: theme.spacing(spacing),
  };

  return (
    <Box sx={gridStyle}>
      {children}
    </Box>
  );
}

interface ResponsiveValueProps<T> {
  xs: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export function useResponsiveValue<T>({ xs, sm, md, lg, xl }: ResponsiveValueProps<T>): T {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  if (isXs) return xs;
  if (isSm) return sm ?? xs;
  if (isMd) return md ?? sm ?? xs;
  if (isLg) return lg ?? md ?? sm ?? xs;
  if (isXl) return xl ?? lg ?? md ?? sm ?? xs;

  return xs;
}

interface HideOnDeviceProps {
  children: React.ReactNode;
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
}

export function HideOnDevice({ children, xs, sm, md, lg, xl }: HideOnDeviceProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const shouldHide =
    (xs && isXs) ||
    (sm && isSm) ||
    (md && isMd) ||
    (lg && isLg) ||
    (xl && isXl);

  if (shouldHide) {
    return null;
  }

  return <>{children}</>;
}

interface ShowOnDeviceProps {
  children: React.ReactNode;
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
}

export function ShowOnDevice({ children, xs, sm, md, lg, xl }: ShowOnDeviceProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const shouldShow =
    (xs && isXs) ||
    (sm && isSm) ||
    (md && isMd) ||
    (lg && isLg) ||
    (xl && isXl);

  if (!shouldShow) {
    return null;
  }

  return <>{children}</>;
}

export default ResponsiveContainer;

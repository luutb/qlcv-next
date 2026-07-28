'use client';

import React from 'react';
import { Box, Skeleton as MuiSkeleton, Card, CardContent, Grid, Chip, Avatar } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  count?: number;
  animation?: 'pulse' | 'wave' | false;
}

export function SkeletonLoader({
  variant = 'text',
  width,
  height,
  count = 1,
  animation = 'pulse',
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MuiSkeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
          animation={animation}
          sx={{
            mb: index < count - 1 ? 1 : 0,
          }}
        />
      ))}
    </>
  );
}

interface CaseCardSkeletonProps {
  count?: number;
}

export function CaseCardSkeleton({ count = 3 }: CaseCardSkeletonProps) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <MuiSkeleton variant="text" width="40%" height={28} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <MuiSkeleton variant="text" width="80%" height={20} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <MuiSkeleton variant="text" width="60%" height={20} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <MuiSkeleton variant="circular" width={24} height={24} />
                <MuiSkeleton variant="rectangular" width={80} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

interface TaskCardSkeletonProps {
  count?: number;
}

export function TaskCardSkeleton({ count = 3 }: TaskCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: index < count - 1 ? 1 : 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <MuiSkeleton variant="text" width="70%" height={24} />
            </Box>
            <MuiSkeleton variant="circular" width={32} height={32} />
          </Box>
          <Box sx={{ mb: 1 }}>
            <MuiSkeleton variant="text" width="90%" height={16} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <MuiSkeleton variant="rectangular" width={100} height={24} />
            <MuiSkeleton variant="rectangular" width={100} height={24} />
          </Box>
        </Box>
      ))}
    </>
  );
}

interface FormSkeletonProps {
  fieldCount?: number;
}

export function FormSkeleton({ fieldCount = 4 }: FormSkeletonProps) {
  return (
    <Box>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <MuiSkeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
          <MuiSkeleton variant="rectangular" width="100%" height={56} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <MuiSkeleton variant="rectangular" width={120} height={36} />
        <MuiSkeleton variant="rectangular" width={120} height={36} />
      </Box>
    </Box>
  );
}

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

export function TableSkeleton({ rowCount = 5, columnCount = 4 }: TableSkeletonProps) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        {Array.from({ length: columnCount }).map((_, index) => (
          <MuiSkeleton key={`header-${index}`} variant="text" width="15%" height={20} />
        ))}
      </Box>
      {/* Rows */}
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <Box
          key={`row-${rowIndex}`}
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <MuiSkeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={`${Math.random() * 40 + 10}%`}
              height={20}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

interface UserAvatarSkeletonProps {
  count?: number;
}

export function UserAvatarSkeleton({ count = 5 }: UserAvatarSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MuiSkeleton variant="circular" width={32} height={32}>
            <Avatar />
          </MuiSkeleton>
          <Box>
            <MuiSkeleton variant="text" width={80} height={16} />
            <MuiSkeleton variant="text" width={60} height={14} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

interface StatsCardSkeletonProps {
  count?: number;
}

export function StatsCardSkeleton({ count = 4 }: StatsCardSkeletonProps) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <MuiSkeleton variant="text" width="60%" height={20} />
                <MuiSkeleton variant="circular" width={24} height={24} />
              </Box>
              <MuiSkeleton variant="text" width="40%" height={32} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default SkeletonLoader;

'use client';

import React from 'react';
import { Label } from '@/types/label.types';
import { LabelBadge } from './LabelBadge';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface LabelCardProps {
  label: Label;
  canEdit?: boolean;
  onEdit?: (label: Label) => void;
  onDelete?: (id: number) => void;
}

export function LabelCard({ label, canEdit = false, onEdit, onDelete }: LabelCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <LabelBadge label={label} size="md" />
          {canEdit && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onEdit?.(label)}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete?.(label.id)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {label.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {label.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {label.category}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(label.created_at).toLocaleDateString('vi-VN')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

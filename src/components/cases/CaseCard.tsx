'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CaseResponse } from '@/types/case.types';
import CaseStatusBadge from './CaseStatusBadge';

interface CaseCardProps {
  case_: CaseResponse;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function CaseCard({
  case_,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: CaseCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {case_.case_code}
          </Typography>
          <CaseStatusBadge status={case_.status} />
        </Box>

        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {case_.title}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Khách hàng:</strong> {case_.client_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Ngày tạo:</strong> {formatDate(case_.created_at)}
          </Typography>
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          {onView && (
            <Tooltip title="Xem chi tiết">
              <IconButton
                size="small"
                onClick={() => onView(case_.id)}
                color="primary"
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                onClick={() => onEdit(case_.id)}
                color="info"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                onClick={() => onDelete(case_.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      )}
    </Card>
  );
}

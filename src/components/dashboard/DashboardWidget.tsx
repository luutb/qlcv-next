'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  children,
  className,
  onEdit,
  onDelete,
  onRefresh
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    onEdit?.();
  };

  const handleDelete = () => {
    handleClose();
    onDelete?.();
  };

  const handleRefresh = () => {
    handleClose();
    onRefresh?.();
  };

  return (
    <Card className={className} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        }
        action={
          <IconButton
            aria-label="settings"
            onClick={handleClick}
            size="small"
          >
            <MoreVert />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      </CardContent>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onRefresh && (
          <MenuItem onClick={handleRefresh}>
            Refresh
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={handleEdit}>
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={handleDelete}>
            Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default DashboardWidget;
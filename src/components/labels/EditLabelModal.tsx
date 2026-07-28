'use client';

import React, { useState, useEffect } from 'react';
import { Label, UpdateLabelData } from '@/types/label.types';
import { LabelBadge } from './LabelBadge';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

interface EditLabelModalProps {
  label: Label | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditLabelModal({ label, isOpen, onClose, onSuccess }: EditLabelModalProps) {
  const [formData, setFormData] = useState<UpdateLabelData>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (label) {
      setFormData({
        name: label.name,
        color: label.color,
        bg_color: label.bg_color,
        icon: label.icon,
        description: label.description
      });
    }
  }, [label]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;

    setIsLoading(true);

    try {
      if (!formData.name?.trim()) {
        toast.error('Vui lòng nhập tên label');
        setIsLoading(false);
        return;
      }

      await fetch(`/api/v1/labels/${label.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      toast.success('Cập nhật label thành công');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật label');
      console.error('Update label error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  if (!label) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Chỉnh sửa Label
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Name */}
            <TextField
              fullWidth
              label="Tên Label *"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên label"
              required
              inputProps={{ maxLength: 100 }}
            />

            {/* Colors */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Màu chữ *"
                  type="color"
                  value={formData.color || '#000000'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  InputProps={{
                    sx: {
                      height: 56,
                      padding: 1
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Màu nền *"
                  type="color"
                  value={formData.bg_color || '#F3F4F6'}
                  onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                  InputProps={{
                    sx: {
                      height: 56,
                      padding: 1
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Icon */}
            <TextField
              fullWidth
              label="Icon (Emoji)"
              value={formData.icon || ''}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🏷️"
              inputProps={{ maxLength: 10 }}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả về label này"
              inputProps={{ maxLength: 255 }}
            />

            {/* Preview */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <LabelBadge label={{ ...label, ...formData }} size="sm" />
                <LabelBadge label={{ ...label, ...formData }} size="md" />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

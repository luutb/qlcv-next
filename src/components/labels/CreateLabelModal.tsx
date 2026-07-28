'use client';

import React, { useState } from 'react';
import { LabelCategory, CreateLabelData } from '@/types/label.types';
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
  MenuItem,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

interface CreateLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { value: LabelCategory.CUSTOMER, label: 'Khách hàng' },
  { value: LabelCategory.CONTRACT, label: 'Hợp đồng' },
  { value: LabelCategory.SPECIAL, label: 'Đặc biệt' },
  { value: LabelCategory.CUSTOM, label: 'Tùy chỉnh' }
];

export function CreateLabelModal({ isOpen, onClose, onSuccess }: CreateLabelModalProps) {
  const [formData, setFormData] = useState<CreateLabelData>({
    name: '',
    color: '#000000',
    bg_color: '#F3F4F6',
    icon: '',
    description: '',
    category: LabelCategory.CUSTOM
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Vui lòng nhập tên label');
        setIsLoading(false);
        return;
      }

      await fetch('/api/v1/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      toast.success('Tạo label thành công');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo label');
      console.error('Create label error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#000000',
      bg_color: '#F3F4F6',
      icon: '',
      description: '',
      category: LabelCategory.CUSTOM
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
          Tạo Label Mới
        </Typography>
        <IconButton onClick={onClose} size="small">
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
              value={formData.name}
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
                  value={formData.color}
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
                  value={formData.bg_color}
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
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🏷️"
              inputProps={{ maxLength: 10 }}
            />

            {/* Category */}
            <TextField
              fullWidth
              select
              label="Danh mục *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Exclude<LabelCategory, LabelCategory.WORKFLOW | LabelCategory.PAYMENT | LabelCategory.STATUS | LabelCategory.PRIORITY> })}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Description */}
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description}
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
                <LabelBadge label={formData} size="sm" />
                <LabelBadge label={formData} size="md" />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? 'Đang tạo...' : 'Tạo Label'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

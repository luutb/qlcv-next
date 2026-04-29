'use client';

import {
  Box, Typography, Paper, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Alert, IconButton,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  DataObject,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

interface CustomField {
  id?: number;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  options?: string[];
  is_required: boolean;
  default_value?: string;
  order: number;
}

interface CustomFieldInstance {
  field_id: number;
  value: string;
}

interface CustomFieldsProps {
  fields: CustomField[];
  instances?: CustomFieldInstance[];
  onUpdate?: (instances: CustomFieldInstance[]) => Promise<void>;
  disabled?: boolean;
}

export default function CustomFields({
  fields,
  instances = [],
  onUpdate,
  disabled = false,
}: CustomFieldsProps) {
  const [open, setOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    field_type: CustomField['field_type'];
    options: string;
    is_required: boolean;
    default_value: string;
  }>({
    name: '',
    field_type: 'text',
    options: '',
    is_required: false,
    default_value: '',
  });
  const [fieldInstances, setFieldInstances] = useState<CustomFieldInstance[]>(instances);

  // Update instances when prop changes
  useEffect(() => {
    setFieldInstances(instances);
  }, [instances]);

  const handleOpen = (field?: CustomField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        field_type: field.field_type,
        options: field.options?.join(', ') || '',
        is_required: field.is_required,
        default_value: field.default_value || '',
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        field_type: 'text',
        options: '',
        is_required: false,
        default_value: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingField(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const field: CustomField = {
      id: editingField?.id,
      name: formData.name,
      field_type: formData.field_type,
      options: formData.options.split(',').map((o) => o.trim()).filter(Boolean),
      is_required: formData.is_required,
      default_value: formData.default_value || undefined,
      order: editingField?.order || fields.length,
    };

    // TODO: Save field to backend
    console.log('Field data:', field);

    handleClose();
  };

  const handleDeleteField = async (fieldId: number) => {
    // TODO: Delete field from backend
    console.log('Delete field:', fieldId);
  };

  const handleInstanceChange = (fieldId: number, value: string) => {
    setFieldInstances((prev) => {
      const existing = prev.find((i) => i.field_id === fieldId);
      if (existing) {
        return prev.map((i) => i.field_id === fieldId ? { ...i, value } : i);
      }
      return [...prev, { field_id: fieldId, value }];
    });
  };

  const handleSaveInstances = async () => {
    if (onUpdate) {
      await onUpdate(fieldInstances);
    }
  };

  const getFieldValue = (field: CustomField) => {
    const instance = fieldInstances.find((i) => i.field_id === field.id);
    return instance?.value || field.default_value || '';
  };

  const renderFieldInput = (field: CustomField, value: string) => {
    switch (field.field_type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => handleInstanceChange(field.id!, e.target.value)}
            disabled={disabled}
            placeholder={field.default_value}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            value={value}
            onChange={(e) => handleInstanceChange(field.id!, e.target.value)}
            disabled={disabled}
            placeholder={field.default_value}
          />
        );
      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            value={value}
            onChange={(e) => handleInstanceChange(field.id!, e.target.value)}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
            placeholder={field.default_value}
          />
        );
      case 'dropdown':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={value}
              onChange={(e) => handleInstanceChange(field.id!, e.target.value)}
              disabled={disabled}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'checkbox':
        return (
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => handleInstanceChange(field.id!, e.target.value)}
            disabled={disabled}
            placeholder={field.default_value || 'true/false'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DataObject fontSize="small" color="action" />
        <Typography variant="h6">Trường tùy chỉnh</Typography>
        <Chip
          label={`${fields.length} trường`}
          size="small"
          color="primary"
        />
      </Box>

      {/* Field Definitions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Định nghĩa trường
        </Typography>

        {fields.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Chưa có trường tùy chỉnh nào
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {fields.map((field) => (
              <Box
                key={field.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Chip
                  label={field.field_type}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Typography variant="body2" fontWeight="500">
                  {field.name}
                </Typography>
                {field.is_required && (
                  <Chip
                    label="Bắt buộc"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
                {!disabled && (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(field)}
                      title="Chỉnh sửa"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteField(field.id!)}
                      title="Xóa"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            ))}
          </Box>
        )}

        {!disabled && (
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ mt: 1 }}
          >
            Thêm trường
          </Button>
        )}
      </Paper>

      {/* Field Instances */}
      {fieldInstances.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Giá trị trường
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fields
              .filter((f) => fieldInstances.some((i) => i.field_id === f.id))
              .map((field) => (
                <Box key={field.id}>
                  <Typography variant="body2" fontWeight="500" gutterBottom>
                    {field.name}
                    {field.is_required && (
                      <Typography component="span" color="error">*</Typography>
                    )}
                  </Typography>
                  {renderFieldInput(field, getFieldValue(field))}
                </Box>
              ))}
          </Box>

          {!disabled && (
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveInstances}
              sx={{ mt: 2 }}
            >
              Lưu giá trị
            </Button>
          )}
        </Paper>
      )}

      {/* Add/Edit Field Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingField ? 'Chỉnh sửa trường' : 'Tạo trường mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên trường"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              select
              label="Loại trường"
              fullWidth
              value={formData.field_type}
              onChange={(e) => setFormData({ ...formData, field_type: e.target.value as any })}
            >
              <MenuItem value="text">Văn bản</MenuItem>
              <MenuItem value="number">Số</MenuItem>
              <MenuItem value="date">Ngày</MenuItem>
              <MenuItem value="dropdown">Dropdown</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
            </TextField>

            {formData.field_type === 'dropdown' && (
              <TextField
                label="Tùy chọn (cách nhau bằng dấu phẩy)"
                fullWidth
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                placeholder="Tùy chọn 1, Tùy chọn 2, Tùy chọn 3"
              />
            )}

            <TextField
              label="Giá trị mặc định"
              fullWidth
              value={formData.default_value}
              onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="required"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
              <label htmlFor="required">Bắt buộc</label>
            </Box>

            <Alert severity="info" sx={{ fontSize: 12 }}>
              Trường tùy chỉnh có thể được sử dụng để lưu trữ thông tin bổ sung cho hồ sơ.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingField ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

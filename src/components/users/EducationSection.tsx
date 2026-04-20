'use client';

import { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Paper,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import { UserEducation, CreateEducationRequest } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  educations: UserEducation[];
  onAdd: (data: CreateEducationRequest) => Promise<void>;
  onUpdate: (eduId: number, data: CreateEducationRequest) => Promise<void>;
  onDelete: (eduId: number) => Promise<void>;
}

const emptyForm: CreateEducationRequest = {
  institution: '',
  degree: '',
  field_of_study: '',
  start_year: undefined,
  end_year: undefined,
  gpa: '',
  description: '',
};

export default function EducationSection({ educations, onAdd, onUpdate, onDelete }: Props) {
  const [dialog, setDialog] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });
  const [form, setForm] = useState<CreateEducationRequest>(emptyForm);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setNum = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value ? Number(e.target.value) : undefined }));

  const openAdd = () => {
    setForm(emptyForm);
    setDialog({ open: true, editId: null });
  };

  const openEdit = (edu: UserEducation) => {
    setForm({
      institution: edu.institution,
      degree: edu.degree || '',
      field_of_study: edu.field_of_study || '',
      start_year: edu.start_year,
      end_year: edu.end_year,
      gpa: edu.gpa || '',
      description: edu.description || '',
    });
    setDialog({ open: true, editId: edu.id });
  };

  const handleSubmit = async () => {
    if (!form.institution.trim()) { toast.error('Tên trường không được để trống'); return; }
    setLoading(true);
    try {
      const payload: CreateEducationRequest = { ...form, institution: form.institution.trim() };
      if (!payload.degree) delete payload.degree;
      if (!payload.field_of_study) delete payload.field_of_study;
      if (!payload.start_year) delete payload.start_year;
      if (!payload.end_year) delete payload.end_year;
      if (!payload.gpa) delete payload.gpa;
      if (!payload.description) delete payload.description;

      if (dialog.editId) {
        await onUpdate(dialog.editId, payload);
        toast.success('Cập nhật thành công');
      } else {
        await onAdd(payload);
        toast.success('Thêm thành công');
      }
      setDialog({ open: false, editId: null });
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eduId: number) => {
    try {
      await onDelete(eduId);
      toast.success('Đã xóa');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Học vấn</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={openAdd}>Thêm</Button>
      </Box>

      {educations.length === 0 ? (
        <Typography color="text.secondary" variant="body2">Chưa có thông tin học vấn.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {educations.map((edu) => (
            <Paper key={edu.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ mt: 0.5 }}>
                <SchoolIcon color="primary" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{edu.institution}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {[edu.degree, edu.field_of_study].filter(Boolean).join(' - ') || 'Chưa cập nhật'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                  {(edu.start_year || edu.end_year) && (
                    <Typography variant="caption" color="text.secondary">
                      {edu.start_year || '?'} — {edu.end_year || 'Đang học'}
                    </Typography>
                  )}
                  {edu.gpa && (
                    <Typography variant="caption" color="text.secondary">
                      Xếp loại: {edu.gpa}
                    </Typography>
                  )}
                </Box>
                {edu.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    {edu.description}
                  </Typography>
                )}
              </Box>
              <Box>
                <Tooltip title="Sửa">
                  <IconButton size="small" onClick={() => openEdit(edu)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton size="small" color="error" onClick={() => handleDelete(edu.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, editId: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.editId ? 'Sửa' : 'Thêm'} thông tin học vấn</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Trường / Cơ sở đào tạo" fullWidth required value={form.institution} onChange={set('institution')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Trình độ" fullWidth value={form.degree} onChange={set('degree')}
              placeholder="VD: Cử nhân, Thạc sĩ, Tiến sĩ" />
            <TextField label="Chuyên ngành" fullWidth value={form.field_of_study} onChange={set('field_of_study')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Năm bắt đầu" type="number" fullWidth value={form.start_year ?? ''} onChange={setNum('start_year')}
              slotProps={{ htmlInput: { min: 1950, max: 2030 } }} />
            <TextField label="Năm tốt nghiệp" type="number" fullWidth value={form.end_year ?? ''} onChange={setNum('end_year')}
              slotProps={{ htmlInput: { min: 1950, max: 2030 } }}
              helperText="Để trống nếu đang học" />
          </Box>
          <TextField label="Xếp loại / Điểm TB" fullWidth value={form.gpa} onChange={set('gpa')}
            placeholder="VD: Giỏi, 3.5/4.0" />
          <TextField label="Ghi chú" fullWidth multiline rows={2} value={form.description} onChange={set('description')} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, editId: null })}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang xử lý...' : dialog.editId ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

'use client';

import { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Paper,
  TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { UserCertificate, CreateCertificateRequest } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  certificates: UserCertificate[];
  onAdd: (data: CreateCertificateRequest) => Promise<void>;
  onUpdate: (certId: number, data: CreateCertificateRequest) => Promise<void>;
  onDelete: (certId: number) => Promise<void>;
}

const TYPE_OPTIONS = [
  { value: 'degree', label: 'Bằng cấp' },
  { value: 'certificate', label: 'Chứng chỉ' },
];

const emptyForm: CreateCertificateRequest = {
  name: '',
  type: 'certificate',
  issuing_organization: '',
  issue_date: '',
  expiry_date: '',
  credential_id: '',
  file_url: '',
};

export default function CertificateSection({ certificates, onAdd, onUpdate, onDelete }: Props) {
  const [dialog, setDialog] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });
  const [form, setForm] = useState<CreateCertificateRequest>(emptyForm);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => {
    setForm(emptyForm);
    setDialog({ open: true, editId: null });
  };

  const openEdit = (cert: UserCertificate) => {
    setForm({
      name: cert.name,
      type: cert.type,
      issuing_organization: cert.issuing_organization || '',
      issue_date: cert.issue_date?.split('T')[0] || '',
      expiry_date: cert.expiry_date?.split('T')[0] || '',
      credential_id: cert.credential_id || '',
      file_url: cert.file_url || '',
    });
    setDialog({ open: true, editId: cert.id });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Tên bằng cấp/chứng chỉ không được để trống'); return; }
    setLoading(true);
    try {
      const payload: CreateCertificateRequest = { ...form, name: form.name.trim() };
      if (!payload.issuing_organization) delete payload.issuing_organization;
      if (!payload.issue_date) delete payload.issue_date;
      if (!payload.expiry_date) delete payload.expiry_date;
      if (!payload.credential_id) delete payload.credential_id;
      if (!payload.file_url) delete payload.file_url;

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

  const handleDelete = async (certId: number) => {
    try {
      await onDelete(certId);
      toast.success('Đã xóa');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Bằng cấp & Chứng chỉ</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={openAdd}>Thêm</Button>
      </Box>

      {certificates.length === 0 ? (
        <Typography color="text.secondary" variant="body2">Chưa có bằng cấp/chứng chỉ nào.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {certificates.map((cert) => (
            <Paper key={cert.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ mt: 0.5 }}>
                {cert.type === 'degree'
                  ? <SchoolIcon color="primary" />
                  : <CardMembershipIcon color="secondary" />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography fontWeight={600}>{cert.name}</Typography>
                  <Chip
                    label={cert.type === 'degree' ? 'Bằng cấp' : 'Chứng chỉ'}
                    size="small" variant="outlined"
                    color={cert.type === 'degree' ? 'primary' : 'secondary'}
                  />
                </Box>
                {cert.issuing_organization && (
                  <Typography variant="body2" color="text.secondary">{cert.issuing_organization}</Typography>
                )}
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                  {cert.issue_date && (
                    <Typography variant="caption" color="text.secondary">
                      Ngày cấp: {new Date(cert.issue_date).toLocaleDateString('vi-VN')}
                    </Typography>
                  )}
                  {cert.expiry_date && (
                    <Typography variant="caption" color="text.secondary">
                      Hết hạn: {new Date(cert.expiry_date).toLocaleDateString('vi-VN')}
                    </Typography>
                  )}
                  {cert.credential_id && (
                    <Typography variant="caption" color="text.secondary">
                      Mã: {cert.credential_id}
                    </Typography>
                  )}
                </Box>
                {cert.file_url && (
                  <Link href={cert.file_url} target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontSize: 13 }}>
                    <InsertDriveFileIcon sx={{ fontSize: 16 }} /> Xem file
                  </Link>
                )}
              </Box>
              <Box>
                <Tooltip title="Sửa">
                  <IconButton size="small" onClick={() => openEdit(cert)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton size="small" color="error" onClick={() => handleDelete(cert.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, editId: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.editId ? 'Sửa' : 'Thêm'} bằng cấp / chứng chỉ</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Tên bằng cấp/chứng chỉ" fullWidth required value={form.name} onChange={set('name')} />
          <TextField select label="Loại" fullWidth value={form.type} onChange={set('type')}>
            {TYPE_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
          <TextField label="Tổ chức cấp" fullWidth value={form.issuing_organization} onChange={set('issuing_organization')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Ngày cấp" type="date" fullWidth value={form.issue_date} onChange={set('issue_date')}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Ngày hết hạn" type="date" fullWidth value={form.expiry_date} onChange={set('expiry_date')}
              slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          <TextField label="Mã chứng chỉ" fullWidth value={form.credential_id} onChange={set('credential_id')} />
          <TextField label="URL file (nếu có)" fullWidth value={form.file_url} onChange={set('file_url')} />
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

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CaseMember, MemberRole } from '@/types/case.types';
import { caseService } from '@/services';
import UserSelect from '@/components/users/UserSelect';

// TODO: Replace with real API call to get user details
const getUserById = (userId: number) => {
  // This should be replaced with actual API call
  return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
};

interface CaseMembersProps {
  caseId: string;
  members: CaseMember[];
  onMembersChange?: () => void;
  readonly?: boolean;
}

interface AddMemberFormData {
  user_id: string;
  role_in_case: MemberRole;
}

export default function CaseMembers({
  caseId,
  members,
  onMembersChange,
  readonly = false,
}: CaseMembersProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CaseMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding member
  const [formData, setFormData] = useState<AddMemberFormData>({
    user_id: '',
    role_in_case: 'lawyer',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddMemberFormData, string>>>({});

  const handleAddMember = async () => {
    // Validate form
    const newErrors: Partial<Record<keyof AddMemberFormData, string>> = {};

    if (!formData.user_id) {
      newErrors.user_id = 'Vui lòng chọn thành viên';
    }

    setFormErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await caseService.addMember(caseId, {
        user_id: parseInt(formData.user_id),
        role_in_case: formData.role_in_case,
      });

      // Reset form and close dialog
      setFormData({ user_id: '', role_in_case: 'lawyer' });
      setAddDialogOpen(false);

      // Call callback to refresh members
      if (onMembersChange) {
        onMembersChange();
      }
    } catch (err: any) {
      console.error('Failed to add member:', err);
      const errorMessage = err.response?.data?.message || 'Không thể thêm thành viên';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMemberClick = (member: CaseMember) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      setError(null);

      await caseService.removeMember(caseId, selectedMember.user_id);

      setRemoveDialogOpen(false);
      setSelectedMember(null);

      // Call callback to refresh members
      if (onMembersChange) {
        onMembersChange();
      }
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa thành viên';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: MemberRole) => {
    return role === 'lawyer' ? 'Luật sư' : 'Hỗ trợ';
  };

  const getRoleColor = (role: MemberRole) => {
    return role === 'lawyer' ? 'primary' : 'default';
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2">
              Thành viên ({members.length})
            </Typography>
            {!readonly && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Thêm thành viên
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {members.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có thành viên nào
              </Typography>
              {!readonly && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Thêm thành viên đầu tiên
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={2}>
              {members.map((member) => {
                const user = getUserById(member.user_id);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: member.role_in_case === 'lawyer' ? 'primary.main' : 'grey.500',
                        }}
                      >
                        {user?.name.charAt(0) || 'U'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {user?.name || `User ${member.user_id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {user?.email || ''}
                        </Typography>
                        <Chip
                          label={getRoleLabel(member.role_in_case)}
                          size="small"
                          color={getRoleColor(member.role_in_case)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      {!readonly && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveMemberClick(member)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => !loading && setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm thành viên</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <UserSelect
              value={formData.user_id}
              onChange={(value) => setFormData({ ...formData, user_id: value })}
              label="Chọn thành viên *"
              error={!!formErrors.user_id}
              helperText={formErrors.user_id}
              excludeUserIds={members.map(m => m.user_id)}
              disabled={loading}
              fullWidth
            />

            <TextField
              fullWidth
              select
              label="Vai trò *"
              value={formData.role_in_case}
              onChange={(e) => setFormData({ ...formData, role_in_case: e.target.value as MemberRole })}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              <MenuItem value="lawyer">Luật sư</MenuItem>
              <MenuItem value="support">Hỗ trợ</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddDialogOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={loading || !formData.user_id}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {loading ? 'Đang thêm...' : 'Thêm thành viên'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => !loading && setRemoveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa thành viên này khỏi hồ sơ?
          </Typography>
          {selectedMember && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {getUserById(selectedMember.user_id)?.name || `User ${selectedMember.user_id}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vai trò: {getRoleLabel(selectedMember.role_in_case)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRemoveDialogOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleRemoveMemberConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Đang xóa...' : 'Xóa thành viên'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

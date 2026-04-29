'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, Box, Typography,
  TextField, Switch, FormControlLabel, Button, Chip,
  Grid, LinearProgress, Alert, CircularProgress,
  Autocomplete, Divider,
} from '@mui/material';
import {
  Save, Person, Schedule, TrendingUp,
  CheckCircle, Warning,
} from '@mui/icons-material';
import { workloadRepo, UserCapacity } from '@/repositories/WorkloadRepository';
import toast from 'react-hot-toast';

interface UserCapacitySettingsProps {
  userId?: number; // If not provided, will use current user
  onUpdate?: (capacity: UserCapacity) => void;
}

const SKILL_OPTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'C#', '.NET',
  'PHP', 'Laravel', 'Django', 'Spring Boot',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'AWS', 'Azure', 'Docker', 'Kubernetes',
  'Git', 'CI/CD', 'Testing', 'Agile'
];

const TASK_TYPE_OPTIONS = [
  'development', 'bug_fix', 'code_review', 'testing',
  'documentation', 'deployment', 'maintenance', 'research'
];

const TASK_TYPE_LABELS: Record<string, string> = {
  development: 'Phát triển',
  bug_fix: 'Sửa lỗi',
  code_review: 'Review code',
  testing: 'Kiểm thử',
  documentation: 'Tài liệu',
  deployment: 'Triển khai',
  maintenance: 'Bảo trì',
  research: 'Nghiên cứu'
};

export default function UserCapacitySettings({ userId, onUpdate }: UserCapacitySettingsProps) {
  const [capacity, setCapacity] = useState<UserCapacity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    max_tasks_per_week: 8,
    max_hours_per_week: 40,
    is_available: true,
    skills: [] as string[],
    preferred_task_types: [] as string[],
    working_hours: '09:00-17:00',
    timezone: 'Asia/Ho_Chi_Minh'
  });

  useEffect(() => {
    fetchCapacity();
  }, [userId]);

  const fetchCapacity = async () => {
    setLoading(true);
    try {
      const data = userId 
        ? await workloadRepo.getUserCapacity(userId)
        : await workloadRepo.getCurrentUserCapacity();
      
      setCapacity(data);
      setFormData({
        max_tasks_per_week: data.max_tasks_per_week,
        max_hours_per_week: data.max_hours_per_week,
        is_available: data.is_available,
        skills: data.skills || [],
        preferred_task_types: data.preferences?.preferred_task_types || [],
        working_hours: data.preferences?.working_hours || '09:00-17:00',
        timezone: data.preferences?.timezone || 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      console.error('Error fetching capacity:', error);
      toast.error('Không thể tải thông tin capacity');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updateData = {
        max_tasks_per_week: formData.max_tasks_per_week,
        max_hours_per_week: formData.max_hours_per_week,
        is_available: formData.is_available,
        skills: formData.skills,
        preferences: {
          preferred_task_types: formData.preferred_task_types,
          working_hours: formData.working_hours,
          timezone: formData.timezone
        }
      };

      const updatedCapacity = userId
        ? await workloadRepo.updateUserCapacity(userId, updateData)
        : await workloadRepo.updateCurrentUserCapacity(updateData);

      setCapacity(updatedCapacity);
      toast.success('Đã cập nhật capacity settings');
      onUpdate?.(updatedCapacity);
    } catch (error) {
      console.error('Error updating capacity:', error);
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'error';
    if (utilization >= 75) return 'warning';
    return 'success';
  };

  const getUtilizationStatus = (utilization: number) => {
    if (utilization >= 90) return 'Quá tải';
    if (utilization >= 75) return 'Cao';
    if (utilization >= 50) return 'Trung bình';
    return 'Thấp';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        avatar={<Person />}
        title="Capacity Settings"
        subheader={capacity ? `Cài đặt cho ${capacity.user_name}` : 'Cài đặt capacity của bạn'}
      />
      
      <CardContent>
        {/* Current Status */}
        {capacity && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tình trạng hiện tại
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tasks tuần này
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={capacity.task_utilization}
                      color={getUtilizationColor(capacity.task_utilization)}
                      sx={{ flex: 1, height: 8 }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {capacity.task_utilization.toFixed(0)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {capacity.current_tasks_this_week}/{capacity.max_tasks_per_week} tasks
                  </Typography>
                  <Chip
                    label={getUtilizationStatus(capacity.task_utilization)}
                    size="small"
                    color={getUtilizationColor(capacity.task_utilization)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Giờ làm tuần này
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={capacity.hour_utilization}
                      color={getUtilizationColor(capacity.hour_utilization)}
                      sx={{ flex: 1, height: 8 }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {capacity.hour_utilization.toFixed(0)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {capacity.current_hours_this_week.toFixed(1)}/{capacity.max_hours_per_week}h
                  </Typography>
                  <Chip
                    label={getUtilizationStatus(capacity.hour_utilization)}
                    size="small"
                    color={getUtilizationColor(capacity.hour_utilization)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>

            {(capacity.task_utilization >= 90 || capacity.hour_utilization >= 90) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Bạn đang có workload cao. Hãy cân nhắc giảm capacity hoặc từ chối nhận thêm task mới.
                </Typography>
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Capacity */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Giới hạn Capacity
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Số tasks tối đa mỗi tuần"
                type="number"
                value={formData.max_tasks_per_week}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  max_tasks_per_week: parseInt(e.target.value) || 0
                }))}
                inputProps={{ min: 1, max: 50 }}
                helperText="Số lượng task tối đa bạn có thể nhận trong 1 tuần"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Số giờ tối đa mỗi tuần"
                type="number"
                value={formData.max_hours_per_week}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  max_hours_per_week: parseFloat(e.target.value) || 0
                }))}
                inputProps={{ min: 1, max: 80, step: 0.5 }}
                helperText="Số giờ làm việc tối đa trong 1 tuần"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_available: e.target.checked
                    }))}
                  />
                }
                label="Có thể nhận task mới"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Tắt tính năng này nếu bạn tạm thời không muốn nhận task mới
              </Typography>
            </Grid>

            {/* Skills */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Kỹ năng & Sở thích
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={SKILL_OPTIONS}
                value={formData.skills}
                onChange={(_, newValue) => setFormData(prev => ({
                  ...prev,
                  skills: newValue
                }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kỹ năng"
                    placeholder="Chọn hoặc thêm kỹ năng"
                    helperText="Các kỹ năng của bạn sẽ được dùng để gợi ý task phù hợp"
                  />
                )}
                freeSolo
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={TASK_TYPE_OPTIONS}
                value={formData.preferred_task_types}
                onChange={(_, newValue) => setFormData(prev => ({
                  ...prev,
                  preferred_task_types: newValue
                }))}
                getOptionLabel={(option) => TASK_TYPE_LABELS[option] || option}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={TASK_TYPE_LABELS[option] || option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Loại task ưa thích"
                    placeholder="Chọn loại task bạn muốn làm"
                    helperText="Hệ thống sẽ ưu tiên gợi ý các task thuộc loại này cho bạn"
                  />
                )}
              />
            </Grid>

            {/* Working Hours */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Thời gian làm việc
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Giờ làm việc"
                value={formData.working_hours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  working_hours: e.target.value
                }))}
                placeholder="09:00-17:00"
                helperText="Khung giờ làm việc của bạn (VD: 09:00-17:00)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Múi giờ"
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  timezone: e.target.value
                }))}
                SelectProps={{ native: true }}
              >
                <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
                <option value="Asia/Singapore">Singapore (UTC+8)</option>
                <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              </TextField>
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                >
                  {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
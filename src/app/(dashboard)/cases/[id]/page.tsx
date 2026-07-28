'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { caseService } from '@/services';
import { CaseDetailResponse, CaseStatus, TaskStatus } from '@/types/case.types';
import CaseStatusBadge from '@/components/cases/CaseStatusBadge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CaseMembers from '@/components/cases/CaseMembers';
import CaseTaskList from '@/components/cases/CaseTaskList';
import CreateTaskForm from '@/components/cases/CreateTaskForm';
import TaskDetail from '@/components/cases/TaskDetail';

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Task management state
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadCaseDetail();
    }
  }, [caseId]);

  const loadCaseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await caseService.getCase(caseId);
      setCaseDetail(data);
    } catch (err: any) {
      console.error('Failed to load case detail:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin hồ sơ';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/cases/${caseId}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await caseService.deleteCase(caseId);
      alert('Xóa hồ sơ thành công!');
      router.push('/cases');
    } catch (err: any) {
      console.error('Failed to delete case:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa hồ sơ';
      setError(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Task handlers
  const handleCreateTask = () => {
    setCreateTaskDialogOpen(true);
  };

  const handleCreateTaskSubmit = async (data: any) => {
    try {
      await caseService.createTask(data);
      await loadCaseDetail();
      setCreateTaskDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to create task:', err);
      throw err;
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await caseService.updateTaskStatus(taskId, { status });
      await loadCaseDetail();
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await caseService.deleteTask(taskId);
      await loadCaseDetail();
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusInfo = (status: CaseStatus) => {
    const statusMap = {
      open: { label: 'Mới', color: 'primary' as const },
      in_progress: { label: 'Đang xử lý', color: 'warning' as const },
      closed: { label: 'Đã đóng', color: 'success' as const },
    };
    return statusMap[status];
  };

  // Task statistics
  const getTaskStatistics = () => {
    const tasks = caseDetail?.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  const taskStats = getTaskStatistics();

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !caseDetail) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Không tìm thấy hồ sơ'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/cases')}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  const statusInfo = getStatusInfo(caseDetail.status);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Quản lý Hồ sơ', href: '/cases' },
    { label: caseDetail.case_code },
  ];

  return (
    <Container maxWidth="xl">
      <Breadcrumbs items={breadcrumbItems} />

      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/cases')}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {caseDetail.case_code}
            </Typography>
            <Typography variant="h5" color="text.secondary">
              {caseDetail.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <CaseStatusBadge status={caseDetail.status} />
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={caseDetail.status === 'closed'}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Xóa
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Case Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon />
              Thông tin hồ sơ
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Mã hồ sơ
                  </Typography>
                  <Typography variant="body1">
                    {caseDetail.case_code}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Trạng thái
                  </Typography>
                  <Chip
                    label={statusInfo.label}
                    color={statusInfo.color}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid size={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tên hồ sơ
                  </Typography>
                  <Typography variant="body1">
                    {caseDetail.title}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Khách hàng
                  </Typography>
                  <Typography variant="body1">
                    {caseDetail.client_name}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tasks Section */}
          <Box>
            {/* Task Statistics */}
            {taskStats.total > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tiến độ công việc
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hoàn thành: {taskStats.completed}/{taskStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(taskStats.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={taskStats.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                    }}
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid size={3}>
                    <Chip
                      label={`Tổng: ${taskStats.total}`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={3}>
                    <Chip
                      label={`Hoàn thành: ${taskStats.completed}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={3}>
                    <Chip
                      label={`Đang làm: ${taskStats.inProgress}`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={3}>
                    <Chip
                      label={`Bị chặn: ${taskStats.blocked}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            <CaseTaskList
              caseId={caseId}
              tasks={caseDetail.tasks || []}
              onCreateTask={caseDetail.status !== 'closed' ? handleCreateTask : undefined}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onTaskClick={handleTaskClick}
              readonly={caseDetail.status === 'closed'}
            />
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Timeline */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon />
              Thời gian
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ngày tạo
              </Typography>
              <Typography variant="body1">
                {formatDate(caseDetail.created_at)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cập nhật lần cuối
              </Typography>
              <Typography variant="body1">
                {formatDate(caseDetail.updated_at)}
              </Typography>
            </Box>
          </Paper>

          {/* Members */}
          <CaseMembers
            caseId={caseId}
            members={caseDetail.members || []}
            onMembersChange={loadCaseDetail}
            readonly={caseDetail.status === 'closed'}
          />
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa hồ sơ</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa hồ sơ "{caseDetail.case_code}"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Đang xóa...' : 'Xóa hồ sơ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Task Dialog */}
      <CreateTaskForm
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        onSubmit={handleCreateTaskSubmit}
        caseId={caseId}
        caseMembers={caseDetail.members || []}
      />

      {/* Task Detail Dialog */}
      <TaskDetail
        open={taskDetailOpen}
        task={selectedTask}
        onClose={() => {
          setTaskDetailOpen(false);
          setSelectedTask(null);
        }}
        onUpdateStatus={handleUpdateTaskStatus}
        onDeleteTask={handleDeleteTask}
        readonly={caseDetail.status === 'closed'}
      />
    </Container>
  );
}
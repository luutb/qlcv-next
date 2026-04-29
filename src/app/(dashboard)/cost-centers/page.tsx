'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  ChevronRight,
  Business,
  AccountTree,
} from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { CostCenter } from '@/types/budget';

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department_id: undefined as number | undefined,
    parent_id: undefined as number | undefined,
    cost_center_type: 'operational',
    annual_budget: 0,
    manager_id: undefined as number | undefined,
  });

  const fetchCostCenters = async () => {
    // Check if cost centers API is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_COST_CENTERS === 'true') {
      setError('Cost Centers API đã bị tắt. Vui lòng bật lại trong .env.local (NEXT_PUBLIC_DISABLE_COST_CENTERS=false)');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching cost centers...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Test API endpoint directly
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-centers`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct fetch response status:', testResponse.status);
      console.log('Direct fetch response headers:', testResponse.headers);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.log('Direct fetch error response:', errorText);
        throw new Error(`HTTP ${testResponse.status}: ${errorText}`);
      }
      
      const data = await budgetRepository.getCostCenters();
      console.log('Cost centers response:', data);
      setCostCenters(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cost centers:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Không thể tải danh sách trung tâm chi phí';
      if (err.response?.status === 500) {
        errorMessage = 'Lỗi server (500). Vui lòng kiểm tra API endpoint /cost-centers';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint /cost-centers không tồn tại (404)';
      } else if (err.response?.status === 401) {
        errorMessage = 'Không có quyền truy cập (401). Vui lòng đăng nhập lại';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCostCenters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const handleOpenDialog = (center?: CostCenter) => {
    if (center) {
      setEditingCenter(center);
      setFormData({
        code: center.code,
        name: center.name,
        description: center.description,
        department_id: center.department_id,
        parent_id: center.parent_id,
        cost_center_type: center.cost_center_type,
        annual_budget: center.annual_budget,
        manager_id: center.manager_id,
      });
    } else {
      setEditingCenter(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        department_id: undefined,
        parent_id: undefined,
        cost_center_type: 'operational',
        annual_budget: 0,
        manager_id: undefined,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCenter(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingCenter) {
        await budgetRepository.updateCostCenter(editingCenter.id, formData);
      } else {
        await budgetRepository.createCostCenter(formData);
      }
      fetchCostCenters();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving cost center:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (centerId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa trung tâm chi phí này?')) {
      try {
        await budgetRepository.deleteCostCenter(centerId);
        fetchCostCenters();
      } catch (err) {
        console.error('Error deleting cost center:', err);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getUtilization = (center: CostCenter) => {
    if (!center.annual_budget || center.annual_budget === 0) return 0;
    return center.current_spend ? (center.current_spend / center.annual_budget) * 100 : 0;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 70) return 'success';
    if (utilization < 90) return 'warning';
    return 'error';
  };

  const buildTree = (centers: CostCenter[], parentId?: number): CostCenter[] => {
    return centers
      .filter(center => center.parent_id === parentId)
      .map(center => ({
        ...center,
        children: buildTree(centers, center.id),
      }));
  };

  const renderTreeItem = (center: CostCenter) => {
    const utilization = getUtilization(center);
    
    return (
      <TreeItem
        key={center.id}
        itemId={center.id.toString()}
        label={
          <Box display="flex" alignItems="center" gap={1} py={0.5}>
            <Business fontSize="small" />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {center.name} ({center.code})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(center.current_spend || 0)} / {formatCurrency(center.annual_budget)}
              </Typography>
            </Box>
            <Chip
              label={`${utilization.toFixed(1)}%`}
              size="small"
              color={getUtilizationColor(utilization)}
            />
          </Box>
        }
      >
        {center.children?.map(child => renderTreeItem(child))}
      </TreeItem>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  const treeData = buildTree(costCenters);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AccountTree color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            Quản lý Trung tâm Chi phí
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Bảng
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('tree')}
            size="small"
          >
            Cây
          </Button>
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            variant="contained"
          >
            Thêm trung tâm chi phí
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Card>
        {viewMode === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã / Tên</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Trung tâm cha</TableCell>
                  <TableCell align="right">Ngân sách năm</TableCell>
                  <TableCell align="right">Đã chi</TableCell>
                  <TableCell align="center">Tỷ lệ sử dụng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costCenters && costCenters.length > 0 ? (
                  costCenters.map((center) => {
                    const utilization = getUtilization(center);
                    return (
                      <TableRow key={center.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {center.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {center.code}
                            </Typography>
                            {center.description && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {center.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={center.cost_center_type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {center.parent ? (
                            <Typography variant="body2">
                              {center.parent.name}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Gốc
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(center.annual_budget)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="warning.main">
                            {formatCurrency(center.current_spend || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${utilization.toFixed(1)}%`}
                            size="small"
                            color={getUtilizationColor(utilization)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={center.is_active ? 'Hoạt động' : 'Không hoạt động'}
                            size="small"
                            color={center.is_active ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              onClick={() => handleOpenDialog(center)}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              onClick={() => handleDelete(center.id)}
                              size="small"
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={4}>
                        <Typography variant="body2" color="text.secondary">
                          Chưa có trung tâm chi phí nào. Nhấn "Thêm trung tâm chi phí" để bắt đầu.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <CardContent>
            {treeData && treeData.length > 0 ? (
              <SimpleTreeView
                sx={{ flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
              >
                {treeData.map(center => renderTreeItem(center))}
              </SimpleTreeView>
            ) : (
              <Box textAlign="center" py={8}>
                <AccountTree sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chưa có trung tâm chi phí nào
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Tạo trung tâm chi phí đầu tiên để bắt đầu quản lý cấu trúc tổ chức
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                  Thêm trung tâm chi phí
                </Button>
              </Box>
            )}
          </CardContent>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCenter ? 'Chỉnh sửa trung tâm chi phí' : 'Thêm trung tâm chi phí mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Mã trung tâm chi phí *"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tên trung tâm chi phí *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Trung tâm cha</InputLabel>
                <Select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value ? Number(e.target.value) : undefined }))}
                  label="Trung tâm cha"
                >
                  <MenuItem value="">Không có</MenuItem>
                  {costCenters
                    .filter(c => c.id !== editingCenter?.id)
                    .map((center) => (
                      <MenuItem key={center.id} value={center.id}>
                        {center.name} ({center.code})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Loại trung tâm chi phí</InputLabel>
                <Select
                  value={formData.cost_center_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_center_type: e.target.value }))}
                  label="Loại trung tâm chi phí"
                >
                  <MenuItem value="operational">Vận hành</MenuItem>
                  <MenuItem value="support">Hỗ trợ</MenuItem>
                  <MenuItem value="revenue">Doanh thu</MenuItem>
                  <MenuItem value="investment">Đầu tư</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ngân sách hàng năm"
                type="number"
                value={formData.annual_budget}
                onChange={(e) => setFormData(prev => ({ ...prev, annual_budget: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="ID người quản lý"
                type="number"
                value={formData.manager_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, manager_id: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.code || !formData.name}
            variant="contained"
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { caseService } from '@/services';
import { CaseResponse, CaseStatus, CaseQueryParams } from '@/types/case.types';
import CaseCard from '@/components/cases/CaseCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CaseCardSkeleton } from '@/components/ui/SkeletonLoader';

export default function CaseListPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');

  useEffect(() => {
    loadCases();
  }, [page, statusFilter]);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: CaseQueryParams = {
        limit,
        offset: (page - 1) * limit,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await caseService.getAll(params);
      setCases(response.data.data || response.data);
      const pagination = response.data.pagination || { total: response.data.length };
      setTotal(pagination.total);
      setTotalPages(Math.ceil(pagination.total / limit));
    } catch (err) {
      console.error('Failed to load cases:', err);
      setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadCases();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewCase = (id: string) => {
    router.push(`/cases/${id}`);
  };

  const handleEditCase = (id: string) => {
    router.push(`/cases/${id}/edit`);
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      return;
    }

    try {
      await caseService.deleteCase(id);
      loadCases();
    } catch (err) {
      console.error('Failed to delete case:', err);
      setError('Không thể xóa hồ sơ. Vui lòng thử lại.');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Quản lý Hồ sơ' },
  ];

  return (
    <Container maxWidth="xl">
      <Breadcrumbs items={breadcrumbItems} />

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý Hồ sơ Pháp lý
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/cases/create')}
          >
            Tạo hồ sơ mới
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên hoặc mã hồ sơ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="open">Mới</MenuItem>
                <MenuItem value="in_progress">Đang xử lý</MenuItem>
                <MenuItem value="closed">Đã đóng</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  fullWidth
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadCases}
                >
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Cases Grid */}
        {loading ? (
          <CaseCardSkeleton count={6} />
        ) : cases.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy hồ sơ nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || statusFilter
                ? 'Thử thay đổi điều kiện tìm kiếm'
                : 'Bắt đầu bằng cách tạo hồ sơ mới'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tìm thấy {total} hồ sơ
            </Typography>
            <Grid container spacing={3}>
              {cases.map((case_) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={case_.id}>
                  <CaseCard
                    case_={case_}
                    onView={handleViewCase}
                    onEdit={handleEditCase}
                    onDelete={handleDeleteCase}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

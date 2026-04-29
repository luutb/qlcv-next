'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, Button, CircularProgress, Alert, MenuItem, TextField,
} from '@mui/material';
import {
  PeopleAlt, Assignment, TrendingUp, Warning,
  Refresh, FilterList,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { workloadRepo, WorkloadUser, WorkloadMetrics } from '@/repositories/WorkloadRepository';
import toast from 'react-hot-toast';

const WORKLOAD_COLORS = {
  low: '#4caf50',
  medium: '#ff9800', 
  high: '#ff5722',
  overloaded: '#f44336'
};

const WORKLOAD_LABELS = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  overloaded: 'Quá tải'
};

export default function WorkloadDashboard() {
  const [workloadData, setWorkloadData] = useState<WorkloadUser[]>([]);
  const [metrics, setMetrics] = useState<WorkloadMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [departmentFilter, roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, metricsData] = await Promise.all([
        workloadRepo.getUsersWorkloadV2({
          role: roleFilter || undefined,
        }),
        workloadRepo.getMetrics()
      ]);
      
      setWorkloadData(usersData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching workload data:', error);
      toast.error('Không thể tải dữ liệu workload');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await workloadRepo.refreshWorkloadData();
      await fetchData();
      toast.success('Đã cập nhật dữ liệu workload');
    } catch (error) {
      toast.error('Không thể cập nhật dữ liệu');
    } finally {
      setRefreshing(false);
    }
  };

  const getWorkloadColor = (level: string) => WORKLOAD_COLORS[level as keyof typeof WORKLOAD_COLORS] || '#9e9e9e';

  const pieChartData = metrics ? [
    { name: 'Thấp', value: metrics.workload_distribution.low, fill: WORKLOAD_COLORS.low },
    { name: 'Trung bình', value: metrics.workload_distribution.medium, fill: WORKLOAD_COLORS.medium },
    { name: 'Cao', value: metrics.workload_distribution.high, fill: WORKLOAD_COLORS.high },
    { name: 'Quá tải', value: metrics.workload_distribution.overloaded, fill: WORKLOAD_COLORS.overloaded },
  ] : [];

  const departmentChartData = metrics ? Object.values(metrics.department_metrics).map(dept => ({
    name: dept.department_name,
    workload: (dept.average_workload * 100).toFixed(1),
    users: dept.total_users,
    available: dept.available_users,
  })) : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Workload Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Cập nhật dữ liệu
        </Button>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleAlt />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {metrics?.total_users || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Tổng nhân viên
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {metrics?.available_users || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Có thể nhận việc
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {metrics?.overloaded_users || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Quá tải
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {metrics ? (metrics.average_workload * 100).toFixed(1) : 0}%
                  </Typography>
                  <Typography color="text.secondary">
                    Workload trung bình
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Phân bố Workload
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workload theo Phòng ban
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="workload" fill="#8884d8" name="Workload (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FilterList />
          <TextField
            select
            label="Vai trò"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="accountant">Accountant</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Workload Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Tasks đang làm</TableCell>
                <TableCell>Workload</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Skills</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workloadData.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {user.user_name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {user.user_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{user.active_tasks}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={user.workload_score * 100}
                        sx={{
                          width: 80,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getWorkloadColor(user.workload_level)
                          }
                        }}
                      />
                      <Typography variant="caption">
                        {(user.workload_score * 100).toFixed(0)}%
                      </Typography>
                      <Chip
                        label={WORKLOAD_LABELS[user.workload_level]}
                        size="small"
                        sx={{
                          backgroundColor: getWorkloadColor(user.workload_level),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={user.capacity_utilization}
                      sx={{ width: 80 }}
                    />
                    <Typography variant="caption">
                      {user.capacity_utilization.toFixed(0)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_available ? 'Có thể nhận việc' : 'Bận'}
                      color={user.is_available ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.skills.slice(0, 3).map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                      {user.skills.length > 3 && (
                        <Chip label={`+${user.skills.length - 3}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Overloaded Users Alert */}
      {metrics && metrics.overloaded_users > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Có {metrics.overloaded_users} nhân viên đang bị quá tải. 
            Hãy xem xét phân bổ lại công việc hoặc tăng cường nhân lực.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
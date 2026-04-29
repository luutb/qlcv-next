'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  MarkEmailRead,
  Settings,
  Add,
} from '@mui/icons-material';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { BudgetAlert } from '@/types/budget';

interface BudgetAlertsTabProps {
  budgetId: number;
  onRefresh: () => void;
}

export default function BudgetAlertsTab({ budgetId, onRefresh }: BudgetAlertsTabProps) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [acknowledging, setAcknowledging] = useState<number[]>([]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await budgetRepository.getBudgetAlerts(budgetId);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách cảnh báo');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [budgetId]);

  const handleAcknowledge = async (alertId: number) => {
    try {
      setAcknowledging(prev => [...prev, alertId]);
      await budgetRepository.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      onRefresh();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    } finally {
      setAcknowledging(prev => prev.filter(id => id !== alertId));
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      const alertIds = alerts.filter(alert => alert.is_active).map(alert => alert.id);
      setAcknowledging(alertIds);
      await budgetRepository.acknowledgeAlerts(alertIds);
      setAlerts(prev => prev.filter(alert => !alert.is_active));
      onRefresh();
    } catch (err) {
      console.error('Error acknowledging all alerts:', err);
    } finally {
      setAcknowledging([]);
    }
  };

  const getAlertIcon = (level: BudgetAlert['alert_level']) => {
    switch (level) {
      case 'critical':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Info color="info" />;
    }
  };

  const getAlertColor = (level: BudgetAlert['alert_level']) => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAlertTypeLabel = (type: BudgetAlert['alert_type']) => {
    switch (type) {
      case 'threshold_exceeded':
        return 'Vượt ngưỡng';
      case 'over_budget':
        return 'Vượt ngân sách';
      case 'forecast':
        return 'Dự báo';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const activeAlerts = alerts.filter(alert => alert.is_active);
  const acknowledgedAlerts = alerts.filter(alert => !alert.is_active);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
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

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Active Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Cảnh báo đang hoạt động</Typography>
                  {activeAlerts.length > 0 && (
                    <Chip
                      label={activeAlerts.length}
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              }
              action={
                <Box>
                  {activeAlerts.length > 0 && (
                    <Button
                      size="small"
                      onClick={handleAcknowledgeAll}
                      disabled={acknowledging.length > 0}
                      startIcon={<MarkEmailRead />}
                    >
                      Đánh dấu tất cả
                    </Button>
                  )}
                  <Tooltip title="Cài đặt cảnh báo">
                    <IconButton onClick={() => setSettingsOpen(true)}>
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent sx={{ p: 0 }}>
              {activeAlerts.length === 0 ? (
                <Box p={3} textAlign="center">
                  <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Không có cảnh báo nào
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {activeAlerts.map((alert) => (
                    <ListItem
                      key={alert.id}
                      sx={{
                        borderLeft: 4,
                        borderLeftColor: `${getAlertColor(alert.alert_level)}.main`,
                        borderLeftStyle: 'solid',
                        bgcolor: `${getAlertColor(alert.alert_level)}.light`,
                        mb: 1,
                        mx: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemIcon>
                        {getAlertIcon(alert.alert_level)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="body2" fontWeight="medium">
                              {alert.message}
                            </Typography>
                            <Chip
                              label={getAlertTypeLabel(alert.alert_type)}
                              size="small"
                              color={getAlertColor(alert.alert_level)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Ngưỡng: {alert.threshold}% | Hiện tại: {alert.current_value}%
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(alert.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Đánh dấu đã đọc">
                          <IconButton
                            edge="end"
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={acknowledging.includes(alert.id)}
                            size="small"
                          >
                            {acknowledging.includes(alert.id) ? (
                              <CircularProgress size={20} />
                            ) : (
                              <MarkEmailRead />
                            )}
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alert History */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Lịch sử cảnh báo" />
            <CardContent sx={{ p: 0 }}>
              {acknowledgedAlerts.length === 0 ? (
                <Box p={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Chưa có lịch sử cảnh báo
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {acknowledgedAlerts.slice(0, 10).map((alert) => (
                    <ListItem key={alert.id} divider>
                      <ListItemIcon>
                        {getAlertIcon(alert.alert_level)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="text.secondary">
                            {alert.message}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Đã xác nhận: {alert.acknowledged_at ? formatDate(alert.acknowledged_at) : 'N/A'}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Tạo lúc: {formatDate(alert.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Statistics */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Thống kê cảnh báo" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error">
                      {alerts.filter(a => a.alert_level === 'critical').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nghiêm trọng
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {alerts.filter(a => a.alert_level === 'warning').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cảnh báo
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {alerts.filter(a => a.alert_level === 'info').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thông tin
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {acknowledgedAlerts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đã xử lý
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cài đặt cảnh báo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Ngưỡng cảnh báo (%)"
                type="number"
                defaultValue={80}
                inputProps={{ min: 0, max: 100 }}
                helperText="Cảnh báo khi sử dụng vượt quá ngưỡng này"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Tần suất kiểm tra</InputLabel>
                <Select defaultValue="daily" label="Tần suất kiểm tra">
                  <MenuItem value="hourly">Hàng giờ</MenuItem>
                  <MenuItem value="daily">Hàng ngày</MenuItem>
                  <MenuItem value="weekly">Hàng tuần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thông báo</InputLabel>
                <Select defaultValue="system" label="Phương thức thông báo">
                  <MenuItem value="system">Hệ thống</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="both">Cả hai</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Hủy
          </Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Lưu cài đặt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
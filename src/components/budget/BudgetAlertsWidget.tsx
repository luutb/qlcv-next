'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Refresh,
  MarkEmailRead,
} from '@mui/icons-material';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { BudgetAlert } from '@/types/budget';

interface BudgetAlertsWidgetProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

export default function BudgetAlertsWidget({ refreshTrigger, onRefresh }: BudgetAlertsWidgetProps) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState<number[]>([]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await budgetRepository.getActiveAlerts();
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
  }, [refreshTrigger]);

  const handleAcknowledge = async (alertId: number) => {
    try {
      setAcknowledging(prev => [...prev, alertId]);
      await budgetRepository.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      onRefresh?.();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    } finally {
      setAcknowledging(prev => prev.filter(id => id !== alertId));
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      const alertIds = alerts.map(alert => alert.id);
      setAcknowledging(alertIds);
      await budgetRepository.acknowledgeAlerts(alertIds);
      setAlerts([]);
      onRefresh?.();
    } catch (err) {
      console.error('Error acknowledging all alerts:', err);
    } finally {
      setAcknowledging([]);
    }
  };

  const getAlertIcon = (level: BudgetAlert['alert_level'], type: BudgetAlert['alert_type']) => {
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

  if (loading) {
    return (
      <Card>
        <CardHeader title="Cảnh báo Ngân sách" />
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Cảnh báo Ngân sách" />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Cảnh báo Ngân sách</Typography>
            {alerts.length > 0 && (
              <Badge badgeContent={alerts.length} color="error">
                <Warning />
              </Badge>
            )}
          </Box>
        }
        action={
          <Tooltip title="Làm mới">
            <IconButton onClick={fetchAlerts} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        {alerts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Không có cảnh báo nào
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {alerts.map((alert, index) => (
              <ListItem
                key={alert.id}
                divider={index < alerts.length - 1}
                sx={{
                  px: 0,
                  py: 1,
                  borderLeft: 4,
                  borderLeftColor: `${getAlertColor(alert.alert_level)}.main`,
                  borderLeftStyle: 'solid',
                  pl: 2,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: `${getAlertColor(alert.alert_level)}.light`,
                  '&:hover': {
                    bgcolor: `${getAlertColor(alert.alert_level)}.light`,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getAlertIcon(alert.alert_level, alert.alert_type)}
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
      {alerts.length > 0 && (
        <CardActions>
          <Button
            startIcon={<MarkEmailRead />}
            onClick={handleAcknowledgeAll}
            disabled={acknowledging.length > 0}
            size="small"
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
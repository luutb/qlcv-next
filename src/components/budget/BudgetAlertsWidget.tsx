'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  IconButton,
  Alert
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { budgetService } from '@/services';
import { BudgetAlert } from '@/types/budget';

interface BudgetAlertsWidgetProps {
  className?: string;
}

const BudgetAlertsWidget: React.FC<BudgetAlertsWidgetProps> = ({ className }) => {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getActiveAlerts();
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Error fetching budget alerts:', err);
      setError('Failed to load budget alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await budgetService.acknowledgeAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'success';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Budget Alerts
          </Typography>
          <Typography>Loading alerts...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Budget Alerts
          </Typography>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Budget Alerts ({alerts.length})
        </Typography>
        
        {alerts.length === 0 ? (
          <Typography color="textSecondary">
            No active budget alerts
          </Typography>
        ) : (
          <List dense>
            {alerts.map((alert) => (
              <ListItem
                key={alert.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    <Close />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {getAlertIcon(alert.alert_type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                      <Chip
                        label={alert.alert_type}
                        size="small"
                        color={getAlertColor(alert.alert_type) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={`Budget: ${alert.budget_name || 'Unknown'}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetAlertsWidget;
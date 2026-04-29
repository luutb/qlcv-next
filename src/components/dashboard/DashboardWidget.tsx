'use client';

import { Box, Paper, IconButton, Typography } from '@mui/material';
import { DragIndicator, Close, Settings } from '@mui/icons-material';
import { DashboardWidget as DashboardWidgetType } from '@/lib/config/types';
import KPIWidget from './KPIWidget';
import ChartWidget from './ChartWidget';
import ForecastWidget from './ForecastWidget';

interface DashboardWidgetProps {
  widget: DashboardWidgetType;
  onRemove?: (id: string) => void;
  onSettings?: (id: string) => void;
  draggable?: boolean;
}

export default function DashboardWidget({
  widget,
  onRemove,
  onSettings,
  draggable = false,
}: DashboardWidgetProps) {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'kpi':
        return <KPIWidget config={widget.config} />;
      case 'chart':
        return <ChartWidget config={widget.config} />;
      case 'forecast':
        return <ForecastWidget config={widget.config} />;
      case 'custom':
        return (
          <Box p={2}>
            <Typography>Custom Widget</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {draggable && (
            <DragIndicator
              sx={{ cursor: 'grab', color: 'text.secondary' }}
              className="drag-handle"
            />
          )}
          <Typography variant="h6" component="h3">
            {widget.title}
          </Typography>
        </Box>

        <Box>
          {onSettings && (
            <IconButton size="small" onClick={() => onSettings(widget.id)}>
              <Settings fontSize="small" />
            </IconButton>
          )}
          {onRemove && (
            <IconButton size="small" onClick={() => onRemove(widget.id)}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>{renderWidgetContent()}</Box>
    </Paper>
  );
}

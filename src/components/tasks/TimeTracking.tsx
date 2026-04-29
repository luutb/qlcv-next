'use client';

import {
  Alert, Box, Typography, Paper, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  History,
  Timer,
  Add,
} from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';

interface TimeEntry {
  id?: number;
  task_id: number;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  description?: string;
  created_at: string;
}

interface TimeTrackingProps {
  taskId: number;
  entries?: TimeEntry[];
  onTrackTime?: (entry: Omit<TimeEntry, 'id' | 'created_at'>) => Promise<TimeEntry>;
  onStopTracking?: (entryId: number) => Promise<void>;
}

export default function TimeTracking({
  taskId,
  entries = [],
  onTrackTime,
  onStopTracking,
}: TimeTrackingProps) {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [newEntryStart, setNewEntryStart] = useState(new Date().toISOString());

  // Timer effect
  useEffect(() => {
    if (activeEntry && !activeEntry.end_time) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeEntry.start_time).getTime();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(0);
    }
  }, [activeEntry]);

  // Format seconds to HH:MM:SS
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format date to Vietnamese format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Start tracking
  const handleStartTracking = async () => {
    if (!onTrackTime) return;

    try {
      const entry: Omit<TimeEntry, 'id' | 'created_at'> = {
        task_id: taskId,
        start_time: newEntryStart,
        duration_seconds: 0,
        description: description.trim() || undefined,
      };

      const result = await onTrackTime(entry);
      setActiveEntry(result);
      setDescription('');
      setNewEntryStart(new Date().toISOString());
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  };

  // Stop tracking
  const handleStopTracking = async () => {
    if (!activeEntry || !onStopTracking) return;

    try {
      await onStopTracking(activeEntry.id!);
      setActiveEntry(null);
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  };

  // Get total time for task
  const getTotalTime = () => {
    return entries.reduce((acc, entry) => acc + entry.duration_seconds, 0);
  };

  // Get today's time
  const getTodayTime = () => {
    const today = new Date().toDateString();
    return entries
      .filter((e) => new Date(e.start_time).toDateString() === today)
      .reduce((acc, entry) => acc + entry.duration_seconds, 0);
  };

  return (
    <Box>
      {/* Active Timer */}
      {activeEntry && !activeEntry.end_time && (
        <Paper
          sx={{
            p: 3,
            mb: 2,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Đang theo dõi thời gian
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
              {formatDuration(elapsedSeconds)}
            </Typography>
            {activeEntry.description && (
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                {activeEntry.description}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<Stop />}
            onClick={handleStopTracking}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            Dừng
          </Button>
        </Paper>
      )}

      {/* Time Summary */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Timer fontSize="small" color="action" />
          <Typography variant="h6">Tổng thời gian</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Hôm nay
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
              {formatDuration(getTodayTime())}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Tổng cộng
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
              {formatDuration(getTotalTime())}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Start/Stop Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {!activeEntry ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrow />}
            onClick={() => setOpenDialog(true)}
            fullWidth
          >
            Bắt đầu theo dõi
          </Button>
        ) : (
          <Button
            variant="contained"
            color="warning"
            startIcon={<Pause />}
            onClick={handleStopTracking}
            fullWidth
          >
            Tạm dừng
          </Button>
        )}
      </Box>

      {/* Time Entries List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <History fontSize="small" color="action" />
          <Typography variant="h6">Lịch sử thời gian</Typography>
          <Chip
            label={`${entries.length} lần`}
            size="small"
            color="primary"
          />
        </Box>

        {entries.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            Chưa có dữ liệu theo dõi thời gian
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entries.map((entry) => (
              <Paper
                key={entry.id ?? entry.start_time}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {formatDate(entry.start_time)}
                    </Typography>
                    {entry.description && (
                      <Typography variant="caption" color="text.secondary">
                        {entry.description}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={formatDuration(entry.duration_seconds)}
                    size="small"
                    color={entry.end_time ? 'default' : 'success'}
                    variant="outlined"
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Start Tracking Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bắt đầu theo dõi thời gian</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Mô tả công việc"
              multiline
              rows={2}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về công việc đang làm..."
            />

            <TextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              fullWidth
              value={newEntryStart}
              onChange={(e) => setNewEntryStart(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Alert severity="info" sx={{ fontSize: 12 }}>
              Hệ thống sẽ tự động tính toán thời gian từ thời điểm bắt đầu đến khi bạn dừng.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleStartTracking}
            variant="contained"
            disabled={!description.trim() && !newEntryStart}
          >
            Bắt đầu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

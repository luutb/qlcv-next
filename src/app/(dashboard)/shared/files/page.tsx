'use client';

import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import FileUpload from '@/components/files/FileUpload';
import FileVersionHistory from '@/components/files/FileVersionHistory';
import StorageQuota from '@/components/files/StorageQuota';

export default function FilesPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>Quản lý file</Typography>

      <StorageQuota quota={{
        used_bytes: 350 * 1024 * 1024,
        limit_bytes: 1024 * 1024 * 1024,
        percentage_used: (350 / 1024) * 100,
        last_updated: new Date().toISOString(),
      }} />

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Tải lên file" />
          <Tab label="Lịch sử phiên bản" />
        </Tabs>

        <Box p={3}>
          {tab === 0 && (
            <FileUpload
              onUpload={async (file) => {
                console.log('Uploaded:', file);
                return { id: 0, file_name: file.name, file_size: file.size, file_type: file.type, uploaded_at: new Date().toISOString(), uploaded_by: 0, version: 1 };
              }}
            />
          )}
          {tab === 1 && (
            <FileVersionHistory versions={[]} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}

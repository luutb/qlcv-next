'use client';

import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
} from '@mui/material';
import { useState } from 'react';

interface WorkflowTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  step_count: number;
  is_default: boolean;
  steps: any[];
}

interface WorkflowTemplateLibraryProps {
  templates: WorkflowTemplate[];
  onSelect?: (template: WorkflowTemplate) => void;
}

export default function WorkflowTemplateLibrary({
  templates,
  onSelect,
}: WorkflowTemplateLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
  };

  const handleClose = () => {
    setSelectedTemplate(null);
  };

  const handleApply = () => {
    if (selectedTemplate && onSelect) {
      onSelect(selectedTemplate);
      handleClose();
    }
  };

  const getCategoryColor = (category: string): 'error' | 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' => {
    const colors: Record<string, 'error' | 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
      default: 'default',
      contract: 'primary',
      payment: 'success',
      approval: 'info',
      internal: 'warning',
    };
    return colors[category] || 'default';
  };

  const formatStepCount = (count: number) => {
    return count === 1 ? '1 bước' : `${count} bước`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip label="Mẫu quy trình" size="small" color="primary" />
        <Chip
          label={`${templates.length} mẫu`}
          size="small"
          color="secondary"
        />
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Tìm kiếm mẫu..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchTerm ? 'Không tìm thấy mẫu nào' : 'Chưa có mẫu quy trình'}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
          {filteredTemplates.map((template) => (
            <Box key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleSelect(template)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={template.category}
                      size="small"
                      color={getCategoryColor(template.category)}
                      variant="outlined"
                    />
                    {template.is_default && (
                      <Chip
                        label="Mặc định"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatStepCount(template.step_count)}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="500">
                      Xem chi tiết
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth onClick={() => handleSelect(template)}>
                    Chọn mẫu
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Template Details Dialog */}
      <Dialog
        open={!!selectedTemplate}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              {selectedTemplate.name}
              {selectedTemplate.is_default && (
                <Chip
                  label="Mặc định"
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedTemplate.description}
                </Typography>

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Các bước:
                </Typography>
                <Paper sx={{ p: 2 }}>
                  {selectedTemplate.steps.map((step: any, idx: number) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="500">
                        Bước {idx + 1}: {step.step_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.required_role} • {step.require_file ? 'Yêu cầu file' : 'Không yêu cầu file'}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Hủy</Button>
              <Button
                onClick={handleApply}
                variant="contained"
                disabled={!onSelect}
              >
                Áp dụng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

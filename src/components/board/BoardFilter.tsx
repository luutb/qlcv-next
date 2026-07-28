'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Typography,
  IconButton,
  Collapse,
  Button,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  InsertEmoticon as MilestoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface Label {
  id: number;
  name: string;
  color: string;
  bg_color: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
}

interface Milestone {
  id: number;
  title: string;
  due_date: string | null;
}

interface BoardFilterProps {
  onFilterChange: (filters: {
    search: string;
    labels: number[];
    assignees: number[];
    milestones: number[];
  }) => void;
  availableLabels?: Label[];
  availableUsers?: User[];
  availableMilestones?: Milestone[];
}

export default function BoardFilter({
  onFilterChange,
  availableLabels = [],
  availableUsers = [],
  availableMilestones = [],
}: BoardFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    onFilterChange({
      search: value,
      labels: selectedLabels,
      assignees: selectedAssignees,
      milestones: selectedMilestones,
    });
  };

  const handleLabelToggle = (labelId: number) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter((id) => id !== labelId)
      : [...selectedLabels, labelId];
    setSelectedLabels(newLabels);
    onFilterChange({
      search,
      labels: newLabels,
      assignees: selectedAssignees,
      milestones: selectedMilestones,
    });
  };

  const handleAssigneeToggle = (assigneeId: number) => {
    const newAssignees = selectedAssignees.includes(assigneeId)
      ? selectedAssignees.filter((id) => id !== assigneeId)
      : [...selectedAssignees, assigneeId];
    setSelectedAssignees(newAssignees);
    onFilterChange({
      search,
      labels: selectedLabels,
      assignees: newAssignees,
      milestones: selectedMilestones,
    });
  };

  const handleMilestoneToggle = (milestoneId: number) => {
    const newMilestones = selectedMilestones.includes(milestoneId)
      ? selectedMilestones.filter((id) => id !== milestoneId)
      : [...selectedMilestones, milestoneId];
    setSelectedMilestones(newMilestones);
    onFilterChange({
      search,
      labels: selectedLabels,
      assignees: selectedAssignees,
      milestones: newMilestones,
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedLabels([]);
    setSelectedAssignees([]);
    setSelectedMilestones([]);
    onFilterChange({
      search: '',
      labels: [],
      assignees: [],
      milestones: [],
    });
  };

  const activeFiltersCount =
    selectedLabels.length +
    selectedAssignees.length +
    selectedMilestones.length +
    (search.trim() !== '' ? 1 : 0);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header with search and expand button */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Search field */}
        <TextField
          placeholder="Tìm kiếm..."
          size="small"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: search && (
              <IconButton
                size="small"
                onClick={() => handleSearchChange({ target: { value: '' } } as any)}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ),
          }}
          sx={{
            flex: 1,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            },
          }}
        />

        {/* Filter toggle button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => setExpanded(!expanded)}
          startIcon={
            <Badge badgeContent={activeFiltersCount} color="primary">
              <FilterListIcon />
            </Badge>
          }
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
          }}
        >
          Bộ lọc
        </Button>

        {/* Clear all button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="text"
            size="small"
            onClick={clearAllFilters}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      {/* Expandable filters */}
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Labels filter */}
          {availableLabels.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LabelIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Labels
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {availableLabels.map((label) => {
                  const isSelected = selectedLabels.includes(label.id);
                  return (
                    <Chip
                      key={label.id}
                      label={label.name}
                      size="small"
                      onClick={() => handleLabelToggle(label.id)}
                      delete={isSelected}
                      deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        backgroundColor: isSelected ? label.bg_color : '#f0f0f0',
                        color: isSelected ? label.color : '#666',
                        border: isSelected ? `1px solid ${label.color}` : '1px solid #ddd',
                        fontWeight: isSelected ? 600 : 400,
                        '&:hover': {
                          backgroundColor: isSelected ? label.bg_color : '#e0e0e0',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: isSelected ? label.color : '#666',
                          fontSize: 14,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Assignees filter */}
          {availableUsers.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Người được giao
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {availableUsers.map((user) => {
                  const isSelected = selectedAssignees.includes(user.id);
                  return (
                    <Chip
                      key={user.id}
                      label={user.name}
                      size="small"
                      onClick={() => handleAssigneeToggle(user.id)}
                      delete={isSelected}
                      deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                      avatar={
                        <Avatar
                          src={user.avatar_url}
                          sx={{ width: 16, height: 16, fontSize: '0.65rem' }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                      }
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        backgroundColor: isSelected ? '#e3f2fd' : '#f0f0f0',
                        color: isSelected ? '#1976d2' : '#666',
                        border: isSelected ? '1px solid #1976d2' : '1px solid #ddd',
                        fontWeight: isSelected ? 600 : 400,
                        '&:hover': {
                          backgroundColor: isSelected ? '#e3f2fd' : '#e0e0e0',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: isSelected ? '#1976d2' : '#666',
                          fontSize: 14,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Milestones filter */}
          {availableMilestones.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <MilestoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Milestones
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {availableMilestones.map((milestone) => {
                  const isSelected = selectedMilestones.includes(milestone.id);
                  return (
                    <Chip
                      key={milestone.id}
                      label={milestone.title}
                      size="small"
                      onClick={() => handleMilestoneToggle(milestone.id)}
                      delete={isSelected}
                      deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        backgroundColor: isSelected ? '#e8f5e9' : '#f0f0f0',
                        color: isSelected ? '#388e3c' : '#666',
                        border: isSelected ? '1px solid #388e3c' : '1px solid #ddd',
                        fontWeight: isSelected ? 600 : 400,
                        '&:hover': {
                          backgroundColor: isSelected ? '#e8f5e9' : '#e0e0e0',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: isSelected ? '#388e3c' : '#666',
                          fontSize: 14,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
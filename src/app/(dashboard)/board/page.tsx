'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewColumn as ColumnIcon,
  ToggleOn as SwimlaneIcon,
} from '@mui/icons-material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import apiClient from '@/api/client';
import TaskCard from '@/components/board/TaskCard';
import BoardFilter from '@/components/board/BoardFilter';
import TaskSidebar from '@/components/board/TaskSidebar';
import Swimlane, { groupTasksBySwimlane } from '@/components/board/Swimlane';
import { Task, Label } from '@/types/board';

interface Column {
  id: string;
  title: string;
  status: string;
  tasks: Task[];
  limit?: number; // GitLab-style WIP limit
}

const INITIAL_COLUMNS: Column[] = [
  { id: 'todo', title: 'Cần làm', status: 'TODO', tasks: [] },
  { id: 'in_progress', title: 'Đang làm', status: 'IN_PROGRESS', tasks: [] },
  { id: 'review', title: 'Đang review', status: 'IN_REVIEW', tasks: [] },
  { id: 'done', title: 'Hoàn thành', status: 'DONE', tasks: [] },
];

const getPriorityColor = (priority: Label) => {
  // Use the color from the label
  return priority.color;
};

const getPriorityLabel = (priority: Label) => {
  return priority.name;
};

const getStatusColor = (status: Label) => {
  return status.color;
};

const getStatusBgColor = (status: Label) => {
  return status.bg_color;
};

// GitLab-style Droppable Column Component
function DroppableColumn({ column, children }: { column: Column; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Box>
      <Paper
        ref={setNodeRef}
        sx={{
          minHeight: '600px',
          backgroundColor: isOver ? '#e6f0ff' : '#fcfcfc',
          transition: 'background-color 0.2s ease',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)',
          borderRadius: 1.5,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        {/* GitLab-style Column Header */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="subtitle2"
              fontWeight="600"
              sx={{
                color: '#333',
                fontSize: '0.875rem',
              }}
            >
              {column.title}
            </Typography>
            {column.limit && (
              <Chip
                label={`${column.tasks.length}/${column.limit}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  backgroundColor:
                    column.tasks.length >= column.limit ? '#db3b21' : '#666',
                  color: 'white',
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            )}
          </Box>
          {!column.limit && (
            <Chip
              label={column.tasks.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                backgroundColor: '#e0e0e0',
                color: '#333',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>

        {/* GitLab-style Column Content */}
        <SortableContext
          items={column.tasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <Box
            sx={{
              p: 1,
              minHeight: '500px',
              backgroundColor: '#fcfcfc',
            }}
          >
            {children}
          </Box>
        </SortableContext>
      </Paper>
    </Box>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // GitLab-style features state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTask, setSidebarTask] = useState<Task | null>(null);
  const [showSwimlanes, setShowSwimlanes] = useState(false);
  const [swimlaneBy, setSwimlaneBy] = useState<'milestone' | 'assignee' | 'none'>('none');
  const [filters, setFilters] = useState({
    search: '',
    labels: [] as number[],
    assignees: [] as number[],
    milestones: [] as number[],
  });

  // Mock data for filters (replace with API calls)
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableMilestones, setAvailableMilestones] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/tasks', {
        params: {
          page: 1,
          limit: 100,
        }
      });

      console.log('Full API Response:', response);
      console.log('Response.data:', response.data);

      const responseData = response.data as any;
      let tasks: Task[] = [];

      // Handle the nested data structure from your API
      if (responseData.data && responseData.data.data && Array.isArray(responseData.data.data)) {
        tasks = responseData.data.data;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        tasks = responseData.data;
      } else if (Array.isArray(responseData)) {
        tasks = responseData;
      }

      console.log('Extracted tasks:', tasks);
      console.log('Tasks count:', tasks.length);

      // Group tasks by their status field (not workflow step)
      const newColumns = INITIAL_COLUMNS.map(column => {
        const columnTasks = tasks.filter(task => {
          // Map task status to column status
          // Nếu task có status là "ACTIVE", có thể cần mapping khác
          // Hoặc sử dụng task_status label thay vì status field
          let taskStatus = task.status?.toUpperCase();
          
          // Nếu status là "ACTIVE", có thể cần xem task_status label
          if (taskStatus === 'ACTIVE') {
            // Tạm thời đặt tất cả ACTIVE tasks vào cột "Cần làm"
            taskStatus = 'TODO';
          }
          
          return taskStatus === column.status;
        });
        console.log(`Column ${column.title} (${column.status}):`, columnTasks.length, 'tasks');
        return {
          ...column,
          tasks: columnTasks
        };
      });

      console.log('New columns:', newColumns);

      setColumns(newColumns);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError('Không thể tải danh sách công việc. Vui lòng thử lại.');
      
      // For development: If API fails, show empty columns
      if (process.env.NODE_ENV === 'development') {
        console.log('Using empty columns for development');
        setColumns(INITIAL_COLUMNS);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await apiClient.put(`/tasks/${taskId}`, {
        status: newStatus
      });
      
      // Refresh tasks after update
      await fetchTasks();
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      setError('Không thể cập nhật trạng thái công việc.');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks)
      .find(task => task.id.toString() === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = columns
      .flatMap(col => col.tasks)
      .find(task => task.id.toString() === active.id);

    if (!activeTask) return;

    // Check if dropped on a column or task
    let targetColumnId = over.id.toString();
    
    // If dropped on a task, find its column
    if (!columns.find(col => col.id === targetColumnId)) {
      // Find which column contains the target task
      const targetTask = columns
        .flatMap(col => col.tasks)
        .find(task => task.id.toString() === targetColumnId);
      
      if (targetTask) {
        const targetColumn = columns.find(col => 
          col.tasks.some(task => task.id === targetTask.id)
        );
        if (targetColumn) {
          targetColumnId = targetColumn.id;
        }
      }
    }

    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (!targetColumn) return;

    // Check if status is different
    const currentStatus = activeTask.status?.toUpperCase();
    const mappedCurrentStatus = currentStatus === 'ACTIVE' ? 'TODO' : currentStatus;
    
    if (mappedCurrentStatus === targetColumn.status) return;

    // Update task status
    await updateTaskStatus(activeTask.id, targetColumn.status);
  };

  const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleTaskMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  // GitLab-style handlers
  const handleFilterChange = (newFilters: {
    search: string;
    labels: number[];
    assignees: number[];
    milestones: number[];
  }) => {
    setFilters(newFilters);
  };

  const handleTaskClick = (task: Task) => {
    setSidebarTask(task);
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSidebarTask(null);
  };

  const handleSidebarEdit = (task: Task) => {
    router.push(`/shared/tasks/${task.id}`);
  };

  const handleSwimlaneToggle = () => {
    setShowSwimlanes(!showSwimlanes);
  };

  const handleSwimlaneByChange = (value: 'milestone' | 'assignee' | 'none') => {
    setSwimlaneBy(value);
    setShowSwimlanes(value !== 'none');
  };

  const handleEditTask = () => {
    if (selectedTask) {
      router.push(`/shared/tasks/${selectedTask.id}`);
    }
    handleTaskMenuClose();
  };

  const handleViewTask = () => {
    if (selectedTask) {
      router.push(`/shared/tasks/${selectedTask.id}`);
    }
    handleTaskMenuClose();
  };

  const handleDeleteTask = async () => {
    if (selectedTask) {
      if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        try {
          await apiClient.delete(`/tasks/${selectedTask.id}`);
          await fetchTasks(); // Refresh the list
        } catch (err) {
          console.error('Failed to delete task:', err);
          setError('Không thể xóa công việc.');
        }
      }
    }
    handleTaskMenuClose();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#fafbfc', minHeight: '100vh' }}>
      {/* GitLab-style Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="600" sx={{ mb: 0.25 }}>
              Board
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý và theo dõi tiến độ công việc
            </Typography>
          </Box>

          {/* GitLab-style controls */}
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="swimlane-select-label">Swimlanes</InputLabel>
              <Select
                labelId="swimlane-select-label"
                value={swimlaneBy}
                label="Swimlanes"
                onChange={(e) => handleSwimlaneByChange(e.target.value as 'milestone' | 'assignee' | 'none')}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="none">Tắt</MenuItem>
                <MenuItem value="milestone">Theo Milestone</MenuItem>
                <MenuItem value="assignee">Theo Assignee</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            router.push('/cases/create');
          }}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
          }}
        >
          Task mới
        </Button>
      </Box>

      {/* GitLab-style BoardFilter */}
      <BoardFilter
        onFilterChange={handleFilterChange}
        availableLabels={availableLabels}
        availableUsers={availableUsers}
        availableMilestones={availableMilestones}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* GitLab-style Board with Swimlanes */}
        {showSwimlanes && swimlaneBy !== 'none' ? (
          // Swimlane view
          (() => {
            // Group all tasks by swimlane
            const allTasks = columns.flatMap((column) => column.tasks);
            const swimlanes = groupTasksBySwimlane(allTasks, swimlaneBy);

            return (
              <Box>
                {swimlanes.map((swimlane, swimlaneIndex) => (
                  <Swimlane
                    key={swimlane.id}
                    swimlane={swimlane}
                    swimlaneIndex={swimlaneIndex}
                    totalSwimlanes={swimlanes.length}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(1, 1fr)',
                          sm: 'repeat(2, 1fr)',
                          lg: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      {columns.map((column) => {
                        // Filter tasks for this column and swimlane
                        const columnTasks = column.tasks.filter((task) => {
                          if (swimlaneBy === 'milestone') {
                            const taskMilestoneId = task.milestone?.id || 'no-milestone';
                            return taskMilestoneId === swimlane.id;
                          }
                          if (swimlaneBy === 'assignee') {
                            const taskAssigneeIds = task.assignees && task.assignees.length > 0
                              ? task.assignees.map((a: any) => a.id).join(',')
                              : 'no-assignee';
                            return taskAssigneeIds === swimlane.id;
                          }
                          return true;
                        });

                        if (columnTasks.length === 0) {
                          // Show empty column placeholder
                          return (
                            <DroppableColumn
                              key={`${column.id}-${swimlane.id}`}
                              column={{
                                ...column,
                                tasks: [],
                              }}
                            >
                              <Box
                                sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  color: 'text.secondary',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Không có task
                              </Box>
                            </DroppableColumn>
                          );
                        }

                        return (
                          <DroppableColumn
                            key={`${column.id}-${swimlane.id}`}
                            column={{
                              ...column,
                              tasks: columnTasks,
                            }}
                          >
                            {columnTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onMenuOpen={handleTaskMenuOpen}
                                onClick={handleTaskClick}
                              />
                            ))}
                          </DroppableColumn>
                        );
                      })}
                    </Box>
                  </Swimlane>
                ))}
              </Box>
            );
          })()
        ) : (
          // Standard view without swimlanes
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}>
            {columns.map((column) => (
              <DroppableColumn key={column.id} column={column}>
                {column.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onMenuOpen={handleTaskMenuOpen}
                    onClick={handleTaskClick}
                  />
                ))}
              </DroppableColumn>
            ))}
          </Box>
        )}

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onMenuOpen={() => {}}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* GitLab-style Task Sidebar */}
      <TaskSidebar
        open={sidebarOpen}
        task={sidebarTask}
        onClose={handleSidebarClose}
        onEdit={handleSidebarEdit}
      />

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleTaskMenuClose}
      >
        <MenuItem onClick={handleEditTask}>
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleViewTask}>
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          Xóa
        </MenuItem>
      </Menu>
    </Box>
  );
}
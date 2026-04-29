'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, CircularProgress, Alert, Link as MuiLink, Tabs, Tab,
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineDot, TimelineContent,
} from '@mui/lab';
import {
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskHistory, WorkflowStepConfig, PaymentAction, Contract, CreateContractRequest, ContractType } from '@/types';
import { getStepConfig, canUserActOnStep } from '@/lib/workflow';
import { extractErrorMessage } from '@/lib/errors';
import apiClient from '@/api/client';

// Inline API helpers to avoid module resolution issues
const taskRepo = {
  getTaskDetail: (id: string) => apiClient.get<Task>(`/tasks/${id}`).then(r => r.data),
  getTaskHistory: (id: string) => apiClient.get<TaskHistory[]>(`/tasks/${id}/history`).then(r => r.data),
  nextStep: (id: string, data: { note?: string; current_step: number; file?: File }) => {
    const fd = new FormData();
    if (data.note) fd.append('note', data.note);
    fd.append('current_step', data.current_step.toString());
    if (data.file) fd.append('file', data.file);
    return apiClient.post(`/tasks/${id}/next-step`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  confirmPayment: (id: string, action: PaymentAction, amount: number, note?: string) =>
    apiClient.post(`/tasks/${id}/payment`, { action, amount, note }),
  completeTask: (id: string, note?: string) => apiClient.post(`/tasks/${id}/complete`, { note }),
  approveTask: (id: string, data: { note?: string; current_step: number }) => apiClient.post(`/tasks/${id}/approve`, data),
  rejectTask: (id: string, reason: string, current_step: number) => apiClient.post(`/tasks/${id}/reject`, { reason, current_step }),
};

const contractRepo = {
  getByTask: (id: string) => apiClient.get<Contract[]>(`/tasks/${id}/contracts`).then(r => r.data),
  create: (taskId: string, data: CreateContractRequest) => apiClient.post<Contract>(`/tasks/${taskId}/contracts`, data).then(r => r.data),
  update: (id: number, data: Partial<CreateContractRequest>) => apiClient.put<Contract>(`/contracts/${id}`, data).then(r => r.data),
};

const contractTypeRepo = {
  getAll: () => apiClient.get<ContractType[]>('/contract-types').then(r => r.data),
};

const workflowRepo = {
  getConfigs: (id: number) => apiClient.get<WorkflowStepConfig[]>(`/workflows/${id}/configs`).then(r => r.data),
};

const timeTrackingRepo = {
  getByTask: (id: number) => apiClient.get<any[]>(`/time-entries?task_id=${id}`).then(r => r.data).catch(() => []),
  create: (entry: any) => apiClient.post<any>('/time-entries', entry).then(r => r.data),
  stop: (id: number) => apiClient.post(`/time-entries/${id}/stop`),
};

const customFieldsRepo = {
  getAll: () => apiClient.get<any[]>('/custom-fields').then(r => r.data).catch(() => []),
  updateInstances: (fieldId: number, instances: any[]) => apiClient.put(`/custom-fields/${fieldId}/instances`, { instances }),
};

const repeatingTasksRepo = {
  getAll: () => apiClient.get<any[]>('/repeating-tasks').then(r => r.data).catch(() => []),
  create: (task: any) => apiClient.post<any>('/repeating-tasks', task).then(r => r.data),
  update: (id: number, task: any) => apiClient.put<any>(`/repeating-tasks/${id}`, task).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/repeating-tasks/${id}`),
};

const taskDependencyRepo = {
  getByTask: (id: number) => apiClient.get<any[]>(`/tasks/${id}/dependencies`).then(r => r.data).catch(() => []),
};

const workloadRepo = {
  getUsersWorkload: () => apiClient.get<any[]>('/workload/users').then(r => r.data).catch(() => []),
  autoAssign: (data: any) => apiClient.post('/tasks/auto-assign', data),
};

const resourceRepo = {
  getAll: () => apiClient.get<any[]>('/resources').then(r => r.data).catch(() => []),
  release: (id: number) => apiClient.delete(`/resources/${id}/release`),
};

const budgetRepo = {
  getAll: () => apiClient.get<any[]>('/budgets').then(r => r.data).catch(() => []),
  create: (data: any) => apiClient.post<any>('/budgets', data).then(r => r.data),
  update: (id: number, data: any) => apiClient.put<any>(`/budgets/${id}`, data).then(r => r.data),
  addExpense: (id: number, data: any) => apiClient.post(`/budgets/${id}/expenses`, data),
};

const documentRepo = {
  getAll: () => apiClient.get<any[]>('/documents').then(r => r.data).catch(() => []),
  upload: (taskId: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('task_id', taskId.toString());
    return apiClient.post<any>('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  delete: (id: number) => apiClient.delete(`/documents/${id}`),
  share: (id: number, permission: string) => apiClient.put(`/documents/${id}/share`, { permission }),
};

const customWorkflowRepo = {
  getAll: () => apiClient.get<any[]>('/custom-workflows').then(r => r.data).catch(() => []),
  create: (data: any) => apiClient.post<any>('/custom-workflows', data).then(r => r.data),
  update: (id: number, data: any) => apiClient.put<any>(`/custom-workflows/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/custom-workflows/${id}`),
};

const pwaRepo = {
  getStatus: () => apiClient.get<any>('/pwa/status').then(r => r.data),
  getSettings: () => apiClient.get<any>('/pwa/settings').then(r => r.data),
  updateSettings: (data: any) => apiClient.put('/pwa/settings', data),
  install: () => Promise.resolve(),
};
import TaskLayout from '@/components/tasks/TaskLayout';
import TaskLeftColumn from '@/components/tasks/TaskLeftColumn';
import ContractDialog from '@/components/contract/ContractDialog';
import TimeTracking from '@/components/tasks/TimeTracking';
import CustomFields from '@/components/tasks/CustomFields';
import RepeatingTask from '@/components/tasks/RepeatingTask';
import DependencyVisualization from '@/components/tasks/DependencyVisualization';
import WorkloadBalancing from '@/components/tasks/WorkloadBalancing';
import ResourceManagement from '@/components/tasks/ResourceManagement';
import BudgetTracking from '@/components/tasks/BudgetTracking';
import DocumentManagement from '@/components/tasks/DocumentManagement';
import CustomWorkflow from '@/components/tasks/CustomWorkflow';
import PWA from '@/components/tasks/PWA';
import toast from 'react-hot-toast';

const emptyContract: CreateContractRequest = {
  contract_number: '',
  title: '',
  value: undefined,
  signing_date: '',
  effective_date: '',
  expiry_date: '',
  status: 'draft',
  file_url: '',
  note: '',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepConfig[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rejectReason, setRejectReason] = useState('');

  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractEditId, setContractEditId] = useState<number | null>(null);
  const [contractForm, setContractForm] = useState<CreateContractRequest>(emptyContract);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);

  // New state for advanced features
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [fieldInstances, setFieldInstances] = useState<any[]>([]);
  const [repeatingTasks, setRepeatingTasks] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [usersWorkload, setUsersWorkload] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [customWorkflows, setCustomWorkflows] = useState<any[]>([]);
  const [pwaStatus, setPwaStatus] = useState<any>(null);
  const [pwaSettings, setPwaSettings] = useState<any>(null);

  const [tabValue, setTabValue] = useState(0);

  const normalizeContracts = (resp: unknown): Contract[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as Contract[];
    const r = resp as any;
    if (Array.isArray(r.data)) return r.data as Contract[];
    if (r.data && Array.isArray(r.data.data)) return r.data.data as Contract[];
    return [];
  };

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [taskData, historyData] = await Promise.all([
        taskRepo.getTaskDetail(taskId),
        taskRepo.getTaskHistory(taskId),
      ]);
      setTask(taskData);
      setHistory(historyData);

      if (taskData.contracts) {
        setContracts(normalizeContracts(taskData.contracts));
      } else {
        try {
          const contractsData = await contractRepo.getByTask(taskId);
          setContracts(normalizeContracts(contractsData));
        } catch {
          setContracts([]);
        }
      }

      if (taskData.workflow_id) {
        try {
          const configs = await workflowRepo.getConfigs(taskData.workflow_id);
          setWorkflowSteps(Array.isArray(configs) ? configs : []);
        } catch {
          setWorkflowSteps([]);
        }
      }

      // Load advanced features data
      await Promise.all([
        loadTimeEntries(),
        loadCustomFields(),
        loadRepeatingTasks(),
        loadDependencies(),
        loadWorkload(),
        loadResources(),
        loadBudgets(),
        loadDocuments(),
        loadCustomWorkflows(),
        loadPWA(),
      ]);

      setError(null);
    } catch {
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [taskId]);

  const loadTimeEntries = async () => {
    try {
      const entries = await timeTrackingRepo.getByTask(parseInt(taskId));
      setTimeEntries(entries);
    } catch {
      setTimeEntries([]);
    }
  };

  const loadCustomFields = async () => {
    try {
      const fields = await customFieldsRepo.getAll();
      setCustomFields(fields);
    } catch {
      setCustomFields([]);
    }
  };

  const loadRepeatingTasks = async () => {
    try {
      const tasks = await repeatingTasksRepo.getAll();
      setRepeatingTasks(tasks.filter((t: any) => t.task_id === parseInt(taskId)));
    } catch {
      setRepeatingTasks([]);
    }
  };

  const loadDependencies = async () => {
    try {
      const deps = await taskDependencyRepo.getByTask(parseInt(taskId));
      setDependencies(deps);
    } catch {
      setDependencies([]);
    }
  };

  const loadWorkload = async () => {
    try {
      const users = await workloadRepo.getUsersWorkload();
      setUsersWorkload(users);
    } catch {
      setUsersWorkload([]);
    }
  };

  const loadResources = async () => {
    try {
      const resources = await resourceRepo.getAll();
      setResources(resources);
    } catch {
      setResources([]);
    }
  };

  const loadBudgets = async () => {
    try {
      const allBudgets = await budgetRepo.getAll();
      setBudgets(allBudgets.filter((budget: { task_id?: number }) => budget.task_id === Number(taskId)));
    } catch {
      setBudgets([]);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await documentRepo.getAll();
      setDocuments(docs.filter((doc: { task_id?: number }) => doc.task_id === Number(taskId)));
    } catch {
      setDocuments([]);
    }
  };

  const loadCustomWorkflows = async () => {
    try {
      const workflows = await customWorkflowRepo.getAll();
      setCustomWorkflows(workflows);
    } catch {
      setCustomWorkflows([]);
    }
  };

  const loadPWA = async () => {
    try {
      const status = await pwaRepo.getStatus();
      const settings = await pwaRepo.getSettings();
      setPwaStatus(status);
      setPwaSettings(settings);
    } catch {
      setPwaStatus(null);
      setPwaSettings(null);
    }
  };

  const fetchContracts = useCallback(async () => {
    try {
      const data = await contractRepo.getByTask(taskId);
      setContracts(normalizeContracts(data));
    } catch { /* silent */ }
  }, [taskId]);

  const fetchContractTypes = async () => {
    try {
      const data = await contractTypeRepo.getAll();
      setContractTypes(data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchData();
    fetchContractTypes();
  }, [taskId, fetchContractTypes]);

  const totalSteps = workflowSteps.length || task?.total_steps || 0;

  const currentStepConfig: WorkflowStepConfig | undefined = task
    ? task.current_step_config || (workflowSteps.length > 0 ? getStepConfig(task.current_step, workflowSteps) : undefined)
    : undefined;

  const isPendingApproval = task?.step_status === 'PENDING_APPROVAL';
  const isManager = user?.role === 'admin' || user?.role === 'manager';

  const canAct = user && task && task.status === 'ACTIVE' && currentStepConfig
    ? (() => {
        const hasRole = workflowSteps.length > 0
          ? canUserActOnStep(user.role, task.current_step, workflowSteps)
          : user.role === 'admin' || currentStepConfig.required_role === user.role;

        if (isPendingApproval) {
          return isManager;
        }
        return hasRole;
      })()
    : false;

  const canAssign = user && isManager && task?.status === 'ACTIVE';

  // --- Handlers ---

  const handleNextStep = async (note?: string, file?: File) => {
    if (!task) return;
    try {
      await taskRepo.nextStep(taskId, {
        note: note || 'Chuyển bước',
        current_step: task.current_step,
        file,
      });
      toast.success(
        currentStepConfig?.require_approval
          ? 'Đã gửi yêu cầu duyệt'
          : 'Đã chuyển bước thành công',
      );
      await fetchData(false);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err) || 'Chuyển bước thất bại';
      toast.error(msg);
    }
  };

  const handleConfirmPayment = async (action: PaymentAction, amount: number, note?: string) => {
    try {
      await taskRepo.confirmPayment(taskId, action, amount, note);
      const label = action === 'confirm_collected' ? 'thu phí' : 'thanh toán';
      toast.success(`Đã xác nhận ${label}`);
      await fetchData(false);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err) || 'Xác nhận thất bại';
      toast.error(msg);
    }
  };

  const handleComplete = async (note?: string) => {
    try {
      await taskRepo.completeTask(taskId, note);
      toast.success('Hồ sơ đã hoàn tất');
      await fetchData(false);
    } catch {
      toast.error('Hoàn tất thất bại');
    }
  };

  const handleApprove = async (note?: string) => {
    if (!task) return;
    try {
      await taskRepo.approveTask(taskId, {
        note: note || 'Phê duyệt',
        current_step: task.current_step,
      });
      toast.success('Đã phê duyệt thành công');
      await fetchData(false);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err) || 'Phê duyệt thất bại';
      toast.error(msg);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || !task) return;
    try {
      await taskRepo.rejectTask(taskId, rejectReason, task.current_step);
      toast.success('Đã từ chối hồ sơ');
      setRejectReason('');
      await fetchData(false);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err) || 'Từ chối thất bại';
      toast.error(msg);
    }
  };

  // --- Contract handlers ---

  const setContractField = (field: keyof CreateContractRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === 'value' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value;
    setContractForm((prev) => ({ ...prev, [field]: val }));
  };

  const openCreateContract = () => {
    setContractEditId(null);
    setContractForm({ ...emptyContract, contract_type_id: undefined });
    setContractDialogOpen(true);
  };

  const openEditContract = (c: Contract) => {
    setContractEditId(c.id);
    setContractForm({
      contract_number: c.contract_number,
      contract_type_id: c.contract_type_id,
      title: c.title,
      value: c.value,
      signing_date: c.signing_date ? c.signing_date.split('T')[0] : '',
      effective_date: c.effective_date ? c.effective_date.split('T')[0] : '',
      expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : '',
      status: c.status,
      file_url: c.file_url || '',
      note: c.note || '',
    });
    setContractDialogOpen(true);
  };

  const handleSaveContract = async (data: CreateContractRequest) => {
    try {
      const payload = { ...data };
      if (!payload.signing_date) delete payload.signing_date;
      if (!payload.effective_date) delete payload.effective_date;
      if (!payload.expiry_date) delete payload.expiry_date;
      if (!payload.file_url) delete payload.file_url;
      if (!payload.note) delete payload.note;

      if (contractEditId) {
        await contractRepo.update(contractEditId, payload);
        toast.success('Đã cập nhật hợp đồng');
      } else {
        await contractRepo.create(taskId, payload);
        toast.success('Đã thêm hợp đồng');
      }
      setContractDialogOpen(false);
      setContractEditId(null);
      setContractForm(emptyContract);
      await fetchContracts();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err) || 'Lưu hợp đồng thất bại';
      toast.error(msg);
    }
  };

  // --- Advanced features handlers ---

  const handleTrackTime = async (entry: any) => {
    try {
      const result = await timeTrackingRepo.create(entry);
      await loadTimeEntries();
      return result;
    } catch (error) {
      console.error('Failed to track time:', error);
      throw error;
    }
  };

  const handleStopTracking = async (entryId: number) => {
    try {
      await timeTrackingRepo.stop(entryId);
      await loadTimeEntries();
    } catch (error) {
      console.error('Failed to stop tracking:', error);
      throw error;
    }
  };

  const handleUpdateCustomFields = async (instances: any[]) => {
    try {
      await customFieldsRepo.updateInstances(0, instances);
      setFieldInstances(instances);
    } catch (error) {
      console.error('Failed to update custom fields:', error);
      throw error;
    }
  };

  const handleAddRepeatingTask = async (task: any) => {
    try {
      const result = await repeatingTasksRepo.create({ ...task, task_id: parseInt(taskId) });
      await loadRepeatingTasks();
      return result;
    } catch (error) {
      console.error('Failed to add repeating task:', error);
      throw error;
    }
  };

  const handleUpdateRepeatingTask = async (task: any) => {
    try {
      await repeatingTasksRepo.update(task.id, task);
      await loadRepeatingTasks();
    } catch (error) {
      console.error('Failed to update repeating task:', error);
      throw error;
    }
  };

  const handleDeleteRepeatingTask = async (taskId: number) => {
    try {
      await repeatingTasksRepo.delete(taskId);
      await loadRepeatingTasks();
    } catch (error) {
      console.error('Failed to delete repeating task:', error);
      throw error;
    }
  };

  const handleAssignTask = async (userId: number, taskId: number) => {
    try {
      await workloadRepo.autoAssign({ task_id: taskId, user_id: userId });
      await loadWorkload();
    } catch (error) {
      console.error('Failed to assign task:', error);
      throw error;
    }
  };

  const handleAddBudget = async (budget: any) => {
    try {
      const result = await budgetRepo.create(budget);
      await loadBudgets();
      return result;
    } catch (error) {
      console.error('Failed to add budget:', error);
      throw error;
    }
  };

  const handleUpdateBudget = async (budget: any) => {
    try {
      await budgetRepo.update(budget.id, budget);
      await loadBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  };

  const handleAddExpense = async (budgetId: number, amount: number, description: string) => {
    try {
      await budgetRepo.addExpense(budgetId, { amount, description });
      await loadBudgets();
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  };

  const handleUploadDocument = async (file: File, targetTaskId?: number) => {
    try {
      const result = await documentRepo.upload(targetTaskId ?? Number(taskId), file);
      await loadDocuments();
      return result;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await documentRepo.delete(documentId);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  };

  const handleShareDocument = async (documentId: number, permission: 'private' | 'team' | 'public') => {
    try {
      await documentRepo.share(documentId, permission);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to share document:', error);
      throw error;
    }
  };

  const handleAddCustomWorkflow = async (workflow: any) => {
    try {
      const result = await customWorkflowRepo.create(workflow);
      await loadCustomWorkflows();
      return result;
    } catch (error) {
      console.error('Failed to add custom workflow:', error);
      throw error;
    }
  };

  const handleUpdateCustomWorkflow = async (workflow: any) => {
    try {
      await customWorkflowRepo.update(workflow.id, workflow);
      await loadCustomWorkflows();
    } catch (error) {
      console.error('Failed to update custom workflow:', error);
      throw error;
    }
  };

  const handleDeleteCustomWorkflow = async (workflowId: number) => {
    try {
      await customWorkflowRepo.delete(workflowId);
      await loadCustomWorkflows();
    } catch (error) {
      console.error('Failed to delete custom workflow:', error);
      throw error;
    }
  };

  const handleInstallPWA = async () => {
    try {
      await pwaRepo.install();
    } catch (error) {
      console.error('Failed to install PWA:', error);
      throw error;
    }
  };

  const handleToggleOffline = async (enabled: boolean) => {
    try {
      await pwaRepo.updateSettings({ enableOffline: enabled });
      await loadPWA();
    } catch (error) {
      console.error('Failed to toggle offline:', error);
      throw error;
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      await pwaRepo.updateSettings({ enablePushNotifications: enabled });
      await loadPWA();
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      throw error;
    }
  };

  const handleUpdatePWASettings = async (settings: any) => {
    try {
      await pwaRepo.updateSettings(settings);
      await loadPWA();
    } catch (error) {
      console.error('Failed to update PWA settings:', error);
      throw error;
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return <Alert severity="error">{error || 'Không tìm thấy hồ sơ'}</Alert>;
  }

  const stepLabels = workflowSteps.length > 0
    ? workflowSteps.map((s) => s.step_name)
    : [];

  const createdBy = typeof task.created_by === 'object' && task.created_by
    ? task.created_by.full_name
    : `User #${task.created_by}`;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <TaskLayout
      task={task}
      createdBy={createdBy}
      stepLabels={stepLabels}
      totalSteps={totalSteps}
      currentStepConfig={currentStepConfig}
      onBack={() => router.back()}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 420px' }, gap: 3 }}>
        <TaskLeftColumn
          task={task!}
          userRole={user!.role}
          currentStepConfig={currentStepConfig}
          totalSteps={totalSteps}
          canAct={canAct}
          canAssign={canAssign}
          handleNextStep={handleNextStep}
          handleConfirmPayment={handleConfirmPayment}
          handleComplete={handleComplete}
          handleApprove={handleApprove}
          handleReject={handleReject}
          fetchData={fetchData}
          contracts={contracts}
          contractTypes={contractTypes}
          openCreateContract={openCreateContract}
          openEditContract={openEditContract}
        />

        {/* Right column with tabs */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Lịch sử</Typography>
            </Box>

            {history.length === 0 ? (
              <Typography color="text.secondary">Chưa có hoạt động</Typography>
            ) : (
              <Timeline>
                {history.map((h, idx) => (
                  <TimelineItem key={h.id ?? idx}>
                    <TimelineSeparator>
                      <TimelineDot color={idx === 0 ? 'primary' : undefined} />
                      {idx < history.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {getActionLabel(h.action_type)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {h.user?.full_name ?? h.actor_name ?? `User #${h.created_by ?? h.user_id ?? '?'}`} • {h.created_at ? new Date(h.created_at).toLocaleString('vi-VN') : '-'}
                        </Typography>
                        {h.note && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {h.note}
                          </Typography>
                        )}
                        {h.file_url && (
                          <MuiLink href={h.file_url} target="_blank" rel="noopener" sx={{ display: 'block', mt: 0.5 }}>
                            Mở tài liệu
                          </MuiLink>
                        )}
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </Paper>

          {/* Tabs for advanced features */}
          <Paper sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Theo dõi thời gian" />
              <Tab label="Custom Fields" />
              <Tab label="Task lặp" />
              <Tab label="Dependencies" />
              <Tab label="Workload" />
              <Tab label="Resources" />
              <Tab label="Budget" />
              <Tab label="Documents" />
              <Tab label="Custom Workflow" />
              <Tab label="PWA" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <TimeTracking
                  taskId={parseInt(taskId)}
                  entries={timeEntries}
                  onTrackTime={handleTrackTime}
                  onStopTracking={handleStopTracking}
                />
              )}
              {tabValue === 1 && (
                <CustomFields
                  fields={customFields}
                  instances={fieldInstances}
                  onUpdate={handleUpdateCustomFields}
                />
              )}
              {tabValue === 2 && (
                <RepeatingTask
                  tasks={repeatingTasks}
                  onAdd={handleAddRepeatingTask}
                  onUpdate={handleUpdateRepeatingTask}
                  onDelete={handleDeleteRepeatingTask}
                />
              )}
              {tabValue === 3 && (
                <DependencyVisualization
                  taskId={parseInt(taskId)}
                  dependencies={dependencies}
                  tasks={[]}
                />
              )}
              {tabValue === 4 && (
                <WorkloadBalancing
                  users={usersWorkload}
                  onAssignTask={handleAssignTask}
                />
              )}
              {tabValue === 5 && (
                <ResourceManagement
                  resources={resources}
                  onAssign={handleAssignTask}
                  onRelease={async (id) => {
                    try {
                      await resourceRepo.release(id);
                      await loadResources();
                    } catch (error) {
                      console.error('Failed to release resource:', error);
                      throw error;
                    }
                  }}
                />
              )}
              {tabValue === 6 && (
                <BudgetTracking
                  budgets={budgets}
                  onAddBudget={handleAddBudget}
                  onUpdateBudget={handleUpdateBudget}
                  onAddExpense={handleAddExpense}
                />
              )}
              {tabValue === 7 && (
                <DocumentManagement
                  documents={documents}
                  onUpload={handleUploadDocument}
                  onDelete={handleDeleteDocument}
                  onShare={handleShareDocument}
                />
              )}
              {tabValue === 8 && (
                <CustomWorkflow
                  workflows={customWorkflows}
                  onAdd={handleAddCustomWorkflow}
                  onUpdate={handleUpdateCustomWorkflow}
                  onDelete={handleDeleteCustomWorkflow}
                />
              )}
              {tabValue === 9 && pwaStatus && pwaSettings && (
                <PWA
                  status={pwaStatus}
                  settings={pwaSettings}
                  onInstall={handleInstallPWA}
                  onToggleOffline={handleToggleOffline}
                  onToggleNotifications={handleToggleNotifications}
                  onUpdateSettings={handleUpdatePWASettings}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      <ContractDialog
        open={contractDialogOpen}
        onClose={() => setContractDialogOpen(false)}
        onSave={handleSaveContract}
        contract={contractEditId ? contracts.find((c) => c.id === contractEditId) || null : null}
        contractTypes={contractTypes}
      />
    </TaskLayout>
  );
}

function getActionLabel(type: TaskHistory['action_type']): string {
  const labels: Record<TaskHistory['action_type'], string> = {
    NEXT_STEP: 'Chuyển bước',
    REJECT: 'Từ chối',
    APPROVE: 'Đã phê duyệt',
    ASSIGN: 'Phân công',
    UPLOAD: 'Tải tài liệu',
    PAYMENT: 'Thanh toán',
  };
  return labels[type] || type;
}

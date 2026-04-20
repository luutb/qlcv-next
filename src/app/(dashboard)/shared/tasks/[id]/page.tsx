'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, CircularProgress, Alert, Link as MuiLink,
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineDot, TimelineContent,
} from '@mui/lab';
import {
  ArrowBack, Person, CalendarToday, Description,
  Business, Phone, Email,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { taskRepo } from '@/repositories/task.repo';
import { contractRepo } from '@/repositories/contract.repo';
import { contractTypeRepo } from '@/repositories/contract-type.repo';
import { workflowRepo } from '@/repositories/workflow.repo';
import { Task, TaskHistory, WorkflowStepConfig, PaymentAction, Contract, CreateContractRequest, ContractType } from '@/types';
import { getStepConfig, canUserActOnStep } from '@/lib/workflow';
import { ERROR_MESSAGES, extractErrorMessage } from '@/lib/errors';
import TaskLayout from '@/components/tasks/TaskLayout';
import TaskLeftColumn from '@/components/tasks/TaskLeftColumn';
import ContractDialog from '@/components/contract/ContractDialog';
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

  const normalizeContracts = (resp: unknown): Contract[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as Contract[];
    // resp may be { data: [...] } or { data: { data: [...] } }
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
      setHistory(Array.isArray(historyData) ? historyData : historyData.data ?? []);

      // Load contracts from task response or fetch separately
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

      // Load workflow steps
      if (taskData.workflow_id) {
        try {
          const configs = await workflowRepo.getConfigs(taskData.workflow_id);
          setWorkflowSteps(Array.isArray(configs) ? configs : []);
        } catch {
          setWorkflowSteps([]);
        }
      }

      setError(null);
    } catch {
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchData();
    fetchContractTypes();
  }, [taskId]);

  const fetchContracts = useCallback(async () => {
    try {
      const data = await contractRepo.getByTask(taskId);
      setContracts(normalizeContracts(data));
    } catch { /* silent */ }
  }, [taskId]);

  const fetchContractTypes = async () => {
    try {
      const data = await contractTypeRepo.getAll();
      setContractTypes(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      // silent
    }
  };

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
          // Only manager/admin can approve/reject when pending
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

        {/* Right column: always show History (even when empty) */}
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

          {/* other right-column panels can go here */}
        </Box>
      </Box>

      <ContractDialog
        open={contractDialogOpen}
        onClose={() => setContractDialogOpen(false)}
        onSave={handleSaveContract}
        contract={contractEditId ? contracts.find((c) => c.id === contractEditId) || null : null}
        contractTypes={contractTypes}
        taskId={Number(taskId)}
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



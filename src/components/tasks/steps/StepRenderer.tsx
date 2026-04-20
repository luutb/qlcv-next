'use client';

import { Task, WorkflowStepConfig, PaymentAction, Role } from '@/types';
import StepDefault from './StepDefault';
import StepUpload from './StepUpload';
import StepPayment from './StepPayment';
import StepFinal from './StepFinal';
import StepApproval from './StepApproval';

interface StepRendererProps {
  task: Task;
  stepConfig: WorkflowStepConfig;
  userRole: Role;
  totalSteps: number;
  onNextStep: (note?: string, file?: File) => Promise<void>;
  onConfirmPayment: (action: PaymentAction, amount: number, note?: string) => Promise<void>;
  onComplete: (note?: string) => Promise<void>;
  onApprove?: (note?: string) => Promise<void>;
  onReject?: () => void;
  disabled?: boolean;
}

export default function StepRenderer({
  task,
  stepConfig,
  userRole,
  totalSteps,
  onNextStep,
  onConfirmPayment,
  onComplete,
  onApprove,
  onReject,
  disabled,
}: StepRendererProps) {
  // Bước cuối cùng = hoàn tất
  if (task.current_step >= totalSteps) {
    return <StepFinal onSubmit={(note) => onNextStep(note)} disabled={disabled} />;
  }

  // Bước phê duyệt
  if (stepConfig.require_approval && onApprove && onReject) {
    return (
      <StepApproval
        onApprove={onApprove}
        onReject={onReject}
        disabled={disabled}
      />
    );
  }

  // Bước thanh toán / thu phí
  if (stepConfig.require_payment) {
    const isAccountant = userRole === 'accountant';
    if (isAccountant) {
      return (
        <StepPayment
          task={task}
          stepNumber={task.current_step}
          onConfirmPayment={onConfirmPayment}
          onSubmit={onNextStep}
          disabled={disabled}
        />
      );
    }
    // Admin: chỉ hiện nút chuyển bước nếu đã thanh toán
    const isPaid = stepConfig.step_name.toLowerCase().includes('thu phí')
      || stepConfig.step_name.toLowerCase().includes('thu phi')
      ? task.is_collected
      : task.is_paid;
    if (isPaid) {
      return <StepDefault onSubmit={onNextStep} disabled={disabled} label="Đã xác nhận thanh toán. Chuyển bước tiếp theo." />;
    }
    return null;
  }

  // Bước cần upload file
  if (stepConfig.require_file) {
    return (
      <StepUpload
        taskId={String(task.id)}
        stepNumber={task.current_step}
        onSubmit={onNextStep}
        disabled={disabled}
      />
    );
  }

  // Bước mặc định chỉ cần ghi chú
  return <StepDefault onSubmit={onNextStep} disabled={disabled} />;
}

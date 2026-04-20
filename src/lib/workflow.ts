import { Role, WorkflowStepConfig } from '@/types';

export function getStepConfig(
  step: number,
  steps: WorkflowStepConfig[],
): WorkflowStepConfig | undefined {
  return steps.find((c) => c.step === step);
}

export function canUserActOnStep(
  userRole: Role,
  step: number,
  steps: WorkflowStepConfig[],
): boolean {
  if (userRole === 'admin') return true;
  const config = getStepConfig(step, steps);
  return config?.required_role === userRole;
}

// --- Factory Pattern for next-step payload ---

export interface NextStepInput {
  note?: string;
  fileUrl?: string;
}

export function createNextStepPayload(
  stepConfig: WorkflowStepConfig,
  input: NextStepInput,
): FormData | Record<string, string> {
  if (stepConfig.require_file && input.fileUrl) {
    const formData = new FormData();
    formData.append('file_url', input.fileUrl);
    if (input.note) formData.append('note', input.note);
    return formData;
  }

  const payload: Record<string, string> = {};
  if (input.note) payload.note = input.note;
  if (input.fileUrl) payload.file_url = input.fileUrl;
  return payload;
}

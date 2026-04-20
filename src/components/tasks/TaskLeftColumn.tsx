import React from 'react';
import {
  Box, Paper, Typography, Button,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import StepRenderer from '@/components/tasks/steps/StepRenderer';
import AssignSection from '@/components/tasks/AssignSection';
import { Task, WorkflowStepConfig, PaymentAction, Contract, Role, ContractType } from '@/types';

interface Props {
  task: Task;
  userRole: Role | string;
  currentStepConfig?: WorkflowStepConfig | undefined;
  totalSteps: number;
  canAct: boolean;
  canAssign: boolean | null;
  handleNextStep: (note?: string, file?: File) => Promise<void>;
  handleConfirmPayment: (action: PaymentAction, amount: number, note?: string) => Promise<void>;
  handleComplete: (note?: string) => Promise<void>;
  handleApprove: (note?: string) => Promise<void>;
  handleReject: () => Promise<void>;
  fetchData: (showLoading?: boolean) => Promise<void>;
  contracts: Contract[];
  contractTypes: ContractType[];
  openCreateContract: () => void;
  openEditContract: (c: Contract) => void;
}

export default function TaskLeftColumn(props: Props) {
  const {
    task, userRole, currentStepConfig, totalSteps,
    canAct, canAssign, handleNextStep, handleConfirmPayment,
    handleComplete, handleApprove, handleReject, fetchData,
    contracts, contractTypes, openCreateContract, openEditContract,
  } = props;

  if (!currentStepConfig) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">Không tìm thấy cấu hình bước</Typography>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Hợp đồng</Typography>
            <Button startIcon={<Add />} onClick={openCreateContract} variant="contained" size="small">
              Thêm
            </Button>
          </Box>

          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Chưa có hợp đồng
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hợp đồng - trên cùng */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Hợp đồng</Typography>
          <Button startIcon={<Add />} onClick={openCreateContract} variant="contained" size="small">
            Thêm
          </Button>
        </Box>

        {contracts.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Chưa có hợp đồng
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {contracts.map((c) => {
              const contractTypeName = contractTypes.find((ct) => ct.id === c.contract_type_id)?.name;
              return (
                <Box
                  key={c.id}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => openEditContract(c)}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {c.title || `Hợp đồng #${c.id}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.contract_number}
                  </Typography>
                  {contractTypeName && (
                    <Typography variant="caption" color="primary">
                      {contractTypeName}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Phân công xử lý - ngay sau hợp đồng */}
      {canAssign && (
        <Paper sx={{ p: 2 }}>
          <AssignSection taskId={String(task.id)} onAssigned={() => fetchData(false)} requiredRole={'admin' as Role} />
        </Paper>
      )}

      {/* Step renderer - dưới cùng */}
      <Paper sx={{ p: 2 }}>
        {currentStepConfig && (
          <StepRenderer
            task={task}
            stepConfig={currentStepConfig}
            userRole={userRole as Role}
            totalSteps={totalSteps}
            onNextStep={handleNextStep}
            onConfirmPayment={handleConfirmPayment}
            onComplete={handleComplete}
            onApprove={handleApprove}
            onReject={handleReject}
            disabled={!canAct}
          />
        )}
      </Paper>
    </Box>
  );
}
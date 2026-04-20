'use client';

import { useForm } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box,
} from '@mui/material';
import { Contract, ContractType, CreateContractRequest } from '@/types';
import React from 'react';

interface ContractDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateContractRequest) => Promise<void>;
  contract?: Contract | null;
  contractTypes: ContractType[];
}

interface ContractForm {
  contract_number: string;
  title: string;
  contract_type_id?: number;
  value?: number;
  signing_date?: string;
  effective_date?: string;
  expiry_date?: string;
  status: 'draft' | 'signed' | 'active' | 'expired' | 'cancelled';
  file_url?: string;
  note?: string;
}

export default function ContractDialog({
  open,
  onClose,
  onSave,
  contract,
  contractTypes,
}: ContractDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContractForm>({
    defaultValues: {
      contract_number: '',
      title: '',
      contract_type_id: undefined,
      value: undefined,
      signing_date: '',
      effective_date: '',
      expiry_date: '',
      status: 'draft',
      file_url: '',
      note: '',
    },
  });

  const onSubmit = async (data: ContractForm) => {
    try {
      await onSave(data);
      onClose();
    } catch {
      // error handled by parent
    }
  };

  // Reset form when contract changes
  const prevContractRef = React.useRef(contract);
  React.useEffect(() => {
    if (contract && contract !== prevContractRef.current) {
      reset({
        contract_number: contract.contract_number,
        title: contract.title,
        contract_type_id: contract.contract_type_id,
        value: contract.value,
        signing_date: contract.signing_date ? contract.signing_date.split('T')[0] : '',
        effective_date: contract.effective_date ? contract.effective_date.split('T')[0] : '',
        expiry_date: contract.expiry_date ? contract.expiry_date.split('T')[0] : '',
        status: contract.status,
        file_url: contract.file_url || '',
        note: contract.note || '',
      });
      prevContractRef.current = contract;
    }
  }, [contract, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{contract ? 'Sửa hợp đồng' : 'Thêm hợp đồng mới'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Số hợp đồng"
            {...register('contract_number', { required: 'Bắt buộc' })}
            error={!!errors.contract_number}
            helperText={errors.contract_number?.message}
          />
          <TextField
            fullWidth
            label="Tiêu đề"
            {...register('title', { required: 'Bắt buộc' })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            fullWidth
            label="Loại hợp đồng"
            select
            {...register('contract_type_id', { valueAsNumber: true })}
          >
            {contractTypes.map((ct) => (
              <MenuItem key={ct.id} value={ct.id}>
                {ct.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Giá trị"
            type="number"
            {...register('value', { valueAsNumber: true })}
          />
          <TextField
            fullWidth
            label="Ngày ký"
            type="date"
            {...register('signing_date')}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Ngày hiệu lực"
            type="date"
            {...register('effective_date')}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Ngày hết hạn"
            type="date"
            {...register('expiry_date')}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Ghi chú"
            multiline
            rows={3}
            {...register('note')}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {contract ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

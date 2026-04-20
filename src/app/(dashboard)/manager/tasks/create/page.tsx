'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box, Paper, Typography, TextField, Button,
  CircularProgress, Divider, MenuItem,
  Autocomplete, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { ArrowBack, Add, PersonAdd } from '@mui/icons-material';
import { taskRepo } from '@/repositories/task.repo';
import { customerRepo } from '@/repositories/customer.repo';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Customer } from '@/types';
import toast from 'react-hot-toast';

interface CreateTaskForm {
  workflowId: number;
  title: string;
  description?: string;
  amount?: number;
  deadline?: string;
  customer_id?: number;
}

interface CustomerForm {
  full_name: string;
  phone?: string;
  email?: string;
  id_number?: string;
  address?: string;
  company_name?: string;
  tax_code?: string;
  note?: string;
}

const emptyCustomerForm: CustomerForm = {
  full_name: '', phone: '', email: '', id_number: '',
  address: '', company_name: '', tax_code: '', note: '',
};

export default function CreateTaskPage() {
  const router = useRouter();
  const { workflows, loading: loadingWorkflows } = useWorkflows({ activeOnly: true });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreateTaskForm>();

  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    formState: { isSubmitting: isSubmittingCustomer },
    reset: resetCustomer,
  } = useForm<CustomerForm>({ defaultValues: emptyCustomerForm });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const fetchCustomers = useCallback(async (search: string) => {
    setLoadingCustomers(true);
    try {
      const res = await customerRepo.getAll({ page: 1, limit: 20, search: search || undefined });
      setCustomers(res.data);
    } catch {
      // silent
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(''); }, [fetchCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch, fetchCustomers]);

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      await taskRepo.createTask({
        title: data.title.trim(),
        workflow_id: data.workflowId,
        description: data.description?.trim() || undefined,
        amount: data.amount || undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        customer_id: data.customer_id || undefined,
      });
      toast.success('Tạo hồ sơ thành công');
      router.push('/manager/tasks');
    } catch {
      toast.error('Tạo hồ sơ thất bại');
    }
  };

  const onSubmitCustomer = async (data: CustomerForm) => {
    try {
      const newCustomer = await customerRepo.create(data);
      setSelectedCustomer(newCustomer);
      setValue('customer_id', newCustomer.id);
      setCustomers((prev) => [newCustomer, ...prev]);
      setCustomerDialogOpen(false);
      resetCustomer(emptyCustomerForm);
      toast.success('Đã tạo khách hàng');
    } catch {
      toast.error('Tạo khách hàng thất bại');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>Quay lại</Button>
        <Typography variant="h5" fontWeight="bold">Tạo hồ sơ mới</Typography>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select label="Quy trình" required fullWidth
              {...register('workflowId', { required: 'Vui lòng chọn quy trình', valueAsNumber: true })}
              error={!!errors.workflowId} helperText={errors.workflowId?.message}
              disabled={loadingWorkflows}
            >
              {loadingWorkflows
                ? <MenuItem value="" disabled>Đang tải...</MenuItem>
                : workflows.length === 0
                  ? <MenuItem value="" disabled>Không có quy trình</MenuItem>
                  : workflows.map((wf) => (
                    <MenuItem key={wf.id} value={wf.id}>{wf.name} ({wf.step_count} bước)</MenuItem>
                  ))
              }
            </TextField>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={customers}
                getOptionLabel={(opt) => [opt.full_name, opt.phone, opt.company_name].filter(Boolean).join(' - ')}
                value={selectedCustomer}
                onChange={(_e, val) => { setSelectedCustomer(val); setValue('customer_id', val?.id); }}
                onInputChange={(_e, val) => setCustomerSearch(val)}
                loading={loadingCustomers}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => <TextField {...params} label="Khách hàng" placeholder="Tìm theo tên, SĐT, CCCD..." />}
                noOptionsText="Không tìm thấy khách hàng"
              />
              <Button variant="outlined" onClick={() => setCustomerDialogOpen(true)}
                sx={{ minWidth: 'auto', px: 1.5, height: 56 }} title="Tạo khách hàng mới">
                <PersonAdd />
              </Button>
            </Box>

            <TextField
              label="Tiêu đề" required fullWidth
              {...register('title', { required: 'Tiêu đề không được để trống' })}
              error={!!errors.title} helperText={errors.title?.message}
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />

            <TextField
              label="Mô tả" multiline rows={4} fullWidth
              {...register('description')}
              helperText={`${watch('description')?.length || 0}/5000`}
              slotProps={{ htmlInput: { maxLength: 5000 } }}
            />

            <TextField
              label="Số tiền (VND)" type="number" fullWidth
              {...register('amount', { valueAsNumber: true, min: { value: 0, message: 'Số tiền phải lớn hơn 0' } })}
              error={!!errors.amount} helperText={errors.amount?.message}
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <TextField
              label="Hạn chót" type="date" fullWidth
              {...register('deadline')}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today, max: maxDate } }}
            />

            <Divider />

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Add />}>
              Tạo hồ sơ
            </Button>
          </Box>
        </form>
      </Paper>

      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo khách hàng mới</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitCustomer(onSubmitCustomer)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Họ tên" required fullWidth
              {...registerCustomer('full_name', { required: 'Họ tên không được để trống' })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Số điện thoại" fullWidth {...registerCustomer('phone')} />
              <TextField label="Email" fullWidth {...registerCustomer('email')} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="CMND/CCCD" fullWidth {...registerCustomer('id_number')} />
              <TextField label="Mã số thuế" fullWidth {...registerCustomer('tax_code')} />
            </Box>
            <TextField label="Địa chỉ" fullWidth {...registerCustomer('address')} />
            <TextField label="Tên công ty" fullWidth {...registerCustomer('company_name')} />
            <TextField label="Ghi chú" multiline rows={2} fullWidth {...registerCustomer('note')} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setCustomerDialogOpen(false)} disabled={isSubmittingCustomer}>Hủy</Button>
              <Button type="submit" variant="contained" disabled={isSubmittingCustomer}
                startIcon={isSubmittingCustomer ? <CircularProgress size={18} color="inherit" /> : <Add />}>
                Tạo khách hàng
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

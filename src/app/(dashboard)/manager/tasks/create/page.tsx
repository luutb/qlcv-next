'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box, Paper, Typography, TextField, Button,
  CircularProgress, Divider, MenuItem,
  Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ArrowBack, Add, PersonAdd } from '@mui/icons-material';
import { taskRepo } from '@/repositories/task.repo';
import { customerRepo } from '@/repositories/customer.repo';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Customer, CreateCustomerRequest } from '@/types';
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
  full_name: '',
  phone: '',
  email: '',
  id_number: '',
  address: '',
  company_name: '',
  tax_code: '',
  note: '',
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
  } = useForm<CreateTaskForm>({
    defaultValues: {
      workflowId: '',
      title: '',
      description: '',
      amount: undefined,
      deadline: '',
      customer_id: undefined,
    },
  });

  const [workflowId, setWorkflowId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Inline create customer dialog
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState<CreateCustomerRequest>(emptyCustomerForm);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    formState: { errors: customerErrors, isSubmitting: isSubmittingCustomer },
    reset: resetCustomer,
  } = useForm<CustomerForm>({ defaultValues: emptyCustomerForm });

  // Fetch customers for autocomplete
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

  useEffect(() => {
    fetchCustomers('');
  }, [fetchCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(customerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, fetchCustomers]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!workflowId) errs.workflowId = 'Vui lòng chọn quy trình';
    if (!title.trim()) errs.title = 'Tiêu đề không được để trống';
    if (title.length > 255) errs.title = 'Tiêu đề tối đa 255 ký tự';
    if (description.length > 5000) errs.description = 'Mô tả tối đa 5000 ký tự';
    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      errs.amount = 'Số tiền phải lớn hơn 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (data: CreateTaskForm) => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: data.title.trim(),
        workflow_id: data.workflowId,
      };
      if (data.description?.trim()) payload.description = data.description.trim();
      if (data.amount) payload.amount = data.amount;
      if (data.deadline) payload.deadline = new Date(data.deadline).toISOString();
      if (data.customer_id) payload.customer_id = data.customer_id;

      await taskRepo.createTask(payload as {
        title: string;
        description?: string;
        amount?: number;
        deadline?: string;
        workflow_id: number;
        customer_id?: number;
      });
      toast.success('Tạo hồ sơ thành công');
      router.push('/manager/tasks');
    } catch {
      toast.error('Tạo hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCustomer = async (data: CustomerForm) => {
    try {
      const newCustomer = await customerRepo.create(data);
      setSelectedCustomer(newCustomer);
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
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Tạo hồ sơ mới
        </Typography>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select
              label="Quy trình"
              {...register('workflowId', { required: 'Vui lòng chọn quy trình', valueAsNumber: true })}
              required
              fullWidth
              error={!!errors.workflowId}
              helperText={errors.workflowId?.message}
              disabled={loadingWorkflows}
            >
              {loadingWorkflows ? (
                <MenuItem value="" disabled>Đang tải...</MenuItem>
              ) : workflows.length === 0 ? (
                <MenuItem value="" disabled>Không có quy trình</MenuItem>
              ) : (
                workflows.map((wf) => (
                  <MenuItem key={wf.id} value={wf.id}>
                    {wf.name} ({wf.step_count} bước)
                  </MenuItem>
                ))
              )}
            </TextField>

            {/* Customer selection */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={customers}
                getOptionLabel={(opt) => {
                  const parts = [opt.full_name];
                  if (opt.phone) parts.push(opt.phone);
                  if (opt.company_name) parts.push(opt.company_name);
                  return parts.join(' - ');
                }}
                value={selectedCustomer}
                onChange={(_e, val) => {
                  setSelectedCustomer(val);
                  setValue('customer_id', val?.id, { shouldValidate: true });
                }}
                onInputChange={(_e, val) => setCustomerSearch(val)}
                loading={loadingCustomers}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField {...params} label="Khách hàng" placeholder="Tìm theo tên, SĐT, CCCD..." />
                )}
                noOptionsText="Không tìm thấy khách hàng"
              />
              <Button
                variant="outlined"
                onClick={() => setCustomerDialogOpen(true)}
                sx={{ minWidth: 'auto', px: 1.5, height: 56 }}
                title="Tạo khách hàng mới"
              >
                <PersonAdd />
              </Button>
            </Box>

            <TextField
              label="Tiêu đề"
              {...register('title', { required: 'Tiêu đề không được để trống' })}
              required
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />

            <TextField
              label="Mô tả"
              {...register('description')}
              multiline
              rows={4}
              fullWidth
              error={!!errors.description}
              helperText={errors.description?.message || `${watch('description')?.length || 0}/5000`}
              slotProps={{ htmlInput: { maxLength: 5000 } }}
            />

            <TextField
              label="Số tiền (VND)"
              {...register('amount', { valueAsNumber: true })}
              type="number"
              fullWidth
              error={!!errors.amount}
              helperText={errors.amount?.message}
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <TextField
              label="Hạn chót"
              {...register('deadline')}
              type="date"
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: today, max: maxDate },
              }}
            />

            <Divider />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
              disabled={loading}
            >
              Tạo hồ sơ
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Inline Create Customer Dialog */}
      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo khách hàng mới</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitCustomer} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Họ tên" {...registerCustomer('full_name', { required: 'Họ tên không được để trống' })} required fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Số điện thoại" {...registerCustomer('phone')} fullWidth />
              <TextField label="Email" {...registerCustomer('email')} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="CMND/CCCD" {...registerCustomer('id_number')} fullWidth />
              <TextField label="Mã số thuế" {...registerCustomer('tax_code')} fullWidth />
            </Box>
            <TextField label="Địa chỉ" {...registerCustomer('address')} fullWidth />
            <TextField label="Tên công ty" {...registerCustomer('company_name')} fullWidth />
            <TextField label="Ghi chú" {...registerCustomer('note')} multiline rows={2} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setCustomerDialogOpen(false)} disabled={isSubmittingCustomer}>Hủy</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingCustomer}
                startIcon={isSubmittingCustomer ? <CircularProgress size={18} color="inherit" /> : <Add />}
              >
                Tạo khách hàng
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

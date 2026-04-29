'use client';

import {
  Box, Typography, Paper, Grid, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, LinearProgress, Divider, TextField,
} from '@mui/material';
import {
  MonetizationOn,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  AttachMoney,
} from '@mui/icons-material';
import { useState } from 'react';

interface Budget {
  id: number;
  name: string;
  task_id?: number;
  task_name?: string;
  total_budget: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: 'active' | 'over_budget' | 'completed';
  currency?: string;
}

interface BudgetTrackingProps {
  budgets: Budget[];
  onAddBudget?: (budget: Omit<Budget, 'id' | 'remaining' | 'percentage_used' | 'status'>) => Promise<void>;
  onUpdateBudget?: (budget: Budget) => Promise<void>;
  onAddExpense?: (budgetId: number, amount: number, description: string) => Promise<void>;
}

export default function BudgetTracking({
  budgets,
  onAddBudget,
  onUpdateBudget,
  onAddExpense,
}: BudgetTrackingProps) {
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Calculate totals
  const totalBudget = budgets?.reduce((acc, b) => acc + b.total_budget, 0) || 0;
  const totalSpent = budgets?.reduce((acc, b) => acc + b.spent, 0) || 0;
  const totalRemaining = budgets?.reduce((acc, b) => acc + b.remaining, 0) || 0;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over_budget':
        return 'error';
      case 'completed':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleAddExpense = async () => {
    if (!selectedBudget || !expenseAmount) return;

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    if (onAddExpense) {
      await onAddExpense(selectedBudget.id, amount, expenseDescription);
      setExpenseAmount('');
      setExpenseDescription('');
      setShowAddExpenseDialog(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MonetizationOn fontSize="small" color="action" />
        <Typography variant="h6">Budget & Cost Tracking</Typography>
        <Chip
          label={`${budgets?.length || 0} budgets`}
          size="small"
          color="primary"
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountBalance fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Tổng ngân sách
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {totalBudget.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingDown fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Đã chi
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {totalSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
            <Typography variant="caption" color="error.main">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% đã sử dụng
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Còn lại
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {totalRemaining.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Budget List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AttachMoney fontSize="small" color="action" />
          <Typography variant="h6">Danh sách ngân sách</Typography>
        </Box>

        {!budgets || budgets.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            Chưa có ngân sách nào
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {budgets.map((budget) => (
              <Paper
                key={budget.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
                onClick={() => setSelectedBudget(budget)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {budget.name}
                    </Typography>
                    {budget.task_name && (
                      <Typography variant="caption" color="text.secondary">
                        Task: {budget.task_name}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={budget.status}
                    size="small"
                    color={getStatusColor(budget.status)}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Typography variant="body2" fontWeight="500">
                    {budget.total_budget.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    -{budget.spent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                  <Typography variant="body2" fontWeight="500" color="success.main">
                    = {budget.remaining.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Đã sử dụng
                    </Typography>
                    <Typography variant="caption" fontWeight="500">
                      {budget.percentage_used.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={budget.percentage_used}
                    color={budget.status === 'over_budget' ? 'error' : budget.status === 'completed' ? 'success' : 'primary'}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>

                {budget.status === 'over_budget' && (
                  <Alert severity="error" sx={{ fontSize: 12 }}>
                    Đã vượt ngân sách!
                  </Alert>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Budget Detail Dialog */}
      <Dialog
        open={!!selectedBudget}
        onClose={() => setSelectedBudget(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedBudget && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn fontSize="small" color="action" />
                <Typography variant="h6">{selectedBudget.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedBudget.task_name ? `Task: ${selectedBudget.task_name}` : 'Không liên kết task'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Paper sx={{ p: 1.5, flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Tổng ngân sách
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                      {selectedBudget.total_budget.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 1.5, flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Đã chi
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ mt: 0.5 }}>
                      {selectedBudget.spent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 1.5, flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Còn lại
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 0.5 }}>
                      {selectedBudget.remaining.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="500" gutterBottom>
                    Chi tiết sử dụng
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedBudget.percentage_used.toFixed(1)}% đã sử dụng
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedBudget.percentage_used}
                    color={selectedBudget.status === 'over_budget' ? 'error' : selectedBudget.status === 'completed' ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 1, mt: 1 }}
                  />
                </Box>

                {selectedBudget.status === 'over_budget' ? (
                  <Alert severity="error" sx={{ fontSize: 12 }}>
                    Ngân sách đã vượt quá! Vui lòng xem xét điều chỉnh.
                  </Alert>
                ) : selectedBudget.status === 'completed' ? (
                  <Alert severity="success" sx={{ fontSize: 12 }}>
                    Ngân sách đã được sử dụng hết.
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ fontSize: 12 }}>
                    Còn {selectedBudget.remaining.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} để chi.
                  </Alert>
                )}

                <Button
                  variant="contained"
                  startIcon={<AttachMoney />}
                  onClick={() => setShowAddExpenseDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Thêm chi phí
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedBudget(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog
        open={showAddExpenseDialog}
        onClose={() => setShowAddExpenseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedBudget && (
          <>
            <DialogTitle>
              Thêm chi phí cho {selectedBudget.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Số tiền"
                  type="number"
                  fullWidth
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  slotProps={{ htmlInput: { min: 0 } }}
                />

                <TextField
                  label="Mô tả"
                  multiline
                  rows={2}
                  fullWidth
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Mô tả chi phí..."
                />

                <Alert severity="info" sx={{ fontSize: 12 }}>
                  Số tiền còn lại: {selectedBudget.remaining.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAddExpenseDialog(false)}>Hủy</Button>
              <Button
                onClick={handleAddExpense}
                variant="contained"
                disabled={!expenseAmount}
              >
                Thêm chi phí
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Budget } from '@/types/budget';
import BudgetForm from '@/components/budget/BudgetForm';

export default function EditBudgetPage() {
  const params = useParams();
  const budgetId = parseInt(params.id as string);
  
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const data = await budgetRepository.getBudget(budgetId);
        setBudget(data);
      } catch (err) {
        setError('Không thể tải thông tin ngân sách');
        console.error('Error fetching budget:', err);
      } finally {
        setLoading(false);
      }
    };

    if (budgetId) {
      fetchBudget();
    }
  }, [budgetId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!budget) {
    return (
      <Alert severity="warning">
        Không tìm thấy ngân sách
      </Alert>
    );
  }

  return <BudgetForm budget={budget} />;
}
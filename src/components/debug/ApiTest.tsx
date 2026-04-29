'use client';

import { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { budgetRepository } from '@/repositories/BudgetRepo';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testCostCentersApi = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      console.log('Testing /cost-centers API...');
      const data = await budgetRepository.getCostCenters();
      console.log('API Response:', data);
      
      setResult(`Success! Received ${data.length} cost centers: ${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(`Error: ${err.message || 'Unknown error'}\nStatus: ${err.response?.status}\nResponse: ${JSON.stringify(err.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        API Test: Cost Centers
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testCostCentersApi}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Test /cost-centers API'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{error}</pre>
        </Alert>
      )}
      
      {result && (
        <Alert severity="success">
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{result}</pre>
        </Alert>
      )}
    </Box>
  );
}
'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface BudgetSummaryWidgetProps {
  title: string;
  data?: any;
}

export default function BudgetSummaryWidget({ title, data }: BudgetSummaryWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Budget summary data will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
/** Finance-ledger status; Task transition commands remain in task.types.ts. */
export type PaymentStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'refunded';

export type PaymentMethod =
  | 'bank_transfer'
  | 'cash'
  | 'check'
  | 'card'
  | 'crypto';

/** Existing finance payment read model pending ST-13 backend verification. */
export interface Payment {
  id: string;
  caseId: string;
  invoiceId?: string;
  amount: number;
  paidAmount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

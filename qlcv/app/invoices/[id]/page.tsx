import { InvoiceDetailPage } from "@/features/invoices";

export default async function InvoiceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoiceDetailPage invoiceId={id} />;
}

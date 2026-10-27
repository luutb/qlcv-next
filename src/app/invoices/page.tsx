import { DataStatePage } from "@/components/organisms";

export default function InvoicesPage() {
  return <DataStatePage eyebrow="Finance / Billing" title="Hóa đơn" description="Invoice lifecycle DRAFT, UNPAID, PAID, VOID với source time entries." endpoint="GET /api/v1/invoices" actionLabel="Tạo hóa đơn" actionHref="#create-invoice" />;
}

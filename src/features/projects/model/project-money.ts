const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 2 });

export function formatProjectMoney(value: number | null | undefined): string {
  return value == null ? "—" : currency.format(value);
}

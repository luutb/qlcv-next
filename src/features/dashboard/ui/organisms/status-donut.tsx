const colors: Record<string, string> = { TODO: "#ffb51b", DOING: "#3266ee", DONE: "#08b981", CANCELLED: "#ee6055" };

export function StatusDonut({ items }: { items: { status: string; count: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  let cursor = 0;
  const stops = items.map((item) => { const start = cursor; cursor += total ? item.count / total * 100 : 0; return `${colors[item.status] ?? "#9ca8ba"} ${start}% ${cursor}%`; });
  return <div className="live-status-donut" role="img" aria-label={`${total} công việc; ${items.map((item) => `${item.status}: ${item.count}`).join(", ")}`} style={{ background: total ? `conic-gradient(${stops.join(",")})` : "#e6eaf1" }}><div><strong>{total.toLocaleString("vi-VN")}</strong><span>Tổng</span></div></div>;
}

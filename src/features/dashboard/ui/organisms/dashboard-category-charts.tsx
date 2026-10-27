import type { CSSProperties, ReactNode } from "react";
import type { DashboardSummary } from "../../api/dashboard.api";

type Props = {
  summary: DashboardSummary;
  canPeople: boolean;
  canFinance: boolean;
  range: "7d" | "30d" | "90d";
  onRange: (range: "7d" | "30d" | "90d") => void;
};
const format = (value: number) => value.toLocaleString("vi-VN");
const amount = (value: number) => `${format(value)} VNĐ`;
const safeCount = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const statuses: Record<string, string> = { TODO: "Chờ xử lý", DOING: "Đang thực hiện", DONE: "Hoàn thành", CANCELLED: "Đã huỷ" };
const statusColors: Record<string, string> = { TODO: "#dc9b2e", DOING: "#5268df", DONE: "#16a085", CANCELLED: "#cd6b72" };
const palette = ["#5268df", "#16a085", "#dc9b2e", "#8c72c9", "#7891ae"];
const percentage = (value: number, max: number) => `${Math.min(100, Math.max(0, max ? value / max * 100 : 0))}%`;

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="workhub-card category-chart"><header><h3>{title}</h3><p>{description}</p></header>{children}</section>;
}
function Empty({ children }: { children: ReactNode }) { return <p className="category-chart-empty">{children}</p>; }

export function DashboardCategoryCharts({ summary, canPeople, canFinance, range, onRange }: Props) {
  const types = summary.issue_type.map((item) => ({ label: item.type === "WORK" ? "Công việc" : "Thu tiền", count: safeCount(item.count) }));
  const typeTotal = types.reduce((sum, item) => sum + item.count, 0);
  const workflow = summary.project_workflow;
  const workflowMax = Math.max(1, ...workflow.map((item) => safeCount(item.count)));
  const people = [...summary.workload].sort((a, b) => b.task_count - a.task_count).slice(0, 6);
  const peopleMax = Math.max(1, ...people.map((person) => safeCount(person.task_count)));
  const billing = canFinance ? summary.billing : null;
  const series = billing?.series ?? [];
  const financialMax = Math.max(1, ...series.flatMap((point) => [safeCount(point.revenue), safeCount(point.cost ?? 0)]));
  const hasCost = series.some((point) => point.cost !== null);
  return <section className="dashboard-analysis" aria-labelledby="dashboard-analysis-title">
    <div className="dashboard-analysis-heading"><div><h2 id="dashboard-analysis-title">Phân tích theo hạng mục</h2><p>Từ {summary.range.from.slice(0, 10)} đến {summary.range.to.slice(0, 10)}</p></div><label>Kỳ thống kê<select value={range} onChange={(event) => { const value = event.target.value; if (value === "7d" || value === "30d" || value === "90d") onRange(value); }}><option value="7d">7 ngày</option><option value="30d">30 ngày</option><option value="90d">90 ngày</option></select></label></div>
    <div className="dashboard-category-grid">
      <Panel title="Công việc" description="Phân bố loại việc và trạng thái xử lý">
        {typeTotal > 0 ? <><div className="category-composition" role="img" aria-label={types.map((item) => `${item.label}: ${format(item.count)}`).join(", ")}>{types.map((item, index) => <span key={item.label} style={{ width: percentage(item.count, typeTotal), background: palette[index] }} />)}</div><div className="category-legend">{types.map((item, index) => <span key={item.label}><i style={{ background: palette[index] }} />{item.label}<b>{format(item.count)}</b></span>)}</div></> : <Empty>Chưa có dữ liệu phân loại công việc trong kỳ.</Empty>}
        <div className="category-bar-list">{summary.issue_status.map((item, index) => { const max = Math.max(1, ...summary.issue_status.map((status) => safeCount(status.count))); return <div className="category-bar-item" key={item.status}><div><span>{statuses[item.status] ?? item.status}</span><b>{format(item.count)}</b></div><div className="category-bar-track"><span style={{ width: percentage(item.count, max), background: statusColors[item.status] ?? palette[index % palette.length] }} /></div></div>; })}</div>
        {!summary.issue_status.length && <Empty>Chưa có dữ liệu trạng thái xử lý.</Empty>}
      </Panel>
      <Panel title="Dự án" description="Số dự án tại từng giai đoạn quy trình">
        {workflow.length ? <div className="category-columns" role="list" aria-label="Phân bổ dự án theo giai đoạn">{workflow.map((item, index) => <div className="category-column" role="listitem" key={item.macro_column}><div className="category-column-plot"><b>{format(item.count)}</b><span style={{ height: percentage(item.count, workflowMax), background: palette[index % palette.length] }} /></div><span className="category-column-label">{item.title}</span></div>)}</div> : <Empty>Chưa có dữ liệu giai đoạn dự án trong kỳ.</Empty>}
        <div className="category-chart-note">{format(summary.kpis.active_projects)} dự án đang hoạt động</div>
      </Panel>
      {canPeople && <Panel title="Nhân sự" description="Tối đa 6 nhân sự có nhiều công việc nhất">
        <div className="category-legend"><span><i className="category-completed" />Hoàn thành</span><span><i className="category-remaining" />Chưa hoàn thành</span></div>
        {people.length ? <div className="category-people">{people.map((person) => { const total = safeCount(person.task_count); const completed = Math.min(total, safeCount(person.completed_count)); return <div key={person.user_id} className="category-person"><div><span>{person.user_name}</span><b>{format(completed)}/{format(total)}</b></div><div className="category-person-scale"><div className="category-person-bars" style={{ width: percentage(total, peopleMax) }}><span className="category-completed" style={{ width: percentage(completed, total) }} /><span className="category-remaining" style={{ width: percentage(total - completed, total) }} /></div></div>{person.overdue_count > 0 && <small>{format(person.overdue_count)} công việc quá hạn</small>}</div>; })}</div> : <Empty>Chưa có dữ liệu phân công nhân sự trong kỳ.</Empty>}
        <div className="category-chart-note">Số hoàn thành / tổng công việc được giao</div>
      </Panel>}
      {canFinance && <Panel title="Tài chính" description="So sánh số tiền đã thu và chi phí từng kỳ">
        <div className="category-legend"><span><i style={{ background: palette[0] }} />Đã thu</span>{hasCost && <span><i style={{ background: palette[2] }} />Chi phí</span>}</div>
        {series.length ? <div className="category-finance-scroll"><div className="category-columns category-finance-columns" style={{ "--period-count": series.length } as CSSProperties} role="list" aria-label="Doanh thu và chi phí theo kỳ">{series.map((point) => <div className="category-column" role="listitem" key={point.period}><div className="category-grouped-plot"><span style={{ height: percentage(point.revenue, financialMax), background: palette[0] }} tabIndex={0} aria-label={`${point.period}: đã thu ${amount(point.revenue)}`}><span className="category-chart-tooltip">{amount(point.revenue)}</span></span>{hasCost && point.cost !== null && <span style={{ height: percentage(point.cost, financialMax), background: palette[2] }} tabIndex={0} aria-label={`${point.period}: chi phí ${amount(point.cost)}`}><span className="category-chart-tooltip">{amount(point.cost)}</span></span>}</div><span className="category-column-label">{point.period}</span></div>)}</div></div> : <Empty>Chưa có dữ liệu tài chính theo kỳ.</Empty>}
        {series.length > 0 && <details className="category-chart-data"><summary>Xem số liệu chi tiết</summary><div><table><caption>Số tiền theo kỳ (VNĐ)</caption><thead><tr><th scope="col">Kỳ</th><th scope="col">Đã thu</th><th scope="col">Chi phí</th></tr></thead><tbody>{series.map((point) => <tr key={point.period}><th scope="row">{point.period}</th><td>{format(point.revenue)}</td><td>{point.cost === null ? "Chưa có dữ liệu" : format(point.cost)}</td></tr>)}</tbody></table></div></details>}
        {billing && <div className="category-finance-summary"><div><span>Đã thu</span><strong>{amount(billing.revenue_collected)}</strong></div><div><span>Còn phải thu</span><strong>{amount(billing.outstanding_amount)}</strong></div></div>}
        {billing && billing.cost_total === null && <div className="category-chart-note">Chưa có dữ liệu tổng chi phí.</div>}
      </Panel>}
    </div>
  </section>;
}

import type { DashboardQuery } from "@/api/dashboard.types";
import { RANGE_OPTIONS } from "../model/dashboard.constants";
import { getDefaultCustomRange } from "../model/dashboard.utils";
import { RefreshIcon } from "./DashboardIcons";

export function DashboardHeader({ query, onQueryChange, onRefresh }: { query: DashboardQuery; onQueryChange: (next: Partial<DashboardQuery>) => void; onRefresh: () => void }) {
  return <div className="od-dashboard__head"><div><p className="od-dashboard__eyebrow">Operations overview</p><h1 id="dashboardTitle">Dashboard</h1><p className="od-dashboard__subtitle">Tổng quan công việc, vụ việc, deadline và doanh thu.</p></div><div className="od-dashboard__controls"><div className="od-dashboard__segmented" aria-label="Khoảng thời gian">{RANGE_OPTIONS.map((option) => <button key={option.value} type="button" aria-pressed={query.range === option.value} onClick={() => onQueryChange({ range: option.value })}>{option.label}</button>)}</div>{query.range === "custom" ? <div className="od-dashboard__date-fields"><input type="date" aria-label="Từ ngày" value={query.from ?? getDefaultCustomRange().from} onChange={(event) => onQueryChange({ range: "custom", from: event.target.value })} /><input type="date" aria-label="Đến ngày" value={query.to ?? getDefaultCustomRange().to} onChange={(event) => onQueryChange({ range: "custom", to: event.target.value })} /></div> : null}<button className="od-dashboard__icon-button" type="button" onClick={onRefresh} aria-label="Tải lại dashboard"><RefreshIcon /></button></div></div>;
}

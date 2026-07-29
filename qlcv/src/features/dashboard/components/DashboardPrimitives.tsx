import type { ReactNode } from "react";
import { formatNumber } from "../model/dashboard.utils";

export function StatusNote({ tone, children }: { tone: "danger" | "warn" | "success"; children: ReactNode }) {
  return <div className="od-dashboard__status-note"><span className={`od-dashboard__status-dot od-dashboard__status-dot--${tone}`} />{children}</div>;
}

export function KpiCard({ label, value, meta, href, tone, icon }: { label: string; value: string; meta: string; href: string; tone?: "danger" | "warn" | "success"; icon: ReactNode }) {
  return <a className={`od-dashboard__kpi-card ${tone ? `od-dashboard__tone-${tone}` : ""}`} href={href}><div className="od-dashboard__kpi-top"><span>{label}</span><span className="od-dashboard__kpi-icon">{icon}</span></div><div><div className="od-dashboard__kpi-value">{value}</div><div className="od-dashboard__kpi-meta">{meta}</div></div></a>;
}

export function Panel({ title, subtitle, action, children }: { title: string; subtitle: string; action?: { label: string; href: string }; children: ReactNode }) {
  return <section className="od-dashboard__panel"><div className="od-dashboard__panel-head"><div><h2 className="od-dashboard__panel-title">{title}</h2><p className="od-dashboard__panel-sub">{subtitle}</p></div>{action ? <a className="od-dashboard__panel-action" href={action.href}>{action.label}</a> : null}</div><div className="od-dashboard__panel-body">{children}</div></section>;
}

export function BarList({ items, empty }: { items: Array<{ key: string; label: string; count: number; tone: string }>; empty: string }) {
  const max = Math.max(...items.map((item) => item.count), 0);
  if (max === 0) return <InlineEmpty>{empty}</InlineEmpty>;
  return <div className="od-dashboard__bar-list">{items.map((item) => <div key={item.key} className="od-dashboard__bar-row"><span className="od-dashboard__bar-label">{item.label}</span><span className="od-dashboard__bar-track"><span className={`od-dashboard__bar-fill od-dashboard__bar-fill--${item.tone}`} style={{ width: `${Math.max((item.count / max) * 100, 4)}%` }} /></span><span className="od-dashboard__bar-value">{formatNumber(item.count)}</span></div>)}</div>;
}

export const BillingCell = ({ label, value }: { label: string; value: string }) => <div className="od-dashboard__billing-cell"><span>{label}</span><strong>{value}</strong></div>;
export const QuickAction = ({ href, name, code }: { href: string; name: string; code: string }) => <a className="od-dashboard__workflow-item" href={href}><span><span className="od-dashboard__workflow-name">{name}</span><span className="od-dashboard__workflow-code">{code}</span></span><span className="od-dashboard__workflow-count">↗</span></a>;
export const InlineEmpty = ({ children }: { children: ReactNode }) => <div className="od-dashboard__inline-empty">{children}</div>;

export function StateCard({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel: string; onAction: () => void }) {
  return <div className="od-dashboard__state-card"><strong>{title}</strong>{description ? <p>{description}</p> : null}<button className="od-dashboard__link-button" type="button" onClick={onAction}>{actionLabel}</button></div>;
}

export const DashboardLoading = () => <div className="od-dashboard__loading">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div>;

"use client";

import { useState } from "react";
import { useDashboardSummaryQuery } from "../../hooks/use-dashboard-summary";

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DashboardCalendar({ onTask }: { onTask: (id: string) => void }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const from = dateKey(month);
  const to = dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const query = useDashboardSummaryQuery({ range: "custom", from, to });
  const offset = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const events = (query.data?.calendar_events ?? []).filter((event) => dateKey(new Date(event.starts_at)) === selected);
  function changeMonth(delta: number) { const next = new Date(month.getFullYear(), month.getMonth() + delta, 1); setMonth(next); setSelected(dateKey(next)); }
  return <section className="workhub-card calendar-card"><div className="card-title-row"><div><h2>Lịch làm việc</h2><strong>{month.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</strong></div><div className="calendar-arrows"><button aria-label="Tháng trước" onClick={() => changeMonth(-1)}>‹</button><button aria-label="Tháng sau" onClick={() => changeMonth(1)}>›</button></div></div>
    <div className="calendar-week">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-days">{Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => { const date = new Date(month.getFullYear(), month.getMonth(), index - offset + 1); const key = dateKey(date); return <button key={key} className={`${key === selected ? "selected" : ""} ${date.getMonth() !== month.getMonth() ? "muted" : ""}`} aria-label={date.toLocaleDateString("vi-VN")} aria-pressed={key === selected} onClick={() => { setSelected(key); if (date.getMonth() !== month.getMonth()) setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }}>{date.getDate()}</button>; })}</div>
    <div className="calendar-events">{query.isPending ? <p role="status">Đang tải lịch…</p> : query.error ? <p role="alert">Không tải được lịch. <button onClick={() => query.refetch()}>Thử lại</button></p> : events.length ? events.map((event) => <div key={event.id}>{event.related_task_id ? <button onClick={() => onTask(event.related_task_id!)}>{event.title}</button> : <span>{event.title}</span>}<small>{new Date(event.starts_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}{event.ends_at ? ` – ${new Date(event.ends_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}</small></div>) : <p>Không có lịch trong ngày đã chọn.</p>}</div>
  </section>;
}

"use client";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";

import { ProjectTeamPanel } from "./project-team-panel";
import { formatProjectMoney } from "../../model/project-money";
import { useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { type Project, listProjectHistory, projectQueryKeys } from "../../api/projects.api";
import type { BoardSummary } from "@/features/tasks";

export function ProjectBoardDetail({ project, summary }: { project: Project; summary: BoardSummary | null }) {
  const user = useCurrentUserQuery();
  const canFinance = hasAuthorizedAction(user.data, "projects.finance.read");
  const token = useAccessToken();
  const [tab, setTab] = useState("detail");

  const history = useQuery({ queryKey: projectQueryKeys.history(project.id, 20, 0), queryFn: ({ signal }) => listProjectHistory({ accessToken: token!, signal }, project.id), enabled: Boolean(token && tab === "activity") });
  return <aside className="project-detail" tabIndex={0} aria-label="Thông tin dự án"><nav className="detail-tabs" aria-label="Thông tin dự án">{[["detail", "Chi tiết"], ["members", "Thành viên"], ["activity", "Hoạt động"]].map(([id, title]) => <button className={tab === id ? "active" : ""} aria-pressed={tab === id} key={id} onClick={() => setTab(id)}>{title}</button>)}</nav>
    {tab === "detail" && <><section><h2>Tiến độ công việc</h2>{summary && summary.total > 0 ? <div className="project-progress-detail"><div className="detail-donut" style={{ "--progress-value": `${summary.percent}%` } as CSSProperties}><strong>{summary.percent}%</strong><span>Hoàn thành</span></div><ul><li><i className="status-green" />Hoàn thành <b>{summary.complete}</b></li><li><i className="status-blue" />Đang thực hiện <b>{summary.inProgress}</b></li>{summary.review > 0 && <li><i className="status-yellow" />Đang duyệt <b>{summary.review}</b></li>}<li><i className="status-gray" />Chưa bắt đầu <b>{summary.toDo}</b></li>{summary.cancelled > 0 && <li><i className="status-gray" />Đã huỷ <b>{summary.cancelled}</b></li>}</ul></div> : <p className="state-inline">Chưa có công việc trong dự án.</p>}</section><section className="project-facts"><h2>Thông tin dự án</h2><div><span>Trạng thái</span><strong>{project.status === "DONE" ? "Hoàn thành" : "Đang thực hiện"}</strong></div>{project.team?.name && <div><span>Đội phụ trách</span><strong>{project.team.name}</strong></div>}<div><span>Cập nhật gần nhất</span><strong>{new Date(project.updated_at).toLocaleDateString("vi-VN")}</strong></div>{canFinance && <dl><dt>Tổng giá trị công việc</dt><dd>{formatProjectMoney(project.total_contract_value)}</dd><dt>Đã thu</dt><dd>{formatProjectMoney(project.total_paid)}</dd><dt>Còn lại</dt><dd>{formatProjectMoney(project.remaining_amount)}</dd></dl>}</section></>}
    {(tab === "detail" || tab === "members") && <ProjectTeamPanel key={project.id} project={project} />}
    {tab === "activity" && <section><h2>Hoạt động gần đây</h2>{history.isPending ? <p>Đang tải…</p> : history.error ? <p role="alert">Không tải được hoạt động. <button onClick={() => history.refetch()}>Thử lại</button></p> : history.data?.history.length ? history.data.history.map((item) => <div className="recent-row" key={item.id}><div><strong>{item.actor?.username ?? "Hệ thống"}</strong><small>{item.action}</small><time>{new Date(item.created_at).toLocaleString("vi-VN")}</time></div></div>) : <p>Chưa có hoạt động.</p>}</section>}
  </aside>;
}

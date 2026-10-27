"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@mui/material";
import { ProjectEditor } from "../ui/organisms/project-editor";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { DataStatePage } from "@/components/organisms";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubIcon } from "@/components/atoms";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { getSafeApiErrorMessage } from "@/services/http";
import { ProjectTeamPanel } from "../ui/organisms/project-team-panel";
import { formatProjectMoney } from "../model/project-money";
import { useProjectQuery, useProjectTasksQuery } from "../hooks/use-project";

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const user = useCurrentUserQuery();
  const [editing,setEditing] = useState(false);
  const canFinance = hasAuthorizedAction(user.data, "projects.finance.read");
  const project = useProjectQuery(projectId);
  const tasks = useProjectTasksQuery(projectId);
  if (!project.data && !project.isLoading && !project.error) return <DataStatePage eyebrow="Dự án" title="Cần đăng nhập" description="Đăng nhập để tải chi tiết dự án từ API." endpoint={`GET /api/v1/projects/${projectId}`} actionLabel="Đăng nhập" actionHref="/login" />;
  if (project.isLoading) return <DataStatePage eyebrow="Dự án" title="Đang tải chi tiết" description="Đang lấy project aggregate từ máy chủ." endpoint={`GET /api/v1/projects/${projectId}`} />;
  if (project.error) return <DataStatePage eyebrow="Dự án" title="Không tải được chi tiết" description={getSafeApiErrorMessage(project.error, "API dự án chưa sẵn sàng.")} endpoint={`GET /api/v1/projects/${projectId}`} actionLabel="Về danh sách" actionHref="/projects" />;
  const item = project.data!;
  const taskList = tasks.data?.tasks ?? [];
  return <WorkspaceTemplate variant="project" sidebar={<WorkhubSidebar activeHref="/projects" variant="project" />} topbar={<WorkhubTopbar variant="project" />}><div className="project-breadcrumb"><Link href="/projects">Dự án</Link><span>/</span><strong>{item.name}</strong></div><section className="project-heading"><div className="project-title"><span className="project-logo"><WorkhubIcon name="folder" size={30} /></span><div><h1>{item.name}</h1><p>Theo dõi đội nhóm, công việc và số tiền của dự án.</p></div></div><div className="project-meta">{hasAuthorizedAction(user.data,"projects.create") && <Button onClick={()=>setEditing(true)}>Sửa thông tin</Button>}<span className="project-status">{item.status}</span>{canFinance && <span className="project-date">{formatProjectMoney(item.remaining_amount)} còn phải thu</span>}</div></section><div className="workhub-card"><ProjectTeamPanel key={item.id} project={item} />{canFinance && <dl className="project-financial-summary"><dt>Tổng giá trị công việc</dt><dd>{formatProjectMoney(item.total_contract_value)}</dd><dt>Đã thu</dt><dd>{formatProjectMoney(item.total_paid)}</dd></dl>}</div><section className="workhub-card live-task-panel"><div className="card-title-row"><h2>Công việc trong dự án</h2><span>{tasks.isLoading ? "Đang tải…" : `${taskList.length} bản ghi`}</span></div>{tasks.error ? <p className="state-inline">{getSafeApiErrorMessage(tasks.error, "Không tải được task của dự án.")}</p> : taskList.length ? <div className="live-task-list">{taskList.map((task) => <article key={task.id}><span className={`task-tag tag-${task.status.toLowerCase()}`}>{task.status}</span><strong>{task.title}</strong><span className="priority p-${task.priority.toLowerCase()}">{task.priority}</span><small>{task.due_date ?? "Chưa có hạn"}</small></article>)}</div> : <p className="state-inline">Dự án chưa có công việc.</p>}</section>{editing && <ProjectEditor project={item} close={()=>setEditing(false)} />}</WorkspaceTemplate>;
}

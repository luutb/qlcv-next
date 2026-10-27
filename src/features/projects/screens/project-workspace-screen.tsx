"use client";

import { canAccessRoute, useCurrentUserQuery } from "@/features/auth";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { WorkspaceTemplate } from "@/components/templates";
import { DropdownSelect } from "@/components/molecules";
import { MenuItem } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { IssueBoard } from "@/features/tasks";
import { useProjectsQuery } from "../hooks/use-projects";
import { useProjectQuery } from "../hooks/use-project";
import { ProjectBoardDetail } from "../ui/organisms/project-board-detail";
import { getSafeApiErrorMessage } from "@/services/http";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import type { BoardSummary } from "@/features/tasks";

function ProjectWorkspace({ fixedProjectId }: { fixedProjectId?: string }) {
  const user = useCurrentUserQuery();
  const params = useSearchParams();
  const router = useRouter();
  const token = useAccessToken();
  const projectId = fixedProjectId ?? params.get("project_id") ?? "";
  const [offset, setOffset] = useState(0);
  const [boardSummary, setBoardSummary] = useState<BoardSummary | null>(null);
  const projects = useProjectsQuery({ limit: 50, offset });
  const project = useProjectQuery(projectId);
  const item = project.data;
  return <WorkspaceTemplate variant="project" sidebar={<WorkhubSidebar activeHref="/work" variant="project" />} topbar={<WorkhubTopbar variant="project" />} detail={item ? <ProjectBoardDetail project={item} summary={boardSummary} /> : <aside className="project-detail"><h2>Chi tiết dự án</h2><p>Chọn dự án để xem thông tin và công việc.</p></aside>}>
    <div className="project-context-row"><div className="project-breadcrumb"><Link href="/projects">Dự án</Link><span>/</span><strong>{item?.name ?? "Bảng công việc"}</strong></div>
    {!fixedProjectId && <div className="project-selector"><label htmlFor="board-project">Dự án</label><DropdownSelect aria-label="Dự án" id="board-project" value={projectId} onChange={(event) => { const next = new URLSearchParams(params); next.set("project_id", event.target.value); next.delete("task_id"); router.push(`?${next}`); }}><MenuItem value="">Chọn dự án</MenuItem>{item && !projects.data?.projects.some((entry) => entry.id === item.id) && <MenuItem value={item.id}>{item.name}</MenuItem>}{projects.data?.projects.map((entry) => <MenuItem key={entry.id} value={entry.id}>{entry.name}</MenuItem>)}</DropdownSelect>{(offset > 0 || (projects.data?.pagination?.total ?? 0) > 50) && <><button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 50))}>Trước</button><button disabled={!projects.data?.pagination || offset + 50 >= projects.data.pagination.total} onClick={() => setOffset(offset + 50)}>Sau</button></>}</div>}
    </div>
    {projects.error && <p role="alert">{getSafeApiErrorMessage(projects.error, "Không tải được danh sách dự án.")}</p>}
    {!token ? <section className="board-notice"><h1>Bảng công việc</h1><p>Đăng nhập để xem công việc.</p><Link href="/login">Đăng nhập</Link></section> : !projectId ? <section className="board-notice"><h1>Bảng công việc</h1><p>{projects.isPending ? "Đang tải danh sách dự án…" : "Chọn dự án để xem bảng và tạo công việc."}</p></section> : project.isPending ? <p role="status">Đang tải dự án…</p> : project.error ? <p role="alert">{getSafeApiErrorMessage(project.error, "Không tải được dự án.")} <button onClick={() => project.refetch()}>Thử lại</button></p> : item && <>
      <section className="project-heading"><div className="project-title"><span className="project-logo"><WorkhubIcon name="folder" size={30} /></span><div><h1>{item.name}</h1>{item.description && <p>{item.description}</p>}</div></div><div className="project-heading-meta"><span className="project-status">{item.status === "DONE" ? "Hoàn thành" : "Đang thực hiện"}</span>{boardSummary && boardSummary.total > 0 && <div className="project-progress-summary"><div><strong>{boardSummary.percent}%</strong><span>hoàn thành</span></div><progress aria-label="Tiến độ hoàn thành" max={100} value={boardSummary.percent} /></div>}</div></section>
      <nav className="project-tabs" aria-label="Điều hướng dự án"><Link className="active" href={`/projects/board?project_id=${item.id}`}>Công việc</Link><Link href={`/projects/${item.id}`}>Tổng quan</Link>{canAccessRoute(user.data, "/documents") && <Link href={`/documents?project_id=${item.id}`}>Tài liệu</Link>}{canAccessRoute(user.data, "/teams") && <Link href="/teams">Thành viên</Link>}</nav>
      <IssueBoard key={item.id} projectId={item.id} workflowTemplateId={item.workflow_template_id} initialStatus={params.get("status") ?? ""} onSummary={setBoardSummary} />
    </>}
  </WorkspaceTemplate>;
}

export function ProjectWorkspaceScreen({ projectId }: { projectId?: string }) {
  return <Suspense fallback={<p>Đang tải bảng công việc…</p>}><ProjectWorkspace fixedProjectId={projectId} /></Suspense>;
}

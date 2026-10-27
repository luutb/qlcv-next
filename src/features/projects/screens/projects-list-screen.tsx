"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, MenuItem, Skeleton } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { DropdownSelect } from "@/components/molecules";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { getSafeApiErrorMessage } from "@/services/http";
import { formatProjectMoney } from "../model/project-money";
import type { ProjectStatus } from "../api/projects.api";
import { useProjectsQuery } from "../hooks/use-projects";


const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export function ProjectsListScreen() {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canFinance = hasAuthorizedAction(user.data, "projects.finance.read");
  const canCreate = hasAuthorizedAction(user.data, "projects.create");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const query = useProjectsQuery({ limit, offset, status: status || undefined });
  const projects = query.data?.projects ?? [];
  const visible = projects.filter(project => project.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  const total = query.data?.pagination?.total;
  const hasNext = total !== undefined ? offset + limit < total : projects.length === limit;
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/projects" />} topbar={<WorkhubTopbar />}>
    <main id="main-content" className="projects-directory">
      <header className="projects-directory-heading"><div><h1>Dự án</h1><p>Theo dõi công việc và tình hình thanh toán của từng dự án.</p></div><div className="projects-directory-heading-actions">{canCreate && <Button component={Link} href="/projects/new" variant="contained" startIcon={<WorkhubIcon name="plus" size={18} />}>Tạo dự án</Button>}{total !== undefined && <span className="projects-total">{total} dự án{status ? " phù hợp" : ""}</span>}</div></header>
      <section className="projects-directory-surface" aria-label="Danh sách dự án" aria-busy={query.isFetching}>
        <div className="projects-directory-toolbar"><label className="workhub-search projects-search"><WorkhubIcon name="search" size={18} /><span className="sr-only">Tìm tên dự án trong trang hiện tại</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm dự án trong trang này" /></label><DropdownSelect aria-label="Trạng thái dự án" value={status} onChange={event => { setStatus(event.target.value as ProjectStatus | ""); setOffset(0); }}><MenuItem value="">Tất cả trạng thái</MenuItem><MenuItem value="OPEN">Đang thực hiện</MenuItem><MenuItem value="DONE">Hoàn thành</MenuItem></DropdownSelect>{(search || status) && <Button onClick={() => { setSearch(""); setStatus(""); setOffset(0); }}>Xóa lọc</Button>}</div>
        {!token ? <div className="projects-directory-empty"><h2>Đăng nhập để xem dự án</h2><Link href="/login">Đăng nhập</Link></div> : query.isPending ? <div className="projects-directory-loading" role="status" aria-label="Đang tải dự án">{[0,1,2,3].map(index => <Skeleton key={index} variant="rounded" height={84} />)}</div> : query.error ? <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>{getSafeApiErrorMessage(query.error, "Không tải được dự án. Vui lòng thử lại.")}</Alert> : visible.length ? <div className="projects-directory-table"><table><caption className="sr-only">Dự án, trạng thái và tình hình thanh toán</caption><thead><tr><th scope="col">Tên dự án</th><th scope="col">Trạng thái</th>{canFinance && <><th scope="col" className="project-money">Giá trị công việc</th><th scope="col" className="project-money">Còn phải thu</th></>}<th scope="col">Cập nhật</th><th scope="col"><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{visible.map(project => <tr key={project.id}>
          <td data-label="Dự án"><div className="directory-project-name"><span className="directory-project-icon"><WorkhubIcon name="folder" size={21} /></span><div><Link href={`/projects/board?project_id=${project.id}`}>{project.name}</Link><small>#{project.id} · {project.team?.name ?? "Chưa gán team"} <span>{project.workflow_template_id ? "Có quy trình" : "Chưa gắn quy trình"}</span></small></div></div></td>
          <td data-label="Trạng thái"><span className={`directory-status directory-status-${project.status.toLowerCase()}`}><i />{project.status === "DONE" ? "Hoàn thành" : "Đang thực hiện"}</span></td>
          {canFinance && <><td data-label="Giá trị công việc" className="project-money">{formatProjectMoney(project.total_contract_value)}<small>Đã thu {formatProjectMoney(project.total_paid)}</small></td>
          <td data-label="Còn phải thu" className={`project-money ${(project.remaining_amount ?? 0) > 0 ? "project-outstanding" : ""}`}>{formatProjectMoney(project.remaining_amount)}</td></>}
          <td data-label="Cập nhật" className="project-updated"><time dateTime={project.updated_at}>{Number.isNaN(Date.parse(project.updated_at)) ? "Chưa có" : date.format(new Date(project.updated_at))}</time></td>
          <td className="directory-project-actions"><Link href={`/projects/${project.id}`} aria-label={`Tổng quan dự án ${project.name}`}>Tổng quan</Link><Link className="directory-board-link" href={`/projects/board?project_id=${project.id}`} aria-label={`Mở công việc dự án ${project.name}`}>Công việc <WorkhubIcon name="briefcase" size={15} /></Link></td>
        </tr>)}</tbody></table></div> : <div className="projects-directory-empty"><span className="directory-empty-icon"><WorkhubIcon name="folder" size={28} /></span><h2>{search || status ? "Không tìm thấy dự án phù hợp" : "Chưa có dự án"}</h2><p>{search ? "Thử tên khác hoặc chuyển trang để tìm trong các dự án còn lại." : status ? "Chọn trạng thái khác để xem danh sách dự án." : "Các dự án sẽ xuất hiện tại đây khi được tạo."}</p>{(search || status) && <Button onClick={() => { setSearch(""); setStatus(""); setOffset(0); }}>Xóa bộ lọc</Button>}</div>}
        {token && query.isSuccess && <footer className="projects-directory-pagination"><span>{projects.length ? `${offset + 1}–${offset + projects.length}${total !== undefined ? ` / ${total} dự án` : " dự án"}` : "0 dự án"}{search && ` · ${visible.length} kết quả trong trang`}</span><div><Button disabled={offset === 0 || query.isFetching} onClick={() => setOffset(Math.max(0, offset - limit))}>Trước</Button><span>Trang {Math.floor(offset / limit) + 1}</span><Button disabled={!hasNext || query.isFetching} onClick={() => setOffset(offset + limit)}>Sau</Button></div></footer>}
      </section>
    </main>
  </WorkspaceTemplate>;
}

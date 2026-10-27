"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Checkbox, FormControlLabel, Skeleton, TextField } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { hasAuthorizedAction } from "@/features/auth/model/current-user";
import { getSafeApiErrorMessage } from "@/services/http";
import { type Team } from "../../api/teams.api";
import { TeamEditor } from "./team-editor";
import { TeamMembers } from "./team-members";
import { TeamStatusDialog } from "./team-status-dialog";
import { useTeamsQuery } from "../../hooks/use-teams";

export function TeamsScreen() {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Team | null>(null);
  const [editor, setEditor] = useState<{ team?: Team } | null>(null);
  const [statusTeam, setStatusTeam] = useState<Team | null>(null);
  const [success, setSuccess] = useState("");
  const query = useTeamsQuery(includeInactive);
  const canManage = hasAuthorizedAction(user.data, "teams.manage");
  const teams = query.data?.filter((team) => team.name.toLocaleLowerCase("vi-VN").includes(search.trim().toLocaleLowerCase("vi-VN"))) ?? [];

  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/teams" />} topbar={<WorkhubTopbar />}>
    <main id="main-content" className="workhub-content teams-content">
      <div className="workspace-breadcrumb"><Link href="/">Không gian làm việc</Link><span>/</span><span>Đội nhóm</span></div>
      <section className="workhub-welcome teams-heading"><div><h1>Đội nhóm</h1><span>Tổ chức đội ngũ, kết nối thành viên và cùng nhau làm việc.</span></div>{token && canManage && <Button variant="contained" startIcon={<WorkhubIcon name="plus" size={18} />} onClick={() => setEditor({})}>Tạo đội nhóm</Button>}</section>
      {success && <Alert severity="success" role="status" onClose={() => setSuccess("")}>{success}</Alert>}
      {!token ? <section className="teams-empty"><span className="teams-empty-icon"><WorkhubIcon name="users" size={30} /></span><h2>Đội ngũ của bạn ở đây</h2><p>Đăng nhập để xem đội nhóm và kết nối với các thành viên trong tổ chức.</p><Button component={Link} href="/login" variant="contained">Đăng nhập</Button></section> : <section className="teams-directory" aria-label="Danh sách đội nhóm" aria-busy={query.isFetching}>
        <div className="teams-toolbar"><TextField size="small" label="Tìm đội nhóm" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="teams-toolbar-actions"><FormControlLabel control={<Checkbox checked={includeInactive} onChange={(_, checked) => setIncludeInactive(checked)} />} label="Hiện nhóm ngừng hoạt động" /><Button variant="outlined" disabled={query.isFetching} onClick={() => query.refetch()}>{query.isFetching ? "Đang tải…" : "Tải lại"}</Button></div></div>
        {query.isPending && <><p role="status" className="teams-result-count">Đang tải đội nhóm…</p><div className="teams-grid" aria-hidden="true">{[0, 1, 2].map((key) => <div className="team-card" key={key}><Skeleton variant="rounded" width={48} height={48} /><Skeleton width="60%" height={32} /><Skeleton width="90%" /><Skeleton width="75%" /><Skeleton height={44} /></div>)}</div></>}
        {query.error && <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>{getSafeApiErrorMessage(query.error, "Không tải được danh sách đội nhóm. Vui lòng thử lại.")}</Alert>}
        {query.isSuccess && <>
          <p className="teams-result-count" role="status">{teams.length} đội nhóm{search.trim() ? ` phù hợp với “${search.trim()}”` : " trong danh sách"}</p>
          {teams.length ? <div className="teams-grid">{teams.map((team) => <article className={`team-card${team.is_active ? "" : " is-inactive"}`} key={team.id}>
            <div className="team-card-top"><span className="team-monogram" aria-hidden="true">{team.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("vi-VN")}</span><span className={`team-status${team.is_active ? " is-active" : ""}`}><i aria-hidden="true" />{team.is_active ? "Hoạt động" : "Ngừng hoạt động"}</span></div>
            <h2><button type="button" onClick={() => setSelected(team)}>{team.name}</button></h2>
            <p className="team-description">{team.description || "Chưa có mô tả cho đội nhóm này."}</p>
            <div className="team-card-footer"><span className="team-member-count"><WorkhubIcon name="users" size={17} /><strong>{team.member_count}</strong> thành viên</span><div>{canManage && <><Button aria-label={`Sửa nhóm ${team.name}`} onClick={() => setEditor({ team })}>Sửa</Button><Button color={team.is_active ? "warning" : "primary"} aria-label={`${team.is_active ? "Ngừng hoạt động" : "Kích hoạt lại"} nhóm ${team.name}`} onClick={() => setStatusTeam(team)}>{team.is_active ? "Ngừng hoạt động" : "Kích hoạt lại"}</Button></>}<Button aria-label={`Xem thành viên ${team.name}`} onClick={() => setSelected(team)} endIcon={<WorkhubIcon name="arrow" size={16} />}>Xem nhóm</Button></div></div>
          </article>)}</div> : <div className="teams-empty"><span className="teams-empty-icon"><WorkhubIcon name={search.trim() ? "search" : "users"} size={30} /></span><h2>{search.trim() ? "Không tìm thấy đội nhóm" : "Bắt đầu với đội nhóm đầu tiên"}</h2><p>{search.trim() ? "Thử tên khác hoặc xóa tìm kiếm để xem tất cả đội nhóm." : "Tạo một đội nhóm để tập hợp thành viên và tổ chức công việc."}</p>{search.trim() ? <Button variant="outlined" onClick={() => setSearch("")}>Xóa tìm kiếm</Button> : canManage ? <Button variant="contained" onClick={() => setEditor({})}>Tạo đội nhóm</Button> : <p>Người quản lý có thể tạo đội nhóm cho tổ chức.</p>}</div>}
        </>}
      </section>}
      {token && selected && <TeamMembers key={selected.id} team={query.data?.find((team) => team.id === selected.id) ?? selected} onClose={() => setSelected(null)} />}
      {token && editor && <TeamEditor key={editor.team?.id ?? "new"} team={editor.team} onSaved={setSuccess} onClose={() => setEditor(null)} />}
      {token && statusTeam && <TeamStatusDialog team={statusTeam} onSaved={setSuccess} onClose={() => setStatusTeam(null)} />}
    </main>
  </WorkspaceTemplate>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, MenuItem, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hasAuthorizedAction, hasResourceAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useTeamsQuery, useTeamMembersQuery } from "@/features/teams";
import { getSafeApiErrorMessage } from "@/services/http";
import { assignProjectTeam, projectQueryKeys, type Project } from "../../api/projects.api";

export function ProjectTeamPanel({ project }: { project: Project }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canRead = hasAuthorizedAction(user.data, "teams.read");
  const canManage = hasResourceAction(user.data, "projects.assign-team", project.actions, "assign-team");
  const teams = useTeamsQuery();
  const members = useTeamMembersQuery(project.team_id ?? "");
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [teamId, setTeamId] = useState(project.team_id ?? "");
  const assign = useMutation({
    mutationFn: () => {
      if (!token || !canManage) throw new Error("Không có quyền gán team.");
      return assignProjectTeam({ accessToken: token }, project.id, teamId || null);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: projectQueryKeys.all });
      setEditing(false);
    },
  });
  if (!canRead) return <section className="project-team-panel"><h2>Đội nhóm</h2><p>Bạn chưa được cấp quyền xem đội nhóm.</p></section>;
  return <section className="project-team-panel" aria-label="Team phụ trách dự án">
    <div className="project-team-heading"><h2>Team phụ trách</h2>{canManage && !editing && <Button size="small" onClick={() => { setTeamId(project.team_id ?? ""); assign.reset(); setEditing(true); }}>{project.team_id ? "Đổi team" : "Gán team"}</Button>}</div>
    {editing && canManage ? <form onSubmit={(event) => { event.preventDefault(); if (!assign.isPending) assign.mutate(); }}>
      <TextField select fullWidth size="small" label="Team phụ trách" value={teamId} onChange={(event) => setTeamId(event.target.value)} disabled={!canManage || assign.isPending || teams.isPending || Boolean(teams.error)} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}><MenuItem value="">Chưa gán team</MenuItem>{teams.data?.filter((team) => team.is_active || String(team.id) === project.team_id).map((team) => <MenuItem key={team.id} value={String(team.id)} disabled={!team.is_active}>{team.name}{team.is_active ? "" : " (Ngừng hoạt động)"}</MenuItem>)}</TextField>
      <p className="project-team-hint">Team mới phải bao gồm những người đang được giao công việc. Bỏ gán team sẽ dùng danh sách người nhận việc chung.</p>
      {teams.error && <Alert severity="error" action={<Button onClick={() => teams.refetch()}>Thử lại</Button>}>Không tải được đội nhóm.</Alert>}
      {assign.error && <Alert severity="error">{getSafeApiErrorMessage(assign.error, "Không gán được team. Kiểm tra team đang hoạt động và có đủ người đang nhận công việc trong dự án.")}</Alert>}
      <div className="project-team-actions"><Button disabled={assign.isPending} onClick={() => setEditing(false)}>Hủy</Button><Button variant="contained" type="submit" disabled={!canManage || assign.isPending || teams.isPending || Boolean(teams.error) || teamId === (project.team_id ?? "")}>{assign.isPending ? "Đang lưu…" : "Lưu team"}</Button></div>
    </form> : <>
      <p className="project-team-name">{project.team?.name ?? (project.team_id ? `Team #${project.team_id}` : "Chưa gán team")}{project.team && !project.team.is_active ? " · Ngừng hoạt động" : ""}</p>
      {project.team_id ? members.isPending ? <p role="status">Đang tải thành viên…</p> : members.error ? <Alert severity="warning" action={<Button onClick={() => members.refetch()}>Thử lại</Button>}>Không tải được thành viên.</Alert> : members.data?.length ? <ul className="project-team-members">{members.data.map((member) => <li key={member.user_id}><span>{member.username}</span><small>{!member.is_active ? "Ngừng hoạt động" : member.team_role === "LEADER" ? "Trưởng nhóm" : member.team_role === "VIEWER" ? "Chỉ xem" : "Thành viên"}</small></li>)}</ul> : <p>Team chưa có thành viên.</p> : <p className="project-team-hint">Gán team để giới hạn người nhận việc theo đội nhóm.</p>}
      <Link href="/teams">Quản lý đội nhóm</Link>
    </>}
  </section>;
}

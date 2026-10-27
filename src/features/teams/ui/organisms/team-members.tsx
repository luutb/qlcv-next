"use client";

import { useState } from "react";
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { hasAuthorizedAction } from "@/features/auth/model/current-user";
import { removeTeamMember, upsertTeamMember, type Team, type TeamMember, type TeamMemberRole } from "../../api/teams.api";
import { useTeamMembersQuery, useTeamUserOptions } from "../../hooks/use-teams";
import { useRefreshTeamData } from "../../hooks/use-team-cache";
import { teamErrorMessage, teamMemberRoles } from "../../model/team-feedback";

type MemberAction = { kind: "add" } | { kind: "edit" | "remove"; member: TeamMember };

export function TeamMembers({ team, onClose }: { team: Team; onClose: () => void }) {
  const token = useAccessToken();
  const currentUser = useCurrentUserQuery();
  const canManage = Boolean(token && hasAuthorizedAction(currentUser.data, "teams.manage"));
  const query = useTeamMembersQuery(team.id);
  const [action, setAction] = useState<MemberAction | null>(null);
  const [success, setSuccess] = useState("");
  return <Dialog className="team-management-dialog" open onClose={action ? undefined : onClose} fullWidth maxWidth="md" aria-labelledby="team-members-title">
    <DialogTitle id="team-members-title">Thành viên · {team.name}</DialogTitle>
    <DialogContent aria-busy={query.isFetching}>
      {team.description && <p>{team.description}</p>}
      {success && <Alert severity="success" role="status" onClose={() => setSuccess("")}>{success}</Alert>}
      {!team.is_active && <Alert severity="info">Nhóm đã ngừng hoạt động. Kích hoạt lại nhóm để quản lý thành viên.</Alert>}
      {!canManage && <Alert severity="info">Bạn có thể xem thành viên. Thao tác quản lý dành cho quản trị viên và người quản lý.</Alert>}
      {canManage && team.is_active && <Button sx={{ my: 2 }} variant="contained" disabled={!query.isSuccess || query.isFetching} onClick={() => { setSuccess(""); setAction({ kind: "add" }); }}>Thêm thành viên</Button>}
      {query.isPending && <p role="status">Đang tải thành viên…</p>}
      {query.error && <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>{teamErrorMessage(query.error, "Không tải được thành viên.")}</Alert>}
      {query.isSuccess && (query.data.length ? <div className="table-wrap team-members-table"><table><caption className="sr-only">Thành viên của {team.name}</caption><thead><tr><th>Tên</th><th>Email</th><th>Vai trò trong nhóm</th><th>Tài khoản</th>{canManage && team.is_active && <th>Thao tác</th>}</tr></thead><tbody>{query.data.map((member) => <tr key={member.user_id}>
        <th scope="row">{member.display_name || member.username}</th><td data-label="Email">{member.email || "—"}</td><td data-label="Vai trò">{teamMemberRoles[member.team_role] ?? member.team_role}</td><td data-label="Tài khoản">{member.is_active ? "Hoạt động" : "Ngừng hoạt động"}</td>
        {canManage && team.is_active && <td data-label="Thao tác"><Stack direction={{ xs: "column", sm: "row" }}><Button aria-label={`Đổi vai trò ${member.username}`} onClick={() => { setSuccess(""); setAction({ kind: "edit", member }); }}>Đổi vai trò</Button><Button color="error" aria-label={`Xóa ${member.username} khỏi nhóm`} onClick={() => { setSuccess(""); setAction({ kind: "remove", member }); }}>Xóa khỏi nhóm</Button></Stack></td>}
      </tr>)}</tbody></table></div> : <p role="status">Nhóm chưa có thành viên.</p>)}
    </DialogContent>
    <DialogActions><Button onClick={() => query.refetch()} disabled={query.isFetching}>Tải lại</Button><Button onClick={onClose}>Đóng</Button></DialogActions>
    {action && <MemberActionDialog team={team} action={action} members={query.data ?? []} onClose={() => setAction(null)} onSaved={(message) => { setSuccess(message); setAction(null); }} />}
  </Dialog>;
}

function MemberActionDialog({ team, action, members, onClose, onSaved }: { team: Team; action: MemberAction; members: TeamMember[]; onClose: () => void; onSaved: (message: string) => void }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canManage = Boolean(token && team.is_active && hasAuthorizedAction(user.data, "teams.manage"));
  const users = useTeamUserOptions(canManage && action.kind === "add");
  const options = (users.data ?? []).filter((option) => !members.some((member) => member.user_id === option.id));
  const [userId, setUserId] = useState(action.kind === "add" ? "" : action.member.user_id);
  const [role, setRole] = useState<TeamMemberRole>(action.kind === "add" ? "MEMBER" : action.member.team_role);
  const refresh = useRefreshTeamData();
  const save = useMutation({
    mutationFn: async () => {
      if (!canManage || !token) throw new Error("Không có quyền quản lý thành viên.");
      if (action.kind === "remove") return removeTeamMember({ accessToken: token }, team.id, action.member.user_id);
      if (!userId || (action.kind === "add" && !options.some((option) => option.id === userId))) throw new Error("Chọn thành viên hợp lệ.");
      return upsertTeamMember({ accessToken: token }, team.id, { user_id: userId, team_role: role });
    },
    onSuccess: async () => { await refresh(); onSaved(action.kind === "remove" ? "Đã xóa thành viên khỏi nhóm." : action.kind === "add" ? "Đã thêm thành viên vào nhóm." : "Đã cập nhật vai trò thành viên."); },
  });
  const unchanged = action.kind === "edit" && role === action.member.team_role;
  return <Dialog className="team-management-dialog" open onClose={save.isPending ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="team-member-action-title">
    <form onSubmit={(event) => { event.preventDefault(); if (canManage && userId && !unchanged && !save.isPending) save.mutate(); }}>
      <DialogTitle id="team-member-action-title">{action.kind === "add" ? "Thêm thành viên" : action.kind === "edit" ? "Đổi vai trò thành viên" : "Xóa thành viên khỏi nhóm?"}</DialogTitle>
      <DialogContent>
        {save.error && <Alert severity="error">{teamErrorMessage(save.error, "Không lưu được thay đổi thành viên. Vui lòng thử lại.")}</Alert>}
        {action.kind === "remove" ? <><p>Bạn muốn xóa <strong>{action.member.display_name || action.member.username}</strong> khỏi nhóm <strong>{team.name}</strong>?</p><p>Tài khoản người dùng vẫn được giữ. Hãy chuyển các công việc chưa hoàn tất cho người khác trước khi xóa.</p></> : <>
          {action.kind === "add" ? <>
            <Autocomplete autoHighlight options={options} value={options.find((option) => option.id === userId) ?? null} onChange={(_, option) => setUserId(option?.id ?? "")} getOptionLabel={(option) => `${option.full_name || option.username}${option.email ? ` · ${option.email}` : ""}`} isOptionEqualToValue={(a, b) => a.id === b.id} loading={users.isPending} loadingText="Đang tải người dùng…" noOptionsText="Không còn người dùng phù hợp" disabled={save.isPending || !canManage || Boolean(users.error)} renderInput={(params) => <TextField {...params} autoFocus required margin="normal" label="Chọn thành viên" helperText="Tìm theo tên hoặc email. Chỉ hiển thị tài khoản đang hoạt động và chưa thuộc nhóm." />} />
            {users.error && <Alert severity="error" action={<Button onClick={() => users.refetch()}>Thử lại</Button>}>{teamErrorMessage(users.error, "Không tải được danh sách người dùng.")}</Alert>}
            {users.isSuccess && !options.length && <Alert severity="info">Không còn tài khoản đang hoạt động và chưa thuộc nhóm để thêm.</Alert>}
          </> : <p>{action.member.display_name || action.member.username} · {action.member.email || "Chưa có email"}</p>}
          <TextField select fullWidth margin="normal" label="Vai trò trong nhóm" value={role} onChange={(event) => { const value = event.target.value; if (value === "LEADER" || value === "MEMBER" || value === "VIEWER") setRole(value); }} disabled={!canManage || save.isPending}>{Object.entries(teamMemberRoles).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
          <Alert severity="info">{role === "VIEWER" ? "Người xem không xuất hiện trong danh sách nhận việc của dự án thuộc nhóm." : role === "LEADER" ? "Người này sẽ trở thành trưởng nhóm. Trưởng nhóm hiện tại chuyển về vai trò Thành viên." : "Thành viên có thể được giao công việc trong dự án thuộc nhóm."}</Alert>
        </>}
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={save.isPending}>Hủy</Button><Button type="submit" variant="contained" color={action.kind === "remove" ? "error" : "primary"} disabled={!canManage || !userId || unchanged || save.isPending || (action.kind === "add" && !options.some((option) => option.id === userId))}>{save.isPending ? "Đang lưu…" : action.kind === "remove" ? "Xóa khỏi nhóm" : action.kind === "add" ? "Thêm thành viên" : "Lưu vai trò"}</Button></DialogActions>
    </form>
  </Dialog>;
}

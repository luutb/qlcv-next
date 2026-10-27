"use client";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { hasAuthorizedAction } from "@/features/auth/model/current-user";
import { archiveTeam, updateTeam, type Team } from "../../api/teams.api";
import { useRefreshTeamData } from "../../hooks/use-team-cache";
import { teamErrorMessage } from "../../model/team-feedback";

export function TeamStatusDialog({ team, onClose, onSaved }: { team: Team; onClose: () => void; onSaved: (message: string) => void }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canManage = Boolean(token && hasAuthorizedAction(user.data, "teams.manage"));
  const refresh = useRefreshTeamData();
  const save = useMutation({
    mutationFn: async () => {
      if (!canManage || !token) throw new Error("Không có quyền quản lý đội nhóm.");
      return team.is_active ? archiveTeam({ accessToken: token }, team.id) : updateTeam({ accessToken: token }, team.id, { is_active: true });
    },
    onSuccess: async () => { await refresh(); onSaved(team.is_active ? "Đã ngừng hoạt động đội nhóm. Bật ‘Hiện nhóm ngừng hoạt động’ để xem hoặc kích hoạt lại." : "Đã kích hoạt lại đội nhóm."); onClose(); },
  });
  return <Dialog className="team-management-dialog" open onClose={save.isPending ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="team-status-title">
    <DialogTitle id="team-status-title">{team.is_active ? "Ngừng hoạt động đội nhóm?" : "Kích hoạt lại đội nhóm?"}</DialogTitle>
    <DialogContent>
      <p><strong>{team.name}</strong></p>
      <p>{team.is_active ? "Nhóm và danh sách thành viên được giữ lại, nhưng nhóm sẽ không còn được chọn để giao dự án mới. Bạn có thể kích hoạt lại sau." : "Nhóm sẽ xuất hiện lại trong danh sách hoạt động và có thể được chọn để giao dự án."}</p>
      {team.is_active && <Alert severity="info">Nhóm còn dự án đang hoạt động phải hoàn tất hoặc chuyển dự án sang nhóm khác trước.</Alert>}
      {save.error && <Alert severity="error">{teamErrorMessage(save.error, "Không đổi được trạng thái nhóm. Vui lòng thử lại.")}</Alert>}
    </DialogContent>
    <DialogActions><Button onClick={onClose} disabled={save.isPending}>Hủy</Button><Button variant="contained" color={team.is_active ? "warning" : "primary"} disabled={!canManage || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Đang lưu…" : team.is_active ? "Ngừng hoạt động" : "Kích hoạt lại"}</Button></DialogActions>
  </Dialog>;
}

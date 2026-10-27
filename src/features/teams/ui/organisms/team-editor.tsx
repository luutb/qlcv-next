"use client";

import { useState } from "react";
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { hasAuthorizedAction } from "@/features/auth/model/current-user";
import { createTeam, updateTeam, type Team } from "../../api/teams.api";
import { useTeamUserOptions } from "../../hooks/use-teams";
import { useRefreshTeamData } from "../../hooks/use-team-cache";
import { teamErrorMessage } from "../../model/team-feedback";

export function TeamEditor({ team, onClose, onSaved }: { team?: Team; onClose: () => void; onSaved: (message: string) => void }) {
  const [name, setName] = useState(team?.name ?? "");
  const [description, setDescription] = useState(team?.description ?? "");
  const [leaderId, setLeaderId] = useState(team?.leader_id ?? "");
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canManage = Boolean(token && hasAuthorizedAction(user.data, "teams.manage"));
  const users = useTeamUserOptions(canManage);
  const refresh = useRefreshTeamData();
  const save = useMutation({
    mutationFn: async () => {
      if (!canManage || !token) throw new Error("Không có quyền quản lý đội nhóm.");
      const input = { name: name.trim(), description: description.trim() || null, ...(!team || leaderId !== (team.leader_id ?? "") ? { leader_id: leaderId || null } : {}) };
      return team ? updateTeam({ accessToken: token }, team.id, input) : createTeam({ accessToken: token }, input);
    },
    onSuccess: async () => { await refresh(); onSaved(team ? "Đã cập nhật đội nhóm." : "Đã tạo đội nhóm."); onClose(); },
  });
  const options = [...(users.data ?? [])];
  if (leaderId && !options.some((option) => option.id === leaderId)) options.push({ id: leaderId, username: `Người dùng #${leaderId}`, full_name: "", email: null });
  return <Dialog className="team-management-dialog" open onClose={save.isPending ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="team-editor-title">
    <form onSubmit={(event) => { event.preventDefault(); if (canManage && name.trim() && !save.isPending) save.mutate(); }}>
      <DialogTitle id="team-editor-title">{team ? "Sửa đội nhóm" : "Tạo đội nhóm"}</DialogTitle>
      <DialogContent>
        {!canManage && <Alert severity="warning">Bạn cần quyền quản lý đội nhóm để lưu thay đổi.</Alert>}
        {save.error && <Alert severity="error">{teamErrorMessage(save.error, "Không lưu được đội nhóm. Vui lòng thử lại.")}</Alert>}
        <TextField autoFocus fullWidth required margin="normal" label="Tên đội nhóm" value={name} onChange={(event) => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 160 } }} disabled={!canManage || save.isPending} />
        <TextField fullWidth multiline minRows={3} margin="normal" label="Mô tả" value={description} onChange={(event) => setDescription(event.target.value)} disabled={!canManage || save.isPending} />
        <Autocomplete options={options} value={options.find((option) => option.id === leaderId) ?? null} onChange={(_, option) => setLeaderId(option?.id ?? "")} getOptionLabel={(option) => `${option.full_name || option.username}${option.email ? ` · ${option.email}` : ""}`} isOptionEqualToValue={(a, b) => a.id === b.id} loading={users.isPending} disabled={!canManage || save.isPending || Boolean(users.error) || team?.is_active === false} noOptionsText="Không có người dùng đang hoạt động" renderInput={(params) => <TextField {...params} margin="normal" label="Trưởng nhóm" helperText={team?.is_active === false ? "Kích hoạt lại nhóm trước khi đổi trưởng nhóm." : "Không bắt buộc. Người được chọn sẽ được thêm vào nhóm với vai trò Trưởng nhóm."} />} />
        {users.error && <Alert severity="warning" action={<Button onClick={() => users.refetch()}>Thử lại</Button>}>Không tải được danh sách chọn trưởng nhóm. Bạn vẫn có thể lưu các thông tin khác.</Alert>}
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={save.isPending}>Hủy</Button><Button type="submit" variant="contained" disabled={!canManage || !name.trim() || save.isPending}>{save.isPending ? "Đang lưu…" : "Lưu đội nhóm"}</Button></DialogActions>
    </form>
  </Dialog>;
}

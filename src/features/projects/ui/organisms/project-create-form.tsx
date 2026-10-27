"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Autocomplete, Button, MenuItem, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";
import { createProject, projectQueryKeys } from "../../api/projects.api";
import { useTeamsQuery } from "@/features/teams";
import { useCustomersQuery, type Customer } from "@/features/customers";

export function ProjectCreateForm() {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const client = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const teams = useTeamsQuery();
  const customers = useCustomersQuery({ search: customerSearch, include_deleted: false, limit: 50, offset: 0 });
  const customerOptions = useMemo(() => {
    const options = customers.data?.customers.filter((option) => !option.is_deleted) ?? [];
    return customer && !customer.is_deleted && !options.some((option) => option.id === customer.id) ? [customer, ...options] : options;
  }, [customer, customers.data?.customers]);
  const canAssignTeam = hasAuthorizedAction(user.data, "projects.assign-team");
  const canCreate = hasAuthorizedAction(user.data, "projects.create");
  const validKey = /^[A-Z0-9]{2,20}$/.test(key);
  const valid = validKey && name.trim().length > 0 && name.trim().length <= 255 && description.length <= 2000 && Boolean(customer && !customer.is_deleted);
  const create = useMutation({
    mutationFn: () => {
      if (!token || !canCreate || !valid) throw new Error("Không thể tạo dự án.");
      return createProject({ accessToken: token }, { key, name: name.trim(), customer_id: customer!.id, description: description.trim(), team_id: canAssignTeam ? teamId || null : null });
    },
    onSuccess: async (project) => {
      await client.invalidateQueries({ queryKey: projectQueryKeys.all });
      router.push(`/projects/board?project_id=${encodeURIComponent(project.id)}`);
    },
  });
  const duplicateKey = create.error instanceof ApiProblem && /project key already exists/i.test(create.error.message);
  if (!token) return <Alert severity="info">Vui lòng <Link href="/login">đăng nhập</Link> để tạo dự án.</Alert>;
  if (user.isPending) return <p role="status">Đang kiểm tra quyền tạo dự án…</p>;
  if (user.error) return <Alert severity="error" action={<Button onClick={() => user.refetch()}>Thử lại</Button>}>Không xác minh được quyền tạo dự án.</Alert>;
  if (!canCreate) return <Alert severity="info">Bạn chưa được cấp quyền tạo dự án.</Alert>;
  return <form className="project-create-form" onSubmit={(event) => { event.preventDefault(); if (valid && !create.isPending) create.mutate(); }} aria-busy={create.isPending}>
    {create.error && <Alert severity="error">{duplicateKey ? "Mã dự án đã tồn tại. Vui lòng chọn mã khác." : getSafeApiErrorMessage(create.error, "Không tạo được dự án. Kiểm tra thông tin và thử lại.")}</Alert>}
    <TextField autoFocus required fullWidth label="Tên dự án" value={name} onChange={(event) => setName(event.target.value)} disabled={create.isPending} slotProps={{ htmlInput: { maxLength: 255 } }} />
    <TextField required fullWidth label="Mã dự án" value={key} onChange={(event) => { setKey(event.target.value.toUpperCase()); if (create.isError) create.reset(); }} disabled={create.isPending} error={Boolean(key) && !validKey || duplicateKey} helperText="2–20 ký tự gồm chữ A–Z và số, không có dấu hoặc khoảng trắng. Ví dụ: QLCV01." slotProps={{ htmlInput: { maxLength: 20, pattern: "[A-Z0-9]{2,20}", autoCapitalize: "characters", spellCheck: false } }} />
    <Autocomplete
      autoHighlight
      options={customerOptions}
      value={customer}
      inputValue={customerSearch}
      onInputChange={(_, value, reason) => { setCustomerSearch(value); if (reason === "input" || reason === "clear") setCustomer(null); }}
      onChange={(_, value) => { setCustomer(value); setCustomerSearch(value ? `${value.name}${value.company_name ? ` · ${value.company_name}` : ""}${value.tax_code ? ` · MST ${value.tax_code}` : ""}` : ""); }}
      getOptionLabel={(option) => `${option.name}${option.company_name ? ` · ${option.company_name}` : ""}${option.tax_code ? ` · MST ${option.tax_code}` : ""}`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionDisabled={(option) => option.is_deleted === true}
      filterOptions={(options) => options}
      loading={customers.isPending || customers.isFetching}
      loadingText="Đang tải khách hàng…"
      noOptionsText={customerSearch ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
      disabled={create.isPending || Boolean(customers.error)}
      renderInput={(params) => <TextField {...params} required label="Khách hàng" helperText="Chọn khách hàng đang hoạt động gắn với dự án." />}
    />
    {customers.error ? <Alert severity="warning" action={<Button onClick={() => customers.refetch()}>Thử lại</Button>}>Không tải được danh sách khách hàng.</Alert> : customers.isSuccess && !customerSearch && !customerOptions.length ? <Alert severity="info">Chưa có khách hàng đang hoạt động để chọn. <Link href="/customers">Thêm khách hàng</Link> trước khi tạo dự án.</Alert> : null}
    <TextField fullWidth multiline minRows={4} label="Mô tả" value={description} onChange={(event) => setDescription(event.target.value)} disabled={create.isPending} helperText={`${description.length}/2000 ký tự`} slotProps={{ htmlInput: { maxLength: 2000 } }} />
    <TextField select fullWidth label="Team phụ trách" value={teamId} onChange={(event) => setTeamId(event.target.value)} disabled={!canAssignTeam || create.isPending || teams.isPending || Boolean(teams.error)} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }} helperText={teams.isPending ? "Đang tải đội nhóm…" : "Khi có team, chỉ thành viên đang hoạt động có vai trò Trưởng nhóm/Thành viên được nhận việc."}><MenuItem value="">Chưa gán team</MenuItem>{teams.data?.filter((team) => team.is_active).map((team) => <MenuItem value={String(team.id)} key={team.id}>{team.name}</MenuItem>)}</TextField>
    {teams.error ? <Alert severity="warning" action={<Button onClick={() => teams.refetch()}>Thử lại</Button>}>Không tải được đội nhóm.</Alert> : teams.isSuccess && !teams.data?.length ? <Alert severity="info">Chưa có đội nhóm. Bạn có thể <Link href="/teams">tạo team</Link> hoặc gán sau trong dự án.</Alert> : null}
    <div className="project-create-actions"><Button component={Link} href="/projects" disabled={create.isPending}>Hủy</Button><Button type="submit" variant="contained" disabled={!valid || create.isPending}>{create.isPending ? "Đang tạo…" : "Tạo dự án"}</Button></div>
  </form>;
}

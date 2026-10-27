"use client";
import { useDeferredValue, useState } from "react";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { listCustomers } from "@/features/customers/api/customers.api";
import { listProjects } from "@/features/projects/api/projects.api";
import { TaskPicker, type TaskOption } from "./task-picker";

export type DocumentContextKind = "customer" | "project" | "task";
export type DocumentContextOption = { type: DocumentContextKind; id: string; name: string };

export function DocumentContextPicker({ type, value, onChange, disabled = false }: { type: DocumentContextKind; value: DocumentContextOption | null; onChange: (value: DocumentContextOption | null) => void; disabled?: boolean }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const scope = authorizationCacheScope(user.data);
  const [search, setSearch] = useState("");
  const queryText = useDeferredValue(search.trim());
  const canReadCustomers = hasAuthorizedAction(user.data, "customers.read");
  const canReadProjects = hasAuthorizedAction(user.data, "projects.read");
  const customerQuery = useQuery({ queryKey: ["administration", "document-customer-options", queryText, token, scope], queryFn: ({ signal }) => listCustomers({ accessToken: token!, signal }, { search: queryText, limit: 30, offset: 0 }), enabled: Boolean(token && !disabled && type === "customer" && canReadCustomers) });
  const projectQuery = useQuery({ queryKey: ["administration", "document-project-options", queryText, token, scope], queryFn: ({ signal }) => listProjects({ accessToken: token!, signal }, { limit: 100, offset: 0, active_only: "true" }), enabled: Boolean(token && !disabled && type === "project" && canReadProjects) });
  const taskValue: TaskOption | null = type === "task" && value ? { id: value.id, title: value.name } : null;
  if (type === "task") return <TaskPicker value={taskValue} onChange={(next) => onChange(next ? { type: "task", id: next.id, name: next.title } : null)} disabled={disabled} required />;

  const rows: DocumentContextOption[] = type === "customer"
    ? (customerQuery.data?.customers ?? []).map((customer) => ({ type, id: customer.id, name: customer.name }))
    : (projectQuery.data?.projects ?? []).filter((project) => !queryText || project.name.toLocaleLowerCase("vi").includes(queryText.toLocaleLowerCase("vi"))).map((project) => ({ type, id: project.id, name: project.name }));
  const query = type === "customer" ? customerQuery : projectQuery;
  const allowed = type === "customer" ? canReadCustomers : canReadProjects;
  const options = value && value.type === type && !rows.some((row) => row.id === value.id) ? [value, ...rows] : rows;
  const selectedValue = value?.type === type ? rows.find((row) => row.id === value.id) ?? value : null;
  return <>
    <Autocomplete options={options} filterOptions={(items) => items} value={selectedValue} disabled={disabled || !allowed} loading={query.isFetching} onInputChange={(_, text, reason) => { if (reason === "input" || reason === "clear") setSearch(text); }} onChange={(_, selected) => onChange(selected)} getOptionKey={(item) => item.id} getOptionLabel={(item) => item.name} isOptionEqualToValue={(a, b) => a.id === b.id} noOptionsText={query.error ? "Không tải được danh sách" : "Không có hồ sơ phù hợp"} loadingText="Đang tải…" renderInput={(params) => <TextField {...params} label={type === "customer" ? "Khách hàng" : "Dự án"} required margin="normal" error={Boolean(query.error || !allowed)} helperText={!allowed && user.data ? `Bạn chưa có quyền xem ${type === "customer" ? "khách hàng" : "dự án"}.` : query.error ? "Không tải được danh sách. Vui lòng thử lại." : "Tìm và chọn hồ sơ cần gắn tài liệu."} />} />
    {query.error && !disabled && allowed && <Button disabled={query.isFetching} onClick={() => query.refetch()}>Tải lại danh sách</Button>}
  </>;
}

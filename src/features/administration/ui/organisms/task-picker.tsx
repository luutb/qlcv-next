"use client";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, Button, TextField } from "@mui/material";
import { tasksApi } from "@/features/tasks/api";
import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
export type TaskOption = { id: string; title: string };
export function TaskPicker({ value, onChange, disabled, required }: { value: TaskOption | null; onChange: (value: TaskOption | null) => void; disabled?: boolean; required?: boolean }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canReadTasks = hasAuthorizedAction(user.data, "tasks.access");
  const [search, setSearch] = useState("");
  const q = useDeferredValue(search.trim());
  const query = useQuery({ queryKey: ["administration", "task-options", q, token, authorizationCacheScope(user.data)], queryFn: ({ signal }) => tasksApi.list({ q, limit: 30, offset: 0 }, { accessToken: token!, signal }), enabled: Boolean(token && !disabled && canReadTasks) });
  const options: TaskOption[] = canReadTasks ? query.data?.data ?? [] : [];
  const combined = value && !options.some((item) => item.id === value.id) ? [value, ...options] : options;
  return <>
    <Autocomplete options={combined} filterOptions={(items) => items} value={value} disabled={disabled || !canReadTasks} loading={query.isFetching} onInputChange={(_, text, reason) => { if (reason === "input" || reason === "clear") setSearch(text); }} onChange={(_, selected) => onChange(selected)} getOptionKey={(item) => item.id} getOptionLabel={(item) => item.title} isOptionEqualToValue={(a, b) => a.id === b.id} noOptionsText={query.error ? "Không tải được danh sách công việc" : "Không có công việc phù hợp"} loadingText="Đang tải…" renderInput={(params) => <TextField {...params} label="Công việc" required={required} margin="normal" error={Boolean(query.error)} helperText={!canReadTasks && user.data ? "Bạn chưa có quyền chọn công việc." : query.error ? "Không tải được danh sách. Vui lòng thử lại." : "Tìm theo tên trong những công việc bạn được xem (tối đa 30 kết quả)."} />} />
    {query.error && !disabled && canReadTasks && <Button disabled={query.isFetching} onClick={() => query.refetch()}>Thử tải lại công việc</Button>}
  </>;
}

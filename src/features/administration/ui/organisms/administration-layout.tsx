"use client";
import type { ReactNode } from "react";
import { Alert, Button, TablePagination } from "@mui/material";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";
export function AdministrationLayout({ title, description, href, children, actions }: { title: string; description: string; href: string; children: ReactNode; actions?: ReactNode }) {
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref={href} />} topbar={<WorkhubTopbar />}><main id="main-content" className="workhub-content directory-content"><div className="directory-heading"><div><h1>{title}</h1><p>{description}</p></div>{actions}</div>{children}</main></WorkspaceTemplate>;
}
export function AdministrationError({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  const messages: Record<string, string> = { DUPLICATE_NAME: "Tên này đã tồn tại. Vui lòng chọn tên khác.", FILE_TOO_LARGE: "Tệp vượt quá giới hạn 10 MB.", INVALID_FILE_TYPE: "Chỉ chấp nhận PDF, JPG hoặc PNG có nội dung hợp lệ.", STORAGE_UNAVAILABLE: "Kho tài liệu chưa sẵn sàng. Vui lòng thử lại sau.", VERSION_CONFLICT: "Thông tin đã được cập nhật ở phiên khác. Tải lại dữ liệu trước khi sửa tiếp." };
  const message = error instanceof ApiProblem && error.problem.code ? messages[error.problem.code] : undefined;
  return <Alert severity="error" sx={{ my: 2 }} action={retry ? <Button onClick={retry}>Thử lại</Button> : undefined}>{message ?? getSafeApiErrorMessage(error, "Không thực hiện được yêu cầu. Vui lòng thử lại.")}</Alert>;
}
export function AdministrationPagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  return <TablePagination component="div" count={total} page={page - 1} rowsPerPage={25} rowsPerPageOptions={[25]} onPageChange={(_, value) => onChange(value + 1)} labelRowsPerPage="Mỗi trang" labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`} getItemAriaLabel={(type) => type === "next" ? "Trang sau" : "Trang trước"} />;
}

import type { ReactNode } from "react";
import { Alert, Button, Skeleton } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";

export function PlatformEmpty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="platform-empty"><span className="platform-empty-icon"><WorkhubIcon name="folder" size={27} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function PlatformError({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  const problem = error instanceof ApiProblem ? error.problem : null;
  const unavailable = problem?.status === 404 || problem?.status === 501;
  const message = problem?.status === 403 ? "Bạn chưa được cấp quyền thực hiện thao tác này. Kiểm tra lại quyền hoặc liên hệ người quản trị." : unavailable ? "Dịch vụ quản trị nền tảng chưa sẵn sàng. Vui lòng thử lại sau khi dịch vụ được cập nhật." : problem?.status === 409 ? "Dữ liệu đã thay đổi hoặc thao tác không còn hợp lệ. Tải bản mới trước khi tiếp tục." : getSafeApiErrorMessage(error, "Không kết nối được dịch vụ quản trị. Vui lòng thử lại.");
  return <Alert severity="error" sx={{ m: 2 }} action={retry && <Button onClick={retry}>Thử lại</Button>}>{message}</Alert>;
}
export function PlatformLoading() {
  return <div className="platform-loading" role="status" aria-label="Đang tải dữ liệu"><Skeleton height={46} /><Skeleton height={46} /><Skeleton height={46} /><Skeleton height={46} /><span>Đang tải dữ liệu…</span></div>;
}
export function PlatformUnavailable({ preview, allowed }: { preview: boolean; allowed: boolean }) {
  if (preview) return <PlatformEmpty title="Giao diện xem trước" description="Danh sách sẽ hiển thị dữ liệu thật khi đăng nhập bằng tài khoản Super Admin và kết nối dịch vụ. Bạn có thể xem cấu trúc màn hình và biểu mẫu tại đây." />;
  if (!allowed) return <Alert severity="warning" sx={{ m: 2 }}>Bạn chưa được cấp quyền xem hạng mục này.</Alert>;
  return null;
}
export function PlatformPagination({ page, total, limit, pending, onPage }: { page: number; total: number; limit: number; pending: boolean; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return <div className="platform-pagination"><span>{total ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} / ${total.toLocaleString("vi-VN")}` : "0 kết quả"}</span><div><Button disabled={pending || page <= 1} onClick={() => onPage(page - 1)}>Trước</Button><span>Trang {page} / {pages}</span><Button disabled={pending || page >= pages} onClick={() => onPage(page + 1)}>Sau</Button></div></div>;
}
export const platformDate = (value: string | null) => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "Chưa ghi nhận";

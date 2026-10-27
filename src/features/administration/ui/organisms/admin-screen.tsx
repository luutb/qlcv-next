"use client";
import Link from "next/link";
import { Alert, Button, Paper } from "@mui/material";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import type { AuthorizationAction } from "@/features/auth/model/current-user";
import { AdministrationLayout } from "./administration-layout";
const modules: ReadonlyArray<{ title: string; description: string; href: string; action?: AuthorizationAction }> = [
  { title: "Xem trước Super Admin", description: "Xem thiết kế khu quản trị hệ thống, tách riêng khỏi Admin tổ chức.", href: "/admin/platform-preview" },
  { title: "Nhân viên", description: "Hồ sơ, tài khoản, vai trò và trạng thái hoạt động.", href: "/users", action: "users.manage" },
  { title: "Quyền theo vai trò", description: "Xem giới hạn quyền, điều chỉnh và khôi phục chính sách.", href: "/admin/permissions" },
  { title: "Thông tin tổ chức", description: "Tên đơn vị, thông tin liên hệ và địa chỉ.", href: "/admin/tenant-settings", action: "tenant-settings.manage" },
  { title: "Loại hợp đồng", description: "Danh mục hợp đồng dùng chung, ngừng hoặc kích hoạt lại.", href: "/admin/contract-types", action: "tenant-settings.manage" },
  { title: "Nhật ký thao tác", description: "Người thực hiện và các thay đổi đã ghi nhận.", href: "/audit", action: "audit.read" },
  { title: "Đội nhóm", description: "Trưởng nhóm, thành viên và trạng thái đội nhóm.", href: "/teams", action: "teams.manage" },
  { title: "Khách hàng", description: "Hồ sơ khách hàng, doanh nghiệp và lưu trữ.", href: "/customers", action: "customers.manage" },
  { title: "Dự án", description: "Khách hàng, đội phụ trách, tiến độ và tài chính.", href: "/projects", action: "projects.read" },
  { title: "Công việc", description: "Phân công, tiến độ, đánh giá và các khoản thu.", href: "/work", action: "tasks.access" },
  { title: "Nhãn", description: "Phân loại công việc và nhãn tài chính.", href: "/labels", action: "labels.manage" },
  { title: "Tài liệu", description: "Tải lên, tải xuống và lưu trữ tài liệu nghiệp vụ.", href: "/documents", action: "documents.read" },
  { title: "Giờ làm việc", description: "Ghi nhận và quản lý thời gian theo công việc.", href: "/time-entries", action: "time-entries.read" },
  { title: "Báo cáo", description: "Tiến độ công việc, phân bổ nhân sự và số liệu tài chính.", href: "/reports", action: "reports.read" },
];
export function AdminScreen() {
  const user = useCurrentUserQuery();
  return <AdministrationLayout title="Quản trị nghiệp vụ" description="Quản lý các hoạt động và cấu hình của tổ chức." href="/admin" actions={<Button component={Link} href="/">Về tổng quan</Button>}>
    {(user.data?.role !== "ADMIN" && user.data?.role !== "SUPER_ADMIN") ? <Alert severity="warning">Trang này dành cho quản trị viên.</Alert> : <div className="admin-module-grid">{modules.filter((item) => !item.action || hasAuthorizedAction(user.data, item.action)).map((item) => <Paper key={item.href} variant="outlined" className="admin-module-card"><Link href={item.href}><h2>{item.title}</h2><p>{item.description}</p><span>Mở quản lý →</span></Link></Paper>)}</div>}
  </AdministrationLayout>;
}

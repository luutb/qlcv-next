"use client";

import { Alert, Button } from "@mui/material";
import { usePlatformAccess } from "../../hooks/use-platform";
import type { PlatformCapability } from "../../model/platform-contracts";

const rights: ReadonlyArray<{ key: PlatformCapability; title: string; description: string }> = [
  { key: "platform.tenants.read", title: "Xem tenant", description: "Đọc thông tin, thành viên, tài nguyên và gói đang dùng." },
  { key: "platform.tenants.manage", title: "Quản lý đăng ký tenant", description: "Gán gói và cập nhật trạng thái đăng ký." },
  { key: "platform.plans.read", title: "Xem gói cước", description: "Đọc danh mục và hạn mức theo từng gói." },
  { key: "platform.plans.manage", title: "Quản lý gói cước", description: "Tạo, chỉnh sửa và ngừng cho phép gán gói." },
  { key: "platform.access", title: "Truy cập nền tảng", description: "Đăng nhập vào không gian Super Admin." },
  { key: "platform.overview.read", title: "Xem tổng quan", description: "Đọc các số liệu tổng hợp của hệ thống." },
  { key: "platform.organizations.read", title: "Xem thông tin đơn vị", description: "Đọc thông tin cấu hình đơn vị vận hành." },
  { key: "platform.admins.read", title: "Xem tài khoản quản trị", description: "Xem danh sách, vai trò và trạng thái tài khoản." },
  { key: "platform.admins.manage", title: "Quản lý tài khoản quản trị", description: "Tạo, thay đổi vai trò và vô hiệu hóa tài khoản." },
  { key: "platform.audit.read", title: "Xem nhật ký hệ thống", description: "Đọc lịch sử thao tác quản trị." },
];
export function PlatformSettings({ preview }: { preview: boolean }) {
  const access = usePlatformAccess(preview);
  const user = access.user.data;
  return <div className="platform-settings-content"><section className="platform-panel"><header><div><h2>Tài khoản đang đăng nhập</h2><p>Thông tin nhận diện và phạm vi được máy chủ xác minh.</p></div><Button disabled={access.user.isFetching} onClick={() => access.user.refetch()}>Kiểm tra lại quyền</Button></header><div className="platform-organization-body"><dl className="platform-detail-list">{[["Tên đăng nhập", user?.username ?? "Chưa xác minh"], ["Email", user?.email || "Chưa cập nhật"], ["Vai trò", preview ? "Admin · chế độ xem trước" : "Super Admin"], ["Phạm vi", preview ? "Xem trước, không cấp quyền nền tảng" : "Quản trị nền tảng"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Alert severity="info">Thay đổi quyền được xác minh lại ở máy chủ cho mỗi yêu cầu. Giao diện này hiển thị quyền hiện hành, không dùng để tự cấp thêm quyền.</Alert></div></section><section className="platform-panel"><header><div><h2>Quyền quản trị hiệu lực</h2><p>{preview ? "Danh sách quyền dự kiến cho Super Admin. Không áp dụng cho tài khoản xem trước." : "Các quyền đang được cấp cho tài khoản này."}</p></div></header><div className="platform-rights">{rights.map((right) => <div key={right.key}><span><strong>{right.title}</strong><small>{right.description}</small></span><span className={`platform-badge ${preview ? "inactive" : access.can(right.key) ? "active" : "inactive"}`}>{preview ? "Xem trước" : access.can(right.key) ? "Được cấp" : "Chưa được cấp"}</span></div>)}</div></section></div>;
}

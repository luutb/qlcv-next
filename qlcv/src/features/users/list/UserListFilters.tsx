import { Input, Select, Space } from "antd";
import { USER_ROLES, type UserRole } from "@/api/users.api";

type UserListFiltersProps = {
  search: string;
  role?: UserRole;
  isActive?: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value?: UserRole) => void;
  onActiveChange: (value?: boolean) => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PARTNER: "Partner",
  LAWYER: "Luật sư",
  ACCOUNTANT: "Kế toán",
};

export function UserListFilters({
  search,
  role,
  isActive,
  onSearchChange,
  onRoleChange,
  onActiveChange,
}: UserListFiltersProps) {
  return (
    <Space wrap size="middle">
      <Input.Search
        allowClear
        aria-label="Tìm người dùng"
        placeholder="Tìm theo tên hoặc email"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        style={{ width: 300 }}
      />
      <Select<UserRole>
        allowClear
        aria-label="Lọc theo vai trò"
        placeholder="Tất cả vai trò"
        value={role}
        options={USER_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))}
        onChange={onRoleChange}
        style={{ width: 180 }}
      />
      <Select<"true" | "false">
        allowClear
        aria-label="Lọc theo trạng thái"
        placeholder="Tất cả trạng thái"
        value={isActive === undefined ? undefined : String(isActive) as "true" | "false"}
        options={[
          { value: "true", label: "Đang hoạt động" },
          { value: "false", label: "Đã vô hiệu hóa" },
        ]}
        onChange={(value) => onActiveChange(value === undefined ? undefined : value === "true")}
        style={{ width: 190 }}
      />
    </Space>
  );
}

export function getUserRoleLabel(role: string): string {
  return ROLE_LABELS[role as UserRole] ?? role;
}

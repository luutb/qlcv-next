"use client";

import Link from "next/link";
import { Alert, Button, Chip, Paper, Stack } from "@mui/material";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { useCurrentUserQuery } from "../../hooks/use-current-user";
import { hasActiveSubscription } from "../../model/current-user";

const statuses: Record<string, string> = {
  ACTIVE: "Đang hoạt động", TRIALING: "Đang dùng thử", PAUSED: "Tạm dừng", CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn", SCHEDULED: "Chưa đến ngày hiệu lực", NO_SUBSCRIPTION: "Chưa được gán gói",
  CONFIGURATION_REQUIRED: "Gói chưa được cấu hình tính năng",
};
const features: Record<string, string> = {
  projects: "Dự án", tasks: "Công việc", customers: "Khách hàng", teams: "Đội nhóm", labels: "Nhãn",
  documents: "Tài liệu", finance: "Tài chính và hợp đồng", "time-entries": "Thời gian làm việc",
  reports: "Báo cáo", audit: "Nhật ký", users: "Nhân viên", settings: "Cấu hình đơn vị",
};
const date = (value: string | null) => value ? new Date(value).toLocaleString("vi-VN") : "Chưa đặt";
const count = (value: number | null) => value === null ? "Không giới hạn" : value.toLocaleString("vi-VN");

export function SubscriptionScreen() {
  const query = useCurrentUserQuery();
  const subscription = query.data?.subscription;
  const active = Boolean(query.data && hasActiveSubscription(query.data));
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/subscription" />} topbar={<WorkhubTopbar />}>
    <main id="main-content" className="workhub-content directory-content">
      <div className="directory-heading"><div><p className="workhub-eyebrow">Tài khoản đơn vị</p><h1>Gói sử dụng</h1><p>Tính năng và hạn mức được áp dụng cùng quyền vai trò của bạn.</p></div></div>
      <Stack spacing={2}>
        {query.isPending && <p role="status">Đang tải thông tin gói…</p>}
        {query.error && <Alert severity="error">Không tải được thông tin gói. Vui lòng thử lại.</Alert>}
        {!query.isPending && !query.error && <>
          <Alert severity={active ? "info" : "warning"}>{active ? "Gói đang có hiệu lực. Từng thao tác vẫn cần quyền vai trò tương ứng." : "Nghiệp vụ đang bị chặn. Liên hệ quản trị hệ thống để gán, gia hạn hoặc cấu hình gói; dữ liệu của đơn vị vẫn được giữ lại."}</Alert>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <h2>{subscription?.plan_name || "Chưa có gói sử dụng"}</h2>
              <p>{subscription?.plan_code || "Chưa gán gói"} · {subscription ? statuses[!active && ["ACTIVE", "TRIALING"].includes(subscription.status) ? "EXPIRED" : subscription.status] : "Chưa có thông tin đăng ký"}</p>
              <dl className="platform-detail-list">
                <div><dt>Bắt đầu</dt><dd>{date(subscription?.starts_at ?? null)}</dd></div>
                <div><dt>Kết thúc</dt><dd>{date(subscription?.ends_at ?? null)}</dd></div>
                <div><dt>Thành viên tối đa</dt><dd>{subscription?.plan_id ? count(subscription.members_limit) : "Chưa có gói"}</dd></div>
                <div><dt>Dự án tối đa</dt><dd>{subscription?.plan_id ? count(subscription.projects_limit) : "Chưa có gói"}</dd></div>
                <div><dt>Dung lượng tài liệu</dt><dd>{subscription?.plan_id ? subscription.storage_bytes_limit === null ? "Không giới hạn" : `${(subscription.storage_bytes_limit / 1024 ** 3).toLocaleString("vi-VN")} GB` : "Chưa có gói"}</dd></div>
              </dl>
              <h3>Tính năng trong gói</h3>
              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>{subscription?.features.map((key) => <Chip key={key} label={features[key] ?? key} variant="outlined" />)}</Stack>
              {!subscription?.features.length && <p>Chưa có tính năng được cấp trong gói.</p>}
            </Stack>
          </Paper>
          <p>Đạt hạn mức sẽ chặn tạo thêm. Hạ gói hoặc hết hạn không xóa dữ liệu hiện có.</p>
        </>}
        <Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => query.refetch()} disabled={query.isFetching}>Kiểm tra lại gói</Button>{active && <Button component={Link} href="/">Về tổng quan</Button>}</Stack>
      </Stack>
    </main>
  </WorkspaceTemplate>;
}

"use client";

import { useState } from "react";
import { Alert, Button, MenuItem, TextField } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import type { PlanFilters, PlatformPlan } from "../../model/tenant-contracts";
import { planPrice, resourceCount, storageSize } from "../../model/tenant-format";
import { PlatformPlanEditor } from "./platform-plan-editor";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, PlatformUnavailable } from "./platform-feedback";

export function PlatformPlans({ preview }: { preview: boolean }) {
  const [filters, setFilters] = useState<PlanFilters>({ page: 1, limit: 12, q: "", is_active: "" });
  const [search, setSearch] = useState(""), [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<{ plan?: PlatformPlan } | null>(null);
  const query = usePlatformQuery(["plans", filters], "platform.plans.read", (signal) => platformApi.plans(filters, signal), preview);
  const data = query.allowed && !query.error ? query.data : undefined;
  const canManage = query.access.can("platform.plans.manage");
  const reset = () => { setSearch(""); setFilters({ ...filters, page: 1, q: "", is_active: "" }); };
  return <><div className="platform-section-toolbar"><div><span className="platform-count-label">{data ? `${data.pagination.total} gói cước` : "Danh mục gói cước"}</span><p>Cấu hình một lần để gán cho tenant và theo dõi hạn mức.</p></div><Button variant="contained" onClick={() => setEditing({})} disabled={!preview && !canManage}>Tạo gói cước</Button></div>
    {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
    <section className="platform-panel"><form className="platform-filters" onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, page: 1, q: search.trim() }); }}><TextField label="Tìm gói cước" placeholder="Mã hoặc tên gói" size="small" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} /><TextField select label="Trạng thái gói" size="small" value={filters.is_active} onChange={(event) => { const value = event.target.value; if (value === "" || value === "true" || value === "false") setFilters({ ...filters, page: 1, is_active: value }); }}><MenuItem value="">Tất cả</MenuItem><MenuItem value="true">Cho phép gán</MenuItem><MenuItem value="false">Ngừng gán mới</MenuItem></TextField><Button type="submit" variant="outlined">Tìm kiếm</Button><Button onClick={reset}>Xóa bộ lọc</Button><Button disabled={preview || !query.allowed || query.isFetching} onClick={() => query.refetch()}>Tải lại</Button></form>
      <PlatformUnavailable preview={preview} allowed={query.allowed} />
      {!preview && query.allowed && query.isPending && <PlatformLoading />}
      {!preview && query.allowed && <PlatformError error={query.error} retry={() => query.refetch()} />}
      {data && <><div className="tenant-plan-grid">{data.items.map((plan) => <article className="tenant-plan-card" key={plan.id}><div className="tenant-plan-top"><span className="tenant-plan-code">{plan.code}</span><span className={`platform-badge ${plan.is_active ? "active" : "inactive"}`}>{plan.is_active ? "Cho phép gán" : "Ngừng gán mới"}</span></div><h2>{plan.name}</h2>{!plan.features_configured && <Alert severity="warning">Chưa cấu hình tính năng</Alert>}<p className="tenant-plan-description">{plan.description || "Chưa có mô tả gói."}</p><div className="tenant-plan-price"><strong>{planPrice(plan.price_amount, plan.currency)}</strong>{plan.billing_interval && <span>/{plan.billing_interval === "MONTHLY" ? "tháng" : "năm"}</span>}</div><dl>{[["Thành viên", plan.limits.members === null ? "Không giới hạn" : resourceCount(plan.limits.members)], ["Dự án", plan.limits.projects === null ? "Không giới hạn" : resourceCount(plan.limits.projects)], ["Lưu trữ", plan.limits.storage_bytes === null ? "Không giới hạn" : storageSize(plan.limits.storage_bytes)]].map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>{canManage && <Button fullWidth variant="outlined" onClick={() => setEditing({ plan })}>Chỉnh sửa gói</Button>}</article>)}</div>{!data.items.length && <PlatformEmpty title="Chưa có gói cước phù hợp" description={filters.q || filters.is_active ? "Thử thay đổi bộ lọc để tìm gói cước." : "Tạo gói đầu tiên và cấu hình phí, chu kỳ, hạn mức theo chính sách của bạn."} action={(canManage || preview) ? <Button onClick={() => setEditing({})}>Tạo gói cước</Button> : undefined} />}<PlatformPagination page={data.pagination.page} total={data.pagination.total} limit={data.pagination.limit} pending={query.isFetching} onPage={(page) => setFilters({ ...filters, page })} /></>}
    </section><div className="platform-section-note">Phí niêm yết và hạn mức được dùng để quản trị thông tin gói. Chưa có thu tiền tự động hoặc chặn sử dụng vượt hạn mức.</div>
    {editing && (preview || canManage) && <PlatformPlanEditor plan={editing.plan} preview={preview} onClose={() => setEditing(null)} onSaved={(message) => { setEditing(null); setSuccess(message); }} />}
  </>;
}

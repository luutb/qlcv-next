"use client";

import { useState } from "react";
import { Alert, Button, Checkbox, FormControlLabel, Stack, TablePagination, TextField } from "@mui/material";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useCustomersQuery } from "../../hooks/use-customers";
import { type Customer } from "../../api/customers.api";
import { customerError } from "../../model/customer-feedback";
import { CustomerEditor } from "./customer-editor";
import { CustomerDetail } from "./customer-detail";
import { CustomerStatusDialog } from "./customer-status-dialog";

export function CustomersScreen() {
  const user = useCurrentUserQuery(); const canManage = hasAuthorizedAction(user.data, "customers.manage");
  const [search, setSearch] = useState(""); const [submitted, setSubmitted] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false); const [page, setPage] = useState(0); const [limit, setLimit] = useState(25);
  const [editor, setEditor] = useState<{ customer?: Customer } | null>(null); const [detail, setDetail] = useState<string | null>(null); const [status, setStatus] = useState<Customer | null>(null); const [success, setSuccess] = useState("");
  const query = useCustomersQuery({ search: submitted, include_deleted: includeDeleted, limit, offset: page * limit });
  const customers = query.data?.customers ?? [];
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/customers" />} topbar={<WorkhubTopbar />}>
    <main id="main-content" className="workhub-content directory-content">
      <div className="directory-heading"><div><h1>Khách hàng</h1><p>Thông tin liên hệ và hồ sơ khách hàng của tổ chức.</p></div>{canManage && <Button variant="contained" onClick={() => setEditor({})}>Thêm khách hàng</Button>}</div>
      {success && <Alert severity="success" role="status" onClose={() => setSuccess("")}>{success}</Alert>}
      <section className="directory-panel" aria-label="Danh sách khách hàng" aria-busy={query.isFetching}>
        <form className="directory-toolbar" onSubmit={(event) => { event.preventDefault(); setPage(0); setSubmitted(search.trim()); }}>
          <TextField size="small" label="Tìm khách hàng" placeholder="Tên, công ty, mã số thuế, email…" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
          <Button type="submit" variant="outlined">Tìm kiếm</Button><FormControlLabel control={<Checkbox checked={includeDeleted} onChange={(_, checked) => { setPage(0); setIncludeDeleted(checked); }} />} label="Hiện khách hàng đã lưu trữ" /><Button disabled={query.isFetching} onClick={() => query.refetch()}>Tải lại</Button>
        </form>
        {query.isPending && <p role="status">Đang tải khách hàng…</p>}
        {query.error && <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>{customerError(query.error, "Không tải được danh sách khách hàng.")}</Alert>}
        {query.isSuccess && (!customers.length ? <div className="directory-empty"><h2>{submitted ? "Không tìm thấy khách hàng" : "Chưa có khách hàng trong danh sách"}</h2><p>{submitted ? "Thử từ khóa khác hoặc xóa tìm kiếm." : "Thêm khách hàng để lưu thông tin liên hệ và hồ sơ."}</p>{page > 0 && <Button onClick={() => setPage(0)}>Về trang đầu</Button>}</div> : <div className="directory-table-wrap"><table className="directory-table"><caption className="sr-only">Danh sách khách hàng</caption><thead><tr><th>Tên khách hàng</th><th>Liên hệ</th><th>Mã số thuế</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}>
          <th scope="row"><button className="directory-name" onClick={() => setDetail(customer.id)}>{customer.name}</button><small>{customer.company_name}</small></th>
          <td data-label="Liên hệ">{customer.contact_email || customer.contact_phone || "—"}</td><td data-label="Mã số thuế">{customer.tax_code || "—"}</td><td data-label="Trạng thái">{customer.is_deleted ? "Đã lưu trữ" : "Hoạt động"}</td>
          <td data-label="Thao tác"><Stack direction="row" sx={{ flexWrap: "wrap" }}><Button aria-label={`Xem ${customer.name}`} onClick={() => setDetail(customer.id)}>Xem hồ sơ</Button>{canManage && <>{!customer.is_deleted && <Button aria-label={`Sửa ${customer.name}`} onClick={() => setEditor({ customer })}>Sửa</Button>}<Button color={customer.is_deleted ? "primary" : "warning"} aria-label={`${customer.is_deleted ? "Khôi phục" : "Lưu trữ"} ${customer.name}`} onClick={() => setStatus(customer)}>{customer.is_deleted ? "Khôi phục" : "Lưu trữ"}</Button></>}</Stack></td>
        </tr>)}</tbody></table></div>)}
        {query.isSuccess && <TablePagination component="div" count={query.data.pagination.total} page={page} rowsPerPage={limit} rowsPerPageOptions={[10, 25, 50]} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={(event) => { setLimit(Number(event.target.value)); setPage(0); }} labelRowsPerPage="Mỗi trang" labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`} getItemAriaLabel={(type) => type === "next" ? "Trang sau" : "Trang trước"} />}
      </section>
      {editor && <CustomerEditor customer={editor.customer} onSaved={(message) => { setSuccess(message); setPage(0); }} onClose={() => setEditor(null)} />}
      {detail && <CustomerDetail id={detail} onClose={() => setDetail(null)} />}
      {status && <CustomerStatusDialog customer={status} onSaved={(message) => { setSuccess(message); setPage(0); }} onClose={() => setStatus(null)} />}
    </main>
  </WorkspaceTemplate>;
}

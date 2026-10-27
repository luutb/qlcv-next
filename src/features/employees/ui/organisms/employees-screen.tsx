"use client";
import { useState } from "react";
import Link from "next/link";
import { Alert, Button, MenuItem, Stack, TablePagination, TextField } from "@mui/material";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { type Employee, type EmployeeRole } from "../../api/employees.api";
import { useEmployeeAccess, useEmployees } from "../../hooks/use-employees";
import { employeeError, employeeRoles } from "../../model/employee-feedback";
import { EmployeeEditor } from "./employee-editor";
import { EmployeeDetail } from "./employee-detail";
import { EmployeeAccountAction, type AccountAction } from "./employee-account-action";
export function EmployeesScreen() {
 const {allowed,user}=useEmployeeAccess();const [search,setSearch]=useState("");const [submitted,setSubmitted]=useState("");const [role,setRole]=useState<EmployeeRole|"">("");const [active,setActive]=useState("");const [department,setDepartment]=useState("");const [submittedDepartment,setSubmittedDepartment]=useState("");const [page,setPage]=useState(0);const [limit,setLimit]=useState(25);
 const [editor,setEditor]=useState<{employee?:Employee}|null>(null);const [detail,setDetail]=useState<string|null>(null);const [action,setAction]=useState<{employee:Employee;kind:AccountAction}|null>(null);const [success,setSuccess]=useState("");
 const query=useEmployees({page:page+1,limit,search:submitted,role:role||undefined,is_active:active===""?undefined:active==="true",department:submittedDepartment||undefined});
 const employees=query.data?.employees??[];
 return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/users"/>} topbar={<WorkhubTopbar/>}><main id="main-content" className="workhub-content directory-content">
  <div className="directory-heading"><div><h1>Hồ sơ nhân viên</h1><p>Thông tin nhân sự, giấy tờ và tài khoản của đội ngũ.</p></div>{allowed&&<Stack direction={{xs:"column",sm:"row"}} spacing={1}><Button component={Link} href="/admin/permissions" variant="outlined">Thiết lập quyền</Button><Button variant="contained" onClick={()=>setEditor({})}>Thêm nhân viên</Button></Stack>}</div>
  {success&&<Alert role="status" severity="success" onClose={()=>setSuccess("")}>{success}</Alert>}
  {user.isPending?<p role="status">Đang kiểm tra quyền truy cập…</p>:user.error?<Alert severity="error" action={<Button onClick={()=>user.refetch()}>Thử lại</Button>}>{employeeError(user.error,"Không kiểm tra được quyền truy cập.")}</Alert>:!allowed?<Alert severity="info">Hồ sơ nhân viên chứa thông tin riêng tư. Chỉ quản trị viên có quyền quản lý mục này.</Alert>:<section className="directory-panel" aria-label="Danh sách nhân viên" aria-busy={query.isFetching}>
   <form className="directory-toolbar" onSubmit={event=>{event.preventDefault();setPage(0);setSubmitted(search.trim());setSubmittedDepartment(department.trim());}}>
    <TextField size="small" label="Tìm nhân viên" placeholder="Tên, tài khoản, email, điện thoại" value={search} onChange={event=>setSearch(event.target.value)} slotProps={{htmlInput:{maxLength:200}}}/>
    <TextField size="small" label="Phòng ban" value={department} onChange={event=>setDepartment(event.target.value)} slotProps={{htmlInput:{maxLength:200}}}/>
    <TextField size="small" select label="Vai trò" value={role} onChange={event=>{const value=event.target.value;if(value===""||value==="admin"||value==="manager"||value==="staff"||value==="accountant"){setRole(value);setPage(0);}}}><MenuItem value="">Tất cả vai trò</MenuItem>{Object.entries(employeeRoles).map(([value,label])=><MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
    <TextField size="small" select label="Trạng thái" value={active} onChange={event=>{setActive(event.target.value);setPage(0);}}><MenuItem value="">Tất cả trạng thái</MenuItem><MenuItem value="true">Hoạt động</MenuItem><MenuItem value="false">Ngừng hoạt động</MenuItem></TextField>
    <Button type="submit" variant="outlined">Tìm kiếm</Button><Button disabled={query.isFetching} onClick={()=>query.refetch()}>Tải lại</Button>
   </form>
   {query.isPending&&<p role="status">Đang tải nhân viên…</p>}{query.error&&<Alert severity="error" action={<Button onClick={()=>query.refetch()}>Thử lại</Button>}>{employeeError(query.error,"Không tải được danh sách nhân viên.")}</Alert>}
   {query.isSuccess&&(!employees.length?<div className="directory-empty"><h2>Không có nhân viên phù hợp</h2><p>Thử đổi bộ lọc hoặc thêm nhân viên mới.</p>{page>0&&<Button onClick={()=>setPage(0)}>Về trang đầu</Button>}</div>:<div className="directory-table-wrap"><table className="directory-table"><caption className="sr-only">Danh sách nhân viên</caption><thead><tr><th>Nhân viên</th><th>Phòng ban / Chức danh</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{employees.map(employee=><tr key={employee.id}>
    <th scope="row"><button className="directory-name" onClick={()=>setDetail(employee.id)}>{employee.full_name}</button><small>{employee.username}{employee.email?` · ${employee.email}`:""}</small></th>
    <td data-label="Phòng ban">{employee.department||"—"}<small>{employee.position}</small></td><td data-label="Vai trò">{employeeRoles[employee.role]}</td><td data-label="Trạng thái">{employee.is_active?"Hoạt động":"Ngừng hoạt động"}</td>
    <td data-label="Thao tác"><Stack direction="row" sx={{ flexWrap: "wrap" }}><Button aria-label={`Xem hồ sơ ${employee.username}`} onClick={()=>setDetail(employee.id)}>Xem hồ sơ</Button><Button aria-label={`Sửa hồ sơ ${employee.username}`} onClick={()=>setEditor({employee})}>Sửa</Button><Button disabled={employee.id===user.data?.id} aria-label={`Đổi vai trò ${employee.username}`} onClick={()=>setAction({employee,kind:"role"})}>Đổi vai trò</Button><Button aria-label={`Đặt lại mật khẩu ${employee.username}`} onClick={()=>setAction({employee,kind:"password"})}>Mật khẩu</Button><Button disabled={employee.id===user.data?.id} color={employee.is_active?"warning":"primary"} aria-label={`${employee.is_active?"Ngừng hoạt động":"Kích hoạt lại"} ${employee.username}`} onClick={()=>setAction({employee,kind:"status"})}>{employee.is_active?"Ngừng hoạt động":"Kích hoạt lại"}</Button></Stack></td>
   </tr>)}</tbody></table></div>)}
   {query.isSuccess&&<TablePagination component="div" count={query.data.pagination.total} page={page} rowsPerPage={limit} rowsPerPageOptions={[10,25,50]} onPageChange={(_,value)=>setPage(value)} onRowsPerPageChange={event=>{setLimit(Number(event.target.value));setPage(0);}} labelRowsPerPage="Mỗi trang" labelDisplayedRows={({from,to,count})=>`${from}–${to} / ${count}`} getItemAriaLabel={type=>type==="next"?"Trang sau":"Trang trước"}/>}
  </section>}
  {allowed&&editor&&<EmployeeEditor employee={editor.employee} onSaved={message=>{setSuccess(message);setPage(0);}} onClose={()=>setEditor(null)}/>}
  {allowed&&detail&&<EmployeeDetail id={detail} onClose={()=>setDetail(null)}/>}
  {allowed&&action&&<EmployeeAccountAction employee={action.employee} action={action.kind} onSaved={message=>{setSuccess(message);setPage(0);}} onClose={()=>setAction(null)}/>}
 </main></WorkspaceTemplate>;
}

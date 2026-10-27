"use client";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { employeeKeys, getEmployee } from "../../api/employees.api";
import { useEmployeeAccess } from "../../hooks/use-employees";
import { employeeError, employeeRoles } from "../../model/employee-feedback";
import { profileFields } from "./employee-editor";
import { EmployeeRecords } from "./employee-records";
export function EmployeeDetail({id,onClose}:{id:string;onClose:()=>void}) {
 const {token,allowed}=useEmployeeAccess();const query=useQuery({queryKey:employeeKeys.detail(id,token),queryFn:({signal})=>getEmployee({accessToken:token!,signal},id),enabled:Boolean(token&&allowed)});
 return <Dialog className="directory-dialog" open fullWidth maxWidth="md" onClose={onClose} aria-labelledby="employee-detail-title"><DialogTitle id="employee-detail-title">Hồ sơ nhân viên</DialogTitle><DialogContent>
  {query.isPending&&<p role="status">Đang tải hồ sơ…</p>}{query.error&&<Alert severity="error" action={<Button onClick={()=>query.refetch()}>Thử lại</Button>}>{employeeError(query.error,"Không tải được hồ sơ nhân viên.")}</Alert>}
  {query.data&&<><h2>{query.data.full_name}</h2><p>{query.data.username} · {employeeRoles[query.data.role]} · {query.data.is_active?"Hoạt động":"Ngừng hoạt động"}</p><dl className="directory-details">{profileFields.filter(([key])=>key!=="full_name").map(([key,label])=><div key={key}><dt>{label}</dt><dd>{query.data[key]||"Chưa khai báo"}</dd></div>)}<div><dt>Ngày sinh</dt><dd>{query.data.date_of_birth||"Chưa khai báo"}</dd></div><div><dt>Giới tính</dt><dd>{query.data.gender==="male"?"Nam":query.data.gender==="female"?"Nữ":query.data.gender==="other"?"Khác":"Chưa khai báo"}</dd></div></dl><EmployeeRecords userId={id}/></>}
 </DialogContent><DialogActions><Button onClick={onClose}>Đóng</Button></DialogActions></Dialog>;
}

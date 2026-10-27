"use client";
import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEmployeeRecord, downloadEmployeeRecord, employeeKeys, listEmployeeRecords, type EmployeeRecord } from "../../api/employees.api";
import { useEmployeeAccess, useRefreshEmployees } from "../../hooks/use-employees";
import { employeeError, recordKinds } from "../../model/employee-feedback";
import { EmployeeRecordEditor } from "./employee-record-editor";
export function EmployeeRecords({userId}:{userId:string}) {
 const {token,allowed}=useEmployeeAccess();const refresh=useRefreshEmployees();
 const [editor,setEditor]=useState<{record?:EmployeeRecord}|null>(null);const [removing,setRemoving]=useState<EmployeeRecord|null>(null);const [success,setSuccess]=useState("");
 const query=useQuery({queryKey:employeeKeys.records(userId,token),queryFn:({signal})=>listEmployeeRecords({accessToken:token!,signal},userId),enabled:Boolean(token&&allowed)});
 const remove=useMutation({mutationFn:()=>{if(!token||!allowed||!removing)throw Error("Không có quyền xóa hồ sơ.");return deleteEmployeeRecord({accessToken:token},userId,removing.id);},onSuccess:async()=>{await refresh();setRemoving(null);setSuccess("Đã xóa giấy tờ khỏi hồ sơ nhân viên.");}});
 const download=useMutation({mutationFn:async(record:EmployeeRecord)=>{if(!token||!allowed)throw Error("Không có quyền tải hồ sơ.");const url=new URL(await downloadEmployeeRecord({accessToken:token},userId,record.id));if(!["http:","https:"].includes(url.protocol)||url.username||url.password)throw Error("Liên kết tải không hợp lệ.");window.location.assign(url.href);}});
 return <section aria-labelledby="employee-records-title"><div className="directory-heading"><h3 id="employee-records-title">Giấy tờ, hợp đồng và chứng chỉ</h3>{allowed&&<Button variant="outlined" onClick={()=>{setSuccess("");setEditor({});}}>Thêm giấy tờ</Button>}</div>
  {success&&<Alert role="status" severity="success" onClose={()=>setSuccess("")}>{success}</Alert>}
  {query.isPending&&<p role="status">Đang tải giấy tờ…</p>}{query.error&&<Alert severity="error" action={<Button onClick={()=>query.refetch()}>Thử lại</Button>}>{employeeError(query.error,"Không tải được giấy tờ nhân viên.")}</Alert>}
  {download.error&&<Alert severity="error">{employeeError(download.error,"Không tải được tệp đính kèm.")}</Alert>}
  {query.isSuccess&&(!query.data.length?<p>Chưa có giấy tờ hoặc chứng chỉ.</p>:<ul className="directory-records">{query.data.map(record=><li key={record.id}><div><strong>{record.title}</strong><p>{recordKinds[record.kind]}{record.issuer?` · ${record.issuer}`:""}{record.reference?` · ${record.reference}`:""}</p>{(record.issue_date||record.expiry_date)&&<p>{record.issue_date?.slice(0,10)||"Chưa có ngày cấp"} → {record.expiry_date?.slice(0,10)||"Không ghi ngày hết hạn"}</p>}{record.note&&<p>{record.note}</p>}{record.file_name&&<p>{record.file_name} · {Math.max(1,Math.round(record.file_size/1024))} KB</p>}</div><Stack direction="row" sx={{ flexWrap: "wrap" }}>{record.file_name&&<Button aria-label={`Tải tệp ${record.title}`} disabled={download.isPending} onClick={()=>download.mutate(record)}>Tải tệp</Button>}<Button aria-label={`Sửa giấy tờ ${record.title}`} onClick={()=>setEditor({record})}>Sửa</Button><Button color="error" aria-label={`Xóa giấy tờ ${record.title}`} onClick={()=>{remove.reset();setRemoving(record);}}>Xóa</Button></Stack></li>)}</ul>)}
  {editor&&<EmployeeRecordEditor userId={userId} record={editor.record} onClose={()=>setEditor(null)} onSaved={()=>setSuccess("Thông tin hồ sơ đã được cập nhật.")}/>}
  {removing&&<Dialog className="directory-dialog" open fullWidth maxWidth="sm" onClose={remove.isPending?undefined:()=>setRemoving(null)} aria-labelledby="remove-employee-record-title"><DialogTitle id="remove-employee-record-title">Xóa giấy tờ khỏi hồ sơ?</DialogTitle><DialogContent><p>{removing.title}</p><p>Giấy tờ này sẽ không còn hiển thị trong hồ sơ nhân viên.</p>{remove.error&&<Alert severity="error">{employeeError(remove.error,"Không xóa được giấy tờ.")}</Alert>}</DialogContent><DialogActions><Button disabled={remove.isPending} onClick={()=>setRemoving(null)}>Hủy</Button><Button color="error" variant="contained" disabled={remove.isPending} onClick={()=>remove.mutate()}>{remove.isPending?"Đang xóa…":"Xóa giấy tờ"}</Button></DialogActions></Dialog>}
 </section>;
}

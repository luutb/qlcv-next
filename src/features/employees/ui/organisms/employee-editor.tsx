"use client";
import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { createEmployee, updateEmployee, type Employee, type EmployeeInput, type EmployeeRole } from "../../api/employees.api";
import { useEmployeeAccess, useRefreshEmployees } from "../../hooks/use-employees";
import { employeeError, employeeRoles } from "../../model/employee-feedback";

import { isValidEmployeePassword, isValidEmployeeUsername, localDateInputMax } from "../../model/account-validation";

export const profileFields = [["full_name","Họ và tên",200],["email","Email",255],["phone","Điện thoại",20],["department","Phòng ban",200],["position","Chức danh",200],["address","Địa chỉ",500]] as const;
export function EmployeeEditor({ employee, onClose, onSaved }: { employee?:Employee;onClose:()=>void;onSaved:(message:string)=>void }) {
 const {token,allowed}=useEmployeeAccess();const refresh=useRefreshEmployees();
 const [draft,setDraft]=useState<EmployeeInput>({full_name:employee?.full_name??"",email:employee?.email??"",phone:employee?.phone??"",department:employee?.department??"",position:employee?.position??"",address:employee?.address??"",date_of_birth:employee?.date_of_birth??"",gender:employee?.gender??null});
 const [username,setUsername]=useState("");const [password,setPassword]=useState("");const [role,setRole]=useState<EmployeeRole>("staff");
 const save=useMutation({mutationFn:()=>{
  if(!token||!allowed)throw Error("Không có quyền quản lý nhân viên.");
  if (!employee && (!isValidEmployeeUsername(username) || !isValidEmployeePassword(password))) throw Error("Tên đăng nhập cần ít nhất 3 ký tự; mật khẩu cần ít nhất 6 ký tự và tối đa 72 byte.");
  const input={...draft};for(const [key] of profileFields){const value=draft[key]?.trim()??"";if(key==="full_name")input.full_name=value;else input[key]=value||null;}
  input.date_of_birth=draft.date_of_birth||null;
  return employee?updateEmployee({accessToken:token},employee.id,input):createEmployee({accessToken:token},{...input,username:username.trim(),password,role});
 },onSuccess:async()=>{await refresh();onSaved(employee?"Đã cập nhật hồ sơ nhân viên.":"Đã tạo nhân viên và tài khoản đăng nhập.");onClose();}});
 return <Dialog className="directory-dialog" open fullWidth maxWidth="sm" onClose={save.isPending?undefined:onClose} aria-labelledby="employee-editor-title"><form onSubmit={event=>{event.preventDefault();if(allowed&&draft.full_name.trim()&&!save.isPending)save.mutate();}}>
  <DialogTitle id="employee-editor-title">{employee?"Sửa hồ sơ nhân viên":"Thêm nhân viên"}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
   {save.error&&<Alert severity="error">{employeeError(save.error,"Không lưu được hồ sơ nhân viên.")}</Alert>}
   {!employee&&<><TextField autoFocus required label="Tên đăng nhập" autoComplete="off" value={username} onChange={event=>setUsername(event.target.value)} slotProps={{htmlInput:{minLength:3,maxLength:100}}} disabled={save.isPending}/><TextField required label="Mật khẩu ban đầu" type="password" autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)} slotProps={{htmlInput:{minLength:6,maxLength:72}}} helperText="Tối thiểu 6 ký tự, tối đa 72 byte." disabled={save.isPending}/><TextField select label="Vai trò tài khoản" value={role} onChange={event=>{const value=event.target.value;if(value==="admin"||value==="manager"||value==="staff"||value==="accountant")setRole(value);}} disabled={save.isPending}>{Object.entries(employeeRoles).map(([value,label])=><MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField></>}
   {employee&&<TextField label="Tên đăng nhập" value={employee.username} disabled helperText="Tên đăng nhập được giữ nguyên; đổi vai trò ở thao tác riêng."/>}
   {profileFields.map(([key,label,maxLength])=><TextField key={key} autoFocus={Boolean(employee&&key==="full_name")} label={label} required={key==="full_name"} type={key==="email"?"email":key==="phone"?"tel":"text"} multiline={key==="address"} value={draft[key]??""} onChange={event=>setDraft({...draft,[key]:event.target.value})} slotProps={{htmlInput:{maxLength}}} disabled={save.isPending}/>)}
   <TextField label="Ngày sinh" type="date" value={draft.date_of_birth??""} onChange={event=>setDraft({...draft,date_of_birth:event.target.value})} slotProps={{inputLabel:{shrink:true},htmlInput:{max:localDateInputMax()}}} disabled={save.isPending}/>
   <TextField select label="Giới tính" value={draft.gender??""} onChange={event=>{const value=event.target.value;if(value==="male"||value==="female"||value==="other"||value==="")setDraft({...draft,gender:value||null});}} disabled={save.isPending}><MenuItem value="">Chưa khai báo</MenuItem><MenuItem value="male">Nam</MenuItem><MenuItem value="female">Nữ</MenuItem><MenuItem value="other">Khác</MenuItem></TextField>
  </Stack></DialogContent><DialogActions><Button disabled={save.isPending} onClick={onClose}>Hủy</Button><Button variant="contained" type="submit" disabled={!allowed||save.isPending||!draft.full_name.trim()||(!employee&&(!isValidEmployeeUsername(username)||!isValidEmployeePassword(password)))}>{save.isPending?"Đang lưu…":"Lưu hồ sơ"}</Button></DialogActions>
 </form></Dialog>;
}

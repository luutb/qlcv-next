"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { employeeKeys, listEmployees, type EmployeeFilters } from "../api/employees.api";
export function useEmployeeAccess() { const token=useAccessToken();const user=useCurrentUserQuery();return { token, user, allowed: hasAuthorizedAction(user.data,"users.manage") }; }
export function useEmployees(filters: EmployeeFilters) { const {token,allowed}=useEmployeeAccess();return useQuery({queryKey:employeeKeys.list(filters,token),queryFn:({signal})=>listEmployees({accessToken:token!,signal},filters),enabled:Boolean(token&&allowed)}); }
export function useRefreshEmployees() { const client=useQueryClient();return async ()=>{await Promise.all([client.invalidateQueries({queryKey:employeeKeys.all}),client.invalidateQueries({queryKey:["team-user-options"]}),client.invalidateQueries({queryKey:["teams"]}),client.invalidateQueries({queryKey:["projects"]}),client.invalidateQueries({queryKey:["auth","current-user"]})]);}; }

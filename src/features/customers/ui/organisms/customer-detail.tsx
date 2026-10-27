"use client";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { canAccessRoute, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { getCustomer, customerQueryKeys } from "../../api/customers.api";
import { customerError } from "../../model/customer-feedback";
import { customerFields } from "./customer-editor";

export function CustomerDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const query = useQuery({ queryKey: [...customerQueryKeys.detail(id), token], queryFn: ({ signal }) => getCustomer({ accessToken: token!, signal }, id), enabled: Boolean(token) });
  return <Dialog className="directory-dialog" open fullWidth maxWidth="sm" onClose={onClose} aria-labelledby="customer-detail-title">
    <DialogTitle id="customer-detail-title">Hồ sơ khách hàng</DialogTitle><DialogContent>
      {query.isPending && <p role="status">Đang tải hồ sơ…</p>}
      {query.error && <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>{customerError(query.error, "Không tải được hồ sơ khách hàng.")}</Alert>}
      {query.data && <><p className="directory-status">{query.data.is_deleted ? "Đã lưu trữ" : "Đang hoạt động"}</p><dl className="directory-details">{customerFields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{query.data[key] || "Chưa có thông tin"}</dd></div>)}</dl></>}
    </DialogContent><DialogActions>{query.data && canAccessRoute(user.data, "/documents") && <Button component={Link} href={`/documents?customer_id=${encodeURIComponent(id)}`} onClick={onClose}>Tài liệu hồ sơ</Button>}<Button onClick={onClose}>Đóng</Button></DialogActions>
  </Dialog>;
}

"use client";

import { useState } from "react";
import { TaskPriorityBadge } from "./task-priority-badge";
import { Drawer, Button, IconButton, Tabs, Tab, TextField, MenuItem, Alert } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useAssignableUsers } from "@/features/projects";
import { getSafeApiErrorMessage } from "@/services/http";
import { tasksApi, taskQueryKeys, type Task, type CreateTaskInput } from "../../api";
import { invalidateTaskQueries } from "../../api/task.invalidation";
import { priorities, taskStatuses } from "../../model/board";
import { TaskLabelField } from "./task-label-field";

type WorkflowOption = { id: string; name: string };

export function TaskEditor({ taskId, projectId, defaults, workflowSteps, onClose }: { taskId?: string; projectId: string; defaults?: Partial<CreateTaskInput>; workflowSteps?: WorkflowOption[]; onClose: () => void }) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canAccess = hasAuthorizedAction(user.data, "tasks.access");
  const query = useQuery({ queryKey: [...taskQueryKeys.task(taskId ?? "new"), token, authorizationCacheScope(user.data)], queryFn: ({ signal }) => tasksApi.get(taskId!, { accessToken: token!, signal }), enabled: Boolean(taskId && token && canAccess) });
  return <Drawer anchor="right" open onClose={onClose} slotProps={{ paper: { className: "task-detail-panel", role: "dialog", "aria-modal": true, "aria-labelledby": "task-detail-heading" } }}>
    <header className="task-detail-header"><div><span>Công việc {taskId ? `#${taskId}` : "mới"}</span><h2 id="task-detail-heading">{taskId ? "Chi tiết công việc" : "Tạo công việc"}</h2></div><IconButton aria-label="Đóng chi tiết công việc" onClick={onClose}>×</IconButton></header>
    {!canAccess ? <Alert severity="info">Bạn chưa được cấp quyền xem công việc.</Alert> : taskId && !query.data ? <div className="task-detail-loading">{!token ? <Alert severity="info">Vui lòng đăng nhập để xem công việc.</Alert> : query.error ? <><Alert severity="error">{getSafeApiErrorMessage(query.error, "Không tải được công việc.")}</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></> : <p role="status">Đang tải công việc…</p>}</div> : <TaskForm key={`${taskId ?? "new"}:${authorizationCacheScope(user.data)}`} task={query.data} projectId={projectId} defaults={defaults} workflowSteps={workflowSteps} onClose={onClose} />}
  </Drawer>;
}

function TaskForm({ task, projectId, defaults, workflowSteps, onClose }: { task?: Task; projectId: string; defaults?: Partial<CreateTaskInput>; workflowSteps?: WorkflowOption[]; onClose: () => void }) {
  const token = useAccessToken();
  const currentUser = useCurrentUserQuery();
  const client = useQueryClient();
  const [draft, setDraft] = useState<CreateTaskInput>({ project_id: task?.project_id ?? projectId, workflow_step_id: task?.workflow_step_id ?? undefined, title: task?.title ?? "", description: task?.description ?? "", priority: task?.priority ?? "MEDIUM", status: task?.status ?? "TODO", due_date: task?.due_date?.slice(0, 10) ?? "", ...defaults });
  const [amount, setAmount] = useState(String(task?.amount ?? defaults?.amount ?? 0));
  const amountValue = Number(amount);
  const validAmount = amount.trim() !== "" && Number.isFinite(amountValue) && amountValue >= (task?.collected_amount ?? 0) && amountValue <= 9999999999999.99 && /^\d+(\.\d{1,2})?$/.test(amount);
  const [comment, setComment] = useState("");
  const [assignee, setAssignee] = useState(task?.assignee_id ?? "");
  const [workflowStepId, setWorkflowStepId] = useState(task?.workflow_step_id ?? defaults?.workflow_step_id ?? "");
  const canEdit = hasAuthorizedAction(currentUser.data, "tasks.access") && (task ? task.actions?.edit === true : hasAuthorizedAction(currentUser.data, "tasks.create"));
  const canMove = task ? task.actions?.move === true : canEdit;
  const canFinance = hasAuthorizedAction(currentUser.data, "tasks.finance.read");
  const canUpdateAmount = canFinance && hasAuthorizedAction(currentUser.data, "tasks.update-amount");
  const canAssignTask = hasAuthorizedAction(currentUser.data, "tasks.assign");
  const people = useAssignableUsers(task?.project_id ?? projectId);
  const comments = useQuery({ queryKey: [...taskQueryKeys.comments(task?.id ?? "new"), token, authorizationCacheScope(currentUser.data)], queryFn: ({ signal }) => tasksApi.comments(task!.id, { limit: 100 }, { accessToken: token!, signal }), enabled: Boolean(task && token) });
  const save = useMutation({ mutationFn: () => {
    if (!token) throw new Error("Vui lòng đăng nhập để lưu công việc.");
    if (!canEdit) throw new Error("Bạn không có quyền sửa công việc này.");
    if (canUpdateAmount && !validAmount) throw new Error("Số tiền công việc không hợp lệ.");
    const { project_id, ...input } = draft;
    const body = { ...input, ...(canUpdateAmount ? { amount: amountValue } : {}), title: input.title.trim(), due_date: input.due_date || undefined,
      ...(task ? { issue_type: task.issue_type ?? "WORK", payment_stage: task.payment_stage, expected_amount: task.expected_amount, parent_task_id: task.parent_task_id, position: task.position, is_required: task.is_required, due_at: task.due_at } : {}),
      assignee_id: canAssignTask ? assignee || null : task?.assignee_id ?? null,
      status: task && !canMove ? task.status : input.status,
    };
    const taskBody = { ...body, workflow_step_id: task && !canMove ? task.workflow_step_id ?? undefined : workflowStepId || undefined };
    return task ? tasksApi.update(task.id, taskBody, { accessToken: token! }) : tasksApi.create({ ...taskBody, project_id }, { accessToken: token! });
  }, onSuccess: async () => { await invalidateTaskQueries(client, task?.id); onClose(); } });
  const addComment = useMutation({ mutationFn: () => {
    if (!token || task?.actions?.comment !== true) throw new Error("Bạn không có quyền bình luận công việc này.");
    return tasksApi.createComment(task!.id, { content: comment.trim() }, { accessToken: token });
  }, onSuccess: async () => { setComment(""); await invalidateTaskQueries(client, task!.id); } });
  return <form className="task-detail-form" onSubmit={(event) => { event.preventDefault(); if (token) save.mutate(); }}><div className="task-detail-scroll"><div className="task-detail-notices">
    {save.error && <Alert severity="error">{getSafeApiErrorMessage(save.error, "Không lưu được công việc. Vui lòng tải lại nếu dữ liệu đã thay đổi.")}</Alert>}
    {!token && <Alert severity="info">Vui lòng đăng nhập để lưu công việc.</Alert>}
    {canFinance && task?.is_paid && task.labels?.some(label => label.label_type === "DEPOSIT") && <Alert severity="success">Đã nhận tiền cọc: {(task.paid_amount ?? 0).toLocaleString("vi-VN")} VNĐ{task.paid_at ? ` · ${new Date(task.paid_at).toLocaleString("vi-VN")}` : ""}</Alert>}
    {!canEdit && <Alert severity="info">Bạn chỉ có quyền xem công việc này.</Alert>}
    </div><div className="task-detail-layout"><section className="task-detail-main"><h3>Nội dung công việc</h3><TextField className="task-detail-title" label="Tên công việc" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} fullWidth disabled={!canEdit} />
    <TextField label="Mô tả" multiline minRows={6} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} fullWidth disabled={!canEdit} />
    </section><aside className="task-detail-properties"><h3>Thông tin công việc</h3>{workflowSteps?.length ? <TextField select label="Bước workflow" value={workflowStepId} onChange={(event) => setWorkflowStepId(event.target.value)} disabled={!canEdit || !canMove}>{workflowSteps.map((step) => <MenuItem key={step.id} value={step.id}>{step.name}</MenuItem>)}</TextField> : task?.workflow_step_id ? <Alert severity="info">Trạng thái do workflow quản lý; hãy đổi bước trên bảng.</Alert> : <TextField select label="Trạng thái" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Task["status"] })} disabled={!canEdit || !canMove}>{taskStatuses.map((status) => <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>)}</TextField>}
    <TextField select label="Ưu tiên" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Task["priority"] })} disabled={!canEdit}>{Object.keys(priorities).map((id) => <MenuItem key={id} value={id}><TaskPriorityBadge priority={id as Task["priority"]} /></MenuItem>)}</TextField>
    <TextField select label="Người thực hiện" slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }} value={assignee} onChange={(event) => setAssignee(event.target.value)} disabled={!canEdit || !canAssignTask}><MenuItem value="">Chưa giao</MenuItem>{assignee && !people.data?.some((person) => person.id === assignee) && <MenuItem value={assignee}>{assignee}</MenuItem>}{people.data?.map((person) => <MenuItem key={person.id} value={person.id}>{person.username}</MenuItem>)}</TextField>
    {canEdit && !canAssignTask && <Alert severity="info">{currentUser.isPending ? "Đang xác minh quyền thay đổi người thực hiện…" : currentUser.error ? "Không xác minh được quyền thay đổi người thực hiện." : "Bạn chưa được cấp quyền thay đổi người thực hiện."}</Alert>}
    {people.error && <Alert severity="warning">Không tải được danh sách người nhận việc.</Alert>}
    {canFinance && (canUpdateAmount || task?.amount != null) && <TextField type="number" label="Số tiền công việc (VNĐ)" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={!canEdit || !canUpdateAmount} error={!validAmount} helperText={!validAmount ? "Nhập số tiền không âm, tối đa 2 số lẻ và không thấp hơn số đã thu." : "Để 0 nếu công việc không có giá trị tiền. Số tiền được cộng vào tổng dự án."} slotProps={{ htmlInput: { min: task?.collected_amount ?? 0, max: 9999999999999.99, step: "0.01" } }} />}
    <TextField type="date" label="Hạn hoàn thành" slotProps={{ inputLabel: { shrink: true } }} value={draft.due_date} onChange={(event) => setDraft({ ...draft, due_date: event.target.value })} disabled={!canEdit} />
    {task && <TaskLabelField taskId={task.id} editable={hasAuthorizedAction(currentUser.data, "tasks.access")} />}
    </aside></div>{task && <TaskContext task={task} assigneeName={people.data?.find((person) => person.id === assignee)?.username} reviewerUsers={people.data ?? []} comments={comments.data?.data ?? []} commentsPending={comments.isPending} commentsError={comments.error} comment={comment} onCommentChange={setComment} onAddComment={() => addComment.mutate()} commentSaving={addComment.isPending} commentError={addComment.error} />}
  </div><footer className="task-detail-footer"><span>{canEdit ? "Lưu để áp dụng thay đổi nội dung." : "Bạn đang xem công việc."}</span><Button onClick={onClose}>Đóng</Button><Button type="submit" variant="contained" disabled={!draft.title.trim() || !token || save.isPending || !canEdit || (canUpdateAmount && !validAmount)}>{save.isPending ? "Đang lưu…" : "Lưu công việc"}</Button></footer></form>;
}

function TaskContext({ task, assigneeName, reviewerUsers, comments, commentsPending, commentsError, comment, onCommentChange, onAddComment, commentSaving, commentError }: { task: Task; assigneeName?: string; reviewerUsers: Array<{ id: string; username: string }>; comments: Awaited<ReturnType<typeof tasksApi.comments>>["data"]; commentsPending: boolean; commentsError: unknown; comment: string; onCommentChange: (value: string) => void; onAddComment: () => void; commentSaving: boolean; commentError: unknown }) {
  const token = useAccessToken();
  const currentUser = useCurrentUserQuery();
  const client = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const canComment = task.actions?.comment === true;
  const [reviewerIds, setReviewerIds] = useState<string[]>([]);
  const [reviewDecision, setReviewDecision] = useState<"APPROVE" | "REQUEST_CHANGES">("APPROVE");
  const [reviewContent, setReviewContent] = useState("");
  const dependencies = useQuery({ queryKey: [...taskQueryKeys.dependencies(task.id), token, authorizationCacheScope(currentUser.data)], queryFn: ({ signal }) => tasksApi.dependencies(task.id, { accessToken: token!, signal }), enabled: Boolean(token) });
  const reviews = useQuery({ queryKey: [...taskQueryKeys.reviews(task.id, { limit: 20, offset: 0 }), token, authorizationCacheScope(currentUser.data)], queryFn: ({ signal }) => tasksApi.reviews(task.id, { limit: 20, offset: 0 }, { accessToken: token!, signal }), enabled: Boolean(token) });
  const history = useQuery({ queryKey: [...taskQueryKeys.history(task.id, { limit: 20, offset: 0 }), token, authorizationCacheScope(currentUser.data)], queryFn: ({ signal }) => tasksApi.history(task.id, { limit: 20, offset: 0 }, { accessToken: token!, signal }), enabled: Boolean(token) });
  const requestReview = useMutation({ mutationFn: () => {
    if (!token || task.actions?.request_review !== true) throw new Error("Bạn không có quyền yêu cầu đánh giá.");
    return tasksApi.createReviewRequest(task.id, { reviewer_ids: reviewerIds }, { accessToken: token });
  }, onSuccess: async () => { await invalidateTaskQueries(client, task.id); setReviewerIds([]); } });
  const submitReview = useMutation({ mutationFn: () => {
    if (!token || task.actions?.review !== true) throw new Error("Bạn không có quyền đánh giá công việc này.");
    return tasksApi.createReview(task.id, { decision: reviewDecision, content: reviewContent.trim() }, { accessToken: token });
  }, onSuccess: async () => { setReviewContent(""); await invalidateTaskQueries(client, task.id); } });
  const actionLabel: Record<string, string> = { TASK_CREATED: "Tạo công việc", TASK_UPDATED: "Cập nhật công việc", TASK_STATUS_CHANGED: "Đổi trạng thái", TASK_WORKFLOW_STEP_CHANGED: "Đổi bước workflow", TASK_REORDERED: "Sắp xếp lại vị trí", TASK_COMMENT_CREATED: "Thêm bình luận", TASK_REVIEW_REQUESTED: "Yêu cầu đánh giá", TASK_REVIEWED: "Đánh giá công việc" };
  return <section className="task-context task-detail-context" data-tab={activeTab}>
    <Tabs value={activeTab} onChange={(_, value: number) => setActiveTab(value)} variant="scrollable" scrollButtons="auto" aria-label="Thông tin liên quan công việc">{["Bình luận", "Lịch sử", "Phụ thuộc", "Đánh giá"].map((label, index) => <Tab key={label} label={label} id={`task-tab-${index}`} aria-controls="task-context-panel" />)}</Tabs><div id="task-context-panel" role="tabpanel" aria-labelledby={`task-tab-${activeTab}`}>
    <div className="task-context-summary"><div><span>Người thực hiện</span><strong>{assigneeName || "Chưa giao việc"}</strong></div><div><span>Trạng thái</span><strong>{taskStatuses.find((item) => item.id === task.status)?.name ?? task.status}</strong></div><div><span>Hạn hoàn thành</span><strong>{task.due_date ? new Date(`${task.due_date.slice(0, 10)}T12:00:00`).toLocaleDateString("vi-VN") : "Chưa đặt"}</strong></div></div>
    <div className="task-context-grid"><section><h3>Bình luận</h3>{commentsPending ? <p>Đang tải bình luận…</p> : Boolean(commentsError) ? <Alert severity="error">Không tải được bình luận.</Alert> : comments.length ? <div className="task-comment-list">{comments.map((item) => <article key={item.id}><strong>{item.author.full_name ?? item.author.name ?? "Thành viên"}</strong><time>{item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : ""}</time><p>{item.content}</p></article>)}</div> : <p>Chưa có bình luận. Hãy ghi lại cập nhật đầu tiên.</p>}{!token && <Alert severity="info">Vui lòng đăng nhập để gửi bình luận.</Alert>}{token && !canComment && <Alert severity="info">Bạn không có quyền bình luận công việc này.</Alert>}<TextField fullWidth label="Viết bình luận" multiline minRows={2} value={comment} onChange={(event) => onCommentChange(event.target.value)} disabled={!token || !canComment} /><Button disabled={!token || !canComment || !comment.trim() || commentSaving} onClick={() => { if (token && canComment) onAddComment(); }}>{commentSaving ? "Đang gửi…" : "Gửi bình luận"}</Button>{Boolean(commentError) && <Alert severity="error">{getSafeApiErrorMessage(commentError, "Không gửi được bình luận.")}</Alert>}</section>
      <section><h3>Lịch sử</h3>{history.isPending ? <p>Đang tải lịch sử…</p> : history.error ? <Alert severity="error">Không tải được lịch sử.</Alert> : <ol className="task-activity">{history.data?.data.length ? history.data.data.map((item) => <li key={item.id}><span>{actionLabel[item.action] ?? item.action.replaceAll("_", " ").toLocaleLowerCase("vi-VN")}</span><time>{item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : ""}</time></li>) : <li>Chưa có ghi nhận.</li>}</ol>}</section></div>
    <div className="task-relations-grid"><section><h3>Phụ thuộc</h3>{dependencies.isPending ? <p>Đang tải phụ thuộc…</p> : dependencies.error ? <Alert severity="error">Không tải được phụ thuộc.</Alert> : dependencies.data?.data.length ? <ul>{dependencies.data.data.map((item) => <li key={item.depends_on_task_id}><span>{item.title}</span><small>{taskStatuses.find((status) => status.id === item.status)?.name ?? item.status}</small></li>)}</ul> : <p>Không có công việc phụ thuộc.</p>}</section><section><h3>Đánh giá {reviews.data?.review_status ? `· ${reviews.data.review_status}` : ""}</h3>{reviews.isPending ? <p>Đang tải đánh giá…</p> : reviews.error ? <Alert severity="error">Không tải được đánh giá.</Alert> : reviews.data?.data.length ? <ul>{reviews.data.data.map((item) => <li key={item.id}><span>{item.reviewer.full_name}: {item.decision === "APPROVE" ? "Đã duyệt" : "Yêu cầu chỉnh sửa"}</span><small>{item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : ""}</small>{item.content ? <p>{item.content}</p> : null}</li>)}</ul> : <p>Chưa có đánh giá.</p>}{(task.actions?.request_review || task.actions?.review) && !token && <Alert severity="info">Vui lòng đăng nhập để gửi yêu cầu hoặc kết quả đánh giá.</Alert>}{task.actions?.request_review && <div className="task-review-action"><label htmlFor={`reviewers-${task.id}`}>Yêu cầu đánh giá từ</label><select id={`reviewers-${task.id}`} multiple value={reviewerIds} onChange={(event) => setReviewerIds(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}>{reviewerUsers.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}</select><Button disabled={!token || !reviewerIds.length || requestReview.isPending} onClick={() => { if (token) requestReview.mutate(); }}>{requestReview.isPending ? "Đang gửi…" : "Gửi yêu cầu"}</Button>{requestReview.error && <Alert severity="error">{getSafeApiErrorMessage(requestReview.error, "Không gửi được yêu cầu đánh giá.")}</Alert>}</div>}{task.actions?.review && <div className="task-review-action"><TextField select label="Kết quả đánh giá" value={reviewDecision} onChange={(event) => setReviewDecision(event.target.value as "APPROVE" | "REQUEST_CHANGES")}><MenuItem value="APPROVE">Duyệt</MenuItem><MenuItem value="REQUEST_CHANGES">Yêu cầu chỉnh sửa</MenuItem></TextField><TextField fullWidth label="Nhận xét" multiline minRows={2} value={reviewContent} onChange={(event) => setReviewContent(event.target.value)} /><Button disabled={!token || submitReview.isPending} onClick={() => { if (token) submitReview.mutate(); }}>{submitReview.isPending ? "Đang gửi…" : "Gửi đánh giá"}</Button>{submitReview.error && <Alert severity="error">{getSafeApiErrorMessage(submitReview.error, "Không gửi được đánh giá.")}</Alert>}</div>}</section></div>
  </div></section>;
}

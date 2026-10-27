"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@mui/material";
import { useAssignableUsers } from "@/features/projects";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAvailableLabels, useTaskBoardLabels } from "@/features/labels";
import { DropdownSelect } from "@/components/molecules";
import { MenuItem } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";
import { useIssueBoard } from "../../hooks/use-issue-board";
import { priorities, type BoardColumn } from "../../model/board";
import type { CreateTaskInput, TaskPriority } from "../../api";
import { TaskPriorityBadge } from "./task-priority-badge";
import { DepositCompletionDialog } from "./deposit-completion-dialog";
import { TaskEditor } from "./task-editor";
import { IssueBoardColumn } from "./issue-board-column";
import { summarizeBoard, type BoardSummary } from "../../model/board-summary";

type TaskEditorDefaults = Partial<CreateTaskInput>;
const EMPTY_COLUMNS: BoardColumn[] = [];

export function IssueBoard({ projectId, workflowTemplateId, initialStatus = "", onSummary }: { projectId: string; workflowTemplateId?: string | null; initialStatus?: string; onSummary?: (summary: BoardSummary) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get("q") ?? "";
  const priority = params.get("priority") ?? "";
  const assignee = params.get("assignee_id") ?? "";
  const label = params.get("label_id") ?? "";
  const status = params.get("status") ?? initialStatus;
  const stepId = params.get("step_id") ?? "";
  const workflowTaskStatus = workflowTemplateId && ["TODO", "DOING", "DONE", "CANCELLED"].includes(status) ? status as "TODO" | "DOING" | "DONE" | "CANCELLED" : undefined;
  const { query, move, accessToken } = useIssueBoard(projectId, workflowTemplateId, { q: search || undefined, assignee_id: assignee || undefined, status: workflowTaskStatus });
  const { query: summaryQuery } = useIssueBoard(projectId, workflowTemplateId);
  const currentUser = useCurrentUserQuery();
  const canCreateTasks = hasAuthorizedAction(currentUser.data, "tasks.create");
  const people = useAssignableUsers(projectId);
  const [view, setView] = useState("board");
  const [filtersExpanded, setFiltersExpanded] = useState<boolean | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [editor, setEditor] = useState<{ taskId?: string; defaults?: TaskEditorDefaults } | null>(null);
  const linkedTaskId = params.get("task_id") ?? "";
  const visibleEditor = editor ?? (/^[1-9]\d*$/.test(linkedTaskId) ? { taskId: linkedTaskId } : null);
  function closeEditor() {
    setEditor(null);
    if (linkedTaskId) {
      const next = new URLSearchParams(params.toString());
      next.delete("task_id");
      router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }
  const [depositTask, setDepositTask] = useState<{ id: string; title: string } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const busy = useRef(false);
  const columns = query.data?.columns ?? EMPTY_COLUMNS;
  const summary = useMemo(() => summarizeBoard(summaryQuery.data?.columns ?? EMPTY_COLUMNS), [summaryQuery.data?.columns]);
  useEffect(() => { onSummary?.(summary); }, [onSummary, summary]);
  const taskIds = columns.flatMap((column) => column.tasks.map((task) => task.id));
  const boardHasLabels = columns.every((column) => column.tasks.every((task) => Array.isArray(task.labels)));
  const boardLabels = useTaskBoardLabels(boardHasLabels ? [] : taskIds, !boardHasLabels);
  const availableLabels = useAvailableLabels();
  const assignees = [...new Set([...(people.data ?? []).map((person) => person.id), ...(assignee ? [assignee] : [])])];
  const statusFallback = query.data?.source === "status-fallback";
  const columnFilter = statusFallback ? status : stepId;
  const hasFilters = Boolean(search || priority || assignee || status || stepId || label);
  const isFiltersExpanded = filtersExpanded ?? hasFilters;
  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }
  const labelsFor = (task: (typeof columns)[number]["tasks"][number]) => task.labels ?? boardLabels.labelsByTask[task.id] ?? [];
  const filtered = (column: BoardColumn) => column.tasks.filter((task) => task.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (!priority || task.priority === priority) && (!assignee || task.assignee_id === assignee) && (!columnFilter || column.id === columnFilter) && (!workflowTaskStatus || task.status === workflowTaskStatus) && (!label || labelsFor(task).some((item) => item.id === label)));
  async function moveTask(taskId: string, targetId: string, beforeId?: string, placement?: "first") {
    if (busy.current || move.isPending) return;
    const task = columns.flatMap(column => column.tasks).find(task => task.id === taskId);
    if (targetId === "DONE" && task && task.status !== "DONE" && labelsFor(task).some(label => label.label_type === "DEPOSIT") && (!task?.is_paid || !(task.paid_amount && task.paid_amount > 0))) {
      move.reset(); setDepositTask({ id: taskId, title: task.title }); setDragging(null); setOver(null); return;
    }
    busy.current = true;
    try { await move.mutateAsync({ taskId, targetId, beforeId, placement }); } catch { /* Mutation error is rendered below. */ } finally { busy.current = false; setDragging(null); setOver(null); }
  }
  function add(column?: BoardColumn) {
    if (!canCreateTasks) return;
    setEditor({ defaults: column ? query.data?.source === "workflow" ? { workflow_step_id: column.id } : column.status ? { status: column.status } : undefined : undefined });
  }
  if (!hasAuthorizedAction(currentUser.data, "tasks.access")) return <Alert severity="info">Bạn chưa được cấp quyền xem công việc.</Alert>;
  if (!accessToken) return <Alert severity="info">Đăng nhập để xem công việc.</Alert>;
  return <section className={focusMode ? "issue-board issue-board-focus" : "issue-board"} aria-label="Bảng công việc" aria-busy={move.isPending}>
    <header className="issue-board-header">
      <div className="issue-board-title-group">
        
        <div className="issue-board-title-row"><h2>{query.data?.source === "status-fallback" ? "Trạng thái công việc" : "Quy trình dự án"}</h2></div>
      </div>
      <div className="issue-board-header-actions"><button className="board-utility-button" type="button" aria-expanded={isFiltersExpanded} aria-controls="board-filters" onClick={() => setFiltersExpanded(!isFiltersExpanded)}>Bộ lọc{hasFilters ? " · Đang áp dụng" : ""}</button><button className="board-utility-button" type="button" aria-pressed={focusMode} onClick={() => setFocusMode((enabled) => !enabled)}>{focusMode ? "Thoát tập trung" : "Chế độ tập trung"}</button></div>
    </header>
    <div className="board-toolbar board-toolbar-refined"><label className="workhub-search board-search"><WorkhubIcon name="search" size={17} /><span className="sr-only">Tìm kiếm công việc</span><input type="search" placeholder="Tìm theo tên công việc" value={search} onChange={(event) => setFilter("q", event.target.value)} /></label>
      <div id="board-filters" hidden={!isFiltersExpanded} className="board-filter-group" aria-label="Bộ lọc bảng công việc"><DropdownSelect aria-label="Lọc cột workflow" className="filter-button" value={columnFilter} onChange={(event) => setFilter(statusFallback ? "status" : "step_id", event.target.value)}><MenuItem value="">Tất cả cột</MenuItem>{columns.map((column) => <MenuItem key={column.id} value={column.id}>{column.name}</MenuItem>)}</DropdownSelect>
        {!statusFallback ? <DropdownSelect aria-label="Trạng thái công việc" className="filter-button" value={workflowTaskStatus ?? ""} onChange={(event) => setFilter("status", event.target.value)}><MenuItem value="">Mọi trạng thái</MenuItem><MenuItem value="TODO">Chưa bắt đầu</MenuItem><MenuItem value="DOING">Đang xử lý</MenuItem><MenuItem value="DONE">Hoàn thành</MenuItem><MenuItem value="CANCELLED">Đã huỷ</MenuItem></DropdownSelect> : null}
        <DropdownSelect aria-label="Người thực hiện" className="filter-button" value={assignee} onChange={(event) => setFilter("assignee_id", event.target.value)}><MenuItem value="">Người thực hiện</MenuItem>{assignees.map((id) => <MenuItem key={id} value={id}>{people.data?.find((person) => person.id === id)?.username ?? id}</MenuItem>)}</DropdownSelect>
        <DropdownSelect aria-label="Ưu tiên" className="filter-button priority-filter" value={priority} onChange={(event) => setFilter("priority", event.target.value)}><MenuItem value="">Ưu tiên</MenuItem>{Object.keys(priorities).map((id) => <MenuItem key={id} value={id}><TaskPriorityBadge priority={id as TaskPriority} /></MenuItem>)}</DropdownSelect>
        <DropdownSelect aria-label="Nhãn" className="filter-button" value={label} onChange={(event) => setFilter("label_id", event.target.value)}><MenuItem value="">Nhãn</MenuItem>{availableLabels.data?.data?.map((item) => <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)}</DropdownSelect>
        {hasFilters ? <button className="board-reset" type="button" onClick={() => { const next = new URLSearchParams(params.toString()); ["q", "priority", "assignee_id", "status", "step_id", "label_id"].forEach((key) => next.delete(key)); const queryString = next.toString(); router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false }); }}>Xoá lọc</button> : null}</div>
      <div className="board-actions"><div className="board-view-switch" role="group" aria-label="Kiểu hiển thị"><button type="button" className={view === "board" ? "active" : ""} aria-pressed={view === "board"} onClick={() => setView("board")}><WorkhubIcon name="grid" size={16} /><span className="sr-only">Dạng bảng</span></button><button type="button" className={view === "list" ? "active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}><WorkhubIcon name="menu" size={16} /><span className="sr-only">Dạng danh sách</span></button></div>{canCreateTasks && <button className="add-task" type="button" onClick={() => add()}><WorkhubIcon name="plus" size={17} /> Thêm công việc</button>}</div>
    </div>
    <details className="board-guide"><summary>Hướng dẫn thao tác</summary><p>{statusFallback ? "Chế độ tương thích cho phép đổi trạng thái; thứ tự thẻ không được lưu trong chế độ này." : "Kéo thẻ để chuyển bước hoặc sắp xếp. Mở menu thao tác trên thẻ để chuyển cột hoặc sắp xếp bằng bàn phím."}</p></details>
    {statusFallback ? <Alert severity="info">Dự án chưa gắn workflow template; bảng đang nhóm theo trạng thái công việc.</Alert> : null}
    <div role="status" className="board-help">{move.isPending ? "Đang lưu vị trí…" : move.isSuccess ? "Đã lưu vị trí công việc." : ""}</div>
    {move.error && <Alert severity="error">{move.error instanceof ApiProblem && move.error.problem.status === 409 ? "Bảng vừa được người khác cập nhật. Dữ liệu đã được đồng bộ; kiểm tra lại vị trí rồi thử lần nữa." : getSafeApiErrorMessage(move.error, "Không lưu được vị trí. Dữ liệu đã được tải lại; vui lòng thử lại.")}</Alert>}
    {query.isPending ? <p role="status">Đang tải công việc…</p> : query.error ? <Alert severity="error">{getSafeApiErrorMessage(query.error, "Không tải được bảng công việc.")} <button onClick={() => query.refetch()}>Thử lại</button></Alert> : <div className={view === "board" ? "kanban-grid live-kanban" : "issue-list-view"} style={view === "board" ? { gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(240px, 1fr))` } : undefined}>
      {columns.map((column) => <IssueBoardColumn key={column.id} column={column} columns={columns} tasks={filtered(column)} labelsFor={labelsFor} assigneeName={(task) => task.assignee?.display_name ?? people.data?.find((person) => person.id === task.assignee_id)?.username ?? "Người được giao"} statusFallback={statusFallback} movePending={move.isPending} canAdd={canCreateTasks} dragging={dragging} dragOver={over === column.id} onAdd={add} onOpenTask={(task) => setEditor({ taskId: task.id })} onSetLabel={(id) => setFilter("label_id", id)} onMove={(taskId, targetId, beforeId, placement) => void moveTask(taskId, targetId, beforeId, placement)} onDragStart={setDragging} onDragEnd={() => { setDragging(null); setOver(null); }} onDragOver={setOver} />)}
    </div>}
    {depositTask && <DepositCompletionDialog key={depositTask.id} title={depositTask.title} allowed={hasAuthorizedAction(currentUser.data, "tasks.complete-deposit")} pending={move.isPending} error={move.error} onClose={() => { setDepositTask(null); move.reset(); }} onConfirm={async amount => { try { await move.mutateAsync({ taskId: depositTask.id, targetId: "DONE", depositAmount: amount }); setDepositTask(null); } catch { /* Keep the amount and error visible for retry. */ } }} />}
    {visibleEditor && <TaskEditor {...visibleEditor} projectId={projectId} workflowSteps={query.data?.source === "workflow" ? columns.map(({ id, name }) => ({ id, name })) : undefined} onClose={closeEditor} />}
  </section>;
}

"use client";

import { useId, useState } from "react";
import { Divider, Menu, MenuItem, Tooltip } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { type BoardColumn } from "../../model/board";
import { TaskPriorityBadge } from "./task-priority-badge";
import type { Task } from "../../api";
import { personInitials, taskDeadline } from "../../model/task-preview";

type TaskLabel = NonNullable<Task["labels"]>[number];

type IssueBoardColumnProps = {
  column: BoardColumn;
  columns: BoardColumn[];
  tasks: Task[];
  labelsFor: (task: Task) => TaskLabel[];
  assigneeName: (task: Task) => string;
  statusFallback: boolean;
  movePending: boolean;
  canAdd: boolean;
  dragging: string | null;
  dragOver: boolean;
  onAdd: (column: BoardColumn) => void;
  onOpenTask: (task: Task) => void;
  onSetLabel: (labelId: string) => void;
  onMove: (taskId: string, targetId: string, beforeId?: string, placement?: "first") => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOver: (columnId: string) => void;
};

export function IssueBoardColumn({ column, columns, tasks, labelsFor, assigneeName, statusFallback, movePending, canAdd, dragging, dragOver, onAdd, onOpenTask, onSetLabel, onMove, onDragStart, onDragEnd, onDragOver }: IssueBoardColumnProps) {
  const menuId = useId();
  const [menu, setMenu] = useState<{ anchor: HTMLElement; taskId: string } | null>(null);
  const menuTask = column.tasks.find((task) => task.id === menu?.taskId);
  function moveFromMenu(targetId: string, beforeId?: string, placement?: "first") {
    if (menuTask?.actions?.move && !movePending) onMove(menuTask.id, targetId, beforeId, placement);
    setMenu(null);
  }
  return <section className={`kanban-column ${column.tone} ${dragOver ? "drag-over" : ""}`} aria-label={column.name} onDragOver={(event) => { if (dragging && !statusFallback) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; onDragOver(column.id); } }} onDrop={(event) => { event.preventDefault(); if (dragging && !statusFallback) onMove(dragging, column.id); }}>
    <div className="kanban-heading"><h2><i aria-hidden="true" />{column.name} <span>{tasks.length}</span></h2>{canAdd && <button type="button" aria-label={`Thêm vào ${column.name}`} onClick={() => onAdd(column)}><WorkhubIcon name="plus" size={18} /></button>}</div>
    <div className="kanban-list">{tasks.map((task) => {
      const taskLabels = labelsFor(task);
      const deadline = taskDeadline(task);
      const assignee = assigneeName(task);
      const canMove = task.actions?.move === true;
      return <article key={task.id} className={`kanban-card ${dragging === task.id ? "dragging" : ""}`} draggable={!statusFallback && !movePending && canMove} onDragStart={(event) => { if (statusFallback || !canMove) return; event.dataTransfer.setData("text/plain", task.id); event.dataTransfer.effectAllowed = "move"; onDragStart(task.id); }} onDragEnd={onDragEnd} onDrop={(event) => { if (dragging && !statusFallback) { event.preventDefault(); event.stopPropagation(); onMove(dragging, column.id, task.id); } }}>
        <div className="kanban-card-topline"><TaskPriorityBadge priority={task.priority} /><div className="kanban-card-tools"><span className="kanban-card-id" title={task.id}>#{task.id.slice(0, 6)}</span><button type="button" className="kanban-card-menu" aria-label={`Thao tác: ${task.title}`} aria-haspopup="menu" aria-expanded={menu?.taskId === task.id} aria-controls={menu?.taskId === task.id ? menuId : undefined} onClick={(event) => setMenu({ anchor: event.currentTarget, taskId: task.id })}><WorkhubIcon name="more" size={18} /></button></div></div>
        <button className="kanban-card-title" type="button" onClick={() => onOpenTask(task)}>{task.title}</button>
        {taskLabels.length ? <div className="kanban-card-labels" role="group" aria-label="Nhãn công việc">{taskLabels.slice(0, 2).map((item) => <Tooltip key={item.id} title={item.title} describeChild enterTouchDelay={400}><button type="button" className="kanban-label-chip" aria-label={`Lọc theo nhãn ${item.title}`} style={{ "--label-color": item.color } as React.CSSProperties} onClick={() => onSetLabel(item.id)}><span className="kanban-label-badge"><i aria-hidden="true" /><span>{item.title}</span></span></button></Tooltip>)}{taskLabels.length > 2 ? <Tooltip title={taskLabels.slice(2).map((item) => item.title).join(", ")} describeChild enterTouchDelay={400}><button type="button" className="kanban-label-more" aria-label={`Xem ${taskLabels.length - 2} nhãn khác của ${task.title}`} onClick={() => onOpenTask(task)}><span>+{taskLabels.length - 2}</span></button></Tooltip> : null}</div> : null}
        {task.description?.trim() ? <p className="kanban-card-description">{task.description}</p> : null}
        {task.is_required || (task.checklist?.total ?? 0) > 0 || (task.comment_count ?? 0) > 0 ? <div className="kanban-card-meta" aria-label="Thông tin bổ sung">{task.is_required && <span className="kanban-required">Bắt buộc</span>}{task.checklist && task.checklist.total > 0 ? <span aria-label={`Checklist ${task.checklist.completed} trên ${task.checklist.total} mục`}>Checklist {task.checklist.completed}/{task.checklist.total}</span> : null}{(task.comment_count ?? 0) > 0 ? <span>{task.comment_count} bình luận</span> : null}</div> : null}
        <footer><span className={`kanban-due ${deadline.overdue ? "overdue" : ""}`}><WorkhubIcon name="calendar" size={14} /><time dateTime={deadline.value}>{deadline.overdue ? "Quá hạn · " : ""}{deadline.label}</time></span><span className="kanban-person" title={task.assignee_id ? assignee : undefined}>{task.assignee_id ? <><span className="kanban-assignee" aria-hidden="true">{personInitials(assignee)}</span><span>{assignee}</span></> : <span className="kanban-unassigned">Chưa giao</span>}</span></footer>
      </article>;
    })}</div>
    <Menu id={menuId} anchorEl={menu?.anchor ?? null} open={Boolean(menu)} onClose={() => setMenu(null)} slotProps={{ paper: { className: "dropdown-select-menu" }, list: { "aria-label": "Thao tác công việc" } }}>
      <MenuItem onClick={() => { if (menuTask) onOpenTask(menuTask); setMenu(null); }}>Xem chi tiết</MenuItem>
      {menuTask?.actions?.move === true && <Divider />}
      {menuTask?.actions?.move === true && columns.filter((target) => target.id !== column.id).map((target) => <MenuItem key={target.id} disabled={movePending} onClick={() => moveFromMenu(target.id)}>{statusFallback ? "Đổi trạng thái" : "Chuyển đến"}: {target.name}</MenuItem>)}
      {menuTask?.actions?.move === true && !statusFallback && <MenuItem disabled={movePending || column.tasks[0]?.id === menuTask.id} onClick={() => moveFromMenu(column.id, undefined, "first")}>Đưa lên đầu cột</MenuItem>}
      {menuTask?.actions?.move === true && !statusFallback && <MenuItem disabled={movePending || column.tasks.at(-1)?.id === menuTask.id} onClick={() => moveFromMenu(column.id)}>Đưa xuống cuối cột</MenuItem>}
    </Menu>
    {!tasks.length && <p className="board-empty">Chưa có công việc phù hợp</p>}
    {canAdd && <button className="add-column-task" type="button" onClick={() => onAdd(column)}>+ Thêm công việc</button>}
  </section>;
}

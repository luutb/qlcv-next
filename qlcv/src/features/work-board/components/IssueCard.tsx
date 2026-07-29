import type { WorkIssue } from "../model/work-board.types";
import { getInitials } from "@/shared/lib/presentation";
import { dueState, projectFor } from "../model/work-board.utils";
import { StatusChip } from "./WorkBoardPrimitives";

export function IssueCard({
  issue,
  selected,
  readonly,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  issue: WorkIssue;
  selected: boolean;
  readonly: boolean;
  onOpen: () => void;
  onDragStart: (issueId: string) => boolean;
  onDragEnd: () => void;
}) {
  const dueKind = dueState(issue.due);
  const project = projectFor(issue);

  return (
    <article
      className={`od-workboard__issue-card ${selected ? "is-selected" : ""} ${dueKind === "overdue" ? "is-overdue" : ""}`}
      draggable
      tabIndex={0}
      aria-label={`${issue.id} ${issue.title}`}
      title="Kéo để chuyển sang cột khác"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      onDragStart={(event) => {
        if (!onDragStart(issue.id)) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData("text/plain", issue.id);
        event.dataTransfer.effectAllowed = "move";
        event.currentTarget.classList.add("dragging");
      }}
      onDragEnd={(event) => {
        event.currentTarget.classList.remove("dragging");
        onDragEnd();
      }}
    >
      <p className="od-workboard__card-title">{issue.title}</p>
      <div className="od-workboard__card-meta field-project">
        <a href={`/projects/${issue.projectId}`}>{project.name}</a>
        <span>{issue.id}</span>
      </div>
      <div className="od-workboard__chip-row field-labels">
        {issue.labels.map((label) => (
          <span key={label} className="od-workboard__chip">
            {label}
          </span>
        ))}
      </div>
      <div className="od-workboard__card-foot">
        <span className="field-assignee">
          <span className="od-workboard__avatar" aria-hidden="true">
            {getInitials(issue.assignee, "--")}
          </span>
          {issue.assignee}
        </span>
        <span className={`od-workboard__due ${dueKind} field-due`}>{issue.due}</span>
      </div>
      <div className="od-workboard__card-foot">
        <span className="field-status">
          <StatusChip status={issue.status} />
        </span>
        <span className="field-created">Created {issue.created}</span>
      </div>
      {readonly ? <span className="od-workboard__readonly-marker">Read only</span> : null}
    </article>
  );
}

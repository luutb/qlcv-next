import { STEPS } from "../model/work-board.fixtures";
import type { ViewMode, WorkIssue, WorkStepId } from "../model/work-board.types";
import { dueState, projectFor, stepFor } from "../model/work-board.utils";
import { IssueCard } from "./IssueCard";
import { StatusChip } from "./WorkBoardPrimitives";

type WorkBoardViewsProps = {
  viewMode: ViewMode;
  issues: WorkIssue[];
  selectedIssueId: string | null;
  readonly: boolean;
  activeStep: WorkStepId;
  dropTarget: WorkStepId | null;
  onDropTargetChange: (step: WorkStepId | null) => void;
  onMoveIssue: (issueId: string, step: WorkStepId) => void;
  onOpenIssue: (issueId: string) => void;
  onReadonlyDrag: () => void;
  onClearFilters: () => void;
};

export function WorkBoardViews(props: WorkBoardViewsProps) {
  return (
    <div className="od-workboard__board-wrap">
      {props.viewMode === "board" ? <BoardView {...props} /> : null}
      {props.viewMode === "list" ? (
        <ListView issues={props.issues} onOpenIssue={props.onOpenIssue} onClearFilters={props.onClearFilters} />
      ) : null}
    </div>
  );
}

function BoardView(props: Omit<WorkBoardViewsProps, "viewMode" | "onClearFilters">) {
  return (
    <div className="od-workboard__board-scroll">
      <div className="od-workboard__board">
        {STEPS.map((step) => (
          <BoardColumn
            key={step.id}
            step={step}
            issues={props.issues.filter((issue) => issue.step === step.id)}
            selectedIssueId={props.selectedIssueId}
            readonly={props.readonly}
            active={step.id === props.activeStep}
            dropTarget={props.dropTarget === step.id}
            onDropTargetChange={props.onDropTargetChange}
            onMoveIssue={props.onMoveIssue}
            onOpenIssue={props.onOpenIssue}
            onReadonlyDrag={props.onReadonlyDrag}
          />
        ))}
      </div>
    </div>
  );
}

function BoardColumn({
  step,
  issues,
  selectedIssueId,
  readonly,
  active,
  dropTarget,
  onDropTargetChange,
  onMoveIssue,
  onOpenIssue,
  onReadonlyDrag,
}: {
  step: (typeof STEPS)[number];
  issues: WorkIssue[];
  selectedIssueId: string | null;
  readonly: boolean;
  active: boolean;
  dropTarget: boolean;
  onDropTargetChange: (step: WorkStepId | null) => void;
  onMoveIssue: (issueId: string, step: WorkStepId) => void;
  onOpenIssue: (issueId: string) => void;
  onReadonlyDrag: () => void;
}) {
  return (
    <section
      className={`od-workboard__column ${dropTarget ? "is-drop-target" : ""} ${active ? "is-mobile-active" : ""}`}
      aria-label={step.name}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDropTargetChange(step.id);
      }}
      onDragEnter={() => onDropTargetChange(step.id)}
      onDragLeave={() => onDropTargetChange(null)}
      onDrop={(event) => {
        event.preventDefault();
        onDropTargetChange(null);
        onMoveIssue(event.dataTransfer.getData("text/plain"), step.id);
      }}
    >
      <header className="od-workboard__column-head">
        <div className="od-workboard__column-title">
          <strong>{step.name}</strong>
          <span>{step.macro}</span>
        </div>
        <span className="od-workboard__count-badge">{issues.length}</span>
      </header>
      <div className="od-workboard__card-list">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              selected={selectedIssueId === issue.id}
              readonly={readonly}
              onOpen={() => onOpenIssue(issue.id)}
              onDragStart={() => {
                if (!readonly) return true;
                onReadonlyDrag();
                return false;
              }}
              onDragEnd={() => onDropTargetChange(null)}
            />
          ))
        ) : (
          <div className="od-workboard__empty-column">Không có issue</div>
        )}
      </div>
    </section>
  );
}

function ListView({ issues, onOpenIssue, onClearFilters }: Pick<WorkBoardViewsProps, "issues" | "onOpenIssue" | "onClearFilters">) {
  return (
    <div className="od-workboard__list-view">
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Project</th><th>Workflow step</th><th>Status</th><th>Assignee</th>
            <th>Due date</th><th>Labels</th><th>Updated at</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.length > 0 ? (
            issues.map((issue) => <IssueRow key={issue.id} issue={issue} onOpen={() => onOpenIssue(issue.id)} />)
          ) : (
            <tr>
              <td colSpan={9}>
                <strong>Chưa có issue trong bộ lọc hiện tại.</strong>{" "}
                <button className="od-workboard__button" type="button" onClick={onClearFilters}>Clear filters</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function IssueRow({ issue, onOpen }: { issue: WorkIssue; onOpen: () => void }) {
  const project = projectFor(issue);
  return (
    <tr>
      <td><strong>{issue.title}</strong><span>{issue.id}</span></td>
      <td><a href={`/projects/${issue.projectId}`}>{project.name}</a><span>{project.customer}</span></td>
      <td>{stepFor(issue.step).name}</td>
      <td><StatusChip status={issue.status} /></td>
      <td>{issue.assignee}</td>
      <td><span className={`od-workboard__due ${dueState(issue.due)}`}>{issue.due}</span></td>
      <td><div className="od-workboard__chip-row">{issue.labels.map((label) => <span key={label} className="od-workboard__chip">{label}</span>)}</div></td>
      <td>{issue.updated}</td>
      <td><button className="od-workboard__button" type="button" onClick={onOpen}>Open</button></td>
    </tr>
  );
}

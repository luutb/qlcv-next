import { PROJECTS, STEPS } from "../model/work-board.fixtures";
import type { WorkDraft, WorkIssue, WorkStatus, WorkStepId } from "../model/work-board.types";
import { dueState, projectFor, stepFor } from "../model/work-board.utils";
import { CloseIcon } from "./WorkBoardIcons";
import { Field, MetaCell } from "./WorkBoardPrimitives";

export function IssueDrawer({
  open,
  readonly,
  issueId,
  issue,
  draft,
  onDraftChange,
  onClose,
  onDelete,
  onSave,
  onMove,
}: {
  open: boolean;
  readonly: boolean;
  issueId: string | null;
  issue: WorkIssue | null;
  draft: WorkDraft | null;
  onDraftChange: (draft: WorkDraft) => void;
  onClose: () => void;
  onDelete: () => void;
  onSave: () => void;
  onMove: (step: WorkStepId) => void;
}) {
  function updateDraft(patch: Partial<WorkDraft>) {
    if (draft) onDraftChange({ ...draft, ...patch });
  }

  return (
    <>
      {open ? <div className="od-workboard__backdrop" onClick={onClose} aria-hidden="true" /> : null}
      <aside className={`od-workboard__drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="od-workboard__drawer-head">
          <div>
            <div className="od-workboard__eyebrow">{issueId ?? "Issue"}</div>
            <h2>{draft?.title || "Issue detail"}</h2>
          </div>
          <button className="od-workboard__icon-button" type="button" onClick={onClose} aria-label="Đóng drawer">
            <CloseIcon />
          </button>
        </div>

        <div className="od-workboard__drawer-body">
          <div className={`od-workboard__readonly-note ${readonly ? "is-visible" : ""}`}>
            Tài khoản hiện tại chỉ được xem. Thao tác tạo, kéo thả và lưu thay đổi đã bị khóa.
          </div>
          {issue ? (
            <section className="od-workboard__summary">
              <div className="od-workboard__summary-head">
                <div>
                  <div className="od-workboard__eyebrow">Detail</div>
                  <strong>{issue.id}</strong>
                </div>
                <span className={`od-workboard__summary-priority priority-${issue.priority.toLowerCase()}`}>
                  {issue.priority}
                </span>
              </div>
              <div className="od-workboard__summary-grid">
                <div>
                  <label>Project</label>
                  <p>{projectFor(issue).name}</p>
                </div>
                <div>
                  <label>Customer</label>
                  <p>{projectFor(issue).customer}</p>
                </div>
                <div>
                  <label>Workflow step</label>
                  <p>{stepFor(issue.step).name}</p>
                </div>
                <div>
                  <label>Status</label>
                  <p>{issue.status}</p>
                </div>
                <div>
                  <label>Assignee</label>
                  <p>{issue.assignee}</p>
                </div>
                <div>
                  <label>Due</label>
                  <p className={dueState(issue.due)}>{issue.due}</p>
                </div>
              </div>
              <div className="od-workboard__summary-actions">
                {STEPS.filter((step) => step.id !== "unassigned").map((step) => (
                  <button
                    key={step.id}
                    className={issue.step === step.id ? "is-active" : ""}
                    type="button"
                    disabled={readonly}
                    onClick={() => onMove(step.id)}
                  >
                    {step.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <Field label="Title" className={readonly ? "can-edit" : ""}>
            <input value={draft?.title ?? ""} onChange={(event) => updateDraft({ title: event.target.value })} disabled={readonly} />
          </Field>
          <div className="od-workboard__detail-grid">
            <Field label="Project" className={readonly ? "can-edit" : ""}>
              <select value={draft?.projectId ?? ""} onChange={(event) => updateDraft({ projectId: event.target.value })} disabled={readonly}>
                {PROJECTS.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Workflow step" className={readonly ? "can-edit" : ""}>
              <select value={draft?.step ?? "intake"} onChange={(event) => updateDraft({ step: event.target.value as WorkStepId })} disabled={readonly}>
                {STEPS.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status" className={readonly ? "can-edit" : ""}>
              <select value={draft?.status ?? "TODO"} onChange={(event) => updateDraft({ status: event.target.value as WorkStatus })} disabled={readonly}>
                {["TODO", "DOING", "DONE", "CANCELLED"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assignee" className={readonly ? "can-edit" : ""}>
              <select value={draft?.assignee ?? ""} onChange={(event) => updateDraft({ assignee: event.target.value })} disabled={readonly}>
                {["Lan", "Minh", "Huy", "Unassigned"].map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date" className={readonly ? "can-edit" : ""}>
              <input type="date" value={draft?.due ?? ""} onChange={(event) => updateDraft({ due: event.target.value })} disabled={readonly} />
            </Field>
            <Field label="Labels" className={readonly ? "can-edit" : ""}>
              <input value={draft?.labels ?? ""} onChange={(event) => updateDraft({ labels: event.target.value })} disabled={readonly} />
            </Field>
          </div>
          <Field label="Description" className={readonly ? "can-edit" : ""}>
            <textarea value={draft?.description ?? ""} onChange={(event) => updateDraft({ description: event.target.value })} disabled={readonly} />
          </Field>
          <div className="od-workboard__detail-grid">
            <MetaCell label="Created" value={issue?.created ?? "-"} />
            <MetaCell label="Updated" value={issue?.updated ?? "-"} />
          </div>
        </div>

        <div className="od-workboard__drawer-foot">
          <button className="od-workboard__button od-workboard__button--danger" type="button" onClick={onDelete} disabled={readonly}>
            Delete
          </button>
          <a className="od-workboard__button" href={issue ? `/projects/${issue.projectId}` : "/projects"}>
            Open project
          </a>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={onSave} disabled={readonly}>
            Save
          </button>
        </div>
      </aside>
    </>
  );
}

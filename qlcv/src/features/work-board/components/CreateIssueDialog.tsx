import { PROJECTS, STEPS } from "../model/work-board.fixtures";
import type { CreateDraft, WorkStatus, WorkStepId } from "../model/work-board.types";
import { CloseIcon } from "./WorkBoardIcons";
import { Field } from "./WorkBoardPrimitives";

export function CreateIssueDialog({
  open,
  draft,
  onDraftChange,
  onClose,
  onCreate,
}: {
  open: boolean;
  draft: CreateDraft;
  onDraftChange: (draft: CreateDraft) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <>
      {open ? <div className="od-workboard__backdrop" onClick={onClose} aria-hidden="true" /> : null}
      <section className={`od-workboard__modal ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="od-workboard__modal-head">
          <h2>New issue</h2>
          <button className="od-workboard__icon-button" type="button" onClick={onClose} aria-label="Đóng dialog">
            <CloseIcon />
          </button>
        </div>
        <div className="od-workboard__modal-body">
          <Field label="Title" required error={!draft.title.trim() ? "Title bắt buộc." : undefined}>
            <input value={draft.title} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} />
          </Field>
          <div className="od-workboard__detail-grid">
            <Field label="Project" required error={!draft.projectId ? "Project bắt buộc." : undefined}>
              <select value={draft.projectId} onChange={(event) => onDraftChange({ ...draft, projectId: event.target.value })}>
                {PROJECTS.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Workflow step" required error={!draft.step ? "Workflow step bắt buộc." : undefined}>
              <select value={draft.step} onChange={(event) => onDraftChange({ ...draft, step: event.target.value as WorkStepId })}>
                {STEPS.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assignee">
              <select value={draft.assignee} onChange={(event) => onDraftChange({ ...draft, assignee: event.target.value })}>
                {["Lan", "Minh", "Huy", "Unassigned"].map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" value={draft.due} onChange={(event) => onDraftChange({ ...draft, due: event.target.value })} />
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={(event) => onDraftChange({ ...draft, status: event.target.value as WorkStatus })}>
                {["TODO", "DOING", "DONE", "CANCELLED"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Labels">
              <input placeholder="contract, urgent" value={draft.labels} onChange={(event) => onDraftChange({ ...draft, labels: event.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              placeholder="Ghi chú nghiệp vụ cần xử lý"
              value={draft.description}
              onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
            />
          </Field>
        </div>
        <div className="od-workboard__modal-foot">
          <button className="od-workboard__button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={onCreate}>
            Create issue
          </button>
        </div>
      </section>
    </>
  );
}

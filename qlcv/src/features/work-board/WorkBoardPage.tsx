"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Box, Popover, Stack } from "@mui/material";
import { FilterAltOutlined } from "@mui/icons-material";
import { INITIAL_ISSUES, PROJECTS, STEPS } from "./model/work-board.fixtures";
import {
  DEFAULT_SETTINGS,
  SETTINGS_FIELDS,
  applyBodySettings,
  applyFieldVisibility,
  fieldLabel,
  persistSettings,
  readSettings,
} from "./model/work-board.settings";
import type {
  CreateDraft,
  DueFilter,
  Settings,
  SettingsField,
  ViewMode,
  WorkDraft,
  WorkIssue,
  WorkStatus,
  WorkStepId,
} from "./model/work-board.types";
import {
  dayDiff,
  defaultCreateDraft,
  dueState,
  initials,
  issueToDraft,
  parseLabels,
  projectFor,
  stepFor,
} from "./model/work-board.utils";

export function WorkBoardPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const role = searchParams.get("role") === "accountant" ? "ACCOUNTANT" : "PARTNER";
  const createRequested = searchParams.get("new") === "1";

  const [issues, setIssues] = useState<WorkIssue[]>(INITIAL_ISSUES);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [activeStep, setActiveStep] = useState<WorkStepId>("intake");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDraft, setDrawerDraft] = useState<WorkDraft | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>(() => defaultCreateDraft());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => readSettings());
  const [toast, setToast] = useState("");
  const [dropTarget, setDropTarget] = useState<WorkStepId | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const toastTimer = useRef<number | null>(null);
  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId],
  );

  const readonly = role === "ACCOUNTANT";
  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const project = projectFor(issue);
      const haystack = [issue.id, issue.title, project.name, project.customer, issue.description].join(" ").toLowerCase();
      const diff = dayDiff(issue.due);
      const dueKind = dueState(issue.due);

      return (!query || haystack.includes(query)) &&
        (workflowFilter === "all" || issue.step === workflowFilter) &&
        (projectFilter === "all" || issue.projectId === projectFilter) &&
        (assigneeFilter === "all" || issue.assignee === assigneeFilter) &&
        (statusFilter === "all" || issue.status === statusFilter) &&
        (labelFilter === "all" || issue.labels.includes(labelFilter)) &&
        (dueFilter === "all" || (dueFilter === "overdue" && dueKind === "overdue") || (dueFilter === "today" && diff === 0) || (dueFilter === "week" && diff >= 0 && diff <= 7));
    });
  }, [assigneeFilter, dueFilter, issues, labelFilter, projectFilter, search, statusFilter, workflowFilter]);

  useEffect(() => {
    applyBodySettings(settings);
    return () => {
      document.body.classList.remove("od-workboard--density-compact");
      SETTINGS_FIELDS.forEach((field) => document.body.classList.remove(`od-workboard--hide-${field}`));
    };
  }, [settings]);

  useEffect(() => {
    document.body.classList.toggle("od-workboard--readonly", readonly);
    applyFieldVisibility(settings.fields);
    return () => {
      document.body.classList.remove("od-workboard--readonly");
    };
  }, [readonly, settings.fields]);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  }

  function closeCreate() {
    setCreateOpen(false);
    if (!createRequested) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("new");
    const query = nextSearchParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function refreshBoard() {
    window.setTimeout(() => {
      notify("Work Board đã được tải lại.");
    }, 650);
  }

  function clearFilters() {
    setSearch("");
    setWorkflowFilter("all");
    setProjectFilter("all");
    setAssigneeFilter("all");
    setStatusFilter("all");
    setLabelFilter("all");
    setDueFilter("all");
  }

  function openDrawer(issueId: string) {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue) return;

    setSelectedIssueId(issueId);
    setDrawerDraft(issueToDraft(issue));
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedIssueId(null);
  }

  function saveDrawer() {
    if (!selectedIssueId || !drawerDraft) return;
    if (readonly) {
      notify("Tài khoản read-only không thể lưu issue.");
      return;
    }

    setIssues((current) =>
      current.map((issue) => {
        if (issue.id !== selectedIssueId) return issue;
        return {
          ...issue,
          title: drawerDraft.title.trim() || issue.title,
          projectId: drawerDraft.projectId,
          step: drawerDraft.step,
          status: drawerDraft.status,
          assignee: drawerDraft.assignee,
          due: drawerDraft.due,
          labels: parseLabels(drawerDraft.labels),
          description: drawerDraft.description.trim(),
          updated: "Vừa xong",
        };
      }),
    );

    notify("Đã lưu thay đổi issue.");
    closeDrawer();
  }

  function deleteIssue() {
    if (!selectedIssueId) return;
    if (readonly) {
      notify("Tài khoản read-only không thể xóa issue.");
      return;
    }

    setIssues((current) => current.filter((issue) => issue.id !== selectedIssueId));
    notify("Đã xóa issue khỏi board.");
    closeDrawer();
  }

  function moveSelectedIssue(nextStep: WorkStepId) {
    if (!selectedIssueId) return;
    moveIssue(selectedIssueId, nextStep);
    setDrawerDraft((current) => (current ? { ...current, step: nextStep } : current));
  }

  function createIssue() {
    if (readonly) {
      notify("Tài khoản read-only không thể tạo issue.");
      return;
    }

    const title = createDraft.title.trim();
    if (!title || !createDraft.projectId || !createDraft.step) {
      if (!title) {
        notify("Title bắt buộc.");
        return;
      }
      if (!createDraft.projectId) {
        notify("Project bắt buộc.");
        return;
      }
      if (!createDraft.step) {
        notify("Workflow step bắt buộc.");
        return;
      }
    }

    const nextId = `ISS-${2426 + issues.length}`;
    const nextIssue: WorkIssue = {
      id: nextId,
      title,
      projectId: createDraft.projectId,
      step: createDraft.step,
      status: createDraft.status,
      assignee: createDraft.assignee,
      due: createDraft.due || "2026-06-21",
      labels: parseLabels(createDraft.labels),
      description: createDraft.description.trim(),
      created: "Hôm nay",
      updated: "Vừa xong",
      priority: "MEDIUM",
    };

    setIssues((current) => [nextIssue, ...current]);
    closeCreate();
    setActiveStep(createDraft.step);
    setCreateDraft(defaultCreateDraft(createDraft.step));
    notify(`Đã tạo ${nextId}.`);
  }

  function moveIssue(issueId: string, nextStep: WorkStepId) {
    if (readonly) {
      notify("Tài khoản read-only không thể kéo thả issue.");
      return;
    }

    const issue = issues.find((item) => item.id === issueId);
    if (!issue || issue.step === nextStep) return;

    const previousStep = issue.step;
    setIssues((current) =>
      current.map((item) => (item.id === issueId ? { ...item, step: nextStep, updated: "Vừa xong" } : item)),
    );
    notify(`Đã chuyển ${issueId} sang ${stepFor(nextStep).name}.`);

    if (issueId === "ISS-2420" && nextStep === "signing") {
      window.setTimeout(() => {
        setIssues((current) =>
          current.map((item) =>
            item.id === issueId ? { ...item, step: previousStep, updated: "09:20" } : item,
          ),
        );
        notify("API từ chối move do thiếu xác nhận khách hàng. Đã rollback.");
      }, 700);
    }
  }

  function openSettings() {
    setSettingsOpen(true);
  }

  function closeSettings() {
    setSettingsOpen(false);
  }

  function saveSettings() {
    persistSettings(settings);
    applyBodySettings(settings);
    closeSettings();
    notify("Đã lưu display settings.");
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
    applyBodySettings(DEFAULT_SETTINGS);
    closeSettings();
    notify("Đã khôi phục display settings.");
  }

  function toggleField(field: SettingsField, checked: boolean) {
    const next = {
      ...settings,
      fields: { ...settings.fields, [field]: checked },
    };
    setSettings(next);
    applyFieldVisibility(next.fields);
  }

  const visibleSteps = useMemo(() => {
    return STEPS.filter((step) => filteredIssues.some((issue) => issue.step === step.id));
  }, [filteredIssues]);
  const displayedActiveStep = visibleSteps.some((step) => step.id === activeStep)
    ? activeStep
    : (visibleSteps[0]?.id ?? activeStep);

  return (
    <section className="od-workboard" aria-labelledby="workBoardTitle">
      <div className="od-workboard__head">
        <div>
          <div className="od-workboard__eyebrow">/work</div>
          <h1 id="workBoardTitle">Work Board</h1>
        <p className="od-workboard__subtitle">
          Theo dõi và xử lý công việc theo workflow step, không trộn lẫn với status nội bộ của issue.
        </p>
        <p className="od-workboard__drag-hint">
          Kéo thả card vào cột đích, hoặc mở detail drawer để đổi workflow step bằng nút nhanh.
        </p>
      </div>
        <div className="od-workboard__head-actions">
          <button className="od-workboard__icon-button" type="button" onClick={refreshBoard} aria-label="Tải lại Work Board">
            <RefreshIcon />
          </button>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New issue
          </button>
          <button className="od-workboard__button" type="button" onClick={openSettings} aria-label="Display settings">
            <SettingsIcon />
          </button>
          <div className="od-workboard__user-chip">
            <span className="od-workboard__avatar">AT</span>
            <span>Anh Tran</span>
          </div>
        </div>
      </div>

      <div className="od-workboard__toolbar">
        <div className="od-workboard__toolbar-row">
          <label className="od-workboard__search-shell">
            <input
              className="od-workboard__search"
              type="search"
              placeholder="Tìm issue, project, mô tả..."
              aria-label="Search issue"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            className="od-workboard__icon-button od-workboard__icon-button--filter"
            type="button"
            onClick={(event) => setFilterAnchorEl(event.currentTarget)}
            aria-label="Mở bộ lọc"
            aria-haspopup="dialog"
            aria-expanded={Boolean(filterAnchorEl)}
          >
            <FilterAltOutlined fontSize="small" />
          </button>
          <div className="od-workboard__segmented" role="tablist" aria-label="Chế độ xem">
            <button type="button" className={viewMode === "board" ? "is-active" : ""} onClick={() => setViewMode("board")}>
              Board
            </button>
            <button type="button" className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")}>
              List
            </button>
          </div>
          <button className="od-workboard__button od-workboard__button--ghost" type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div className="od-workboard__mobile-columns" aria-label="Workflow steps">
          {visibleSteps.map((step) => (
            <button key={step.id} type="button" className={displayedActiveStep === step.id ? "is-active" : ""} onClick={() => setActiveStep(step.id)}>
              {step.name} · {filteredIssues.filter((issue) => issue.step === step.id).length}
            </button>
          ))}
        </div>
      </div>

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, width: 320, borderRadius: 2, border: "1px solid", borderColor: "divider" } } }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <FilterSelect
              label="Workflow"
              value={workflowFilter}
              onChange={setWorkflowFilter}
              options={[
                { value: "all", label: "All workflows" },
                ...STEPS.filter((step) => step.id !== "unassigned").map((step) => ({ value: step.id, label: step.name })),
              ]}
            />
            <FilterSelect
              label="Project"
              value={projectFilter}
              onChange={setProjectFilter}
              options={[
                { value: "all", label: "All projects" },
                ...PROJECTS.map((project) => ({ value: project.id, label: project.name })),
              ]}
            />
            <FilterSelect
              label="Assignee"
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              options={[
                { value: "all", label: "All assignees" },
                ...["Lan", "Minh", "Huy", "Unassigned"].map((assignee) => ({ value: assignee, label: assignee })),
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                ...["TODO", "DOING", "DONE", "CANCELLED"].map((status) => ({ value: status, label: status })),
              ]}
            />
            <FilterSelect
              label="Label"
              value={labelFilter}
              onChange={setLabelFilter}
              options={[
                { value: "all", label: "All labels" },
                ...["contract", "urgent", "billing", "customer"].map((label) => ({ value: label, label })),
              ]}
            />
            <FilterSelect
              label="Due"
              value={dueFilter}
              onChange={(value) => setDueFilter(value as DueFilter)}
              options={[
                { value: "all", label: "Any due date" },
                { value: "overdue", label: "Overdue" },
                { value: "today", label: "Due today" },
                { value: "week", label: "Due this week" },
              ]}
            />
          </Stack>
          <div className="od-workboard__popover-actions">
            <button className="od-workboard__button od-workboard__button--ghost" type="button" onClick={clearFilters}>
              Clear filters
            </button>
            <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={() => setFilterAnchorEl(null)}>
              Done
            </button>
          </div>
        </Box>
      </Popover>

      <div className="od-workboard__board-wrap">
        {viewMode === "board" ? (
          <div className="od-workboard__board-scroll">
            <div className="od-workboard__board">
              {STEPS.map((step) => {
                const columnIssues = filteredIssues.filter((issue) => issue.step === step.id);
                const isActiveMobile = step.id === displayedActiveStep;
                return (
                  <section
                    key={step.id}
                    className={`od-workboard__column ${dropTarget === step.id ? "is-drop-target" : ""} ${isActiveMobile ? "is-mobile-active" : ""}`}
                    aria-label={step.name}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropTarget(step.id);
                    }}
                    onDragEnter={() => setDropTarget(step.id)}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDropTarget(null);
                      const issueId = event.dataTransfer.getData("text/plain");
                      moveIssue(issueId, step.id);
                    }}
                  >
                    <header className="od-workboard__column-head">
                      <div className="od-workboard__column-title">
                        <strong>{step.name}</strong>
                        <span>{step.macro}</span>
                      </div>
                      <span className="od-workboard__count-badge">{columnIssues.length}</span>
                    </header>
                    <div className="od-workboard__card-list">
                      {columnIssues.length > 0 ? (
                        columnIssues.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          selected={selectedIssueId === issue.id}
                          readonly={readonly}
                          onOpen={() => openDrawer(issue.id)}
                          onDragStart={() => {
                            if (readonly) {
                              notify("Tài khoản read-only không thể kéo thả issue.");
                              return false;
                            }
                            return true;
                          }}
                          onDragEnd={() => setDropTarget(null)}
                        />
                      ))
                      ) : (
                        <div className="od-workboard__empty-column">Không có issue</div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : null}

        {viewMode === "list" ? (
          <div className="od-workboard__list-view">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Workflow step</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Due date</th>
                  <th>Labels</th>
                  <th>Updated at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => {
                    const project = projectFor(issue);
                    return (
                      <tr key={issue.id}>
                        <td>
                          <strong>{issue.title}</strong>
                          <span>{issue.id}</span>
                        </td>
                        <td>
                          <a href={`/projects/${issue.projectId}`}>{project.name}</a>
                          <span>{project.customer}</span>
                        </td>
                        <td>{stepFor(issue.step).name}</td>
                        <td>
                          <Chip status={issue.status} />
                        </td>
                        <td>{issue.assignee}</td>
                        <td>
                          <span className={`od-workboard__due ${dueState(issue.due)}`}>{issue.due}</span>
                        </td>
                        <td>
                          <div className="od-workboard__chip-row">
                            {issue.labels.map((label) => (
                              <span key={label} className="od-workboard__chip">
                                {label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{issue.updated}</td>
                        <td>
                          <button className="od-workboard__button" type="button" onClick={() => openDrawer(issue.id)}>
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <strong>Chưa có issue trong bộ lọc hiện tại.</strong>{" "}
                      <button className="od-workboard__button" type="button" onClick={clearFilters}>
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {drawerOpen ? <div className="od-workboard__backdrop" onClick={closeDrawer} aria-hidden="true" /> : null}
      <aside className={`od-workboard__drawer ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="od-workboard__drawer-head">
          <div>
            <div className="od-workboard__eyebrow">{selectedIssueId ?? "Issue"}</div>
            <h2>{drawerDraft?.title || "Issue detail"}</h2>
          </div>
          <button className="od-workboard__icon-button" type="button" onClick={closeDrawer} aria-label="Đóng drawer">
            <CloseIcon />
          </button>
        </div>

        <div className="od-workboard__drawer-body">
          <div className={`od-workboard__readonly-note ${readonly ? "is-visible" : ""}`}>
            Tài khoản hiện tại chỉ được xem. Thao tác tạo, kéo thả và lưu thay đổi đã bị khóa.
          </div>
          {selectedIssue ? (
            <section className="od-workboard__summary">
              <div className="od-workboard__summary-head">
                <div>
                  <div className="od-workboard__eyebrow">Detail</div>
                  <strong>{selectedIssue.id}</strong>
                </div>
                <span className={`od-workboard__summary-priority priority-${selectedIssue.priority.toLowerCase()}`}>
                  {selectedIssue.priority}
                </span>
              </div>
              <div className="od-workboard__summary-grid">
                <div>
                  <label>Project</label>
                  <p>{projectFor(selectedIssue).name}</p>
                </div>
                <div>
                  <label>Customer</label>
                  <p>{projectFor(selectedIssue).customer}</p>
                </div>
                <div>
                  <label>Workflow step</label>
                  <p>{stepFor(selectedIssue.step).name}</p>
                </div>
                <div>
                  <label>Status</label>
                  <p>{selectedIssue.status}</p>
                </div>
                <div>
                  <label>Assignee</label>
                  <p>{selectedIssue.assignee}</p>
                </div>
                <div>
                  <label>Due</label>
                  <p className={dueState(selectedIssue.due)}>{selectedIssue.due}</p>
                </div>
              </div>
              <div className="od-workboard__summary-actions">
                {STEPS.filter((step) => step.id !== "unassigned").map((step) => (
                  <button
                    key={step.id}
                    className={selectedIssue.step === step.id ? "is-active" : ""}
                    type="button"
                    disabled={readonly}
                    onClick={() => moveSelectedIssue(step.id)}
                  >
                    {step.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <Field label="Title" className={readonly ? "can-edit" : ""}>
            <input
              value={drawerDraft?.title ?? ""}
              onChange={(event) => setDrawerDraft((current) => current ? { ...current, title: event.target.value } : current)}
              disabled={readonly}
            />
          </Field>
          <div className="od-workboard__detail-grid">
            <Field label="Project" className={readonly ? "can-edit" : ""}>
              <select
                value={drawerDraft?.projectId ?? ""}
                onChange={(event) => setDrawerDraft((current) => current ? { ...current, projectId: event.target.value } : current)}
                disabled={readonly}
              >
                {PROJECTS.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Workflow step" className={readonly ? "can-edit" : ""}>
              <select
                value={drawerDraft?.step ?? "intake"}
                onChange={(event) => setDrawerDraft((current) => current ? { ...current, step: event.target.value as WorkStepId } : current)}
                disabled={readonly}
              >
                {STEPS.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status" className={readonly ? "can-edit" : ""}>
              <select
                value={drawerDraft?.status ?? "TODO"}
                onChange={(event) => setDrawerDraft((current) => current ? { ...current, status: event.target.value as WorkStatus } : current)}
                disabled={readonly}
              >
                {["TODO", "DOING", "DONE", "CANCELLED"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assignee" className={readonly ? "can-edit" : ""}>
              <select
                value={drawerDraft?.assignee ?? ""}
                onChange={(event) => setDrawerDraft((current) => current ? { ...current, assignee: event.target.value } : current)}
                disabled={readonly}
              >
                {["Lan", "Minh", "Huy", "Unassigned"].map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date" className={readonly ? "can-edit" : ""}>
              <input
                type="date"
                value={drawerDraft?.due ?? ""}
                onChange={(event) => setDrawerDraft((current) => current ? { ...current, due: event.target.value } : current)}
                disabled={readonly}
              />
            </Field>
            <Field label="Labels" className={readonly ? "can-edit" : ""}>
              <input
                value={drawerDraft?.labels ?? ""}
                onChange={(event) => setDrawerDraft((current) => current ? { ...current, labels: event.target.value } : current)}
                disabled={readonly}
              />
            </Field>
          </div>
          <Field label="Description" className={readonly ? "can-edit" : ""}>
            <textarea
              value={drawerDraft?.description ?? ""}
              onChange={(event) => setDrawerDraft((current) => current ? { ...current, description: event.target.value } : current)}
              disabled={readonly}
            />
          </Field>
          <div className="od-workboard__detail-grid">
            <MetaCell label="Created" value={selectedIssue?.created ?? "-"} />
            <MetaCell label="Updated" value={selectedIssue?.updated ?? "-"} />
          </div>
        </div>

        <div className="od-workboard__drawer-foot">
          <button className="od-workboard__button od-workboard__button--danger" type="button" onClick={deleteIssue} disabled={readonly}>
            Delete
          </button>
          <a className="od-workboard__button" href={selectedIssueId ? `/projects/${issues.find((issue) => issue.id === selectedIssueId)?.projectId ?? ""}` : "/projects"}>
            Open project
          </a>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={saveDrawer} disabled={readonly}>
            Save
          </button>
        </div>
      </aside>

      {createOpen || createRequested ? <div className="od-workboard__backdrop" onClick={closeCreate} aria-hidden="true" /> : null}
      <section className={`od-workboard__modal ${createOpen || createRequested ? "is-open" : ""}`} aria-hidden={!createOpen && !createRequested}>
        <div className="od-workboard__modal-head">
          <h2>New issue</h2>
          <button className="od-workboard__icon-button" type="button" onClick={closeCreate} aria-label="Đóng dialog">
            <CloseIcon />
          </button>
        </div>
        <div className="od-workboard__modal-body">
          <Field label="Title" required error={!createDraft.title.trim() ? "Title bắt buộc." : undefined}>
            <input value={createDraft.title} onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))} />
          </Field>
          <div className="od-workboard__detail-grid">
            <Field label="Project" required error={!createDraft.projectId ? "Project bắt buộc." : undefined}>
              <select value={createDraft.projectId} onChange={(event) => setCreateDraft((current) => ({ ...current, projectId: event.target.value }))}>
                {PROJECTS.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Workflow step" required error={!createDraft.step ? "Workflow step bắt buộc." : undefined}>
              <select value={createDraft.step} onChange={(event) => setCreateDraft((current) => ({ ...current, step: event.target.value as WorkStepId }))}>
                {STEPS.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assignee">
              <select value={createDraft.assignee} onChange={(event) => setCreateDraft((current) => ({ ...current, assignee: event.target.value }))}>
                {["Lan", "Minh", "Huy", "Unassigned"].map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" value={createDraft.due} onChange={(event) => setCreateDraft((current) => ({ ...current, due: event.target.value }))} />
            </Field>
            <Field label="Status">
              <select value={createDraft.status} onChange={(event) => setCreateDraft((current) => ({ ...current, status: event.target.value as WorkStatus }))}>
                {["TODO", "DOING", "DONE", "CANCELLED"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Labels">
              <input placeholder="contract, urgent" value={createDraft.labels} onChange={(event) => setCreateDraft((current) => ({ ...current, labels: event.target.value }))} />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              placeholder="Ghi chú nghiệp vụ cần xử lý"
              value={createDraft.description}
              onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))}
            />
          </Field>
        </div>
        <div className="od-workboard__modal-foot">
          <button className="od-workboard__button" type="button" onClick={closeCreate}>
            Cancel
          </button>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={createIssue}>
            Create issue
          </button>
        </div>
      </section>

      {settingsOpen ? <div className="od-workboard__backdrop" onClick={closeSettings} aria-hidden="true" /> : null}
      <section className={`od-workboard__sheet ${settingsOpen ? "is-open" : ""}`} aria-hidden={!settingsOpen}>
        <div className="od-workboard__sheet-head">
          <h2>Display settings</h2>
          <button className="od-workboard__icon-button" type="button" onClick={closeSettings} aria-label="Đóng settings">
            <CloseIcon />
          </button>
        </div>
        <div className="od-workboard__sheet-body">
          <Field label="Density">
            <select
              value={settings.density}
              onChange={(event) => {
                const density = event.target.value as Settings["density"];
                const next = { ...settings, density };
                setSettings(next);
                applyBodySettings(next);
              }}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </Field>
          <Field label="Card fields">
            <div className="od-workboard__check-list">
              {SETTINGS_FIELDS.map((field) => (
                <label key={field}>
                  {fieldLabel(field)}
                  <input
                    type="checkbox"
                    checked={settings.fields[field]}
                    onChange={(event) => toggleField(field, event.target.checked)}
                  />
                </label>
              ))}
            </div>
          </Field>
        </div>
        <div className="od-workboard__sheet-foot">
          <button className="od-workboard__button" type="button" onClick={resetSettings}>
            Reset
          </button>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={saveSettings}>
            Save
          </button>
        </div>
      </section>

      <div className={`od-workboard__toast ${toast ? "is-open" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}

function IssueCard({
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
            {initials(issue.assignee)}
          </span>
          {issue.assignee}
        </span>
        <span className={`od-workboard__due ${dueKind} field-due`}>{issue.due}</span>
      </div>
      <div className="od-workboard__card-foot">
        <span className="field-status">
          <Chip status={issue.status} />
        </span>
        <span className="field-created">Created {issue.created}</span>
      </div>
      {readonly ? <span className="od-workboard__readonly-marker">Read only</span> : null}
    </article>
  );
}

function Field({
  label,
  children,
  required,
  error,
  className,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`od-workboard__field ${className ?? ""} ${error ? "has-error" : ""}`}>
      <label>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? <span className="od-workboard__field-error">{error}</span> : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="od-workboard__popover-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label>{label}</label>
      <p>{value}</p>
    </div>
  );
}

function Chip({ status }: { status: WorkStatus }) {
  return <span className={`od-workboard__chip od-workboard__chip--status-${status.toLowerCase()}`}>{status}</span>;
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a9 9 0 0 1-15.5 6.2" />
      <path d="M3 12A9 9 0 0 1 18.5 5.8" />
      <path d="M18 2v4h4" />
      <path d="M6 22v-4H2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M2 14h4M10 8h4M18 16h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

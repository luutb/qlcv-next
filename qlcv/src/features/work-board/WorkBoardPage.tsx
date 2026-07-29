"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Box, Popover, Stack } from "@mui/material";
import { FilterAltOutlined } from "@mui/icons-material";
import { CreateIssueDialog } from "./components/CreateIssueDialog";
import { DisplaySettingsSheet } from "./components/DisplaySettingsSheet";
import { IssueCard } from "./components/IssueCard";
import { IssueDrawer } from "./components/IssueDrawer";
import { PlusIcon, RefreshIcon, SettingsIcon } from "./components/WorkBoardIcons";
import { FilterSelect, StatusChip } from "./components/WorkBoardPrimitives";
import { INITIAL_ISSUES, PROJECTS, STEPS } from "./model/work-board.fixtures";
import {
  DEFAULT_SETTINGS,
  SETTINGS_FIELDS,
  applyBodySettings,
  applyFieldVisibility,
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
  WorkStepId,
} from "./model/work-board.types";
import {
  dayDiff,
  defaultCreateDraft,
  dueState,
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
                          <StatusChip status={issue.status} />
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

      <IssueDrawer
        open={drawerOpen}
        readonly={readonly}
        issueId={selectedIssueId}
        issue={selectedIssue}
        draft={drawerDraft}
        onDraftChange={setDrawerDraft}
        onClose={closeDrawer}
        onDelete={deleteIssue}
        onSave={saveDrawer}
        onMove={moveSelectedIssue}
      />

      <CreateIssueDialog
        open={createOpen || createRequested}
        draft={createDraft}
        onDraftChange={setCreateDraft}
        onClose={closeCreate}
        onCreate={createIssue}
      />
      <DisplaySettingsSheet
        open={settingsOpen}
        settings={settings}
        onDensityChange={(density) => {
          const next = { ...settings, density };
          setSettings(next);
          applyBodySettings(next);
        }}
        onToggleField={toggleField}
        onClose={closeSettings}
        onReset={resetSettings}
        onSave={saveSettings}
      />

      <div className={`od-workboard__toast ${toast ? "is-open" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}

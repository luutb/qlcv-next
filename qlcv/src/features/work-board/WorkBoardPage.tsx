"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateIssueDialog } from "./components/CreateIssueDialog";
import { DisplaySettingsSheet } from "./components/DisplaySettingsSheet";
import { IssueDrawer } from "./components/IssueDrawer";
import { WorkBoardControls } from "./components/WorkBoardControls";
import { WorkBoardViews } from "./components/WorkBoardViews";
import { INITIAL_ISSUES, STEPS } from "./model/work-board.fixtures";
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
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
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
    const frame = window.requestAnimationFrame(() => setSettings(readSettings()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

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
      <WorkBoardControls
        search={search}
        viewMode={viewMode}
        filters={{
          workflow: workflowFilter,
          project: projectFilter,
          assignee: assigneeFilter,
          status: statusFilter,
          label: labelFilter,
          due: dueFilter,
        }}
        filterAnchor={filterAnchorEl}
        visibleSteps={visibleSteps}
        activeStep={displayedActiveStep}
        issues={filteredIssues}
        onSearchChange={setSearch}
        onViewModeChange={setViewMode}
        onFilterChange={(key, value) => {
          if (key === "workflow") setWorkflowFilter(value);
          if (key === "project") setProjectFilter(value);
          if (key === "assignee") setAssigneeFilter(value);
          if (key === "status") setStatusFilter(value);
          if (key === "label") setLabelFilter(value);
          if (key === "due") setDueFilter(value as DueFilter);
        }}
        onFilterAnchorChange={setFilterAnchorEl}
        onActiveStepChange={setActiveStep}
        onClearFilters={clearFilters}
        onRefresh={refreshBoard}
        onCreate={() => setCreateOpen(true)}
        onOpenSettings={openSettings}
      />
      <WorkBoardViews
        viewMode={viewMode}
        issues={filteredIssues}
        selectedIssueId={selectedIssueId}
        readonly={readonly}
        activeStep={displayedActiveStep}
        dropTarget={dropTarget}
        onDropTargetChange={setDropTarget}
        onMoveIssue={moveIssue}
        onOpenIssue={openDrawer}
        onReadonlyDrag={() => notify("Tài khoản read-only không thể kéo thả issue.")}
        onClearFilters={clearFilters}
      />

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

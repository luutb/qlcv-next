import { FilterAltOutlined } from "@mui/icons-material";
import { Box, Popover, Stack } from "@mui/material";
import { PROJECTS, STEPS } from "../model/work-board.fixtures";
import type { DueFilter, ViewMode, WorkIssue, WorkStepId } from "../model/work-board.types";
import { PlusIcon, RefreshIcon, SettingsIcon } from "./WorkBoardIcons";
import { FilterSelect } from "./WorkBoardPrimitives";

export type WorkBoardFilters = {
  workflow: string;
  project: string;
  assignee: string;
  status: string;
  label: string;
  due: DueFilter;
};

export function WorkBoardControls({
  search,
  viewMode,
  filters,
  filterAnchor,
  visibleSteps,
  activeStep,
  issues,
  onSearchChange,
  onViewModeChange,
  onFilterChange,
  onFilterAnchorChange,
  onActiveStepChange,
  onClearFilters,
  onRefresh,
  onCreate,
  onOpenSettings,
}: {
  search: string;
  viewMode: ViewMode;
  filters: WorkBoardFilters;
  filterAnchor: HTMLButtonElement | null;
  visibleSteps: typeof STEPS;
  activeStep: WorkStepId;
  issues: WorkIssue[];
  onSearchChange: (value: string) => void;
  onViewModeChange: (value: ViewMode) => void;
  onFilterChange: (key: keyof WorkBoardFilters, value: string) => void;
  onFilterAnchorChange: (anchor: HTMLButtonElement | null) => void;
  onActiveStepChange: (step: WorkStepId) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <>
      <div className="od-workboard__head">
        <div>
          <div className="od-workboard__eyebrow">/work</div>
          <h1 id="workBoardTitle">Work Board</h1>
          <p className="od-workboard__subtitle">Theo dõi và xử lý công việc theo workflow step, không trộn lẫn với status nội bộ của issue.</p>
          <p className="od-workboard__drag-hint">Kéo thả card vào cột đích, hoặc mở detail drawer để đổi workflow step bằng nút nhanh.</p>
        </div>
        <div className="od-workboard__head-actions">
          <button className="od-workboard__icon-button" type="button" onClick={onRefresh} aria-label="Tải lại Work Board"><RefreshIcon /></button>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={onCreate}><PlusIcon />New issue</button>
          <button className="od-workboard__button" type="button" onClick={onOpenSettings} aria-label="Display settings"><SettingsIcon /></button>
          <div className="od-workboard__user-chip"><span className="od-workboard__avatar">AT</span><span>Anh Tran</span></div>
        </div>
      </div>
      <div className="od-workboard__toolbar">
        <div className="od-workboard__toolbar-row">
          <label className="od-workboard__search-shell"><input className="od-workboard__search" type="search" placeholder="Tìm issue, project, mô tả..." aria-label="Search issue" value={search} onChange={(event) => onSearchChange(event.target.value)} /></label>
          <button className="od-workboard__icon-button od-workboard__icon-button--filter" type="button" onClick={(event) => onFilterAnchorChange(event.currentTarget)} aria-label="Mở bộ lọc" aria-haspopup="dialog" aria-expanded={Boolean(filterAnchor)}><FilterAltOutlined fontSize="small" /></button>
          <div className="od-workboard__segmented" role="tablist" aria-label="Chế độ xem"><button type="button" className={viewMode === "board" ? "is-active" : ""} onClick={() => onViewModeChange("board")}>Board</button><button type="button" className={viewMode === "list" ? "is-active" : ""} onClick={() => onViewModeChange("list")}>List</button></div>
          <button className="od-workboard__button od-workboard__button--ghost" type="button" onClick={onClearFilters}>Clear</button>
        </div>
        <div className="od-workboard__mobile-columns" aria-label="Workflow steps">{visibleSteps.map((step) => <button key={step.id} type="button" className={activeStep === step.id ? "is-active" : ""} onClick={() => onActiveStepChange(step.id)}>{step.name} · {issues.filter((issue) => issue.step === step.id).length}</button>)}</div>
      </div>
      <Popover open={Boolean(filterAnchor)} anchorEl={filterAnchor} onClose={() => onFilterAnchorChange(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }} slotProps={{ paper: { sx: { mt: 1, width: 320, borderRadius: 2, border: "1px solid", borderColor: "divider" } } }}>
        <Box sx={{ p: 2 }}><Stack spacing={1.5}>
          <FilterSelect label="Workflow" value={filters.workflow} onChange={(value) => onFilterChange("workflow", value)} options={[{ value: "all", label: "All workflows" }, ...STEPS.filter((step) => step.id !== "unassigned").map((step) => ({ value: step.id, label: step.name }))]} />
          <FilterSelect label="Project" value={filters.project} onChange={(value) => onFilterChange("project", value)} options={[{ value: "all", label: "All projects" }, ...PROJECTS.map((project) => ({ value: project.id, label: project.name }))]} />
          <FilterSelect label="Assignee" value={filters.assignee} onChange={(value) => onFilterChange("assignee", value)} options={[{ value: "all", label: "All assignees" }, ...["Lan", "Minh", "Huy", "Unassigned"].map((value) => ({ value, label: value }))]} />
          <FilterSelect label="Status" value={filters.status} onChange={(value) => onFilterChange("status", value)} options={[{ value: "all", label: "All statuses" }, ...["TODO", "DOING", "DONE", "CANCELLED"].map((value) => ({ value, label: value }))]} />
          <FilterSelect label="Label" value={filters.label} onChange={(value) => onFilterChange("label", value)} options={[{ value: "all", label: "All labels" }, ...["contract", "urgent", "billing", "customer"].map((value) => ({ value, label: value }))]} />
          <FilterSelect label="Due" value={filters.due} onChange={(value) => onFilterChange("due", value)} options={[{ value: "all", label: "Any due date" }, { value: "overdue", label: "Overdue" }, { value: "today", label: "Due today" }, { value: "week", label: "Due this week" }]} />
        </Stack><div className="od-workboard__popover-actions"><button className="od-workboard__button od-workboard__button--ghost" type="button" onClick={onClearFilters}>Clear filters</button><button className="od-workboard__button od-workboard__button--primary" type="button" onClick={() => onFilterAnchorChange(null)}>Done</button></div></Box>
      </Popover>
    </>
  );
}

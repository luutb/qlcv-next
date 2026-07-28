# ST-02 MUI compatibility audit (IS-02.4.1)

Audit date: 2026-07-28
Base: `9422b30` (`story/st-02-unify-types`)
Owner: `core_types`
Scope: documentation-only inventory for `IS-02.4.2`–`IS-02.4.4`; no application code, backlog, review record, Git state, dependency, or generated-file changes.

## Installed-version evidence

The installed declarations are authoritative for this audit. `package.json` requests `@mui/material ^7.3.9`, `@mui/x-data-grid ^8.28.2`, and `@mui/x-tree-view ^9.0.4`; the resolved package manifests are:

| Package | Installed | Evidence |
| --- | ---: | --- |
| `@mui/material` | 7.3.10 | `node_modules/@mui/material/package.json:3` |
| `@mui/x-data-grid` | 8.28.2 | `node_modules/@mui/x-data-grid/package.json:3` |
| `@mui/x-tree-view` | 9.0.4 | `node_modules/@mui/x-tree-view/package.json:3` |
| `react` | 19.2.4 | `node_modules/react/package.json:7` |
| `typescript` | 5.9.3 | `node_modules/typescript/package.json:5` |

This is therefore not only a Material v7 migration: MUI X usages must satisfy Data Grid v8 and Tree View v9 declarations.

## Installed guides and declarations read

No Internet or remembered API contract was used. Exact local files/sections inspected:

- `node_modules/@mui/material/CHANGELOG.md:1159-1172`, Material 7 beta breaking changes: Grid2 renamed to Grid and old Grid renamed GridLegacy.
- `node_modules/@mui/material/CHANGELOG.md:647-660`, docs notes including `ListItemButton` clarification.
- `node_modules/@mui/material/Grid/Grid.d.ts:4-89`, `GridBaseProps`: supported responsive `size`; no `item`, `xs`, `sm`, `md`, `lg`, or `xl` props.
- `node_modules/@mui/material/Select/Select.d.ts:60-101,120-144` and `Select/SelectInput.d.ts:7-53`, supported Select value and `SelectChangeEvent<Value>` callback contract.
- `node_modules/@mui/material/ListItem/ListItem.d.ts:15-68` and `ListItemButton/ListItemButton.d.ts:12-86`, ListItem versus actionable ListItemButton contract.
- `node_modules/@mui/material/Chip/Chip.d.ts:65-87`, supported `onDelete`/`deleteIcon` contract.
- `node_modules/@mui/material/TextField/TextField.d.ts:132-159,208-210,247-293`, deprecated TextField `*Props` mapping to `slotProps`.
- `node_modules/@mui/x-data-grid/CHANGELOG.md:5391-5435`, Data Grid v8 breaking changes, especially the object-based row selection model.
- `node_modules/@mui/x-data-grid/models/props/DataGridProps.d.ts:62-71,169-179,281-289,634-647,719-727,780-790`, installed props/slots/pagination/selection contract.
- `node_modules/@mui/x-data-grid/models/gridRowSelectionModel.d.ts:1-9`, `{ type, ids: Set<GridRowId> }` selection shape.
- `node_modules/@mui/x-data-grid/models/gridPaginationProps.d.ts` and `models/colDef/gridColDef.d.ts:118-150`, pagination and current getter/formatter declarations.
- `node_modules/@mui/x-data-grid/CHANGELOG.md:7215-7234`, Tree View v7 migration notes (`TreeView` to `SimpleTreeView`, removed customization props).
- `node_modules/@mui/x-tree-view/CHANGELOG.md:1009-1024`, Tree View v9 removed API list.
- `node_modules/@mui/x-tree-view/SimpleTreeView/SimpleTreeView.types.d.ts`, `TreeItem/TreeItem.types.d.ts`, `useTreeItem/useTreeItem.types.d.ts:4-27`, and `internals/MinimalTreeViewStore/MinimalTreeViewStore.types.d.ts:155-175,190-237`, supported component, `itemId`, expansion, and selection contracts.

The npm packages contain changelogs and declarations, but no standalone local migration-guide Markdown. The changelog migration sections and resolved `.d.ts` files above are the locally installed source of truth.

## IS-02.4.2 — Material Grid sizing

Finding: **28 incompatible Grid item sites in 7 files**. Every old item must drop `item` and collapse breakpoint props into `size`. Container-only Grid usages and existing `size` usages are already supported and must remain unchanged.

Installed mapping:

```tsx
// removed shape
<Grid item xs={12} sm={6} md={4}>

// installed Material 7 shape
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
```

For a single breakpoint use `size={12}` or `size={{ xs: 12 }}` consistently with the surrounding file. Evidence: `GridBaseProps.size` is declared at `Grid.d.ts:74-77`; old item/breakpoint properties are absent from `GridBaseProps` (`Grid.d.ts:10-89`).

Inventory (each line is one failing JSX site):

- `src/app/(dashboard)/cases/[id]/edit/page.tsx:219,229,243,256,273` — 5
- `src/app/(dashboard)/cases/create/page.tsx:151,163,178,192` — 4
- `src/components/cases/CaseMembers.tsx:196` — 1
- `src/components/cases/CaseTaskList.tsx:203,215,229` — 3
- `src/components/cases/CreateTaskForm.tsx:178,195,209,225` — 4
- `src/components/cases/TaskDetail.tsx:181,231,248,279,302` — 5
- `src/components/tasks/TaskGanttView.tsx:137,152,157,162,167,172` — 6

Acceptance focus: preserve the exact old breakpoint values and nesting; do not convert `<Grid container>` to `size`; `rg -n '<Grid[^>]*\bitem\b' src --glob '*.tsx'` must return zero.

## IS-02.4.3 — Data Grid, Select, and Tree View

### Data Grid v8

There are **8 DataGrid instances in 8 files**, and the scanned props are already on the installed API. No `selectionModel`, `onSelectionModelChange`, `components`, `componentsProps`, `rowsPerPageOptions`, `pageSize`, or `disableSelectionOnClick` usage was found.

- `src/app/(dashboard)/accountant/payments/page.tsx:155`
- `src/app/(dashboard)/admin/audit-logs/page.tsx:264`
- `src/app/(dashboard)/admin/reports/page.tsx:282`
- `src/app/(dashboard)/admin/users/page.tsx:262`
- `src/app/(dashboard)/admin/workflows/page.tsx:126`
- `src/app/(dashboard)/manager/tasks/page.tsx:246`
- `src/app/(dashboard)/shared/customers/page.tsx:214`
- `src/app/(dashboard)/staff/my-tasks/page.tsx:208`

Migration guardrails if controlled selection/slots are added while implementing the Issue:

| Removed/old | Installed-supported |
| --- | --- |
| `components` / `componentsProps` | `slots` / `slotProps` (`DataGridProps.d.ts:62-66,784-786`) |
| `selectionModel` / `onSelectionModelChange` | `rowSelectionModel` / `onRowSelectionModelChange` (`DataGridProps.d.ts:719-727`) |
| `GridRowId[]` selection | `{ type: 'include' | 'exclude', ids: Set<GridRowId> }` (`gridRowSelectionModel.d.ts:6-9`) |
| `pageSize`, `rowsPerPageOptions` | `paginationModel.pageSize`, `pageSizeOptions` (`DataGridProps.d.ts:283-289,636-647`) |
| `disableSelectionOnClick` | `disableRowSelectionOnClick` (`DataGridProps.d.ts:171-174`) |

Current `valueGetter(value, row)` and `valueFormatter(value)` call sites compile against installed `GridValueGetter`/`GridValueFormatter`; do not revert them to older params-object signatures. No Data Grid-specific diagnostic appeared in the baseline typecheck.

### Material Select

There are **6 direct Select instances in 4 files**:

- `src/app/(dashboard)/board/page.tsx:459`
- `src/app/(dashboard)/cost-centers/page.tsx:483,502`
- `src/components/cases/CaseTaskList.tsx:218,232`
- `src/components/tasks/CustomFields.tsx:181`

All use an inferred event and `event.target.value`, which is supported by `SelectChangeEvent<Value>` (`Select.d.ts:94-101`; `SelectInput.d.ts:7-21,41`). There is no removed Select prop or Select-specific type diagnostic to fix. If a handler is extracted, type it as `SelectChangeEvent<T>` rather than `React.ChangeEvent<HTMLSelectElement>`; retain `''` for no selection where needed (`Select.d.ts:138-144`).

Separate deprecation debt: 9 TextField `inputProps` sites remain at `UserCapacitySettings.tsx:257,272`, `CreateTaskForm.tsx:236`, `CreateLabelModal.tsx:121,165,193`, and `EditLabelModal.tsx:115,159,171`. They still compile in Material 7 but are declared deprecated in favor of `slotProps.htmlInput` (`TextField.d.ts:152-159`). This is not a Select blocker; migrate only if IS-02.4.3 explicitly includes deprecation cleanup.

### Tree View v9

There is **1 SimpleTreeView screen and 1 recursive TreeItem site**, both already supported:

- imports: `src/app/(dashboard)/cost-centers/page.tsx:42-43`
- `TreeItem itemId`: `src/app/(dashboard)/cost-centers/page.tsx:223-225`
- `SimpleTreeView`: `src/app/(dashboard)/cost-centers/page.tsx:422`

No `@mui/lab/TreeView`, old `<TreeView>`, `nodeId`, `expanded`, `selected`, `onNodeToggle`, `onNodeSelect`, removed `ContentComponent`/`ContentProps`, removed `useTreeViewApiRef`, or removed CSS state-class usage was found.

Installed mapping guardrails:

| Removed/old | Installed-supported |
| --- | --- |
| `@mui/lab` Tree View / `<TreeView>` | `@mui/x-tree-view/SimpleTreeView` / `<SimpleTreeView>` |
| `nodeId` | `itemId` (`useTreeItem.types.d.ts:20-27`) |
| `expanded`, `onNodeToggle` | `expandedItems`, `onExpandedItemsChange` (`MinimalTreeViewStore.types.d.ts:160-175`) |
| `selected`, `onNodeSelect` | `selectedItems`, `onSelectedItemsChange` (`MinimalTreeViewStore.types.d.ts:194-203,232-237`) |
| `ContentComponent`, `ContentProps` | `slots`, `slotProps`, or `useTreeItem` (Data Grid changelog Tree View section `:7215-7225`) |

## IS-02.4.4 — remaining MUI-related type regressions

These are not Grid/DataGrid/Select/Tree migrations, but the scoped typecheck identifies them as Material/System contract blockers:

| File:line | Count | Current problem | Installed-supported direction |
| --- | ---: | --- | --- |
| `src/components/board/BoardFilter.tsx:247,289,339` | 3 | `Chip delete={isSelected}` is not a Chip prop | Use conditional `onDelete` to activate delete affordance; `deleteIcon` is shown only with `onDelete` (`Chip.d.ts:67-87`) |
| `src/components/ui/ResponsiveAppBar.tsx:109` | 1 | `ListItem button` was removed | Use `ListItemButton` for the actionable anchor, preserving list semantics and children |
| `src/components/ui/ResponsiveContainer.tsx:6-59` | 1 file | custom `maxWidth` conflicts with `BoxProps.maxWidth`; mutable `BoxProps['sx']` is a union and cannot be indexed safely | Omit/rename the conflicting inherited prop and construct a typed `SxProps<Theme>` object without mutating the union |

`src/components/ui/Input.tsx:26,78` also has a native HTML `size` versus variant `size` collision, but it is a local CVA/HTML interface composition issue rather than a MUI API migration. Keep it in the general ST-02 type-regression queue unless IS-02.4.4 owns all UI typing blockers.

## Ownership and migration order

1. `IS-02.4.2` / `core_types`: migrate the 28 Grid sites, grouped by file, preserving layout values.
2. Issue QA gate: focused typecheck output for those 7 files plus zero legacy Grid scan.
3. `IS-02.4.3` / `core_types`: verify the 8 Data Grids, 6 Selects, and Tree screen against the installed guardrails; make code changes only where a real diagnostic or deprecated-prop acceptance item exists.
4. Issue QA gate: targeted source scan and relevant page/component tests where available.
5. `IS-02.4.4` / `core_types`: fix Chip, ListItem, ResponsiveContainer, then classify any remaining MUI/System diagnostics without absorbing unrelated domain/repository errors.
6. Task gate: run the documented baseline checks; after ST-05 passes, require lint, typecheck, test, and build green per `AGENTS.md`.

## Focused checks and limitations

Recommended checks:

```sh
rg -n '<Grid[^>]*\bitem\b|\b(xs|sm|md|lg|xl)=' src --glob '*.tsx'
rg -n 'selectionModel|onSelectionModelChange|componentsProps|components=|rowsPerPageOptions|disableSelectionOnClick|@mui/lab/TreeView|nodeId|onNodeToggle|onNodeSelect' src --glob '*.{ts,tsx}'
./node_modules/.bin/tsc --noEmit --pretty false
git diff --check
```

Limitations/evidence:

- `npm run typecheck -- --pretty false` cannot run because `package.json` has no `typecheck` script.
- One direct `./node_modules/.bin/tsc --noEmit --pretty false` baseline was run. It fails on many pre-existing, non-MUI Story areas; it confirmed the Grid, Chip, ListItem, and ResponsiveContainer diagnostics above and produced no Data Grid, Select, or Tree View diagnostic. No full build was run.
- This is a static source/declaration audit, not visual regression coverage. Grid migration still needs responsive viewport verification.
- QA readiness: the inventory is deterministic, locally evidenced, and split by owning Issue. QA should require no new diagnostics relative to `docs/QUALITY_BASELINE.md` until ST-05 establishes the green suite.

## IS-02.4.3 execution verification — N/A/no-code

Verification date/base: 2026-07-28 at committed base `df56d95`. The installed contracts remain Material 7.3.10, Data Grid 8.28.2, and Tree View 9.0.4. A fresh scan confirms that this Issue requires no application-code migration.

- **Data Grid:** 8 instances in 8 files: `accountant/payments/page.tsx:155`, `admin/audit-logs/page.tsx:264`, `admin/reports/page.tsx:282`, `admin/users/page.tsx:262`, `admin/workflows/page.tsx:126`, `manager/tasks/page.tsx:246`, `shared/customers/page.tsx:214`, and `staff/my-tasks/page.tsx:208`. They use installed-supported `paginationModel`, `onPaginationModelChange`, `paginationMode`, `pageSizeOptions`, `initialState.pagination.paginationModel`, and `disableRowSelectionOnClick` where applicable (`DataGridProps.d.ts:169-174,281-289,634-648,780-786`). No controlled row selection is present; future selection must use `rowSelectionModel`/`onRowSelectionModelChange` with `{ type, ids: Set<GridRowId> }` (`DataGridProps.d.ts:719-727`; `gridRowSelectionModel.d.ts:6-9`).
- **Select:** 6 instances in 4 files: `board/page.tsx:459`, `cost-centers/page.tsx:483,502`, `CaseTaskList.tsx:218,232`, and `CustomFields.tsx:181`. All handlers use inferred installed-compatible events and `event.target.value`; extracted handlers must use `SelectChangeEvent<T>`, not `React.ChangeEvent<HTMLSelectElement>` (`Select.d.ts:94-101`; `SelectInput.d.ts:12-22,41`).
- **Tree View:** one `SimpleTreeView` at `cost-centers/page.tsx:422`, one recursive `TreeItem` at `:223`, package imports at `:42-43`, and supported `itemId` at `:225`. Future controlled state must use `expandedItems`/`onExpandedItemsChange` and `selectedItems`/`onSelectedItemsChange` (`MinimalTreeViewStore.types.d.ts:160-175,194-203,232-237`).
- **Zero legacy usage:** the source contains none of `selectionModel`, `onSelectionModelChange`, `componentsProps`, `components=`, `rowsPerPageOptions`, `disableSelectionOnClick`, `@mui/lab`, `<TreeView>`, `nodeId`, `onNodeToggle`, `onNodeSelect`, `ContentComponent`, `ContentProps`, or `useTreeViewApiRef`. Filtered current TypeScript diagnostics contain no DataGrid, Select, or Tree View API/type error.

Commands used:

```sh
rg -n '<DataGrid' src --glob '*.tsx'
rg -n '<Select' src --glob '*.tsx'
rg -n 'SimpleTreeView|<TreeItem|itemId=' src --glob '*.tsx'
rg -n '\b(selectionModel|onSelectionModelChange|componentsProps|rowsPerPageOptions|disableSelectionOnClick|nodeId|onNodeToggle|onNodeSelect|ContentComponent|ContentProps|useTreeViewApiRef)\b|components\s*=|@mui/lab|<TreeView\b' src --glob '*.{ts,tsx}'
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | rg -i '(@mui/x-data-grid|DataGrid|GridColDef|GridPaginationModel|GridRowSelection|SelectChangeEvent|SelectProps|SimpleTreeView|TreeItem|TreeView)'
```

Limitations and scope separation: the diagnostic command checks the project but reports only this Issue's three API families; it is not a build or proof that unrelated baseline errors are green. Pre-existing concurrent diffs in `src/app/(dashboard)/cases/[id]/edit/page.tsx`, `src/components/cases/TaskDetail.tsx`, and `src/components/tasks/TaskGanttView.tsx` are outside IS-02.4.3, were preserved untouched, and are not attributed to this result. Deprecated TextField props and other MUI debt listed under IS-02.4.4 remain explicitly out of scope.

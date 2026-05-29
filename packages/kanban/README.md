# Kanban (hs-uix/kanban)

[![npm version](https://img.shields.io/npm/v/hs-uix)](https://www.npmjs.com/package/hs-uix)
[![npm downloads](https://img.shields.io/npm/dm/hs-uix)](https://www.npmjs.com/package/hs-uix)
[![license](https://img.shields.io/npm/l/hs-uix)](https://github.com/05bmckay/hs-uix/blob/main/LICENSE)

A stage-based board view for HubSpot UI Extensions. Share DataTable's config vocabulary (`cardFields` ≈ `columns`, filters, sort, selection) so you can offer users a table-or-board toggle without rewriting the data layer. Drag-and-drop isn't available inside HubSpot UI Extensions, so stage changes happen through an inline `Select` (or menu) on each card.

![Kanban — HubSpot Deals preset with metrics](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/kanban/assets/hubspot-deals-preset-with-metrics.png)

## Why Kanban?

If you've tried to build a board view on top of HubSpot's primitives, you know the drill: Flex + Box columns, a `Select` per card for stage changes, manual bucket-by-stage logic, per-column totals, overflow handling, and a toolbar that behaves differently from your table views. Kanban does all of that for you with the same config shape DataTable uses.

```jsx
<Kanban
  data={deals}
  stages={STAGES}
  groupBy="stage"
  cardFields={CARD_FIELDS}
  onStageChange={(row, newStage) => updateDealStage(row.id, newStage)}
/>
```

That's a filterable, sortable, stage-bucketed board with per-stage footers and inline stage controls.

## Features

- Stage-based columns with variant-colored headers (`success` / `warning` / `info` / `default`), collapse-to-rail, and per-stage count badges
- `cardFields` with placement (`title` / `subtitle` / `meta` / `body` / `footer`) — same render / truncate / visible hooks as DataTable columns
- Two card densities (`compact` and `comfortable`) with sensible divider defaults at each
- Filters and sort with the same config shape as DataTable (`select`, `multiselect`, `dateRange`)
- Full-text search across any combination of fields, with optional fuzzy matching via Fuse.js
- Headline metrics panel rendered above the board (`<Statistics>` under the hood) via a `metrics` prop
- Stage transition prompts — async confirmation or extra-property capture before committing a stage change, declared per-stage via `stage.onEnterRequired.render`
- Per-card selection with a bulk action bar, plus `KanbanCardActions` for per-card actions
- Per-stage pagination via `stageMeta` + `onLoadMore` — mix client-side, server-load-more, and pre-bucketed server data column-by-column
- Empty / loading / error render slots that mirror DataTable's override API
- `deriveCardFieldsFromColumns` utility in `hs-uix/utils` that projects a DataTable `columns` config into Kanban `cardFields` with a single function call
- Full i18n surface via the `labels` prop

## Installation

```bash
npm install hs-uix
```

Import it in your card:

```jsx
import { Kanban, KanbanCardActions } from "hs-uix/kanban";
```

Requires `@hubspot/ui-extensions` >= 0.12.0 and `react` >= 18.0.0 as peer dependencies (already present in any HubSpot UI Extensions project). TypeScript declarations are bundled with `hs-uix` (`kanban.d.ts`).

---

## Examples

### Basic board with stage transitions

Define your stages and card fields, pass your data, and the component handles bucketing, per-stage counts, and the inline stage control on each card.

```jsx
import React from "react";
import { Link, hubspot } from "@hubspot/ui-extensions";
import { Kanban } from "hs-uix/kanban";
import { AutoTag } from "hs-uix/common-components";
import { formatCurrencyCompact, formatDate } from "hs-uix/utils";

const STAGES = [
  { value: "qualified",   label: "Qualified",    variant: "info" },
  { value: "proposal",    label: "Proposal",     variant: "info" },
  { value: "negotiation", label: "Negotiation",  variant: "warning" },
  { value: "closed_won",  label: "Closed Won",   variant: "success", terminal: true },
  { value: "closed_lost", label: "Closed Lost",  variant: "default", terminal: true },
];

const CARD_FIELDS = [
  { field: "name",      placement: "title",
    render: (val, row) => <Link href={dealUrl(row)}>{val}</Link> },
  { field: "company",   placement: "subtitle" },
  { field: "amount",    placement: "meta",
    render: (val) => formatCurrencyCompact(val) },
  { field: "segment",   placement: "body", label: "Segment",
    render: (val) => <AutoTag value={val} /> },
  { field: "closeDate", placement: "footer",
    render: (val) => formatDate(val) },
];

hubspot.extend(() => (
  <Kanban
    data={deals}
    stages={STAGES}
    groupBy="stage"
    rowIdField="id"
    cardFields={CARD_FIELDS}
    onStageChange={(row, newStage) => updateDealStage(row.id, newStage)}
  />
));
```

> You can pass a custom `renderCard(row, context)` function for full control, but `cardFields` is required when using `selectable`, density presets, or the divider system — it's the declarative baseline the component optimizes around.

---

### HubSpot Deals preset with metrics

![Kanban — HubSpot Deals preset with metrics](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/kanban/assets/hubspot-deals-preset-with-metrics.png)

Drop-in preset shaped like HubSpot's native deals pipeline: stage-variant headers, per-stage amount totals in the column footer, and a headline metrics panel above the board. Hide the summary row with `showMetrics={false}` for dashboards that already surface totals elsewhere.

```jsx
import { Kanban } from "hs-uix/kanban";
import { formatCurrencyCompact, sumBy } from "hs-uix/utils";

const metrics = useMemo(() => {
  const total = sumBy(deals, "amount");
  const weighted = deals.reduce((s, r) => s + r.amount * (r.probability ?? 0), 0);
  const open = sumBy(deals.filter((d) => !isClosed(d.stage)), "amount");
  return [
    { label: "Total deal amount",    number: formatCurrencyCompact(total) },
    { label: "Weighted deal amount", number: formatCurrencyCompact(weighted) },
    { label: "Open deal amount",     number: formatCurrencyCompact(open) },
  ];
}, [deals]);

<Kanban
  data={deals}
  stages={STAGES}
  groupBy="stage"
  cardFields={CARD_FIELDS}
  metrics={metrics}
  columnFooter={(rows) => `Total: ${formatCurrencyCompact(sumBy(rows, "amount"))}`}
  onStageChange={handleStageChange}
/>
```

![Kanban — HubSpot Deals preset without metrics](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/kanban/assets/hubspot-deals-preset-no-metrics.png)

The metrics panel is toggled via a **Metrics** button that appears in the toolbar whenever `metrics` is provided. Pass an array for the shorthand `<StatisticsItem>` rendering, or a raw `ReactNode` when you need a chart / multi-row layout:

```jsx
import { Statistics, StatisticsItem, BarChart } from "@hubspot/ui-extensions";

<Kanban
  {...rest}
  metrics={
    <Flex direction="column" gap="sm">
      <Statistics>
        <StatisticsItem label="Pipeline" number="$123.58M" />
        <StatisticsItem label="Forecast" number="$32.54M" />
      </Statistics>
      <BarChart data={monthlyForecast} options={{ xAxis: "month", yAxis: "amount" }} />
    </Flex>
  }
/>
```

Keep metrics to 4–6 items (HubSpot's own `<Statistics>` guidance caps at 4 side-by-side; native Deals boards stretch to 6). Reach for the `ReactNode` escape hatch beyond that.

---

### Compact lead board

![Kanban — Compact lead board preset](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/kanban/assets/compact-lead-board-preset.png)

`cardDensity="compact"` with trimmed `cardFields` for high-volume boards (leads, tickets, tasks) where you want to fit 8–12 cards per column on a typical viewport without horizontal scrolling.

```jsx
<Kanban
  data={leads}
  stages={LEAD_STAGES}
  groupBy="leadStatus"
  cardDensity="compact"
  cardFields={[
    { field: "name",       placement: "title",
      render: (val, row) => <Link href={contactUrl(row)}>{val}</Link> },
    { field: "createDate", placement: "meta",
      render: (val) => formatDate(val) },
    { field: "location",   placement: "body" },
    { placement: "footer",
      render: (_, row) => (
        <KanbanCardActions
          display="icon"
          actions={[
            { label: "Email", icon: "email",   onClick: () => openEmail(row) },
            { label: "Note",  icon: "comment", onClick: () => openNote(row) },
            { label: "Task",  icon: "tasks",   onClick: () => openTask(row) },
          ]}
        />
      ),
    },
  ]}
  searchFields={["name", "email"]}
  columnFooter={(rows) => `${rows.length} leads`}
/>
```

Density defaults:

| Knob | compact | comfortable |
|---|---|---|
| Subtitle visible | no | yes |
| `cardDividers` default | after-body only | every seam |
| Body line cap | 3 | 5 |
| `stageControl` default | `menu` (inside footer cluster) | `select` (full-width below footer) |
| `KanbanCardActions` default | icon-only | label with pipe separators |

Every knob stays overridable per board — density only shifts the defaults.

---

### Per-stage "Load more" and stage controls

![Kanban — Select + load more preset](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/kanban/assets/select-load-more-preset.png)

Per-column pagination via an `onLoadMore` handler and `stageMeta[stage].hasMore`, plus inline `Select` stage controls on each card (`stageControl="select"`). Switch to `"menu"` for action-menu style transitions, or `"none"` for read-only boards.

```jsx
const [data, setData] = useState(initial);
const [stageMeta, setStageMeta] = useState({
  qualified:   { hasMore: true, totalCount: 142, loading: false },
  proposal:    { hasMore: true, totalCount: 37,  loading: false },
  negotiation: { hasMore: false },
});

const handleLoadMore = useCallback(async (stage) => {
  setStageMeta((m) => ({ ...m, [stage]: { ...m[stage], loading: true } }));
  try {
    const { rows, hasMore } = await fetchMoreForStage(stage, {
      offset: data.filter((r) => r.stage === stage).length,
    });
    setData((prev) => [...prev, ...rows]);
    setStageMeta((m) => ({ ...m, [stage]: { ...m[stage], loading: false, hasMore } }));
  } catch (err) {
    setStageMeta((m) => ({
      ...m,
      [stage]: { ...m[stage], loading: false, error: err.message },
    }));
  }
}, [data]);

<Kanban
  data={data}
  stages={STAGES}
  groupBy="stage"
  cardFields={CARD_FIELDS}
  stageMeta={stageMeta}
  onLoadMore={handleLoadMore}
  stageControl="select"
  onStageChange={handleStageChange}
/>
```

Three pagination shapes compose freely in the same board:

1. **Fully client-side (default).** `data` holds everything; clamp kicks in at `maxCardsPerColumn` with a "Show more" button per column.
2. **Per-column server load-more.** Caller wires `stageMeta[stage].hasMore` + `onLoadMore(stage)`. Columns without `hasMore` keep the client-side show-more behavior.
3. **Parent pre-buckets.** Pass already-filtered `data` plus `stageMeta[stage].totalCount` per column — the component just bucket-renders whatever `data` contains and trusts `totalCount` for the header display.

Column header count format:
- No meta: `{loaded}`.
- `totalCount` present: `{loaded} of {totalCount}`.
- `loading`: trailing inline `LoadingSpinner`.
- `error`: inline retry row under the last card.

---

### Stage transition prompts — reason-required transitions

Prompt for extra information (e.g. a `closed_lost_reason`) before committing a stage change. Declare it per-stage — no new UI state in the caller:

```jsx
import { FormBuilder } from "hs-uix/form";

const LOST_REASONS = [
  { label: "Price",       value: "price" },
  { label: "Competitor",  value: "competitor" },
  { label: "No decision", value: "no_decision" },
];

const STAGES = [
  // …other stages…
  {
    value: "closed_lost",
    label: "Closed Lost",
    variant: "default",
    terminal: true,
    onEnterRequired: {
      render: ({ row, onConfirm, onCancel }) => (
        <FormBuilder
          fields={[
            { name: "reason", type: "select", label: "Reason", options: LOST_REASONS, required: true },
          ]}
          onSubmit={(v) => onConfirm({ extraProperties: { closed_lost_reason: v.reason } })}
          onCancel={onCancel}
          showCancel
        />
      ),
    },
  },
];

<Kanban
  data={deals}
  stages={STAGES}
  groupBy="stage"
  cardFields={CARD_FIELDS}
  onStageChange={(row, newStage, oldStage, result) => {
    // result.extraProperties = { closed_lost_reason: "..." }
    saveStageChange(row.id, newStage, result?.extraProperties);
  }}
/>
```

The card flips to the prompt renderer in place; `onStageChange` only fires after `onConfirm({ extraProperties })` resolves. This composes with FormBuilder — no separate prompt DSL.

You can also gate transitions with a synchronous predicate:

```jsx
{
  value: "closed_won",
  canEnter: (row) => row.amount > 0 && row.owner != null,
}
```

Invalid target stages are disabled in the inline control; no callback fires.

---

### Row selection with bulk actions

Add `selectable={true}` and checkboxes appear on each card (top-right of the title row). When any card is selected, a compact selection bar appears above the board with selected count, "Select all", "Deselect all", and any custom action buttons.

```jsx
import { useState, useMemo } from "react";
import { Kanban } from "hs-uix/kanban";

function SelectableBoard() {
  const [selected, setSelected] = useState([]);

  const actions = useMemo(() => [
    { label: "Assign",  icon: "add",        onClick: (ids) => assignDealsTo(ids) },
    { label: "Archive", icon: "delete",     variant: "secondary", onClick: (ids) => archive(ids) },
    { label: "Export",  icon: "dataExport", onClick: (ids) => exportDeals(ids) },
  ], []);

  return (
    <Kanban
      data={deals}
      stages={STAGES}
      groupBy="stage"
      rowIdField="id"
      cardFields={CARD_FIELDS}
      selectable
      selectedIds={selected}
      onSelectionChange={setSelected}
      selectionActions={actions}
      recordLabel={{ singular: "Deal", plural: "Deals" }}
    />
  );
}
```

Each action's `onClick` receives the array of selected row IDs. Uncontrolled selection memory persists across filter/sort changes by default; use `selectionResetKey` to force a reset when dataset identity changes (switching tabs, changing scope, etc.).

---

### Card actions — `KanbanCardActions`

A dedicated helper for the per-card action row. Typical placement is `placement: "footer"` inside `cardFields`.

```jsx
import { KanbanCardActions } from "hs-uix/kanban";

const CARD_FIELDS = [
  // …title, body, etc.…
  {
    placement: "footer",
    render: (_, row) => (
      <KanbanCardActions
        display="icon"
        actions={[
          { label: "Open record", icon: "record",  href: { url: recordUrl(row), external: true } },
          { label: "Email",       icon: "email",   onClick: () => openEmail(row) },
          { label: "Note",        icon: "comment", onClick: () => openNote(row) },
          { label: "Task",        icon: "tasks",   onClick: () => openTask(row) },
        ]}
      />
    ),
  },
];
```

Display modes:

| `display` | Use when |
|---|---|
| `"icon"` *(default)* | Native deal-card footer look — icon-only buttons |
| `"label"` | Prototype lead-board look — `Email \| Note \| Task`. Combine with `separator="pipe"` |
| `"iconAndLabel"` | Comfortable density boards where you have room for both |

Use `overflowAfter={N}` to collapse actions past index N into an overflow menu, and `align="end"` (default) to anchor actions to the right of the footer row.

Icon names must come from HubSpot's `IconNames` union (`add`, `email`, `comment`, `tasks`, `record`, `calling`, etc.). There is no `note` icon — use `comment`.

---

### Sharing a config with DataTable

The state props on `DataTable` and `Kanban` are wire-compatible (`data`, `searchValue`, `filterValues`, `selectedIds`, `loading`, `error`) — the one thing that isn't is the rendering config. Use `deriveCardFieldsFromColumns` from `hs-uix/utils` to project a DataTable `columns` config into Kanban `cardFields`:

```jsx
import { DataTable } from "hs-uix/datatable";
import { Kanban } from "hs-uix/kanban";
import { deriveCardFieldsFromColumns } from "hs-uix/utils";

const COLUMNS = [
  { field: "name",      label: "Deal name",  sortable: true,
    renderCell: (v, row) => <Link href={dealUrl(row)}>{v}</Link> },
  { field: "owner",     label: "Deal owner", sortable: true },
  { field: "amount",    label: "Amount",     renderCell: (v) => formatCurrencyCompact(v) },
  { field: "closeDate", label: "Close date", sortable: true,
    renderCell: (v) => formatDate(v) },
];

const CARD_FIELDS = deriveCardFieldsFromColumns(COLUMNS, {
  titleField: "name",
  placements: { owner: "subtitle", amount: "footer" },
});

const [view, setView] = useState("table");

const shared = {
  data,
  rowIdField: "id",
  searchFields: ["name", "owner"],
  filters: FILTERS,
  selectable: true,
  selectedIds,
  onSelectionChange: setSelectedIds,
  loading,
  error,
};

return view === "table"
  ? <DataTable {...shared} columns={COLUMNS} />
  : <Kanban    {...shared} stages={STAGES} groupBy="stage" cardFields={CARD_FIELDS} />;
```

Per-column sort and board-wide `sortOptions` are different models — you still maintain a separate `sortOptions` array for Kanban. See the `deriveCardFieldsFromColumns` docs in `hs-uix/utils` for the full option list (`titleHref`, `exclude`, `include`, `maxBodyFields`).

---

### Sorting

Sort is a board-wide single-select (one sort applies to every column) — matches native Deals behavior and avoids combinatoric per-column sort state.

```jsx
const SORT_OPTIONS = [
  { value: "amount_desc",   label: "Amount (high to low)",
    field: "amount", direction: "desc", fieldLabel: "Amount",
    comparator: (a, b) => b.amount - a.amount },
  { value: "amount_asc",    label: "Amount (low to high)",
    field: "amount", direction: "asc",  fieldLabel: "Amount",
    comparator: (a, b) => a.amount - b.amount },
  { value: "close_date",    label: "Close date (soonest first)",
    field: "closeDate", direction: "asc", fieldLabel: "Close date",
    comparator: (a, b) => new Date(a.closeDate) - new Date(b.closeDate) },
];

<Kanban
  {...rest}
  sortOptions={SORT_OPTIONS}
  defaultSort="amount_desc"
/>
```

When every sort option has `field` + `direction`, the toolbar renders the richer "field picker + Asc/Desc toggle" UI. Mixed or missing → simple flat option list.

---

### Server-driven board

If your data comes from an API or you have too many records to load up-front, drive the board from controlled state. Pass pre-filtered / pre-sorted `data`, wire the toolbar callbacks to re-fetch, and use `stageMeta` for per-column totals and load-more.

```jsx
<Kanban
  loading={loading}
  error={error}
  data={rows}                    // already filtered/sorted on the server
  stages={STAGES}
  groupBy="stage"
  cardFields={CARD_FIELDS}

  searchValue={params.search}
  filterValues={params.filters}
  sort={params.sort}
  onParamsChange={fetchBoard}    // { search, filters, sort, collapsedStages }

  stageMeta={stageMeta}          // per-column totals / hasMore / loading
  onLoadMore={loadMoreForStage}

  searchDebounce={300}
/>
```

`onParamsChange` fires on any toolbar change with a unified `{ search, filters, sort, collapsedStages }` object so you can avoid wiring four separate callbacks. The component never mutates `data` — updating the board after a stage change or load-more is the caller's job, same as DataTable's `onRowEdit`.

---

## API Reference

### Kanban Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Row[]` | *required* | Array of row objects |
| `stages` | `KanbanStage[]` | *required* | Ordered stage/column definitions |
| `groupBy` | `string \| (row) => string` | `"status"` | Field name or accessor that maps a row to its stage `value` |
| `rowIdField` | string | `"id"` | Field name for the unique row identifier |
| `renderCard` | `(row, context) => ReactNode` | — | Full-card escape hatch. Omit to use `cardFields`. |
| `cardFields` | `KanbanCardField[]` | — | Declarative card content (see below) |
| `cardDensity` | `"compact" \| "comfortable"` | `"compact"` | Card density preset |
| `cardDividers` | `boolean \| KanbanCardDividers` | density-dependent | Toggle region dividers. Object allows per-seam control. |
| `cardBodyAs` | `"descriptionList" \| "stack"` | `"descriptionList"` | Body layout. `descriptionList` aligns labels across cards for consistent height. |
| `countDisplay` | `"tag" \| "text" \| "none"` | `"tag"` | How per-stage counts render in the column header |
| `maxBodyLines` | number | density default | Max body rows before truncation |
| `maxCardsPerColumn` | number | `10` | Cards per column before "Show more" |
| `maxCardsExpanded` | number | `50` | Cards per column after "Show more" is clicked |
| `expandedStages` | string[] | — | Controlled list of stages showing all cards |
| `onExpandedStagesChange` | `(stages) => void` | — | Controlled-expansion callback |
| `stageMeta` | `Record<string, KanbanStageMeta>` | — | Per-stage `hasMore` / `totalCount` / `loading` / `error` |
| `onLoadMore` | `(stage) => void` | — | Per-column "Load more" callback |
| `selectable` | boolean | `false` | Show a selection checkbox on each card |
| `selectedIds` | `Id[]` | — | Controlled selection — array of row IDs |
| `onSelectionChange` | `(ids) => void` | — | Called when selection changes |
| `selectionActions` | `KanbanSelectionAction[]` | — | Bulk action buttons in the selection bar |
| `recordLabel` | `{ singular, plural }` | `{ "record", "records" }` | Entity name for selection bar, loading, empty states |
| `selectionResetKey` | unknown | — | Force uncontrolled selection memory to reset when changed |
| `resetSelectionOnQueryChange` | boolean | `true` | Whether uncontrolled selection resets on search/filter/sort changes |
| `showSelectionBar` | boolean | `true` | Hide the default selection bar while keeping selection state active |
| `renderSelectionBar` | `(ctx) => ReactNode` | — | Replace the default selection bar |
| `stageControl` | `"select" \| "menu" \| "none"` | `"menu"` in compact, `"select"` in comfortable | Per-card stage control style |
| `stageControlPlacement` | `"inline" \| "separateRow"` | density default | Render the stage control inside the footer row, or on its own row below |
| `onStageChange` | `(row, newStage, oldStage, result?) => void \| Promise` | — | Called when a user commits a stage change |
| `isStageChanging` | `(row) => boolean` | — | Caller-owned pending flag that shows a spinner on the card |
| `canMove` | `(row, toStage) => boolean` | — | Gate target stages per row |
| `showSearch` | boolean | `true` (when `searchFields` set) | Show/hide the search input |
| `searchFields` | string[] | `[]` | Fields to search across. Search UI only renders when non-empty. |
| `searchPlaceholder` | string | `"Search..."` | Placeholder for the search input |
| `searchDebounce` | number | `250` | Milliseconds to debounce `onSearchChange` callback. Pass `0` for synchronous search |
| `fuzzySearch` | boolean | `false` | Enable fuzzy matching via Fuse.js |
| `fuzzyOptions` | object | — | Custom Fuse.js options (threshold, distance, keys) |
| `filters` | `KanbanFilterConfig[]` | `[]` | Filter configurations (see below) |
| `filterInlineLimit` | number | `4` | Max filters shown inline before overflow into a "Filters" button |
| `showFilterBadges` | boolean | `true` | Show active filter chips |
| `showClearFiltersButton` | boolean | `showFilterBadges` | Show "Clear all" reset button. Defaults to the value of `showFilterBadges`, so hiding the chips hides the reset button too unless set explicitly |
| `sortOptions` | `KanbanSortOption[]` | — | Sort options (single board-wide sort) |
| `defaultSort` | string | — | Initial sort option `value` (uncontrolled) |
| `sort` | string | — | Controlled sort option `value` |
| `onSortChange` | `(value) => void` | — | Sort callback (controlled) |
| `columnFooter` | `(rows, stage) => ReactNode` | — | Per-stage footer (aggregate row). Overridden by `stage.footer` when set. |
| `columnWidth` | number | `350` | Min per-column width in px (AutoGrid `columnWidth`). Clamped to a 350px minimum. |
| `collapsedStages` | string[] | — | Controlled list of collapsed stage values |
| `onCollapsedStagesChange` | `(stages) => void` | — | Controlled-collapse callback |
| `metrics` | `KanbanMetricItem[] \| ReactNode` | — | Headline metrics panel. Array → `<StatisticsItem>` shorthand; ReactNode → full custom render. |
| `showMetrics` | boolean | — | Controlled visibility of the metrics panel |
| `onMetricsToggle` | `(visible) => void` | — | Called when the toolbar Metrics button is clicked |
| `searchValue` | string | — | Controlled search term |
| `onSearchChange` | `(term) => void` | — | Search callback |
| `filterValues` | `Record<string, unknown>` | — | Controlled filter values |
| `onFilterChange` | `(values) => void` | — | Filter callback |
| `onParamsChange` | `({ search, filters, sort, collapsedStages }) => void` | — | Unified callback fired on any toolbar change |
| `loading` | boolean | `false` | Show a loading skeleton in place of the board |
| `error` | `string \| boolean` | — | Show an error state. String value is used as the title. |
| `labels` | `KanbanLabels` | — | Override hardcoded UI strings for i18n |
| `renderEmptyState` | `(ctx) => ReactNode` | — | Replace the default empty state |
| `renderLoadingState` | `(ctx) => ReactNode` | — | Replace the default loading spinner |
| `renderErrorState` | `(ctx) => ReactNode` | — | Replace the default error state |

### Stage Definition

| Property | Type | Description |
|---|---|---|
| `value` | string | Stage key; matches `groupBy` output |
| `label` | string | Column title |
| `shortLabel` | string | Shorter label shown in narrow columns |
| `description` | string | Tooltip text on the column header |
| `variant` | `"success" \| "info" \| "warning" \| "default"` | Drives the column header color |
| `color` | string | Optional dot color for the header |
| `icon` | string | Optional HubSpot `Icon` name for the header |
| `terminal` | boolean | Mark as a "closed" stage (hidden behind a "Show closed" toggle) |
| `order` | number | Explicit order override (otherwise array order wins) |
| `footer` | `(rows) => ReactNode` | Per-stage footer content (overrides `columnFooter`) |
| `canEnter` | `(row) => boolean` | Gate whether a row can move *into* this stage |
| `onEnterRequired` | `{ render: (ctx) => ReactNode }` | Inline prompt shown before committing a transition into this stage. `ctx = { row, fromStage, toStage, onConfirm, onCancel }`. |

### Card Field Definition

| Property | Type | Description |
|---|---|---|
| `field` | string | Data key. Optional when `render` is provided and doesn't read a single value. |
| `label` | string | Body-placement label (shown as `DescriptionListItem` term). Ignored for `title`/`subtitle`/`meta`/`footer`. |
| `placement` | `"title" \| "subtitle" \| "meta" \| "body" \| "footer"` | Where this field renders on the card |
| `render` | `(value, row) => ReactNode` | Custom value renderer |
| `href` | string \| `{ url, external? }` \| `(row) => string \| { url, external? }` | On `placement: "title"`, wraps the rendered value in a `<Link>`. `external: true` opens in a new tab. |
| `truncate` | `true \| number` | Truncate long values (title default: 60 chars). Use `false` to opt out on title. |
| `visible` | `(row) => boolean` | Hide this field for specific rows |
| `colSpan` | number | Reserved for future grid-body variants |

### Filter Definition

| Property | Type | Description |
|---|---|---|
| `name` | string | Field name to filter on |
| `type` | `"select" \| "multiselect" \| "dateRange"` | Filter type (default `"select"`) |
| `placeholder` | string | Placeholder / label text |
| `options` | `{ label, value }[]` | Options for select / multiselect |
| `chipLabel` | string | Prefix used in the active-filter chip (defaults to `placeholder` or `name`) |
| `filterFn` | `(row, value) => boolean` | Custom filter function (e.g. for range-based filters or computed values) |

### Sort Option Definition

| Property | Type | Description |
|---|---|---|
| `value` | string | Unique sort identifier |
| `label` | string | Display label in the sort dropdown |
| `field` | string | *(Optional)* Field key for the richer "field + direction" picker UI |
| `direction` | `"asc" \| "desc"` | *(Optional)* Direction for the field-picker UI |
| `fieldLabel` | string | *(Optional)* Label shown in the grouped field selector |
| `comparator` | `(a, b) => number` | Sort comparator applied within each stage |

### Stage Meta

| Property | Type | Description |
|---|---|---|
| `hasMore` | boolean | Column shows "Load more" at the bottom |
| `totalCount` | number | Shown in the column header as `{loaded} of {totalCount}` |
| `loading` | boolean | Column shows a spinner under the last card |
| `error` | string | Column shows an inline error row (with retry if `onLoadMore` is wired) |

### Metric Item

| Property | Type | Description |
|---|---|---|
| `id` | string | Unique key (defaults to `label`) |
| `label` | string | Metric label (`"Total deal amount"`) |
| `number` | `string \| number` | Display value (`"$123.58M"`, `42`) |
| `trend` | `{ direction?: "increase" \| "decrease", value: string, color?: "red" \| "green" }` | Optional `<StatisticsTrend>` indicator |

### KanbanCardActions Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `actions` | `KanbanCardAction[]` | *required* | Action definitions |
| `display` | `"icon" \| "label" \| "iconAndLabel"` | `"icon"` | How each action renders |
| `size` | `"xs" \| "sm"` | `"xs"` | Button size |
| `align` | `"start" \| "end" \| "between"` | `"end"` | Horizontal alignment inside the container |
| `gap` | string | `"xs"` | HubSpot spacing token between actions |
| `separator` | `"none" \| "pipe"` | `"none"` | Render `\|` between actions (matches label-style prototype) |
| `overflowAfter` | number | — | Collapse actions past index N into an overflow menu |
| `overflowLabel` | string | `"More"` | Overflow button label |

### KanbanCardAction

| Property | Type | Description |
|---|---|---|
| `key` | string | Unique key (defaults to `label`) |
| `label` | string | Button label; used as `aria-label` in icon-only mode |
| `icon` | string | HubSpot `Icon` name |
| `tooltip` | string | Hover tooltip (defaults to `label` in icon-only mode) |
| `variant` | `"primary" \| "secondary" \| "transparent"` | Button variant (default `"transparent"`) |
| `disabled` | boolean | Disable the action |
| `visible` | boolean | Hide without taking layout space (default `true`) |
| `onClick` | `() => void` | Click handler — mutually exclusive with `href` |
| `href` | string \| `{ url, external? }` | Navigation target — mutually exclusive with `onClick` |

### Labels

`labels` accepts overrides for every hardcoded UI string. See `KanbanLabels` in `kanban.d.ts` for the full list — the most common overrides are `search`, `filtersButton`, `sortButton`, `loadMore`, `loadingMore`, `showMore`, `emptyTitle`, `emptyMessage`, `selected`, `selectAll`, `deselectAll`, `moveTo`, `metricsButton`.

---

## Limitations

These come from HubSpot UI Extensions itself, not Kanban:

| Limitation | Details |
|---|---|
| No drag-and-drop | The UI Extensions runtime doesn't expose HTML5 drag-and-drop. Stage changes happen through an inline `Select` or menu on each card. |
| No sticky headers | HubSpot primitives don't support `position: sticky`. Long columns scroll the header out of view — use `maxCardsPerColumn` + "Show more" to keep columns short. |
| Column widths in HubSpot's AutoGrid | Columns share the viewport; `columnWidth` is a *minimum* (clamped to 280px). The number of columns that fit is driven by viewport width, not the prop. |
| Rotated column labels | Collapsed columns stack each character vertically in its own `Text` (no CSS transforms available). Long stage names become tall — use `shortLabel` for those. |
| External-link glyph on title links | HubSpot's `Link` primitive always shows the external-link glyph when `href.external === true`. To get a title link *without* the glyph, omit `external: true`. New-tab + no-glyph is not possible today. |
| No row expansion | Cards are read-mostly; expandable detail rows aren't supported. Route to the CRM record for full edits. |
| No swimlanes | Secondary grouping (e.g. by owner within stage) isn't supported. On the roadmap. |
| No export | No built-in CSV/Excel export. Pair with a serverless function. |

See [`packages/kanban/SPEC.md`](./SPEC.md) for the full design doc, decision log, and roadmap.

---

## License

MIT

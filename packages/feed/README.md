# Feed (hs-uix/feed)

Activity feed / timeline component for HubSpot UI Extensions. Feed is the default choice for chronological activity streams, audit logs, recent-events panels, interaction history, and lightweight timelines — the same way `DataTable` is the default for tabular list managers.

Feed gives you search, filters, sort, grouping, count text, view-more pagination, loading/empty/error states, declarative item regions, and render escape hatches while staying fully renderable with HubSpot primitives: `Tile`, `Flex`, `Text`, `Icon`, `AvatarStack`, `Tag`, `StatusTag`, `DescriptionList`, `List`, `ButtonRow`, `SearchInput`, `Select`, `MultiSelect`, `EmptyState`, `Alert`, and `LoadingSpinner`.

## Quick Start

```jsx
import { Feed } from "hs-uix/feed";

const activity = [
  {
    id: "1",
    type: "Note",
    typeVariant: "info",
    iconName: "comment",
    title: "Note added",
    actor: { name: "Avery Reed", initials: "AR" },
    timestamp: "2026-04-26T13:41:00Z",
    body: "Customer asked for implementation timeline and pricing details.",
    meta: ["Sales", "High intent"],
    actions: [{ label: "Open", icon: "record", href: { url: recordUrl } }],
  },
];

<Feed
  title="Activity"
  description="Latest timeline events for this record."
  items={activity}
  searchFields={["title", "body", "type"]}
  filters={[
    {
      name: "type",
      type: "multiselect",
      label: "Activity type",
      options: [
        { label: "Emails", value: "Email" },
        { label: "Calls", value: "Call" },
        { label: "Meetings", value: "Meeting" },
        { label: "Notes", value: "Note" },
      ],
    },
  ]}
  sortOptions={[
    { value: "newest", label: "Newest first", field: "timestamp", direction: "desc" },
    { value: "oldest", label: "Oldest first", field: "timestamp", direction: "asc" },
  ]}
  defaultSort="newest"
  groupByDate
/>
```

That gives you a searchable, filterable, sorted, date-grouped timeline with a native toolbar and empty/loading/error states.

## When to use Feed vs DataTable vs Kanban

| Need | Use |
|---|---|
| Chronological history, audit log, recent events, activity timeline | `Feed` |
| Compare records across columns, edit cells, aggregate totals, export-like list manager | `DataTable` |
| Records moving through stages/status columns | `Kanban` |

If the primary mental model is “what happened, and when?”, use Feed. If the user needs to compare many attributes side-by-side, use DataTable. If the user needs WIP/stage visibility, use Kanban.

## Features

- Standard activity item shape (`type`, `typeVariant`, `iconName`, `timestamp`, `actor`, `body`, `meta`, `actions`)
- Declarative `fields` with Kanban-like placements: `title`, `subtitle`, `meta`, `body`, `footer`
- Full-text search across configured fields
- DataTable/Kanban-style toolbar layout with search, inline filters, overflow filters, sort, and count text
- `select`, `multiselect`, and `dateRange` filters
- Sort dropdown via `sortOptions` (`field` + `direction` or custom `comparator`)
- Date grouping (`Today`, `Yesterday`, localized older dates) or custom `groupBy`
- Built-in item count (`5 of 12 events`) with custom `recordLabel` / `itemCountText`
- View-more pagination (`pageSize`) plus server/external load-more (`hasMore`, `onLoadMore`)
- Client-side or server-side mode (`serverSide`) with unified `onParamsChange`
- Built-in loading, error, and empty states with render overrides
- Tile-backed outer/item containers and divider mode
- Render escape hatches for item, toolbar, and individual item regions

## Standard item shape

Feed works out of the box with these item keys:

| Key | Description |
|---|---|
| `id` / `key` | Stable item key |
| `type` | Activity type label, rendered in a `StatusTag` by default |
| `typeLabel` | Optional display label when `type` is a machine value |
| `typeVariant` | `StatusTag` variant: `default`, `info`, `success`, `warning`, `danger` |
| `iconName` / `icon` | Activity/entity icon. Use verified HubSpot icon names (`email`, `calling`, `appointment`, `comment`, `description`, etc.) |
| `title` / `subject` | Main item heading |
| `href` | Optional link wrapping the title |
| `body` / `description` / `content` / `preview` / `notePreview` | Main text body |
| `timestamp` / `time` / `date` / `createdAt` / `dateLabel` | Time display and date grouping input |
| `actor` / `actorName` / `author` | Actor text or `{ name, avatar/avatarUrl/src/initials }` |
| `avatar` | Avatar source/initials, rendered via `AvatarStack` |
| `meta` / `metadata` | Inline metadata, rendered via `List variant="inline-divided"` when array |
| `actions` | ReactNode or action objects rendered through `ButtonRow` |
| `footer` | Optional footer content |

Prefer precomputing `typeVariant` in data when the values are known. That mirrors the Studio knowledge-base derivation pattern and keeps the render deterministic.

## Declarative fields

Use `fields` when your rows have custom properties. Placements mirror Kanban's card-field vocabulary.

```jsx
<Feed
  items={events}
  fields={[
    { field: "subject", placement: "title", href: (row) => row.url },
    { field: "channel", placement: "subtitle" },
    { field: "owner", label: "Owner", placement: "body" },
    { field: "nextStep", label: "Next step", placement: "body" },
    { field: "priority", placement: "meta", type: "tag", variant: "warning" },
    { field: "outcome", placement: "footer", type: "status", variant: "success" },
  ]}
/>
```

Labeled body fields render in one `DescriptionList`; `type: "tag"` and `type: "status"` render HubSpot `Tag` and `StatusTag`. Keep `label` a string — HubSpot's `DescriptionListItem.label` does not accept nodes.

## Search, filters, and sort

The default toolbar intentionally mirrors DataTable/Kanban: left column for Search + quick filters (+ overflow Filters button), right column for Sort + item count.

```jsx
<Feed
  items={activity}
  searchFields={["title", "body", "type", "actorName"]}
  filters={[
    { name: "type", type: "multiselect", label: "Activity type", options: TYPE_OPTIONS },
    { name: "outcome", type: "select", label: "Outcome", options: OUTCOME_OPTIONS },
    { name: "timestamp", type: "dateRange", label: "Date" },
  ]}
  sortOptions={[
    { value: "newest", label: "Newest first", field: "timestamp", direction: "desc" },
    { value: "oldest", label: "Oldest first", field: "timestamp", direction: "asc" },
    { value: "type", label: "Type A-Z", field: "type", direction: "asc" },
  ]}
  defaultSort="newest"
  filterInlineLimit={2}
/>
```

Filter config:

| Prop | Description |
|---|---|
| `name` | Filter key; defaults to reading `item[name]` |
| `field` | Optional field/accessor when the item key differs from `name` |
| `type` | `select`, `multiselect`, or `dateRange` |
| `label` / `placeholder` | Native input label/placeholder |
| `options` | `{ label, value }[]` for select/multiselect |
| `filterFn(item, value)` | Custom matching logic |

Sort options accept either `field` + `direction` or a custom `comparator(a, b)`.

## Grouping and pagination

```jsx
<Feed
  items={activity}
  groupByDate
  pageSize={5}
/>
```

`groupByDate` groups by `Today`, `Yesterday`, then localized dates. Use `groupBy="type"` or `groupBy={(item) => item.bucket}` for arbitrary grouping.

Feed shows `pageSize` items initially and a transparent “View more” button when more client-side items are available. For server/external loading, pass `hasMore`, `loadingMore`, and `onLoadMore`:

```jsx
<Feed
  items={activity}
  hasMore={hasMore}
  loadingMore={loadingMore}
  onLoadMore={loadMore}
/>
```

## Server-side mode

Use `serverSide` when the parent/API owns filtering, sorting, searching, and pagination. Feed renders the toolbar and calls back with params, but does not mutate `items`.

```jsx
<Feed
  serverSide
  items={pageItems}
  searchValue={params.search}
  filterValues={params.filters}
  sort={params.sort}
  onParamsChange={(next) => fetchActivity(next)}
  filters={filters}
  sortOptions={sortOptions}
  hasMore={hasMore}
  onLoadMore={loadMore}
/>
```

## Containers

```jsx
<Feed container="tile" itemContainer="none" />
<Feed container="none" itemContainer="tile" />
<Feed container="card" compact /> // alias for Tile, kept for ergonomic naming
```

- `container`: `"tile"` (default), `"none"`, or `"card"` (`card` is a Tile-backed alias)
- `itemContainer`: `"none"` (default), `"tile"`, or `"card"` (`card` is a Tile-backed alias)
- `showDividers`: dividers between items when `itemContainer="none"`

## Render escape hatches

- `renderItem(item, index)` replaces the entire row
- `renderToolbar(context)` replaces search/filter/sort/count toolbar
- `renderActor`, `renderTimestamp`, `renderMeta`, `renderActions`, `renderFooter` replace individual regions
- `renderEmptyState`, `renderLoadingState`, `renderErrorState` mirror DataTable/Kanban state override APIs

## Props

See `feed.d.ts` for the full typed API.

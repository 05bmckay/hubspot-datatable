# CRM search demo

Demo for wiring HubSpot's `useCrmSearch` hook into hs-uix components without making the components CRM-only.

> **Most apps don't need this low-level wiring.** Reach for `CrmDataTable` / `CrmKanban` from `hs-uix/utils` — they point at an `objectType` + `properties`, fetch one batch, and paginate client-side by default (opt into `serverSide` for very large datasets). This demo deliberately shows the lower-level `useCrmSearch*` hooks for cases that need full control over the data source.

## Requirements

- `@hubspot/ui-extensions >= 0.14.0`
- `hs-uix` built/linked into your UI extension project
- A CRM extension point with access to contacts, companies, and deals

The current HubSpot docs import `useCrmSearch` from `@hubspot/ui-extensions`. In `0.14.0` it is also re-exported from `@hubspot/ui-extensions/experimental`, but the public docs show the stable root export, so the hs-uix utility uses the root import and the package peer dependency is raised to `>=0.14.0`.

## What this tests

`CrmSearchDemo.jsx` has three slices:

1. **DataTable** — server-side search/filter/sort powered by `useCrmSearchDataSource`.
2. **Kanban** — CRM deal rows normalized from `useCrmSearch` and rendered in stages.
3. **FormBuilder** — a text input drives `useCrmSearchOptions`, which feeds a select field via `makeCrmSearchSelectField`.

## Adapter approach

The demo keeps search support balanced:

- hs-uix components stay generic and keep their existing controlled props (`data`, `loading`, `error`, `searchValue`, `filterValues`, `onParamsChange`).
- `hs-uix/utils` provides CRM-specific adapters as optional helpers.
- Consumers can use the helpers for common CRM searches or replace `filterMap`, `sortMap`, `mapRecord`, and `mapOption` for custom object/property mappings.

## Usage sketch

Copy `CrmSearchDemo.jsx` into a HubSpot UI extension project, or import the same patterns into an existing extension:

```jsx
import { DataTable } from "hs-uix/datatable";
import { useCrmSearchDataSource } from "hs-uix/utils";

const [params, setParams] = useState({ search: "", filters: {}, sort: {}, page: 1 });
const contacts = useCrmSearchDataSource(params, {
  objectType: "contact",
  properties: ["firstname", "lastname", "email"],
  pageLength: 10,
  row: {
    mapRecord: (record) => ({ objectId: record.objectId, ...record.properties }),
  },
});

<DataTable
  serverSide
  data={contacts.data}
  loading={contacts.loading}
  error={contacts.error}
  totalCount={contacts.totalCount}
  columns={columns}
  searchFields={["firstname", "lastname", "email"]}
  searchValue={params.search}
  onParamsChange={(next) => setParams((prev) => ({ ...prev, ...next }))}
/>;
```

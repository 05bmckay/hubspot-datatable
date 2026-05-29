# FormBuilder (hs-uix/form)

Declarative, config-driven FormBuilder for HubSpot UI Extensions. Define fields as data, get a complete form with validation, layout, multi-step wizards, and full HubSpot component integration.

![Basic Form](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/basic-form.png)

```bash
npm install hs-uix
```

## Quick Start

```jsx
import { FormBuilder } from "hs-uix/form";

const fields = [
  { name: "firstName", type: "text", label: "First name", required: true },
  { name: "lastName", type: "text", label: "Last name", required: true },
  { name: "email", type: "text", label: "Email", pattern: /^[^\s@]+@[^\s@]+$/, patternMessage: "Enter a valid email" },
];

<FormBuilder
  columns={2}
  fields={fields}
  onSubmit={(values) => console.log(values)}
/>
```

## Field Types

Every field maps to a native HubSpot UI Extension component with full prop support:

| `type` | Component | Key Props |
|---|---|---|
| `text` | `Input` | `placeholder`, `onInput`, `onBlur` |
| `password` | `Input type="password"` | Same as text |
| `textarea` | `TextArea` | `rows`, `cols`, `resize`, `maxLength` |
| `number` | `NumberInput` | `min`, `max`, `precision`, `formatStyle` |
| `stepper` | `StepperInput` | `min`, `max`, `stepSize`, `precision`, `formatStyle`, `minValueReachedTooltip`, `maxValueReachedTooltip` |
| `currency` | `CurrencyInput` | `currency` (ISO 4217), `min`, `max`, `precision` |
| `date` | `DateInput` | `format`, `min`, `max`, `timezone`, `clearButtonLabel`, `todayButtonLabel`, `minValidationMessage`, `maxValidationMessage` |
| `time` | `TimeInput` | `interval`, `min`, `max`, `timezone` |
| `datetime` | `DateInput` + `TimeInput` | Composite — all date and time props apply |
| `select` | `Select` | `options`, `variant` (`"input"` or `"transparent"`) |
| `multiselect` | `MultiSelect` | `options` |
| `toggle` | `Toggle` | `size`, `labelDisplay`, `textChecked`, `textUnchecked` |
| `checkbox` | `Checkbox` | `inline`, `variant` |
| `checkboxGroup` | `ToggleGroup checkboxList` | `options`, `inline`, `variant` |
| `radioGroup` | `ToggleGroup radioButtonList` | `options`, `inline`, `variant` |
| `display` | Custom render | Render-only, no form value or validation |
| `slot` | Custom render | Alias of `display` — clearer name for injecting JSX between fields |
| `repeater` | Sub-field rows | `fields`, `min`, `max` — add/remove dynamic rows |
| `fieldGroup` | Structured rows | `items`, `fields` — fixed predefined rows (no add/remove) |
| `crmPropertyList` | `CrmPropertyList` | `properties`, `direction` — native HubSpot inline editing |
| `crmAssociationPropertyList` | `CrmAssociationPropertyList` | `objectTypeId`, `properties`, `filters`, `sort` |

All field types share these common props: `description`, `placeholder`, `tooltip`, `required`, `readOnly`, `defaultValue`, `fieldProps` (pass-through).

## Layout

FormBuilder provides four layout modes. The default is a single full-width column, but HubSpot rarely uses full-width inputs — most forms should use `columns` or `columnWidth` for a tighter layout.

### Choosing a Layout Mode

| Mode | Prop | Best for | Responsive? |
|---|---|---|---|
| **Single column** | *(default)* | Simple forms, sidebars | N/A |
| **Fixed columns** | `columns={2}` | Most forms — predictable grid | Yes — collapses on narrow viewports |
| **Responsive** | `columnWidth={200}` | Cards and variable-width containers | Yes — columns fill available space |
| **Explicit** | `layout={[...]}` | Precise per-row control, weighted columns | No — rows are fixed as defined |

Priority when multiple are set: `layout` > `columnWidth` > `columns` > single-column.

### Fixed Columns (recommended default)

Set a column count. Fields flow left-to-right, top-to-bottom, and columns collapse to single-column on narrow viewports.

```jsx
<FormBuilder columns={2} fields={fields} />
```

#### Spanning columns

Use `colSpan` to span a specific number of columns, or `width: "full"` to always span all columns regardless of the column count:

```jsx
const fields = [
  { name: "firstName", type: "text", label: "First name" },           // 1 column
  { name: "lastName", type: "text", label: "Last name" },             // 1 column
  { name: "bio", type: "textarea", label: "Bio", colSpan: 2 },       // spans 2 columns
  { name: "notes", type: "textarea", label: "Notes", width: "full" }, // always full width
  { name: "city", type: "text", label: "City" },                      // 1 column
  { name: "state", type: "select", label: "State", options: STATES }, // 1 column
];

<FormBuilder columns={2} fields={fields} />
```

- `colSpan: N` — span exactly N columns (capped at the column count)
- `width: "full"` — span all columns without knowing the count. Prefer this over `colSpan` when the form's column count might change.

Partial rows get empty space (fields don't stretch to fill).

### Responsive (AutoGrid)

Set `columnWidth` in pixels. Columns fill the available space and collapse automatically on narrow screens using HubSpot's `AutoGrid` component.

```jsx
<FormBuilder columnWidth={200} fields={fields} />
```

With `columnWidth={200}`, a 400px card shows 2 columns; a 600px page shows 3. Use `maxColumns` to cap the number of columns:

```jsx
<FormBuilder columnWidth={200} maxColumns={3} fields={fields} />
```

> **Note:** `colSpan` and `width: "full"` are not supported in AutoGrid mode — all fields get equal width. If you need per-field column control with responsive behavior, use `columns` instead.

### Explicit Layout

![Explicit Layout](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/explicit-layout-weighted.png)

Define exact row structure with the `layout` prop. Each inner array is a row.

```jsx
<FormBuilder
  layout={[
    ["firstName", "lastName"],           // 2 equal columns
    ["email"],                           // full width
    ["city", "state", "zip"],            // 3 columns this row
  ]}
  fields={fields}
/>
```

Weighted columns use object entries:

```jsx
<FormBuilder
  layout={[
    [{ field: "address", flex: 2 }, { field: "apt", flex: 1 }],  // 2:1 ratio
  ]}
  fields={fields}
/>
```

Fields not listed in `layout` are appended full-width at the end, so you never accidentally lose a field. Explicit layout rows do not collapse on narrow viewports — each row renders exactly as defined.

## Validation

Built-in validators run in order, first failure wins:
- Required check (`required`)
- Default type/shape checks (enabled by default via `useDefaultValidators`)
- Pattern + length/range checks (`pattern`, `minLength`, `maxLength`, `min`, `max`)
- Custom validators (`validators`, then `validate`)

```jsx
{
  name: "email",
  type: "text",
  label: "Email",
  required: true,                                    // 1) required
  pattern: /^[^\s@]+@[^\s@]+$/,                     // 2) built-in pattern
  patternMessage: "Enter a valid email",
  minLength: 5,                                      // 3) built-in length
  maxLength: 100,
  validators: [                                      // 4) custom sync validators
    (value) => value.endsWith("@example.com") ? true : "Use your company email",
  ],
  validate: async (value, allValues, { signal }) => { // 5) custom async validator
    const exists = await checkEmailExists(value, { signal });
    if (exists) return "Email already in use";
    if (value === allValues.confirmEmail) return true;
    return "Emails must match";
  },
}
```

Set `useDefaultValidators={false}` to run only your custom validators for a field.
For async validators, prefer `async` functions so they run only in the async validation phase.

### Validation Timing

| Prop | Default | When |
|---|---|---|
| `validateOnChange` | `false` | Every keystroke (onInput) |
| `validateOnBlur` | `true` | Field loses focus |
| `validateOnSubmit` | `true` | Submit attempt |

### Date/Time Validation Messages

DateInput supports custom messages for out-of-range dates:

```jsx
{
  name: "startDate",
  type: "date",
  label: "Start date",
  min: { year: 2024, month: 1, date: 1 },
  max: { year: 2025, month: 12, date: 31 },
  minValidationMessage: "Date must be in 2024 or later",
  maxValidationMessage: "Date must be before 2026",
}
```

## Controlled vs Uncontrolled

**Uncontrolled (default):** FormBuilder manages its own state.

```jsx
<FormBuilder
  fields={fields}
  initialValues={{ firstName: "John" }}
  onSubmit={(values) => save(values)}
/>
```

**Controlled:** Parent owns the values.

```jsx
const [values, setValues] = useState({});

<FormBuilder
  fields={fields}
  values={values}
  onChange={setValues}
  onSubmit={(values) => save(values)}
/>
```

Validation errors can also be controlled:

```jsx
const [errors, setErrors] = useState({});

<FormBuilder
  fields={fields}
  values={values}
  errors={errors}
  onValidationChange={setErrors}
  onChange={setValues}
  onSubmit={save}
/>
```

### Surfacing submit-time validation failures

By default, when `validateOnSubmit` is on and a required field is invalid, FormBuilder writes the errors and silently aborts the submit. If the invalid field lives inside a collapsed accordion section, the error marker is hidden and the submit button looks broken.

Two opt-in props handle this:

```jsx
<FormBuilder
  fields={fields}
  sections={sections}
  openSectionOnValidationFail
  onValidationFail={({ firstInvalidField, fields, errors }) => {
    addAlert({ type: "danger", title: "Please fix the highlighted fields." });
  }}
  onSubmit={save}
/>
```

- `openSectionOnValidationFail` — auto-opens the accordion section that contains the first invalid field.
- `onValidationFail({ errors, fields, firstInvalidField })` — fires whenever submit-time validation blocks submission, so consumers calling `formRef.current.submit()` from custom buttons can surface their own toast/alert. Each entry in `fields` includes `{ name, label, sectionId }`.

## Ref API

Access form methods imperatively — essential for modals, panels, and any UI where buttons live outside the form:

```jsx
const formRef = useRef();

<FormBuilder ref={formRef} fields={fields} onSubmit={save} />

// Later:
formRef.current.submit();                              // trigger validation + submit
formRef.current.validate();                            // { valid: boolean, errors: {} }
formRef.current.reset();                               // reset to initial values
formRef.current.getValues();                           // current form values
formRef.current.isDirty();                             // true if values changed
formRef.current.setFieldValue("email", "new@test.com"); // programmatic update
formRef.current.setFieldError("email", "Taken");        // programmatic error
formRef.current.setErrors({ email: "Taken", phone: "Invalid" }); // bulk set errors
```

Use `submitPosition="none"` to hide the built-in buttons and drive the form entirely via ref.

## Submit Lifecycle

The full submit flow: validation → `onBeforeSubmit` → `onSubmit` → `onSubmitSuccess` / `onSubmitError`.

```jsx
<FormBuilder
  fields={fields}
  onBeforeSubmit={(values) => {
    // Return false to cancel submit
    return window.confirm("Save changes?");
  }}
  onSubmit={async (values) => {
    // If this throws or returns a rejected promise, onSubmitError fires.
    // If it resolves, onSubmitSuccess fires with the return value.
    return await saveRecord(values);
  }}
  onSubmitSuccess={(result, { reset, values }) => {
    // result = whatever onSubmit returned
    showToast("Saved!");
  }}
  onSubmitError={(error, { values }) => {
    // error = whatever onSubmit threw
    showToast(`Failed: ${error.message}`);
  }}
  resetOnSuccess={true}  // auto-reset after successful submit
/>
```

If `onSubmitError` is not provided and `onSubmit` throws, the error re-throws (so you can catch it in a parent). The `loading` state is managed automatically during the async submit — all fields disable and the submit button shows a spinner.

## Conditional Visibility

Fields can show/hide based on other field values:

```jsx
const fields = [
  { name: "hasCompany", type: "toggle", label: "Has company?" },
  {
    name: "companyName",
    type: "text",
    label: "Company name",
    visible: (values) => values.hasCompany === true,
  },
];
```

## Conditional Disabled

Like `visible` and `required`, `disabled` accepts a function to conditionally disable fields based on other field values. The field stays visible but greyed out:

```jsx
const fields = [
  { name: "acceptWalkins", type: "toggle", label: "Accept walk-ins" },
  {
    name: "walkinHours",
    type: "text",
    label: "Walk-in hours",
    disabled: (values) => !values.acceptWalkins,
  },
];
```

## Dependent Properties

![Dependent & Cascading](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/dependent-cascading.gif)

Dependent fields are grouped in a HubSpot Tile container below their parent. Use `dependsOnConfig` to define the relationship and `visible` to control when the dependent field appears:

```jsx
const fields = [
  { name: "dealType", type: "select", label: "Deal type", options: DEAL_TYPES },
  {
    name: "contractLength",
    type: "number",
    label: "Contract length (months)",
    dependsOnConfig: {
      field: "dealType",         // parent field name — determines tile placement
      display: "grouped",        // "grouped" (in Tile below parent) or "inline" (normal position)
      label: "Contract details", // tile header text
      message: (parentLabel) => `These properties depend on ${parentLabel}`, // info tooltip
    },
    visible: (values) => values.dealType === "recurring",  // when to show
  },
];
```

`dependsOnConfig` controls **where** the field renders (grouped in a Tile below the parent). `visible` controls **whether** it renders. They work together: the Tile only appears when at least one dependent field is visible.

You can combine `dependsOnConfig` with `disabled` for fields that should always be visible but only editable when a condition is met:

```jsx
{
  name: "renewalDate",
  type: "date",
  label: "Renewal date",
  dependsOnConfig: { field: "dealType", label: "Renewal settings" },
  disabled: (values) => values.dealType !== "recurring",
}
```

## Cascading Options

Options can be a function that receives all form values:

```jsx
const fields = [
  { name: "category", type: "select", label: "Category", options: CATEGORIES },
  {
    name: "subCategory",
    type: "select",
    label: "Sub-category",
    options: (values) => SUB_CATEGORIES[values.category] || [],
  },
];
```

## Multi-Step Wizard

Enable with the `steps` prop:

```jsx
<FormBuilder
  fields={allFields}
  steps={[
    { title: "Contact Info", fields: ["firstName", "lastName", "email"] },
    { title: "Company", fields: ["company", "role"] },
    { title: "Review", render: ({ values, goBack }) => (
      <ReviewPanel values={values} onEdit={goBack} />
    )},
  ]}
  showStepIndicator={true}
  validateStepOnNext={true}
  onSubmit={handleSubmit}
/>
```

Each step can have per-step validation:

```jsx
{
  title: "Passwords",
  fields: ["password", "confirmPassword"],
  validate: (values) => {
    if (values.password !== values.confirmPassword) {
      return { confirmPassword: "Passwords must match" };
    }
    return true;
  },
}
```

## Display Options

![Display Options](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/display-options.png)

### Boolean Fields

```jsx
// Toggle with custom ON/OFF text
{ name: "active", type: "toggle", label: "Status", size: "md", textChecked: "Active", textUnchecked: "Inactive" }

// Toggle sizes: "xs", "sm", "md"
// Label positions: "inline", "top", "hidden"
{ name: "notify", type: "toggle", label: "Notifications", size: "sm", labelDisplay: "inline" }

// Small checkbox
{ name: "agree", type: "checkbox", label: "I agree to terms", variant: "small" }

// Inline checkbox group
{ name: "colors", type: "checkboxGroup", label: "Colors", options: COLORS, inline: true }

// Radio group with small variant
{ name: "size", type: "radioGroup", label: "Size", options: SIZES, inline: true, variant: "small" }
```

### Date & Time

```jsx
// Date formats: "short", "long", "medium", "standard", "YYYY-MM-DD", "L", "LL", "ll"
{ name: "dob", type: "date", label: "Date of birth", format: "long" }

// Timezone: "userTz" (default) or "portalTz"
{ name: "deadline", type: "date", label: "Deadline", timezone: "portalTz" }

// Time interval (minutes between dropdown options)
{ name: "meetingTime", type: "time", label: "Meeting time", interval: 15 }

// Full datetime with all options
{ name: "eventStart", type: "datetime", label: "Event start", format: "medium", timezone: "portalTz", interval: 30 }
```

### Number & Currency

```jsx
// Percentage display
{ name: "rate", type: "number", label: "Tax rate", formatStyle: "percentage", precision: 2 }

// Stepper with boundary tooltips
{ name: "quantity", type: "stepper", label: "Qty", min: 1, max: 99, stepSize: 1,
  minValueReachedTooltip: "Minimum 1 item", maxValueReachedTooltip: "Maximum 99 items" }

// Currency (ISO 4217 code)
{ name: "price", type: "currency", label: "Price", currency: "EUR", precision: 2 }
```

### Select

```jsx
// Standard dropdown
{ name: "country", type: "select", label: "Country", options: COUNTRIES }

// Transparent (hyperlink-style) dropdown
{ name: "status", type: "select", label: "Status", options: STATUSES, variant: "transparent" }
```

## Buttons

```jsx
<FormBuilder
  fields={fields}
  onSubmit={save}
  labels={{
    submit: "Save record",
    cancel: "Discard",
    back: "Previous",
    next: "Continue",
  }}
  submitVariant="primary"
  showCancel={true}
  submitAlign="end"
  onCancel={() => actions.closeOverlay()}
  loading={isSaving}        // controlled loading state
  disabled={!canEdit}       // disables entire form
  submitPosition="bottom"   // "bottom" | "none"
/>
```

Use `submitPosition="none"` with the ref API for custom button placement.

`submitAlign` controls the default single-step button row alignment (`"start" | "end" | "between"`). By default, FormBuilder preserves the existing behavior: `"between"` when `showCancel` is true, otherwise `"start"`.

`labels` provides a single i18n object for button text, and `renderButtons` can fully replace the default button row.

## Form-Level Alerts

```jsx
<FormBuilder
  fields={fields}
  onSubmit={save}
  error="Something went wrong. Please try again."
  success="Record saved successfully!"
/>
```

For centralized alert config:

```jsx
<FormBuilder
  fields={fields}
  onSubmit={save}
  alerts={{
    addAlert: actions.addAlert,
    errorTitle: "Save failed",
    successTitle: "Saved",
  }}
/>
```

## Dirty Tracking

```jsx
<FormBuilder
  fields={fields}
  onSubmit={save}
  onDirtyChange={(isDirty) => {
    // e.g., show unsaved changes warning
  }}
/>
```

## Custom Render Escape Hatch

For fields that need custom rendering:

```jsx
{
  name: "rating",
  type: "text",  // type is required but ignored when render is set
  label: "Rating",
  render: ({ value, onChange, error, values }) => (
    <MyCustomRatingWidget value={value} onChange={onChange} hasError={error} />
  ),
}
```

## fieldProps Pass-Through

For any HubSpot component prop not exposed as a first-class field config, use `fieldProps`. For wrapper-level attributes (like `aria-*` on the `<Form>`), use `formProps`.

```jsx
{
  name: "search",
  type: "text",
  label: "Search",
  fieldProps: { testId: "search-input", onFocus: () => trackEvent("search_focused") },
}
```

## Sections (Accordion Grouping)

![Sections & Groups](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/section-and-groups.png)

Group fields into collapsible accordion sections:

```jsx
<FormBuilder
  fields={fields}
  sections={[
    { id: "basic", label: "Basic Info", fields: ["firstName", "lastName", "email"], defaultOpen: true },
    { id: "social", label: "Social Links", fields: ["facebook", "instagram"], defaultOpen: false, info: "Optional links" },
  ]}
  onSubmit={handleSubmit}
/>
```

Fields not listed in any section render after all sections. Sections can be combined with multi-step forms.

### Per-Section Columns

Each section can override the form-level column count:

```jsx
<FormBuilder
  columns={1}
  fields={fields}
  sections={[
    { id: "images", label: "Images", fields: ["profileImage", "bannerImage"] },
    { id: "social", label: "Social Links", fields: ["facebook", "instagram", "twitter", "linkedin"], columns: 2 },
    { id: "hours", label: "Business Hours", fields: ["acceptWalkins", "hoursSchedule"], columns: 1 },
  ]}
  onSubmit={handleSubmit}
/>
```

The Social Links section renders in 2 columns while the rest of the form stays single-column.

### Section Render Slots

Inject arbitrary content before or after a section's fields with `renderBefore` and `renderAfter`:

```jsx
sections={[
  {
    id: "images",
    label: "Images",
    defaultOpen: false,
    fields: ["profileImage", "bannerImage"],
    renderBefore: ({ values }) => (
      <Text variant="microcopy">Upload or paste a hosted image URL.</Text>
    ),
    renderAfter: ({ values }) => (
      values.profileImage
        ? <Image src={values.profileImage} width={100} />
        : null
    ),
  },
]}
```

Both callbacks receive `{ values, errors }` — the current form state.

## Field Groups (Dividers)

Lightweight non-collapsible grouping with auto-inserted dividers:

```jsx
const fields = [
  { name: "name", type: "text", label: "Name", group: "contact" },
  { name: "email", type: "text", label: "Email", group: "contact" },
  // Divider + label auto-inserted here
  { name: "company", type: "text", label: "Company", group: "company" },
];
```

By default the group key is rendered as the header text. Use the `groups` prop to customize per-group rendering — including a friendly label, hiding the divider, hiding the header, or rendering a fully custom header:

```jsx
<FormBuilder
  fields={fields}
  groups={{
    contact: { label: "Contact Info" },
    company: {
      label: "Company Info",
      showDivider: false,
      renderHeader: (group) => (
        <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
          {group}
        </Text>
      ),
    },
  }}
/>
```

Per-group options:

| Option | Type | Description |
|---|---|---|
| `label` | `string` | Override the displayed header text (defaults to the group key) |
| `showLabel` | `boolean` | Hide the header entirely. Defaults to `true` |
| `description` | `string` | Microcopy rendered underneath the group label. Ignored when `renderHeader` is provided or `showLabel` is `false` |
| `showDivider` | `boolean` | Hide the divider above this group. Defaults to `true` |
| `renderHeader` | `(group, fields, values) => ReactNode` | Fully custom header renderer |

## Display & Slot Fields

Render-only fields with no form value, no validation, and not included in submit values. Use `type: "display"` or its alias `type: "slot"` (clearer when injecting JSX between fields):

```jsx
{
  name: "mapPreview",
  type: "display",
  render: ({ values }) => {
    const url = buildMapsUrl(values.address, values.city, values.zip);
    return url ? <Link href={url}>Preview in Google Maps</Link> : null;
  },
}
```

Combine `type: "slot"` with `visible` to inject conditional content (warnings, hints, banners) anywhere in the field list:

```jsx
{
  name: "_addressWarning",
  type: "slot",
  visible: (vals) => isAddressIncomplete(vals),
  render: () => <Tag variant="warning">Incomplete address</Tag>,
}
```

Display fields can also interact with the form via `setFieldValue` and `setFieldError`:

```jsx
{
  name: "fileUpload",
  type: "display",
  render: ({ values, setFieldValue, setFieldError }) => (
    <CrmPropertyList
      properties={["profile_file_id"]}
      direction="column"
      onChange={(fileId) => setFieldValue("profileFileId", fileId)}
    />
  ),
}
```

## Read-Only Mode

![Read-Only, Auto-Save & Dirty](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/readonly-autosave-dirty.png)

Lock the entire form with an optional warning message:

```jsx
<FormBuilder
  fields={fields}
  readOnly={isPremiumAccount}
  readOnlyMessage="This is a premium account. Editing is disabled."
  onSubmit={handleSubmit}
/>
```

Sets all fields to `readOnly`, hides submit/cancel buttons, and shows a warning Alert. The ref API still works.

To keep specific fields editable while the rest of the form is locked, set `alwaysEditable: true` on the field — it overrides the form-level `readOnly`:

```jsx
<FormBuilder
  fields={[
    { name: "owner", label: "Owner", type: "text" },
    { name: "internalNote", label: "Internal note", type: "textarea", alwaysEditable: true },
  ]}
  readOnly
/>
```

## Async Validation

![Async Validation & Side Effects](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/async-validation-side-effects.png)

`validate` and entries in `validators` can return a Promise. The field shows a loading indicator while validation runs:

```jsx
{
  name: "email",
  type: "text",
  label: "Email",
  validate: async (value, allValues, { signal }) => {
    const exists = await checkEmailExists(value, { signal });
    return exists ? "Email already in use" : true;
  },
  validateDebounce: 500, // debounce async calls (ms)
}
```

Async validators run after sync validators pass. Pending requests are versioned and prior requests are aborted when supported (`signal`).
Validation gates (`submit`, `next step`) also trigger async validators for untouched visible fields before proceeding.

## Conditional Required

`required` can be a function:

```jsx
{ name: "businessType", type: "multiselect", label: "Business Type",
  required: (values) => values.accountType === "business" }
```

## Value Transforms

### Per-Field Transforms (`transformIn` / `transformOut`)

When storage format differs from display format, use per-field transforms to bridge the gap:

```jsx
const fields = [
  {
    name: "startTime",
    type: "text",
    label: "Start time",
    transformIn: (raw) => to12Hour(raw),     // "14:00" → "2:00 PM" (on load)
    transformOut: (display) => to24Hour(display), // "2:00 PM" → "14:00" (on save)
  },
  {
    name: "website",
    type: "text",
    label: "Website",
    transformIn: (url) => url?.replace(/^https?:\/\//, ""),  // strip protocol for display
    transformOut: (handle) => handle ? `https://${handle}` : "", // add protocol for storage
  },
  {
    name: "isActive",
    type: "toggle",
    label: "Active",
    transformIn: (raw) => raw === "true",    // string → boolean
    transformOut: (val) => String(val),       // boolean → string
  },
];
```

`transformIn` runs once during initial value computation (storage → display). `transformOut` runs at submit time before `transformValues` (display → storage). The form internally works with display values, so validation runs against the display format.

### Transform Initial Values

Reshape raw API data into the form's field structure on load:

```jsx
<FormBuilder
  initialValues={rawCrmProperties}
  transformInitialValues={(raw) => {
    const values = { ...raw };
    // Parse a JSON blob into individual fields
    const hours = JSON.parse(raw.business_hours || "[]");
    for (const entry of hours) {
      values[`hours_${entry.day}_start`] = entry.opensAt;
      values[`hours_${entry.day}_end`] = entry.closesAt;
    }
    return values;
  }}
  transformValues={(values) => {
    // Reverse: individual fields back to JSON for save
  }}
  fields={fields}
  onSubmit={save}
/>
```

Runs once in `computeInitialValues`, before per-field defaults and `transformIn`. Combined with `transformValues` for the save side, this creates a clean load ↔ save pipeline for API-backed forms.

### Transform Values (Submit)

Reshape the aggregate form values before submission:

```jsx
<FormBuilder
  fields={fields}
  transformValues={(values) => ({
    ...values,
    fullName: `${values.firstName} ${values.lastName}`.trim(),
  })}
  onSubmit={(transformedValues, { reset, rawValues }) => {
    await serverless("save", { parameters: transformedValues });
  }}
/>
```

### Success / Error Callbacks

```jsx
<FormBuilder
  onSubmit={saveRecord}
  onSubmitSuccess={(result, { reset, values }) => {
    actions.addAlert({ type: "success", message: "Saved!" });
  }}
  onSubmitError={(err, { values }) => {
    actions.addAlert({ type: "danger", message: err.message });
  }}
  resetOnSuccess={true}
/>
```

### Confirmation Before Submit

Intercept submit for review/confirmation:

```jsx
<FormBuilder
  onBeforeSubmit={async (values) => {
    return await showConfirmDialog(); // false cancels, true proceeds
  }}
  onSubmit={handleSubmit}
/>
```

## Field-Level Side Effects

Change handlers on field definitions that can update other fields:

```jsx
{
  name: "zip",
  type: "text",
  label: "ZIP Code",
  onFieldChange: async (value, allValues, { setFieldValue }) => {
    if (value.length === 5) {
      const geo = await lookupZip(value);
      setFieldValue("city", geo.city);
      setFieldValue("state", geo.state);
    }
  },
}
```

## Repeater Fields

![Repeater Fields](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/repeater-fields.png)

Add/remove rows for dynamic lists:

```jsx
{ name: "phones", type: "repeater", label: "Phone Numbers",
  fields: [
    { name: "number", type: "text", label: "Number" },
    { name: "type", type: "select", label: "Type", options: PHONE_TYPES },
  ],
  min: 1, max: 5 }
```

Repeater sub-fields now validate on blur/onChange like top-level fields. Pass `repeaterProps` on the repeater field to customize the add/remove/reorder controls:

| `repeaterProps` key | Type | Default | Description |
|---|---|---|---|
| `addLabel` | `string` | repeater add label | Text for the add-row control |
| `removeLabel` | `string` | repeater remove label | Text for the per-row remove control |
| `renderAdd` | `({ onClick, count }) => ReactNode` | — | Replace the default add control |
| `renderRemove` | `({ index, onClick }) => ReactNode` | — | Replace the default per-row remove control |
| `reorderable` | `boolean` | `false` | Enable up/down row reordering controls |
| `moveUpLabel` | `string` | `"Up"` | Label for the move-up control |
| `moveDownLabel` | `string` | `"Down"` | Label for the move-down control |
| `renderMoveUp` | `({ index, disabled, onClick }) => ReactNode` | — | Replace the move-up control. `disabled` is `true` on the first row |
| `renderMoveDown` | `({ index, disabled, onClick }) => ReactNode` | — | Replace the move-down control. `disabled` is `true` on the last row |

When `reorderable` is set, both move controls always render so rows stay column-aligned — the first row's "up" and the last row's "down" come through disabled (and the `disabled` flag is passed to `renderMoveUp` / `renderMoveDown`).

## Field Groups (Structured)

Fixed structured groups for patterns like weekly schedules, multi-address forms, or per-region settings. Unlike repeaters, items are predefined — no add/remove.

```jsx
const fields = [
  {
    name: "businessHours",
    type: "fieldGroup",
    label: "Business Hours",
    items: [
      { key: "monday", label: "Monday" },
      { key: "tuesday", label: "Tuesday" },
      { key: "wednesday", label: "Wednesday" },
      { key: "thursday", label: "Thursday" },
      { key: "friday", label: "Friday" },
    ],
    fields: (item) => [
      { name: `hours_${item.key}_start`, type: "text", label: "Start", placeholder: "9:00 AM" },
      { name: `hours_${item.key}_end`, type: "text", label: "End", placeholder: "5:00 PM" },
    ],
    showItemLabel: true, // render item.label as row header (default true)
  },
];
```

Each item's sub-fields get their own top-level form values (e.g. `hours_monday_start`, `hours_monday_end`), so they work with `initialValues`, validation, `transformIn`/`transformOut`, and `transformValues` like any other field.

## Custom Field Types

![Custom Field Types](https://raw.githubusercontent.com/05bmckay/hs-uix/main/packages/form/assets/custom-field-types.png)

Register custom renderers with full FormBuilder integration:

```jsx
<FormBuilder
  fieldTypes={{
    imageGallery: {
      render: ({ value, onChange, error, field }) => (
        <ImageGalleryInput urls={value} onUpdate={onChange} error={error} />
      ),
      getEmptyValue: () => [],
      isEmpty: (v) => v.length === 0,
    },
  }}
  fields={[
    { name: "photos", type: "imageGallery", label: "Photos", required: true },
  ]}
/>
```

Plugin renderers must use HubSpot components (`@hubspot/ui-extensions`).

## CRM Data Components

Embed native HubSpot CRM components directly in forms. These are hands-off -- HubSpot handles inline editing and auto-saving. No form value, no validation.

```jsx
// Current record's properties
{ name: "contactInfo", type: "crmPropertyList",
  properties: ["lastname", "email", "phone"],
  direction: "row" }

// Associated record's properties
{ name: "companyInfo", type: "crmAssociationPropertyList",
  objectTypeId: "0-2",
  properties: ["name", "domain", "city"] }
```

Works well in multi-step wizards where some steps capture new data via form fields and others display/edit existing CRM properties.

## CRM Prefill

Map CRM property values to form initial values with `useFormPrefill`.

**Direct pass-through** — when your field names match the CRM property names exactly, no mapping is needed:

```jsx
import { FormBuilder, useFormPrefill } from "hs-uix/form";
import { useCrmProperties } from "@hubspot/ui-extensions/crm";

const { properties } = useCrmProperties(["firstname", "lastname", "email"]);
const initialValues = useFormPrefill(properties);

<FormBuilder fields={fields} initialValues={initialValues} onSubmit={save} />
```

**Explicit mapping** — when your field names differ from CRM property names:

```jsx
const { properties } = useCrmProperties(["firstname", "lastname", "email"]);
const initialValues = useFormPrefill(properties, {
  firstName: "firstname",
  lastName: "lastname",
  email: "email",
});

<FormBuilder fields={fields} initialValues={initialValues} onSubmit={save} />
```

## Auto-Save

Debounced auto-save on field changes:

```jsx
<FormBuilder
  fields={fields}
  autoSave={{ debounce: 1000, onAutoSave: saveDraft }}
  onSubmit={save}
/>
```

Only fires when the form is dirty. Debounce defaults to 1000ms.

## Debounced Fields

Delay onChange for search-as-you-type fields:

```jsx
{ name: "search", type: "text", label: "Search", debounce: 300 }
```

## Server-Side Validation

Map API error responses to field errors via the ref API:

```jsx
try {
  await saveRecord(values);
} catch (err) {
  formRef.current.setErrors(err.errors);
  // err.errors = { email: "Already exists", phone: "Invalid format" }
}
```

## Props Reference

### FormBuilder Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `fields` | `FormBuilderField[]` | required | Field definitions |
| `onSubmit` | `(values, { reset }) => void \| Promise` | required | Called on valid submit |
| `initialValues` | `Record<string, unknown>` | `{}` | Starting values (uncontrolled) |
| `values` | `Record<string, unknown>` | - | Controlled values |
| `onChange` | `(values) => void` | - | Change callback (controlled) |
| `errors` | `Record<string, string>` | - | Controlled validation errors |
| `onFieldChange` | `(name, value, allValues) => void` | - | Per-field change |
| `validateOnChange` | `boolean` | `false` | Validate on keystroke |
| `validateOnBlur` | `boolean` | `true` | Validate on blur |
| `validateOnSubmit` | `boolean` | `true` | Validate all before submit |
| `onValidationChange` | `(errors) => void` | - | Validation state callback |
| `onValidationFail` | `({ errors, fields, firstInvalidField }) => void` | - | Called when submit-time validation blocks submission. `fields` and `firstInvalidField` carry `{ name, label, sectionId }` |
| `openSectionOnValidationFail` | `boolean` | `false` | Auto-open the accordion section containing the first invalid field on submit-time validation failure |
| `steps` | `FormBuilderStep[]` | - | Enables multi-step mode |
| `step` | `number` | - | Controlled step (0-based) |
| `onStepChange` | `(step) => void` | - | Step change callback |
| `showStepIndicator` | `boolean` | `true` | Show StepIndicator |
| `validateStepOnNext` | `boolean` | `true` | Validate before Next |
| `submitVariant` | `"primary" \| "secondary"` | `"primary"` | Button variant |
| `showCancel` | `boolean` | `false` | Show cancel button |
| `onCancel` | `() => void` | - | Cancel callback |
| `submitPosition` | `"bottom" \| "none"` | `"bottom"` | Button placement |
| `submitAlign` | `"start" \| "end" \| "between"` | auto | Default single-step button-row alignment. Defaults to `"between"` when `showCancel` is true, otherwise `"start"` |
| `loading` | `boolean` | - | Controlled loading state |
| `disabled` | `boolean` | `false` | Disable entire form |
| `labels` | `{ submit?, cancel?, back?, next? }` | - | Button label i18n object |
| `renderButtons` | `(context) => ReactNode` | - | Custom button-row renderer |
| `columns` | `number` | `1` | Fixed column count (Flex+Box grid) |
| `columnWidth` | `number` | - | AutoGrid responsive column width (px) |
| `maxColumns` | `number` | - | Cap on column count when `columnWidth` is set (AutoGrid mode) |
| `layout` | `FormBuilderLayout` | - | Explicit row layout |
| `groups` | `Record<string, FormBuilderGroupOptions>` | - | Per-group rendering options keyed by group name (`label`, `showLabel`, `showDivider`, `renderHeader`) |
| `gap` | `string` | `"sm"` | Spacing between fields. HubSpot tokens: `"flush" \| "extra-small" \| "small" \| "medium" \| "large" \| "extra-large"` (or shorthand `"xs" \| "sm" \| "md" \| "lg" \| "xl"`) |
| `showRequiredIndicator` | `boolean` | `true` | Show * on required fields |
| `noFormWrapper` | `boolean` | `false` | Skip `<Form>` wrapper |
| `autoComplete` | `string` | - | Form autoComplete attribute |
| `formProps` | `Record<string, unknown>` | - | Pass-through props to `<Form>` |
| `sections` | `FormBuilderSection[]` | - | Accordion field grouping |
| `fieldTypes` | `Record<string, FieldTypePlugin>` | - | Custom field type registry |
| `readOnly` | `boolean` | `false` | Lock all fields |
| `readOnlyMessage` | `string` | - | Warning alert in read-only mode |
| `showReadOnlyAlert` | `boolean` | `true` | Whether the read-only Alert banner renders above the form |
| `showInlineAlerts` | `boolean` | `true` | Whether form-level `error` / `success` / read-only Alerts render inline (disable if you pipe them through `alerts.addAlert` instead) |
| `renderReadOnlyAlert` | `({ title, message }) => ReactNode` | - | Custom renderer for the read-only alert |
| `renderFieldError` | `(error, field) => ReactNode` | - | Custom renderer for per-field validation errors |
| `alerts` | `{ addAlert?, readOnlyTitle?, errorTitle?, successTitle? }` | - | Grouped alert config |
| `error` | `string \| boolean` | - | Form-level error alert |
| `success` | `string` | - | Form-level success alert |
| `defaultCurrency` | `string` | `"USD"` | Form-level default ISO 4217 currency code for `currency` fields |
| `transformValues` | `(values) => values` | - | Reshape values before submit (after per-field `transformOut`) |
| `transformInitialValues` | `(rawValues) => values` | - | Reshape raw initial values on load (before per-field `transformIn`) |
| `onBeforeSubmit` | `(values) => boolean \| Promise` | - | Intercept submit |
| `onSubmitSuccess` | `(result, helpers) => void` | - | Post-submit success |
| `onSubmitError` | `(error, helpers) => void` | - | Post-submit error |
| `resetOnSuccess` | `boolean` | `false` | Auto-reset after success |
| `autoSave` | `{ debounce?, onAutoSave }` | - | Debounced auto-save |
| `onDirtyChange` | `(isDirty) => void` | - | Dirty state callback |
| `ref` | `Ref<FormBuilderRef>` | - | Imperative ref |

### Field Props

| Prop | Type | Applies To | Description |
|---|---|---|---|
| `name` | `string` | All | Unique field identifier |
| `type` | `FormBuilderFieldType` | All | Field type |
| `label` | `string` | All | Field label |
| `description` | `string` | All | Helper text |
| `placeholder` | `string` | Most | Placeholder text |
| `tooltip` | `string` | Most | Tooltip next to label |
| `required` | `boolean \| (values) => boolean` | All | Required validation (supports conditional) |
| `readOnly` | `boolean` | All | Prevent editing |
| `alwaysEditable` | `boolean` | All | Stay editable even when FormBuilder-level `readOnly` is set (per-field escape hatch) |
| `disabled` | `boolean \| (values) => boolean` | All | Disable this field (supports function for conditional disable) |
| `defaultValue` | `unknown` | All | Default value |
| `colSpan` | `number` | All | Columns to span (with `columns` prop) |
| `width` | `"full"` | All | Span all columns regardless of column count |
| `visible` | `(values) => boolean` | All | Conditional visibility |
| `dependsOnConfig` | `{ field, display?, label?, message? }` | All | Grouped dependent config alias |
| `validate` | `(value, allValues, context?) => true \| string \| Promise` | All | Custom validation (sync or async) |
| `validators` | `Array<(value, allValues, context?) => true \| string \| Promise>` | All | Additional custom validators (run before `validate`) |
| `useDefaultValidators` | `boolean` | All | Enable/disable built-in type/shape validation (default `true`) |
| `validateDebounce` | `number` | All | Debounce async validation (ms) |
| `debounce` | `number` | All | Debounce onChange callback (ms) |
| `loading` | `boolean` | All | Field-level loading indicator |
| `group` | `string` | All | Divider-based field grouping |
| `onFieldChange` | `(value, allValues, helpers) => void` | All | Cross-field side effects |
| `transformIn` | `(rawValue) => displayValue` | All | Storage → display transform (on load) |
| `transformOut` | `(displayValue) => rawValue` | All | Display → storage transform (on save) |
| `fields` | `Field[] \| (item) => Field[]` | repeater, fieldGroup | Sub-field definitions (array for repeater, function for fieldGroup) |
| `items` | `Array<{ key, label? }>` | fieldGroup | Predefined items to generate rows |
| `showItemLabel` | `boolean` | fieldGroup | Show item labels as row headers (default `true`) |
| `repeaterProps` | `RepeaterProps` | repeater | Repeater controls (labels, custom add/remove, reorder) |
| `pattern` | `RegExp` | text, textarea, password | Regex validation |
| `patternMessage` | `string` | text, textarea, password | Custom pattern error |
| `minLength` / `maxLength` | `number` | text, textarea | String length limits |
| `min` / `max` | `number \| DateValue \| TimeValue` | number, stepper, currency, date, time | Range limits |
| `minValidationMessage` / `maxValidationMessage` | `string` | date | Custom range error text |
| `options` | `Option[] \| (values) => Option[]` | select, multiselect, checkboxGroup, radioGroup | Dropdown/toggle options |
| `variant` | `string` | select, checkbox, checkboxGroup, radioGroup | Visual style |
| `inline` | `boolean` | checkbox, checkboxGroup, radioGroup | Horizontal layout |
| `currency` | `string` | currency | ISO 4217 code |
| `precision` | `number` | number, stepper, currency | Decimal places |
| `formatStyle` | `"decimal" \| "percentage"` | number, stepper | Number format |
| `stepSize` | `number` | stepper | Increment amount |
| `minValueReachedTooltip` / `maxValueReachedTooltip` | `string` | stepper | Boundary feedback |
| `rows` / `cols` | `number` | textarea | Visible dimensions |
| `resize` | `"vertical" \| "horizontal" \| "both" \| "none"` | textarea | Resize behavior |
| `size` | `"xs" \| "sm" \| "md"` | toggle | Toggle size |
| `labelDisplay` | `"inline" \| "top" \| "hidden"` | toggle | Label position |
| `textChecked` / `textUnchecked` | `string` | toggle | Custom ON/OFF text |
| `format` | `string` | date, datetime | Date display format |
| `timezone` | `"userTz" \| "portalTz"` | date, time, datetime | Timezone context |
| `interval` | `number` | time, datetime | Minutes between time options |
| `clearButtonLabel` / `todayButtonLabel` | `string` | date, datetime | Date picker button labels |
| `properties` | `string[]` | crmPropertyList, crmAssociationPropertyList | CRM property names to render |
| `direction` | `"column" \| "row"` | crmPropertyList, crmAssociationPropertyList | Layout direction passed to the native component |
| `objectId` | `string` | crmPropertyList | Override the CRM object ID (defaults to the current record) |
| `objectTypeId` | `string` | crmPropertyList, crmAssociationPropertyList | Object type ID (e.g. `"0-1"` contacts, `"0-2"` companies, `"0-3"` deals) |
| `associationLabels` | `string[]` | crmAssociationPropertyList | Limit to associations matching these labels |
| `filters` | `Array<{ operator, property, value }>` | crmAssociationPropertyList | Filter the associated records |
| `sort` | `Array<{ columnName, direction: 1 \| -1 }>` | crmAssociationPropertyList | Sort associated records |
| `render` | `(props) => ReactNode` | All | Custom render escape hatch. Helpers: `{ value, onChange, error, values, setFieldValue, setFieldError }`. (`allValues` is also passed but deprecated — use `values`.) |
| `fieldProps` | `Record<string, unknown>` | All | Pass-through to HubSpot component |

### Ref API

| Method | Returns | Description |
|---|---|---|
| `submit()` | `Promise<void>` | Trigger validation + submit |
| `validate()` | `{ valid, errors }` | Validate all visible fields |
| `reset()` | `void` | Reset to initial values |
| `getValues()` | `Record<string, unknown>` | Current form values |
| `isDirty()` | `boolean` | Whether values differ from initial |
| `setFieldValue(name, value)` | `void` | Set a field value programmatically |
| `setFieldError(name, message)` | `void` | Set a field error programmatically |
| `setErrors(errors)` | `void` | Batch set field errors (server-side validation) |

## Peer Dependencies

- `react` >= 18.0.0
- `@hubspot/ui-extensions` >= 0.12.0

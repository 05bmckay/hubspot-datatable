import type { ComponentType } from "react";
import type { DataTableProps, DataTableColumn } from "./packages/datatable/index";

export type AutoStatusTagVariant = "default" | "success" | "warning" | "danger" | "info";
export type AutoTagVariant = "default" | "success" | "warning" | "error" | "info";

export interface AutoTagSharedOptions<TVariant extends string> {
  overrides?: Record<string, TVariant>;
  fallback?: TVariant;
}

export interface AutoStatusTagOptions extends AutoTagSharedOptions<AutoStatusTagVariant> {}

export interface AutoTagOptions extends AutoTagSharedOptions<AutoTagVariant> {}

export interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
  locale?: string;
  currency?: string;
  maximumFractionDigits?: number;
}

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

export interface BuildOptionsConfig<Item> {
  labelKey?: keyof Item | string;
  valueKey?: keyof Item | string;
  descriptionKey?: keyof Item | string;
  mapLabel?: (item: Item) => unknown;
  mapValue?: (item: Item) => unknown;
  mapDescription?: (item: Item) => unknown;
}

export interface BuiltOption {
  label: unknown;
  value: unknown;
  description?: unknown;
}

export declare function getAutoTagVariant(value: unknown, options?: AutoTagOptions): AutoTagVariant;
export declare function getAutoStatusTagVariant(value: unknown, options?: AutoStatusTagOptions): AutoStatusTagVariant;
export declare function getAutoTagDisplayValue(value: unknown): unknown;

export interface StatusTagSortComparatorOptions extends AutoStatusTagOptions {
  variantOrder?: readonly string[];
  getLabel?: (value: unknown) => unknown;
}

export declare function createStatusTagSortComparator(
  options?: StatusTagSortComparatorOptions
): (aValue: unknown, bValue: unknown) => number;
export declare function buildCrmSearchConfig(params?: CrmSearchParams, options?: CrmSearchConfigOptions): Record<string, unknown>;
export declare function normalizeCrmSearchRecord<Row = Record<string, unknown>>(record: unknown, options?: CrmSearchNormalizeOptions<Row>): Row;
export declare function normalizeCrmSearchRows<Row = Record<string, unknown>>(response: unknown, options?: CrmSearchNormalizeOptions<Row>): Row[];
export declare function useCrmSearchDataSource<Row = Record<string, unknown>>(params?: CrmSearchParams, options?: CrmSearchConfigOptions<Row>): CrmSearchDataSource<Row>;
export declare function crmSearchResultToOption<Row = Record<string, unknown>>(row: Row, options?: CrmSearchOptionOptions<Row>): BuiltOption;
export declare function useCrmSearchOptions<Row = Record<string, unknown>>(params?: CrmSearchParams, options?: CrmSearchConfigOptions<Row> & CrmSearchOptionOptions<Row>): CrmSearchOptionsDataSource<Row>;
export declare function makeCrmSearchSelectField<Field = Record<string, unknown>>(field: Field, searchOptions: { options?: BuiltOption[]; loading?: boolean; isLoading?: boolean }): Field & CrmSearchFormField;
export declare function makeCrmSearchMultiSelectField<Field = Record<string, unknown>>(field: Field, searchOptions: { options?: BuiltOption[]; loading?: boolean; isLoading?: boolean }): Field & CrmSearchFormField;
export declare function resolveCrmObjectType(objectType: string): string;
export declare const CrmDataTable: ComponentType<CrmDataTableProps>;
export interface FormatCurrencyCompactOptions extends Intl.NumberFormatOptions {
  locale?: string;
  currency?: string;
  maximumFractionDigits?: number;
  compactDisplay?: "short" | "long";
}

export interface CrmSearchParams {
  search?: string;
  filters?: Record<string, unknown>;
  sort?: unknown;
  pageLength?: number;
  [key: string]: unknown;
}

export interface CrmSearchConfigOptions<Row = Record<string, unknown>> {
  objectType?: string;
  properties?: string[];
  query?: string;
  filterGroups?: Array<{ filters: Array<Record<string, unknown>> }>;
  sorts?: Array<Record<string, unknown>>;
  pageLength?: number;
  propertyMap?: Record<string, string>;
  filterMap?: (filters: Record<string, unknown>, params: CrmSearchParams) => Array<{ filters: Array<Record<string, unknown>> }> | undefined;
  sortMap?: (sort: unknown, params: CrmSearchParams) => Array<Record<string, unknown>> | undefined;
  baseConfig?: Record<string, unknown>;
  format?: Record<string, unknown>;
  row?: CrmSearchNormalizeOptions<Row>;
  rowIdField?: string;
  option?: CrmSearchOptionOptions<Row>;
  mapResponse?: (response: unknown) => Row[];
  totalCount?: number | ((response: unknown) => number);
  loading?: boolean | ((response: unknown) => boolean);
  error?: string | boolean | ((response: unknown) => string | boolean);
}

export interface CrmSearchNormalizeOptions<Row = Record<string, unknown>> {
  idField?: string;
  objectIdField?: string;
  propertiesKey?: string;
  flattenProperties?: boolean;
  propertyValueKey?: string;
  mapRecord?: (record: unknown) => Row;
}

export interface CrmSearchOptionOptions<Row = Record<string, unknown>> {
  label?: string | ((row: Row) => unknown);
  value?: string | ((row: Row) => unknown);
  description?: string | ((row: Row) => unknown);
  fallbackLabel?: string;
  mapOption?: (row: Row) => BuiltOption;
}

export interface CrmSearchDataSource<Row = Record<string, unknown>> {
  data: Row[];
  rows: Row[];
  response: unknown;
  loading: boolean;
  isLoading: boolean;
  error: string | boolean;
  totalCount: number;
  rowIdField: string;
}

export interface CrmSearchOptionsDataSource<Row = Record<string, unknown>> extends CrmSearchDataSource<Row> {
  options: BuiltOption[];
}

export interface CrmSearchFormField<Field = Record<string, unknown>> extends Record<string, unknown> {
  type: "select" | "multiselect";
  options: BuiltOption[];
  loading?: boolean;
}

export interface CrmDataTableProps<Row = Record<string, unknown>> extends Omit<DataTableProps<Row>, "data" | "loading" | "error" | "columns" | "searchValue" | "onParamsChange"> {
  objectType: "contact" | "contacts" | "company" | "companies" | "deal" | "deals" | string;
  properties?: string[];
  columns?: DataTableColumn<Row>[];
  pageLength?: number;
  serverSide?: boolean;
  filters?: DataTableProps<Row>["filters"];
  autoFilters?: boolean | string[] | { fields?: string[] };
  autoFilterMaxOptions?: number;
  filterMap?: CrmSearchConfigOptions<Row>["filterMap"];
  propertyMap?: Record<string, string>;
  sortMap?: CrmSearchConfigOptions<Row>["sortMap"];
  searchFields?: string[];
  format?: Record<string, unknown>;
  mapRecord?: (record: unknown) => Row;
  dataTableProps?: Partial<DataTableProps<Row>>;
}

export interface DeriveCardFieldsOptions<Row = Record<string, unknown>> {
  titleField?: string;
  titleHref?: (row: Row) => string | { url: string; external?: boolean };
  placements?: Record<string, "title" | "subtitle" | "meta" | "body" | "footer">;
  exclude?: string[];
  include?: string[];
  maxBodyFields?: number;
}

export interface DerivedCardField<Row = Record<string, unknown>> {
  key: string;
  field: string;
  placement: "title" | "subtitle" | "meta" | "body" | "footer";
  label?: unknown;
  render?: (value: unknown, row: Row) => unknown;
  truncate?: true | number | { maxLength?: number };
  href?: (row: Row) => string | { url: string; external?: boolean };
}

export declare function formatCurrency(value: unknown, options?: FormatCurrencyOptions): string;
export declare function formatCurrencyCompact(value: unknown, options?: FormatCurrencyCompactOptions): string;
export declare function formatDate(value: unknown, options?: FormatDateOptions): string;
export declare function formatDateTime(value: unknown, options?: FormatDateOptions): string;
export declare function formatPercentage(value: unknown, options?: Intl.NumberFormatOptions & { locale?: string }): string;
export declare function buildOptions<Item = Record<string, unknown>>(items: Item[] | null | undefined, config?: BuildOptionsConfig<Item>): BuiltOption[];
export declare function findOptionLabel(options: Array<{ label?: unknown; value?: unknown }> | null | undefined, value: unknown, fallback?: string): unknown;
export declare function isDateValueObject(value: unknown): boolean;
export declare function isTimeValueObject(value: unknown): boolean;
export declare function isDateTimeValueObject(value: unknown): boolean;
export declare function sumBy<Item = Record<string, unknown>>(items: Item[] | null | undefined, keyOrFn: keyof Item | ((item: Item) => unknown)): number;
export declare function deriveCardFieldsFromColumns<Row = Record<string, unknown>>(
  columns: ReadonlyArray<Record<string, unknown>> | null | undefined,
  options?: DeriveCardFieldsOptions<Row>
): DerivedCardField<Row>[];

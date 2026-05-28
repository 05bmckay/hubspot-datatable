import type { ReactNode } from "react";

export type FeedPlacement = "title" | "subtitle" | "meta" | "body" | "footer";
export type FeedFieldType = "text" | "tag" | "status";
export type FeedContainer = "none" | "tile" | "card";
export type FeedFilterType = "select" | "multiselect" | "dateRange";
export type FeedSortDirection = "asc" | "desc" | "ascending" | "descending";
export type FeedStatusVariant = "default" | "info" | "success" | "warning" | "danger";
export type FeedTagVariant = "default" | "info" | "success" | "warning" | "error";

export interface FeedOption<T = string | number | boolean> {
  label: string;
  value: T;
}

export interface FeedDateValue {
  year: number;
  month: number;
  date: number;
  formattedDate?: string;
}

export interface FeedDateRangeValue {
  from?: FeedDateValue | Date | string | null;
  to?: FeedDateValue | Date | string | null;
}

export interface FeedAction {
  key?: string;
  label: string;
  icon?: string;
  size?: "sm" | "small" | "md" | "medium";
  variant?: "primary" | "secondary" | "destructive" | "transparent";
  disabled?: boolean;
  href?: string | { url: string; external?: boolean };
  onClick?: (...args: unknown[]) => void;
}

export interface FeedActor {
  name?: ReactNode;
  label?: ReactNode;
  email?: ReactNode;
  avatar?: string;
  avatarUrl?: string;
  src?: string;
  initials?: string;
  href?: string | { url: string; external?: boolean };
}

export interface FeedItem {
  id?: string | number;
  key?: string | number;
  type?: string;
  typeLabel?: ReactNode;
  typeVariant?: FeedStatusVariant;
  title?: ReactNode;
  subject?: ReactNode;
  subtitle?: ReactNode;
  body?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  preview?: ReactNode;
  notePreview?: ReactNode;
  timestamp?: ReactNode;
  time?: ReactNode;
  date?: ReactNode;
  dateLabel?: ReactNode;
  createdAt?: ReactNode;
  actor?: ReactNode | FeedActor;
  actorName?: ReactNode;
  author?: ReactNode | FeedActor;
  avatar?: string;
  avatarAlt?: string;
  avatarSize?: string | number;
  icon?: ReactNode | string;
  iconName?: string;
  href?: string | { url: string; external?: boolean };
  meta?: ReactNode | ReactNode[];
  metadata?: ReactNode | ReactNode[];
  actions?: ReactNode | FeedAction[];
  footer?: ReactNode;
  [key: string]: unknown;
}

export interface FeedField<Row = FeedItem> {
  key?: string;
  field?: string | ((item: Row) => unknown);
  label?: string;
  placement?: FeedPlacement;
  type?: FeedFieldType;
  variant?: FeedTagVariant | FeedStatusVariant | ((value: unknown, item: Row) => string);
  href?: string | { url: string; external?: boolean } | ((item: Row) => string | { url: string; external?: boolean });
  visible?: (item: Row) => boolean;
  render?: (value: unknown, item: Row, index: number) => ReactNode;
}

export interface FeedFilterConfig<Row = FeedItem> {
  name: string;
  field?: string | ((item: Row) => unknown);
  type?: FeedFilterType;
  label?: string;
  placeholder?: string;
  variant?: "transparent" | "input";
  options?: FeedOption[];
  defaultValue?: unknown;
  includeAll?: boolean;
  allLabel?: string;
  fromLabel?: string;
  toLabel?: string;
  filterFn?: (item: Row, value: unknown) => boolean;
}

export interface FeedSortOption<Row = FeedItem> {
  value: string;
  label: string;
  field?: string | ((item: Row) => unknown);
  direction?: FeedSortDirection;
  comparator?: (a: Row, b: Row) => number;
}

export interface FeedLabels {
  search?: string;
  sort?: string;
  all?: string;
  clearAll?: string;
  dateFrom?: string;
  dateTo?: string;
  loading?: string;
  loadingMore?: string;
  loadMore?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  collapseAll?: string;
  expandAll?: string;
  errorTitle?: string;
  errorMessage?: string;
  itemCount?: (shown: number, total: number, label: string) => string;
}

export interface FeedTabOption<T = string | number | boolean> {
  label: string;
  value: T;
  disabled?: boolean;
  tooltip?: string;
}

export interface FeedParams {
  tab?: string | number | boolean | null;
  search: string;
  filters: Record<string, unknown>;
  sort: string | null;
}

export interface FeedToolbarRenderContext {
  tab?: string | number | boolean | null;
  tabs?: FeedTabOption[];
  search: string;
  filters: Record<string, unknown>;
  sort: string | null;
  totalCount: number;
  visibleCount: number;
  onTabChange: (value: string | number | boolean | null) => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (name: string, value: unknown) => void;
  onSortChange: (value: string | null) => void;
}

export interface FeedEmptyStateRenderContext {
  title: string;
  message: string;
}

export interface FeedLoadingStateRenderContext {
  label: string;
}

export interface FeedErrorStateRenderContext {
  error: string | boolean;
  title: string;
  message: string;
}

export interface FeedRecordLabel {
  singular?: string;
  plural?: string;
}

export interface FeedProps<Row = FeedItem> {
  items?: Row[];
  fields?: FeedField<Row>[];
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  error?: string | boolean | null;
  labels?: FeedLabels;
  renderItem?: (item: Row, index: number) => ReactNode;
  renderActor?: (item: Row, index: number) => ReactNode;
  renderTimestamp?: (item: Row, index: number) => ReactNode;
  renderMeta?: (item: Row, index: number) => ReactNode;
  renderActions?: (item: Row, index: number) => ReactNode;
  renderFooter?: (item: Row, index: number) => ReactNode;
  renderToolbar?: (ctx: FeedToolbarRenderContext) => ReactNode;
  renderEmptyState?: (ctx: FeedEmptyStateRenderContext) => ReactNode;
  renderLoadingState?: (ctx: FeedLoadingStateRenderContext) => ReactNode;
  renderErrorState?: (ctx: FeedErrorStateRenderContext) => ReactNode;
  getKey?: (item: Row, index: number) => string | number;
  groupBy?: string | ((item: Row) => unknown);
  groupByDate?: boolean;
  getGroupLabel?: (groupValue: unknown, firstItem: Row) => ReactNode;
  bordered?: boolean;
  container?: FeedContainer;
  showDividers?: boolean;
  itemContainer?: FeedContainer;
  compact?: boolean;
  gap?: string;
  avatarSize?: string | number;
  iconSize?: "sm" | "small" | "md" | "medium" | "lg" | "large";
  tabs?: FeedTabOption[];
  showTabs?: boolean;
  tabField?: string | ((item: Row) => unknown);
  tabVariant?: "default" | "enclosed";
  tabValue?: string | number | boolean | null;
  defaultTab?: string | number | boolean | null;
  onTabChange?: (value: string | number | boolean | null) => void;
  searchFields?: Array<string | ((item: Row) => unknown)>;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FeedFilterConfig<Row>[];
  filterValues?: Record<string, unknown>;
  defaultFilterValues?: Record<string, unknown>;
  onFilterChange?: (values: Record<string, unknown>) => void;
  sortOptions?: FeedSortOption<Row>[];
  sort?: string | null;
  defaultSort?: string | null;
  onSortChange?: (value: string | null) => void;
  onParamsChange?: (params: FeedParams) => void;
  serverSide?: boolean;
  showToolbar?: boolean;
  filterInlineLimit?: number;
  showItemCount?: boolean;
  itemCountText?: (shown: number, total: number) => string;
  recordLabel?: FeedRecordLabel;
  pageSize?: number;
  initialItemCount?: number;
  maxItems?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: (...args: unknown[]) => void;
  collapsible?: boolean | "auto";
  defaultCollapsed?: "all" | "none" | (string | number)[];
  collapsedIds?: (string | number)[];
  onCollapsedIdsChange?: (next: (string | number)[]) => void;
  showCollapseToggle?: boolean;
}

export declare function Feed<Row = FeedItem>(props: FeedProps<Row>): ReactNode;

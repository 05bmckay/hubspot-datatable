import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonRow,
  DateInput,
  DescriptionList,
  DescriptionListItem,
  Divider,
  EmptyState,
  Flex,
  Icon,
  Inline,
  Link,
  List,
  LoadingSpinner,
  MultiSelect,
  SearchInput,
  Select,
  StatusTag,
  Tab,
  Tabs,
  Tag,
  Text,
  Tile,
} from "@hubspot/ui-extensions";
import { AvatarStack } from "../../../src/common-components/AvatarStack.js";

const DEFAULT_LABELS = {
  search: "Search activity...",
  sort: "Sort",
  all: "All",
  clearAll: "Clear all",
  dateFrom: "From",
  dateTo: "To",
  loading: "Loading feed...",
  loadingMore: "Loading...",
  loadMore: "View more",
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  emptyTitle: "No activity yet",
  emptyMessage: "New activity will appear here.",
  errorTitle: "Something went wrong.",
  errorMessage: "An error occurred while loading the feed.",
  itemCount: (shown, total, label) => shown === total ? `${total} ${label}` : `${shown} of ${total} ${label}`,
  allItems: "All",
};

const DEFAULT_RECORD_LABEL = { singular: "item", plural: "items" };
const DEFAULT_SEARCH_FIELDS = ["title", "subject", "body", "description", "content", "preview", "type", "typeLabel", "actorName", "author"];
const DEFAULT_PAGE_SIZE = 5;

const hasValue = (value) => value != null && value !== false && value !== "";

const getItemKey = (item, index, getKey) => {
  if (typeof getKey === "function") return getKey(item, index);
  return item?.id ?? item?.key ?? `feed-item-${index}`;
};

const getValue = (item, field) => {
  if (typeof field === "function") return field(item);
  if (typeof field === "string") return item?.[field];
  return undefined;
};

const normalizeText = (value) => String(value ?? "").toLowerCase();
const pickTimestamp = (item) => item?.timestamp ?? item?.time ?? item?.date ?? item?.createdAt ?? item?.dateLabel;
const pickActor = (item) => item?.actor ?? item?.actorName ?? item?.author;
const pickActorName = (actor) => {
  if (!actor || typeof actor !== "object") return actor;
  return actor.name ?? actor.label ?? actor.email;
};
const pickActorAvatar = (actor) => {
  if (!actor || typeof actor !== "object") return null;
  return actor.avatar ?? actor.avatarUrl ?? actor.src ?? actor.initials ?? actor.name;
};
const pickBody = (item) => item?.body ?? item?.description ?? item?.content ?? item?.preview ?? item?.notePreview;
const pickHeaderActions = (item) => item?.headerActions;
const itemHasExpandableContent = (item, fields) => {
  if (item?.collapsible === false) return false;
  if (item?.collapsible === true) return true;
  if (hasValue(pickBody(item))) return true;
  if (hasValue(pickActor(item))) return true;
  if (hasValue(item?.actions)) return true;
  if (hasValue(item?.footer)) return true;
  if (hasValue(item?.meta) || hasValue(item?.metadata)) return true;
  if (Array.isArray(fields)) {
    if (fields.some((f) => ["body", "footer"].includes(f.placement ?? "body"))) return true;
  }
  return false;
};
const pickMeta = (item) => item?.meta ?? item?.metadata;
const pickType = (item) => item?.typeLabel ?? item?.type;
const pickStatus = (item) => item?.statusLabel ?? item?.status ?? item?.outcome ?? item?.severity;
const pickStatusVariant = (item) => item?.statusVariant ?? item?.outcomeVariant ?? item?.severityVariant ?? "default";

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "object" && value.year != null && value.month != null && value.date != null) {
    return new Date(value.year, value.month, value.date);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const compareValues = (a, b) => {
  const aDate = toDate(a);
  const bDate = toDate(b);
  if (aDate && bDate) return aDate.getTime() - bDate.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
};

const formatDateGroup = (value) => {
  if (!value) return "No date";
  const date = toDate(value);
  if (!date) return String(value);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

const formatTimestamp = (value) => {
  if (!value) return value;
  const date = toDate(value);
  if (!date) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const renderMaybe = (renderer, item, index) => {
  if (typeof renderer !== "function") return null;
  return renderer(item, index);
};

const isEmptyFilterValue = (value) => {
  if (value == null || value === "" || value === "all") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return !value.from && !value.to;
  return false;
};

const getFilterValue = (filterValues, filter) => {
  if (!filterValues) return filter.defaultValue;
  const value = filterValues[filter.name];
  return value === undefined ? filter.defaultValue : value;
};

const getRecordLabel = (recordLabel, count) => {
  const label = { ...DEFAULT_RECORD_LABEL, ...(recordLabel || {}) };
  return count === 1 ? label.singular : label.plural;
};

const FeedIcon = ({ name, size = "sm" }) => {
  if (!name) return null;
  return <Icon name={name} size={size} purpose="decorative" />;
};

const FeedActorAvatar = ({ item, avatarSize }) => {
  const actor = pickActor(item);
  const avatar = item?.avatar ?? pickActorAvatar(actor);
  if (!hasValue(avatar)) return null;
  return (
    <AvatarStack
      items={[avatar]}
      size={item.avatarSize ?? avatarSize}
      maxVisible={1}
      alt={item.avatarAlt ?? pickActorName(actor) ?? item.title ?? "Feed item avatar"}
    />
  );
};

const FeedTypeIcon = ({ item, iconSize }) => {
  if (hasValue(item?.icon) && typeof item.icon !== "string") return item.icon;
  const iconName = typeof item?.icon === "string" ? item.icon : item?.iconName;
  if (!hasValue(iconName)) return null;
  return <Icon name={iconName} size={iconSize} purpose="decorative" />;
};

const FeedActions = ({ actions }) => {
  if (!Array.isArray(actions) || actions.length === 0) return actions || null;

  return (
    <ButtonRow dropDownButtonOptions={{ text: "More", size: "small", variant: "transparent" }}>
      {actions.filter(Boolean).slice(0, 3).map((action, index) => (
        <Button
          key={action.key ?? action.label ?? `action-${index}`}
          size={action.size ?? "small"}
          variant={action.variant ?? "transparent"}
          disabled={action.disabled}
          href={action.href}
          onClick={action.onClick}
        >
          {action.icon ? <Icon name={action.icon} size={action.iconSize ?? "sm"} purpose="decorative" /> : null}
          {action.label}
        </Button>
      ))}
    </ButtonRow>
  );
};

const FeedField = ({ field, item, index }) => {
  if (!field) return null;
  if (field.visible && !field.visible(item)) return null;

  const value = getValue(item, field.field);
  const rendered = field.render ? field.render(value, item, index) : value;
  if (!hasValue(rendered)) return null;

  if (field.href) {
    const href = typeof field.href === "function" ? field.href(item) : field.href;
    return <Link href={href}>{rendered}</Link>;
  }

  if (field.type === "status") {
    const variant = typeof field.variant === "function" ? field.variant(value, item) : field.variant;
    return <StatusTag variant={variant ?? "default"}>{rendered}</StatusTag>;
  }

  if (field.type === "tag") {
    const variant = typeof field.variant === "function" ? field.variant(value, item) : field.variant;
    return <Tag variant={variant ?? "default"}>{rendered}</Tag>;
  }

  if (field.label) {
    return <DescriptionListItem label={field.label}>{rendered}</DescriptionListItem>;
  }

  return rendered;
};

const fieldsForPlacement = (fields, placement) =>
  Array.isArray(fields) ? fields.filter((field) => (field.placement ?? "body") === placement) : [];

const renderPlacedFields = ({ fields, placement, item, index, inline = false }) => {
  const placed = fieldsForPlacement(fields, placement);
  if (placed.length === 0) return null;

  const nodes = placed
    .map((field, fieldIndex) => (
      <FeedField
        key={field.key ?? field.field ?? `${placement}-${fieldIndex}`}
        field={field}
        item={item}
        index={index}
      />
    ))
    .filter(Boolean);

  if (nodes.length === 0) return null;
  if (inline) return <Inline gap="xs" align="center">{nodes}</Inline>;
  if (placed.some((field) => field.label)) return <DescriptionList direction="row">{nodes}</DescriptionList>;
  return <Flex direction="column" gap="xs">{nodes}</Flex>;
};

const renderHeaderActions = (headerActions) => {
  if (!hasValue(headerActions)) return null;
  if (!Array.isArray(headerActions)) return headerActions;
  return (
    <Inline gap="sm" align="center">
      {headerActions.filter(Boolean).map((action, index) => (
        <Link
          key={action.key ?? action.label ?? `header-action-${index}`}
          href={action.href}
          onClick={action.onClick}
        >
          {action.label}
        </Link>
      ))}
    </Inline>
  );
};

const DefaultFeedItem = ({
  item,
  index,
  fields,
  compact,
  avatarSize,
  iconSize,
  collapsible,
  expanded,
  onToggleExpanded,
  renderActor,
  renderTimestamp,
  renderMeta,
  renderActions,
  renderFooter,
}) => {
  const rawActor = pickActor(item);
  const actor = renderMaybe(renderActor, item, index) ?? pickActorName(rawActor);
  const timestamp = renderMaybe(renderTimestamp, item, index) ?? pickTimestamp(item);
  const meta = renderMaybe(renderMeta, item, index) ?? pickMeta(item);
  const type = pickType(item);
  const status = pickStatus(item);
  const statusVariant = pickStatusVariant(item);
  const actions = renderMaybe(renderActions, item, index) ?? item?.actions;
  const headerActions = pickHeaderActions(item);
  const footer = renderMaybe(renderFooter, item, index) ?? item?.footer;
  const body = pickBody(item);
  const avatar = <FeedActorAvatar item={item} avatarSize={avatarSize} />;
  const typeIcon = <FeedTypeIcon item={item} iconSize={iconSize} />;
  const hasAvatarNode = hasValue(item?.avatar) || hasValue(pickActorAvatar(rawActor));
  const titleFields = fieldsForPlacement(fields, "title");
  const titleField = titleFields.length > 0 ? <FeedField field={titleFields[0]} item={item} index={index} /> : null;
  const subtitleFields = renderPlacedFields({ fields, placement: "subtitle", item, index, inline: true });
  const metaFields = renderPlacedFields({ fields, placement: "meta", item, index, inline: true });
  const bodyFields = renderPlacedFields({ fields, placement: "body", item, index });
  const footerFields = renderPlacedFields({ fields, placement: "footer", item, index, inline: true });

  const titleContent = titleField ?? item?.title ?? item?.subject;
  const title = hasValue(item?.href) ? <Link href={item.href}>{titleContent}</Link> : titleContent;

  const headerLeft = (
    <Flex direction="row" align="center" gap="xs" wrap="nowrap">
      {collapsible ? (
        <Link onClick={onToggleExpanded}>
          <Icon name={expanded ? "downCarat" : "right"} size="sm" purpose="decorative" />
        </Link>
      ) : null}
      {typeIcon}
      {hasValue(title) && (
        <Text format={{ fontWeight: "demibold" }} truncate={true}>
          {title}
        </Text>
      )}
    </Flex>
  );

  const headerRight = (hasValue(headerActions) || hasValue(timestamp) || hasValue(type)) ? (
    <Inline gap="sm" align="center">
      {renderHeaderActions(headerActions)}
      {hasValue(type) && <Text variant="microcopy">{type}</Text>}
      {hasValue(timestamp) && (
        <Text variant="microcopy">{formatTimestamp(timestamp)}</Text>
      )}
    </Inline>
  ) : null;

  const showBody = !collapsible || expanded;

  return (
    <Flex direction="column" gap={compact ? "xs" : "sm"}>
      <Flex direction="row" justify="between" align="center" gap="sm" wrap="nowrap">
        <Box flex={1}>{headerLeft}</Box>
        {headerRight}
      </Flex>

      {showBody ? (
        <Flex direction="column" gap={compact ? "xs" : "sm"}>
          {(hasAvatarNode || hasValue(actor) || hasValue(subtitleFields) || hasValue(status)) && (
            <Flex direction="row" align="center" gap="xs" wrap="wrap">
              {hasAvatarNode ? avatar : null}
              {hasValue(actor) && <Text variant="microcopy">{actor}</Text>}
              {subtitleFields}
              {hasValue(status) && (
                <StatusTag variant={statusVariant} hollow>{status}</StatusTag>
              )}
            </Flex>
          )}

          {hasValue(body) && <Text>{body}</Text>}
          {bodyFields}

          {Array.isArray(meta) ? (
            meta.length > 0 ? <List variant="inline-divided">{meta}</List> : metaFields
          ) : hasValue(meta) ? (
            <Inline gap="xs">{meta}</Inline>
          ) : metaFields ? metaFields : null}

          {hasValue(actions) && <FeedActions actions={actions} />}
          {(hasValue(footer) || hasValue(footerFields)) && (
            <Inline gap="xs" align="center">
              {footerFields}
              {footer}
            </Inline>
          )}
        </Flex>
      ) : null}
    </Flex>
  );
};

const applyTab = (items, activeTab, tabField) => {
  if (!activeTab || activeTab === "all") return items;
  return items.filter((item) => String(getValue(item, tabField)) === String(activeTab));
};

const normalizeTabs = (tabs, items, tabField, labels) => {
  if (Array.isArray(tabs) && tabs.length > 0) return tabs;
  const values = [];
  items.forEach((item) => {
    const value = getValue(item, tabField);
    if (value != null && value !== "" && !values.some((v) => String(v) === String(value))) values.push(value);
  });
  return [
    { label: labels.allItems, value: "all" },
    ...values.map((value) => ({ label: String(value), value })),
  ];
};

const applySearch = (items, search, searchFields) => {
  const term = normalizeText(search).trim();
  if (!term) return items;
  const fields = Array.isArray(searchFields) && searchFields.length > 0 ? searchFields : DEFAULT_SEARCH_FIELDS;
  return items.filter((item) => fields.some((field) => {
    const value = field === "actor" || field === "author" ? pickActorName(getValue(item, field)) : getValue(item, field);
    return normalizeText(value).includes(term);
  }));
};

const applyFilters = (items, filters, filterValues) => {
  if (!Array.isArray(filters) || filters.length === 0) return items;

  return items.filter((item) => filters.every((filter) => {
    const value = getFilterValue(filterValues, filter);
    if (isEmptyFilterValue(value)) return true;
    if (typeof filter.filterFn === "function") return filter.filterFn(item, value);

    const itemValue = getValue(item, filter.field ?? filter.name);

    if (filter.type === "multiselect") {
      const selected = Array.isArray(value) ? value : [value];
      return selected.map(String).includes(String(itemValue));
    }

    if (filter.type === "dateRange") {
      const itemDate = toDate(itemValue);
      if (!itemDate) return false;
      const from = toDate(value.from);
      const to = toDate(value.to);
      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;
      return true;
    }

    return String(itemValue) === String(value);
  }));
};

const applySort = (items, sortValue, sortOptions) => {
  if (!sortValue || !Array.isArray(sortOptions) || sortOptions.length === 0) return items;
  const option = sortOptions.find((opt) => opt.value === sortValue);
  if (!option) return items;

  const sorted = [...items];
  sorted.sort((a, b) => {
    if (typeof option.comparator === "function") return option.comparator(a, b);
    const direction = option.direction === "desc" || option.direction === "descending" ? -1 : 1;
    return compareValues(getValue(a, option.field), getValue(b, option.field)) * direction;
  });
  return sorted;
};

const buildGroups = ({ items, groupBy, groupByDate, getGroupLabel }) => {
  if (!groupBy && !groupByDate) return [{ key: "__all__", label: null, items }];

  const groups = [];
  const groupMap = new Map();

  items.forEach((item) => {
    const rawKey = groupByDate ? formatDateGroup(pickTimestamp(item)) : getValue(item, groupBy);
    const key = rawKey == null ? "__empty__" : String(rawKey);
    const label = typeof getGroupLabel === "function" ? getGroupLabel(rawKey, item) : key === "__empty__" ? "Other" : key;

    if (!groupMap.has(key)) {
      const group = { key, label, items: [] };
      groupMap.set(key, group);
      groups.push(group);
    }

    groupMap.get(key).items.push(item);
  });

  return groups;
};

const FeedToolbar = ({
  labels,
  search,
  onSearch,
  showSearch,
  searchPlaceholder,
  filters,
  filterValues,
  onFilter,
  filterInlineLimit,
  sortOptions,
  sort,
  onSort,
  showItemCount,
  itemCountLabel,
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const inlineFilters = (filters || []).slice(0, filterInlineLimit);
  const overflowFilters = (filters || []).slice(filterInlineLimit);

  const renderFilterControl = (filter) => {
    const value = getFilterValue(filterValues, filter);

    if (filter.type === "multiselect") {
      return (
        <MultiSelect
          key={filter.name}
          name={`feed-filter-${filter.name}`}
          label=""
          placeholder={filter.placeholder || filter.label || labels.all}
          value={Array.isArray(value) ? value : []}
          options={filter.options || []}
          onChange={(next) => onFilter(filter.name, next)}
        />
      );
    }

    if (filter.type === "dateRange") {
      return (
        <Flex key={filter.name} direction="row" align="center" gap="xs">
          <DateInput
            label=""
            placeholder={filter.fromLabel ?? labels.dateFrom}
            name={`feed-filter-${filter.name}-from`}
            format="medium"
            value={value?.from ?? null}
            onChange={(next) => onFilter(filter.name, { ...(value || {}), from: next })}
          />
          <FeedIcon name="dataSync" size="sm" />
          <DateInput
            label=""
            placeholder={filter.toLabel ?? labels.dateTo}
            name={`feed-filter-${filter.name}-to`}
            format="medium"
            value={value?.to ?? null}
            onChange={(next) => onFilter(filter.name, { ...(value || {}), to: next })}
          />
        </Flex>
      );
    }

    const options = filter.includeAll === false
      ? (filter.options || [])
      : [{ label: filter.allLabel ?? filter.placeholder ?? filter.label ?? labels.all, value: "all" }, ...(filter.options || [])];

    return (
      <Select
        key={filter.name}
        name={`feed-filter-${filter.name}`}
        variant="transparent"
        placeholder={filter.placeholder || filter.label || labels.all}
        value={value ?? "all"}
        options={options}
        onChange={(next) => onFilter(filter.name, next)}
      />
    );
  };

  const hasLeftControls = showSearch || inlineFilters.length > 0 || overflowFilters.length > 0;
  const hasRightControls = (Array.isArray(sortOptions) && sortOptions.length > 0) || showItemCount;
  if (!hasLeftControls && !hasRightControls) return null;

  return (
    <Flex direction="row" gap="sm">
      <Box flex={3}>
        <Flex direction="column" gap="sm">
          {hasLeftControls ? (
            <Flex direction="row" align="center" gap="sm" wrap="wrap">
              {showSearch ? (
                <SearchInput
                  name="feed-search"
                  placeholder={searchPlaceholder ?? labels.search}
                  value={search}
                  clearable
                  onChange={onSearch}
                />
              ) : null}
              {inlineFilters.map(renderFilterControl)}
              {overflowFilters.length > 0 ? (
                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => setShowMoreFilters((prev) => !prev)}
                >
                  <Icon name="filter" size="sm" purpose="decorative" />
                  Filters
                </Button>
              ) : null}
            </Flex>
          ) : null}

          {showMoreFilters && overflowFilters.length > 0 ? (
            <Flex direction="row" align="center" gap="sm" wrap="wrap">
              {overflowFilters.map(renderFilterControl)}
            </Flex>
          ) : null}
        </Flex>
      </Box>

      {hasRightControls ? (
        <Box flex={1} alignSelf="start">
          <Flex direction="row" align="center" gap="sm" justify="end" wrap="wrap">
            {Array.isArray(sortOptions) && sortOptions.length > 0 ? (
              <Select
                name="feed-sort"
                value={sort ?? ""}
                variant="transparent"
                placeholder={labels.sort}
                options={[{ label: labels.sort, value: "" }, ...sortOptions.map((opt) => ({ label: opt.label, value: opt.value }))]}
                onChange={onSort}
              />
            ) : null}
            {showItemCount ? <Text variant="microcopy">{itemCountLabel}</Text> : null}
          </Flex>
        </Box>
      ) : null}
    </Flex>
  );
};

export const Feed = ({
  items = [],
  fields,
  title,
  description,
  actions,
  children,
  loading = false,
  error = null,
  labels: labelOverrides,
  renderItem,
  renderActor,
  renderTimestamp,
  renderMeta,
  renderActions,
  renderFooter,
  renderToolbar,
  renderEmptyState,
  renderLoadingState,
  renderErrorState,
  getKey,
  groupBy,
  groupByDate = false,
  getGroupLabel,
  bordered = true,
  container = bordered ? "tile" : "none",
  showDividers = true,
  itemContainer = "tile",
  compact = false,
  gap = "sm",
  avatarSize = "small",
  iconSize = "sm",
  tabs,
  showTabs,
  tabField = "type",
  tabVariant = "default",
  tabValue,
  defaultTab = "all",
  onTabChange,
  searchFields = DEFAULT_SEARCH_FIELDS,
  showSearch,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters = [],
  filterValues,
  defaultFilterValues = {},
  onFilterChange,
  sortOptions = [],
  sort,
  defaultSort = null,
  onSortChange,
  onParamsChange,
  serverSide = false,
  showToolbar = true,
  showItemCount = true,
  itemCountText,
  recordLabel,
  filterInlineLimit = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  initialItemCount,
  maxItems,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  collapsible = "auto",
  defaultCollapsed = "none",
  collapsedIds,
  onCollapsedIdsChange,
  showCollapseToggle = true,
}) => {
  const labels = { ...DEFAULT_LABELS, ...(labelOverrides || {}) };
  const safeItems = Array.isArray(items) ? items : [];

  const [internalTab, setInternalTab] = useState(tabValue ?? defaultTab ?? "all");
  const [internalSearch, setInternalSearch] = useState(searchValue ?? "");
  const [internalFilters, setInternalFilters] = useState(filterValues ?? defaultFilterValues);
  const [internalSort, setInternalSort] = useState(sort ?? defaultSort ?? null);
  const [visibleCount, setVisibleCount] = useState(initialItemCount ?? pageSize);

  const computeInitialCollapsed = () => {
    if (Array.isArray(collapsedIds)) return collapsedIds;
    if (Array.isArray(defaultCollapsed)) return defaultCollapsed;
    if (defaultCollapsed === "all") return safeItems.map((item, idx) => getItemKey(item, idx, getKey));
    return [];
  };
  const [internalCollapsedIds, setInternalCollapsedIds] = useState(computeInitialCollapsed);

  const activeTab = tabValue !== undefined ? tabValue : internalTab;
  const activeSearch = searchValue !== undefined ? searchValue : internalSearch;
  const activeFilters = filterValues !== undefined ? filterValues : internalFilters;
  const activeSort = sort !== undefined ? sort : internalSort;
  const activeCollapsedIds = Array.isArray(collapsedIds) ? collapsedIds : internalCollapsedIds;
  const resolvedShowSearch = showSearch ?? (Array.isArray(searchFields) && searchFields.length > 0);
  const resolvedMaxItems = maxItems ?? visibleCount;

  useEffect(() => {
    if (tabValue !== undefined) setInternalTab(tabValue);
  }, [tabValue]);

  useEffect(() => {
    if (searchValue !== undefined) setInternalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (filterValues !== undefined) setInternalFilters(filterValues);
  }, [filterValues]);

  useEffect(() => {
    if (sort !== undefined) setInternalSort(sort);
  }, [sort]);

  useEffect(() => {
    if (Array.isArray(collapsedIds)) setInternalCollapsedIds(collapsedIds);
  }, [collapsedIds]);

  const emitParamsChange = (next) => {
    if (typeof onParamsChange === "function") {
      onParamsChange({ tab: activeTab, search: activeSearch, filters: activeFilters, sort: activeSort, ...next });
    }
  };

  const handleTabChange = (next) => {
    if (tabValue === undefined) setInternalTab(next);
    setVisibleCount(initialItemCount ?? pageSize);
    onTabChange?.(next);
    emitParamsChange({ tab: next });
  };

  const handleSearchChange = (next) => {
    if (searchValue === undefined) setInternalSearch(next);
    setVisibleCount(initialItemCount ?? pageSize);
    onSearchChange?.(next);
    emitParamsChange({ search: next });
  };

  const handleFilterChange = (name, value) => {
    const nextFilters = { ...(activeFilters || {}), [name]: value };
    if (filterValues === undefined) setInternalFilters(nextFilters);
    setVisibleCount(initialItemCount ?? pageSize);
    onFilterChange?.(nextFilters);
    emitParamsChange({ filters: nextFilters });
  };

  const handleSortChange = (next) => {
    const nextSort = next || null;
    if (sort === undefined) setInternalSort(nextSort);
    setVisibleCount(initialItemCount ?? pageSize);
    onSortChange?.(nextSort);
    emitParamsChange({ sort: nextSort });
  };

  const setCollapsedIds = (next) => {
    if (collapsedIds === undefined) setInternalCollapsedIds(next);
    onCollapsedIdsChange?.(next);
  };

  const toggleItemExpanded = (key) => {
    const isCollapsed = activeCollapsedIds.includes(key);
    setCollapsedIds(isCollapsed ? activeCollapsedIds.filter((id) => id !== key) : [...activeCollapsedIds, key]);
  };

  const handleCollapseAll = () => {
    const collapsibleKeys = visibleItems
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => itemHasExpandableContent(item, fields))
      .map(({ item, idx }) => getItemKey(item, idx, getKey));
    setCollapsedIds(collapsibleKeys);
  };

  const handleExpandAll = () => setCollapsedIds([]);

  const processedItems = useMemo(() => {
    if (serverSide) return safeItems;
    const tabbed = applyTab(safeItems, activeTab, tabField);
    const searched = applySearch(tabbed, activeSearch, searchFields);
    const filtered = applyFilters(searched, filters, activeFilters);
    return applySort(filtered, activeSort, sortOptions);
  }, [safeItems, activeTab, tabField, activeSearch, searchFields, filters, activeFilters, activeSort, sortOptions, serverSide]);

  const visibleItems = useMemo(
    () => processedItems.slice(0, Math.max(0, resolvedMaxItems)),
    [processedItems, resolvedMaxItems]
  );

  const groups = useMemo(
    () => buildGroups({ items: visibleItems, groupBy, groupByDate, getGroupLabel }),
    [visibleItems, groupBy, groupByDate, getGroupLabel]
  );

  const totalCount = processedItems.length;
  const itemCountLabel = typeof itemCountText === "function"
    ? itemCountText(visibleItems.length, totalCount)
    : labels.itemCount(visibleItems.length, totalCount, getRecordLabel(recordLabel, totalCount));
  const canViewMore = visibleItems.length < processedItems.length;
  const shouldShowExternalLoadMore = hasMore && onLoadMore;

  const normalizedTabs = useMemo(
    () => normalizeTabs(tabs, safeItems, tabField, labels),
    [tabs, safeItems, tabField, labels]
  );
  const resolvedShowTabs = showTabs ?? normalizedTabs.length > 1;

  const toolbarNode = renderToolbar ? renderToolbar({
    tab: activeTab,
    tabs: normalizedTabs,
    search: activeSearch,
    filters: activeFilters,
    sort: activeSort,
    totalCount,
    visibleCount: visibleItems.length,
    onTabChange: handleTabChange,
    onSearchChange: handleSearchChange,
    onFilterChange: handleFilterChange,
    onSortChange: handleSortChange,
  }) : (
    showToolbar && !loading && !error ? (
      <FeedToolbar
        labels={labels}
        search={activeSearch}
        onSearch={handleSearchChange}
        showSearch={resolvedShowSearch}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        filterValues={activeFilters}
        onFilter={handleFilterChange}
        filterInlineLimit={filterInlineLimit}
        sortOptions={sortOptions}
        sort={activeSort}
        onSort={handleSortChange}
        showItemCount={showItemCount}
        itemCountLabel={itemCountLabel}
      />
    ) : null
  );

  const content = [];

  const collapsibleVisibleItems = visibleItems.filter((item) => itemHasExpandableContent(item, fields));
  const allCollapsed = collapsibleVisibleItems.length > 0 && collapsibleVisibleItems.every((item, idx) => {
    const i = visibleItems.indexOf(item);
    return activeCollapsedIds.includes(getItemKey(item, i >= 0 ? i : idx, getKey));
  });

  const collapseToggle = (showCollapseToggle && collapsibleVisibleItems.length > 1 && !loading && !error) ? (
    <Link onClick={allCollapsed ? handleExpandAll : handleCollapseAll}>
      {allCollapsed ? labels.expandAll : labels.collapseAll}
    </Link>
  ) : null;

  if (hasValue(title) || hasValue(description) || hasValue(actions) || hasValue(children) || collapseToggle) {
    const headerBody = (
      <Flex direction="column" gap="xs">
        {hasValue(title) && <Text format={{ fontWeight: "demibold" }}>{title}</Text>}
        {hasValue(description) && <Text>{description}</Text>}
        {children}
      </Flex>
    );

    const headerRight = (hasValue(actions) || collapseToggle) ? (
      <Inline gap="sm" align="center">
        {actions}
        {collapseToggle}
      </Inline>
    ) : null;

    content.push(
      <Flex key="header" direction="row" justify="between" align="start" gap="sm">
        {headerBody}
        {headerRight}
      </Flex>
    );
  }

  const bodyContent = [];

  if (toolbarNode) bodyContent.push(<React.Fragment key="toolbar">{toolbarNode}</React.Fragment>);

  if (loading) {
    bodyContent.push(
      renderLoadingState ? renderLoadingState({ label: labels.loading }) : (
        <LoadingSpinner key="loading" label={labels.loading} layout="centered" />
      )
    );
  } else if (error) {
    bodyContent.push(
      renderErrorState ? renderErrorState({
        error,
        title: typeof error === "string" ? error : labels.errorTitle,
        message: labels.errorMessage,
      }) : (
        <Alert key="error" variant="danger" title={typeof error === "string" ? error : labels.errorTitle}>
          <Text>{labels.errorMessage}</Text>
        </Alert>
      )
    );
  } else if (processedItems.length === 0) {
    bodyContent.push(
      renderEmptyState ? renderEmptyState({ title: labels.emptyTitle, message: labels.emptyMessage }) : (
        <EmptyState key="empty" title={labels.emptyTitle} layout="vertical">
          <Text>{labels.emptyMessage}</Text>
        </EmptyState>
      )
    );
  } else {
    bodyContent.push(
      <Flex key="items" direction="column" gap={compact ? "xs" : gap}>
        {groups.map((group) => (
          <Flex key={group.key} direction="column" gap={compact ? "xs" : gap}>
            {hasValue(group.label) && <Text format={{ fontWeight: "demibold" }}>{group.label}</Text>}
            {group.items.map((item, index) => {
              const globalIndex = safeItems.indexOf(item);
              const itemIndex = globalIndex >= 0 ? globalIndex : index;
              const key = getItemKey(item, itemIndex, getKey);
              const node = renderItem
                ? renderItem(item, itemIndex)
                : (
                  <DefaultFeedItem
                    item={item}
                    index={itemIndex}
                    fields={fields}
                    compact={compact}
                    avatarSize={avatarSize}
                    iconSize={iconSize}
                    collapsible={collapsible !== false && itemHasExpandableContent(item, fields)}
                    expanded={!activeCollapsedIds.includes(key)}
                    onToggleExpanded={() => toggleItemExpanded(key)}
                    renderActor={renderActor}
                    renderTimestamp={renderTimestamp}
                    renderMeta={renderMeta}
                    renderActions={renderActions}
                    renderFooter={renderFooter}
                  />
                );

              const wrappedNode = itemContainer === "card" || itemContainer === "tile"
                ? <Tile compact>{node}</Tile>
                : node;

              return (
                <React.Fragment key={key}>
                  {wrappedNode}
                  {showDividers && itemContainer === "none" && index < group.items.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </Flex>
        ))}
      </Flex>
    );

    if (canViewMore || shouldShowExternalLoadMore) {
      bodyContent.push(
        <Flex key="load-more" direction="row" justify="center">
          <Button
            onClick={shouldShowExternalLoadMore ? onLoadMore : () => setVisibleCount((count) => count + pageSize)}
            disabled={loadingMore}
            variant="transparent"
            size="sm"
          >
            {loadingMore ? labels.loadingMore : labels.loadMore}
          </Button>
        </Flex>
      );
    }
  }

  if (resolvedShowTabs && !loading && !error) {
    content.push(
      <Tabs
        key="tabs"
        selected={activeTab ?? "all"}
        onSelectedChange={handleTabChange}
        variant={tabVariant}
      >
        {normalizedTabs.map((tab) => (
          <Tab key={tab.value} tabId={tab.value} title={String(tab.label)} disabled={tab.disabled} tooltip={tab.tooltip}>
            <Flex direction="column" gap={compact ? "xs" : gap}>
              {String(tab.value) === String(activeTab ?? "all") ? bodyContent : null}
            </Flex>
          </Tab>
        ))}
      </Tabs>
    );
  } else {
    content.push(...bodyContent);
  }

  const feed = <Flex direction="column" gap={compact ? "xs" : gap}>{content}</Flex>;
  if (container === "card" || container === "tile") return <Tile compact>{feed}</Tile>;
  return feed;
};

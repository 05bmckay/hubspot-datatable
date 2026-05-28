import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Inline,
  Link,
  SearchInput,
  TableCell,
  TableRow,
  Text,
  hubspot,
} from "@hubspot/ui-extensions";
import { DataTable } from "hs-uix/datatable";
import { FormBuilder } from "hs-uix/form";
import { Kanban } from "hs-uix/kanban";
import {
  makeCrmSearchSelectField,
  useCrmSearchDataSource,
  useCrmSearchOptions,
} from "hs-uix/utils";

// Requires @hubspot/ui-extensions >=0.14.0 for useCrmSearch.
// This demo intentionally keeps the CRM hook outside hs-uix components:
// DataTable/Kanban/FormBuilder stay generic, while these adapters provide a
// small, copyable starting point for HubSpot CRM-backed search.

const CONTACT_PROPERTIES = ["firstname", "lastname", "email", "createdate", "lifecyclestage"];
const DEAL_PROPERTIES = ["dealname", "amount", "dealstage", "closedate"];
const COMPANY_PROPERTIES = ["name", "domain", "industry"];

const contactColumns = [
  {
    field: "name",
    label: "Name",
    sortable: true,
    renderCell: (_value, row) => `${row.firstname || ""} ${row.lastname || ""}`.trim() || "—",
  },
  { field: "email", label: "Email", sortable: true },
  { field: "lifecyclestage", label: "Lifecycle stage" },
  { field: "createdate", label: "Created", sortable: true },
];

const contactFilters = [
  {
    name: "lifecyclestage",
    label: "Lifecycle stage",
    placeholder: "Any stage",
    options: [
      { label: "Lead", value: "lead" },
      { label: "Subscriber", value: "subscriber" },
      { label: "Marketing qualified lead", value: "marketingqualifiedlead" },
      { label: "Customer", value: "customer" },
    ],
  },
];

const mapContactSort = (sort) => {
  const [field, direction] = Object.entries(sort || {})[0] || [];
  if (!field || !direction) return undefined;
  const propertyName = field === "name" ? "lastname" : field;
  return [{ propertyName, direction: direction === "descending" ? "DESCENDING" : "ASCENDING" }];
};

const mapContactFilters = (filters) => {
  if (!filters?.lifecyclestage) return undefined;
  return [{ filters: [{ propertyName: "lifecyclestage", operator: "EQ", value: filters.lifecyclestage }] }];
};

function ContactTableDemo() {
  const [params, setParams] = useState({ search: "", filters: {}, sort: {}, page: 1 });

  const contacts = useCrmSearchDataSource(params, {
    objectType: "0-1",
    properties: CONTACT_PROPERTIES,
    pageLength: 10,
    format: {
      propertiesToFormat: "all",
      formattingOptions: {
        dateTime: { format: "MM-DD-YYYY hh:mm", relative: false },
      },
    },
    filterMap: mapContactFilters,
    sortMap: mapContactSort,
    rowIdField: "objectId",
    row: {
      idField: "objectId",
      mapRecord: (record) => ({
        objectId: record.objectId,
        firstname: record.properties.firstname,
        lastname: record.properties.lastname,
        name: `${record.properties.firstname || ""} ${record.properties.lastname || ""}`.trim(),
        email: record.properties.email,
        lifecyclestage: record.properties.lifecyclestage,
        createdate: record.properties.createdate,
      }),
    },
  });

  const pagination = contacts.response?.pagination;

  return (
    <DataTable
      title="CRM contacts"
      serverSide
      loading={contacts.loading || contacts.response?.isRefetching}
      error={contacts.error}
      data={contacts.data}
      totalCount={contacts.totalCount}
      page={pagination?.currentPage || params.page}
      pageSize={pagination?.pageSize || 10}
      columns={contactColumns}
      searchFields={["firstname", "lastname", "email"]}
      searchValue={params.search}
      searchDebounce={300}
      filters={contactFilters}
      filterValues={params.filters}
      sort={params.sort}
      rowIdField="objectId"
      renderRow={(row) => (
        <TableRow key={row.objectId}>
          <TableCell>{row.name || "—"}</TableCell>
          <TableCell>{row.email || "—"}</TableCell>
          <TableCell>{row.lifecyclestage || "—"}</TableCell>
          <TableCell>{row.createdate || "—"}</TableCell>
        </TableRow>
      )}
      onParamsChange={(next) => {
        setParams((prev) => ({ ...prev, ...next }));
        if (next.page === 1) pagination?.reset?.();
      }}
      onPageChange={(page) => {
        setParams((prev) => ({ ...prev, page }));
        if (page > (pagination?.currentPage || 1)) pagination?.nextPage?.();
        else if (page < (pagination?.currentPage || 1)) pagination?.previousPage?.();
      }}
    />
  );
}

function DealKanbanDemo() {
  const [params, setParams] = useState({ search: "", filters: {} });
  const deals = useCrmSearchDataSource(params, {
    objectType: "0-3",
    properties: DEAL_PROPERTIES,
    pageLength: 100,
    format: {
      propertiesToFormat: "all",
      formattingOptions: { currency: { addSymbol: true }, date: { format: "MM-DD-YYYY" } },
    },
    rowIdField: "objectId",
    row: {
      mapRecord: (record) => ({ objectId: record.objectId, ...record.properties }),
    },
  });

  const stages = useMemo(() => {
    const values = [];
    for (const deal of deals.data || []) {
      if (deal.dealstage && !values.includes(deal.dealstage)) values.push(deal.dealstage);
    }
    return values.map((value, index) => ({ value, label: `CRM stage ${index + 1}`, shortLabel: `Stage ${index + 1}` }));
  }, [deals.data]);

  return (
    <Kanban
      title="CRM deals"
      data={deals.data}
      loading={deals.loading}
      error={deals.error}
      rowIdField="objectId"
      groupBy="dealstage"
      stages={stages}
      searchFields={["dealname"]}
      searchValue={params.search}
      filterValues={params.filters}
      onParamsChange={(next) => setParams((prev) => ({ ...prev, ...next }))}
      cardFields={[
        { field: "dealname", label: "Deal", placement: "title" },
        { field: "amount", label: "Amount", placement: "meta" },
        { field: "closedate", label: "Close date", placement: "body" },
      ]}
    />
  );
}

function FormCompanyLookupDemo() {
  const [query, setQuery] = useState("");
  const [values, setValues] = useState({ companyId: "" });
  const companyOptions = useCrmSearchOptions(
    { search: query },
    {
      objectType: "0-2",
      properties: COMPANY_PROPERTIES,
      pageLength: 20,
      rowIdField: "objectId",
      row: { mapRecord: (record) => ({ objectId: record.objectId, ...record.properties }) },
      option: {
        label: "name",
        value: "objectId",
        description: "domain",
      },
    }
  );

  const fields = useMemo(
    () => [
      makeCrmSearchSelectField(
        {
          name: "companyId",
          label: "Company result",
          placeholder: "Choose a matching company",
          description: "Options are backed by useCrmSearch.",
        },
        companyOptions
      ),
    ],
    [companyOptions]
  );

  return (
    <Flex direction="column" gap="sm">
      <SearchInput
        name="company-search"
        label="Search CRM companies"
        placeholder="Type a company name..."
        value={query}
        onInput={setQuery}
        onChange={setQuery}
        clearable
      />
      <FormBuilder
        title="CRM-backed form lookup"
        fields={fields}
        values={values}
        onChange={setValues}
        submitLabel="Use selected company"
        onSubmit={(submitted) => console.log("Submitted", submitted)}
      />
    </Flex>
  );
}

function CrmSearchDemo() {
  const [view, setView] = useState("table");

  return (
    <Flex direction="column" gap="medium">
      <Text format={{ fontWeight: "bold" }}>hs-uix + HubSpot useCrmSearch demo</Text>
      <Text>
        Try one pattern at a time: DataTable server-side search, Kanban CRM-backed cards, or FormBuilder
        search-backed select options.
      </Text>
      <Inline gap="sm">
        <Button variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}>Table</Button>
        <Button variant={view === "kanban" ? "primary" : "secondary"} onClick={() => setView("kanban")}>Kanban</Button>
        <Button variant={view === "form" ? "primary" : "secondary"} onClick={() => setView("form")}>Form</Button>
      </Inline>
      <Box>{view === "table" ? <ContactTableDemo /> : view === "kanban" ? <DealKanbanDemo /> : <FormCompanyLookupDemo />}</Box>
      <Text>
        Adapter source: <Link href="https://github.com/05bmckay/hs-uix">hs-uix/utils</Link>
      </Text>
    </Flex>
  );
}

hubspot.extend(() => <CrmSearchDemo />);

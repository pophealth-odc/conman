// RenewalTable.jsx
import { useMemo, useState } from 'react';
import RenewalRow from './RenewalRow.jsx';

const COLUMNS = [
  { key: 'renewalStatus', label: 'Status', sortable: true },
  { key: 'latestRemark', label: 'Latest Remark', sortable: false },
  { key: 'systemName', label: 'System', sortable: true },
  { key: 'primaryFA', label: 'Primary FA', sortable: true },
  { key: 'secondaryFA', label: 'Secondary FA', sortable: true },
  { key: 'manager', label: 'Manager', sortable: true },
  { key: 'poIssueDate', label: 'PO Issue Date', sortable: true },
  { key: 'poNumber', label: 'PO Number', sortable: true },
  { key: 'poAmount', label: 'PO Amount', sortable: true },
  { key: 'contractPeriodEnd', label: 'Contract Period', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

const STATUS_ORDER = { 'In Progress': 0, 'Not Started': 1, Completed: 2 };

export default function RenewalTable({
  items,
  onAddRemark,
  onStatusChange,
  onPOChange,
  onEdit,
  onDelete,
}) {
  const [sortKey, setSortKey] = useState('contractPeriodEnd');
  const [sortDir, setSortDir] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFA, setFilterFA] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [search, setSearch] = useState('');

  // Unique values for filter dropdowns
  const allFAs = useMemo(
    () => [...new Set(items.map((i) => i.primaryFA).filter(Boolean))].sort(),
    [items]
  );
  const allManagers = useMemo(
    () => [...new Set(items.map((i) => i.manager).filter(Boolean))].sort(),
    [items]
  );

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const processed = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterStatus) result = result.filter((i) => i.renewalStatus === filterStatus);
    if (filterFA) result = result.filter((i) => i.primaryFA === filterFA);
    if (filterManager) result = result.filter((i) => i.manager === filterManager);

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => {
        const haystack = [
          i.systemName,
          i.primaryFA,
          i.secondaryFA,
          i.manager,
          i.poNumber,
          ...i.remarkHistory.map((r) => r.text + ' ' + r.author),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'renewalStatus') {
        av = STATUS_ORDER[av] ?? 99;
        bv = STATUS_ORDER[bv] ?? 99;
      } else if (sortKey === 'poAmount') {
        av = av ?? -Infinity;
        bv = bv ?? -Infinity;
      } else {
        av = (av ?? '').toString().toLowerCase();
        bv = (bv ?? '').toString().toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, filterStatus, filterFA, filterManager, search, sortKey, sortDir]);

  function SortIcon({ col }) {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <span className="text-gray-300 ml-0.5">⇅</span>;
    return <span className="text-blue-500 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filter / Search Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search remarks, names, PO…"
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
        >
          <option value="">All Statuses</option>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        {/* Primary FA filter */}
        <select
          value={filterFA}
          onChange={(e) => setFilterFA(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
        >
          <option value="">All Primary FAs</option>
          {allFAs.map((fa) => <option key={fa}>{fa}</option>)}
        </select>

        {/* Manager filter */}
        <select
          value={filterManager}
          onChange={(e) => setFilterManager(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
        >
          <option value="">All Managers</option>
          {allManagers.map((m) => <option key={m}>{m}</option>)}
        </select>

        {(filterStatus || filterFA || filterManager || search) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterFA(''); setFilterManager(''); setSearch(''); }}
            className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
          >
            Clear ✕
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          {processed.length} of {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none border-b border-gray-200 ${
                    col.sortable ? 'cursor-pointer hover:text-gray-800' : ''
                  } whitespace-nowrap`}
                >
                  {col.label}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {processed.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-sm text-gray-400">
                  No items match the current filters.
                </td>
              </tr>
            ) : (
              processed.map((item) => (
                <RenewalRow
                  key={item.id}
                  item={item}
                  onAddRemark={onAddRemark}
                  onStatusChange={onStatusChange}
                  onPOChange={onPOChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

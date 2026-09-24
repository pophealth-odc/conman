// RenewalRow.jsx
import { useState } from 'react';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge.jsx';
import RemarkHistory from './RemarkHistory.jsx';
import AddRemarkForm from './AddRemarkForm.jsx';

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;

function formatCurrency(val) {
  if (val == null || val === '') return '—';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return '$' + n.toLocaleString('en-SG');
}

function EditableCell({ value, onChange, type = 'text', placeholder = '', validate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState('');

  function startEdit() {
    setDraft(value ?? '');
    setErr('');
    setEditing(true);
  }

  function commit() {
    if (validate) {
      const msg = validate(draft);
      if (msg) { setErr(msg); return; }
    }
    onChange(draft === '' ? null : draft);
    setEditing(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className={`text-xs border rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 ${
            err ? 'border-red-400' : 'border-blue-300'
          }`}
        />
        {err && <span className="text-[10px] text-red-500">{err}</span>}
      </div>
    );
  }

  return (
    <span
      onClick={startEdit}
      title="Click to edit"
      className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 text-xs text-gray-700 inline-block min-w-[40px]"
    >
      {value ?? <span className="text-gray-400 italic">—</span>}
    </span>
  );
}

export default function RenewalRow({ item, onAddRemark, onStatusChange, onPOChange, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const latestRemark = item.remarkHistory[0];
  const remarkPreview = latestRemark
    ? (latestRemark.text.length > 60
        ? latestRemark.text.slice(0, 60) + '…'
        : latestRemark.text)
    : <span className="text-gray-400 italic text-xs">No remarks</span>;

  function handleStatusChange(e) {
    const newStatus = e.target.value;
    onStatusChange(item.id, newStatus);
    setChangingStatus(false);
  }

  function handleAddRemark(remark) {
    onAddRemark(item.id, remark);
    setShowRemarkForm(false);
  }

  function validateDate(val) {
    if (val && !DATE_RE.test(val)) return 'DD/MM/YYYY';
    return '';
  }

  function validateAmount(val) {
    if (val && isNaN(Number(val))) return 'Numeric only';
    return '';
  }

  return (
    <>
      {/* Main Row */}
      <tr
        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${expanded ? 'bg-blue-50/30' : ''}`}
      >
        {/* Status */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          {changingStatus ? (
            <select
              autoFocus
              value={item.renewalStatus}
              onChange={handleStatusChange}
              onBlur={() => setChangingStatus(false)}
              className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {Object.keys(STATUS_CONFIG).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setChangingStatus(true)}
              title="Click to change status"
              className="focus:outline-none"
            >
              <StatusBadge status={item.renewalStatus} />
            </button>
          )}
        </td>

        {/* Latest Remark */}
        <td
          className="px-3 py-2.5 max-w-[220px] cursor-pointer"
          onClick={() => setExpanded((x) => !x)}
        >
          <div className="flex items-start gap-1.5">
            <span
              className={`mt-0.5 text-gray-400 text-xs transition-transform ${expanded ? 'rotate-90' : ''}`}
            >
              ▶
            </span>
            <div>
              {latestRemark && (
                <div className="text-[10px] text-gray-400 mb-0.5 font-mono">
                  {latestRemark.date}
                  {latestRemark.author ? ` · ${latestRemark.author}` : ''}
                </div>
              )}
              <span className="text-xs text-gray-700 leading-snug line-clamp-2">
                {remarkPreview}
              </span>
            </div>
          </div>
        </td>

        {/* System Name */}
        <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap max-w-[140px] truncate">
          {item.systemName}
        </td>

        {/* Primary FA */}
        <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{item.primaryFA}</td>

        {/* Secondary FA */}
        <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{item.secondaryFA}</td>

        {/* Manager */}
        <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{item.manager}</td>

        {/* PO Issue Date */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <EditableCell
            value={item.poIssueDate}
            placeholder="DD/MM/YYYY"
            validate={validateDate}
            onChange={(v) => onPOChange(item.id, { poIssueDate: v })}
          />
        </td>

        {/* PO Number */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <EditableCell
            value={item.poNumber}
            placeholder="PO-XXXX"
            onChange={(v) => onPOChange(item.id, { poNumber: v })}
          />
        </td>

        {/* PO Amount */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          {changingStatus ? null : (
            <EditableCell
              value={item.poAmount != null ? String(item.poAmount) : null}
              placeholder="0"
              validate={validateAmount}
              onChange={(v) => onPOChange(item.id, { poAmount: v === null ? null : Number(v) })}
            />
          )}
          {item.poAmount != null && !changingStatus && (
            <span className="ml-0 text-xs text-gray-500 hidden">{formatCurrency(item.poAmount)}</span>
          )}
          {!changingStatus && item.poAmount == null && null}
        </td>

        {/* Contract Period */}
        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
          {item.contractPeriodStart && item.contractPeriodEnd
            ? `${item.contractPeriodStart} → ${item.contractPeriodEnd}`
            : '—'}
        </td>

        {/* Actions */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(item)}
              className="text-[11px] px-2 py-0.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-[11px] px-2 py-0.5 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
            >
              Del
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Panel */}
      {expanded && (
        <tr className="bg-blue-50/20 border-b border-blue-100">
          <td colSpan={11} className="px-6 py-4">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Remark History
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({item.remarkHistory.length} {item.remarkHistory.length === 1 ? 'entry' : 'entries'}, newest first)
                  </span>
                </h3>
                <button
                  onClick={() => setShowRemarkForm((x) => !x)}
                  className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {showRemarkForm ? 'Cancel' : '+ Add Remark'}
                </button>
              </div>

              {showRemarkForm && (
                <AddRemarkForm
                  onAdd={handleAddRemark}
                  onCancel={() => setShowRemarkForm(false)}
                />
              )}

              <div className="mt-3">
                <RemarkHistory history={item.remarkHistory} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

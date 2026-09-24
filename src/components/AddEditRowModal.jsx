// AddEditRowModal.jsx — slide-over panel for adding or editing a full renewal row.
import { useEffect, useState } from 'react';

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const STATUSES = ['Not Started', 'In Progress', 'Completed'];

function todayDMY() {
  const d = new Date();
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
}

const EMPTY = {
  systemName: '',
  renewalStatus: 'Not Started',
  primaryFA: '',
  secondaryFA: '',
  manager: '',
  poIssueDate: '',
  poNumber: '',
  poAmount: '',
  contractPeriodStart: '',
  contractPeriodEnd: '',
};

export default function AddEditRowModal({ item, onSave, onClose }) {
  const isEdit = !!item;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setForm({
        systemName: item.systemName ?? '',
        renewalStatus: item.renewalStatus ?? 'Not Started',
        primaryFA: item.primaryFA ?? '',
        secondaryFA: item.secondaryFA ?? '',
        manager: item.manager ?? '',
        poIssueDate: item.poIssueDate ?? '',
        poNumber: item.poNumber ?? '',
        poAmount: item.poAmount != null ? String(item.poAmount) : '',
        contractPeriodStart: item.contractPeriodStart ?? '',
        contractPeriodEnd: item.contractPeriodEnd ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [item]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const e = {};
    if (!form.systemName.trim()) e.systemName = 'Required';
    if (!form.primaryFA.trim()) e.primaryFA = 'Required';
    if (!form.manager.trim()) e.manager = 'Required';
    if (form.poIssueDate && !DATE_RE.test(form.poIssueDate)) e.poIssueDate = 'DD/MM/YYYY';
    if (form.poAmount && isNaN(Number(form.poAmount))) e.poAmount = 'Numeric only';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      poIssueDate: form.poIssueDate || null,
      poNumber: form.poNumber || null,
      poAmount: form.poAmount !== '' ? Number(form.poAmount) : null,
    });
  }

  function Field({ label, field, placeholder = '', required = false, type = 'text' }) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={form[field]}
          onChange={set(field)}
          placeholder={placeholder}
          className={`text-sm border rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            errors[field] ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
      </div>
    );
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-40 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Edit Renewal Item' : 'Add Renewal Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-5 py-5 space-y-4">
          <Field label="System / Certificate Name" field="systemName" required placeholder="e.g. eSMF SSL Certificate" />

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Renewal Status</label>
            <select
              value={form.renewalStatus}
              onChange={set('renewalStatus')}
              className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Field label="Primary FA" field="primaryFA" required placeholder="Name (Org)" />
          <Field label="Secondary FA" field="secondaryFA" placeholder="Name (Org)" />
          <Field label="Manager" field="manager" required placeholder="Manager name" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contract Start" field="contractPeriodStart" placeholder="YYYY-MM-DD" />
            <Field label="Contract End" field="contractPeriodEnd" placeholder="YYYY-MM-DD" />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PO Details</p>
            <Field label="PO Issue Date" field="poIssueDate" placeholder="DD/MM/YYYY" />
            <Field label="PO Number" field="poNumber" placeholder="PO-XXXX-XXXX" />
            <Field label="PO Amount ($)" field="poAmount" placeholder="0" />
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

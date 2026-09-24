// App.jsx
import { useCallback, useEffect, useReducer, useState } from 'react';
import AddEditRowModal from './components/AddEditRowModal.jsx';
import RenewalTable from './components/RenewalTable.jsx';
import {
  addItem,
  addRemark,
  deleteItem,
  generateId,
  getItems,
  saveItems,
  updateItem,
  updatePO,
  updateStatus,
} from './dataService.js';

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm"
      role="alert"
    >
      <span className="text-green-400 text-base">✓</span>
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-gray-400 hover:text-white ml-2 text-base leading-none">
        ✕
      </button>
    </div>
  );
}

function todayDMY() {
  const d = new Date();
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
}

function addOneYear(dateStr) {
  // dateStr: YYYY-MM-DD
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [toast, setToast] = useState(null);
  const [modalItem, setModalItem] = useState(undefined); // undefined = closed, null = new, object = edit
  const [confirmDelete, setConfirmDelete] = useState(null); // id to delete

  // Load from storage on mount
  useEffect(() => {
    dispatch({ type: 'SET_ITEMS', payload: getItems() });
  }, []);

  function showToast(msg) {
    setToast(msg);
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddRemark = useCallback((id, remark) => {
    dispatch({ type: 'SET_ITEMS', payload: addRemark(state.items, id, remark) });
  }, [state.items]);

  const handleStatusChange = useCallback((id, newStatus) => {
    let items = updateStatus(state.items, id, newStatus);

    if (newStatus === 'Completed') {
      const source = items.find((i) => i.id === id);
      if (source) {
        const systemRemark = {
          date: todayDMY(),
          author: '',
          text: 'Automatically generated upon renewal completion, PLEASE VERIFY THE NEW DATES. You may overwrite this remark.',
          isSystemGenerated: true,
        };

        const newRow = {
          id: generateId(),
          systemName: source.systemName,
          renewalStatus: 'Not Started',
          remarkHistory: [systemRemark],
          primaryFA: source.primaryFA,
          secondaryFA: source.secondaryFA,
          manager: source.manager,
          poIssueDate: null,
          poNumber: null,
          poAmount: null,
          contractPeriodStart: addOneYear(source.contractPeriodStart),
          contractPeriodEnd: addOneYear(source.contractPeriodEnd),
        };

        items = addItem(items, newRow);
        showToast(
          `Renewal completed! A new row for the next contract period has been created for "${source.systemName}".`
        );
      }
    }

    dispatch({ type: 'SET_ITEMS', payload: items });
  }, [state.items]);

  const handlePOChange = useCallback((id, fields) => {
    dispatch({ type: 'SET_ITEMS', payload: updatePO(state.items, id, fields) });
  }, [state.items]);

  const handleEdit = useCallback((item) => {
    setModalItem(item);
  }, []);

  const handleDelete = useCallback((id) => {
    setConfirmDelete(id);
  }, []);

  function confirmDeleteAction() {
    const items = deleteItem(state.items, confirmDelete);
    dispatch({ type: 'SET_ITEMS', payload: items });
    setConfirmDelete(null);
  }

  function handleModalSave(formData) {
    if (modalItem === null) {
      // Add new
      const newItem = {
        ...formData,
        id: generateId(),
        remarkHistory: [],
      };
      dispatch({ type: 'SET_ITEMS', payload: addItem(state.items, newItem) });
      showToast('New renewal item added.');
    } else {
      // Edit existing
      dispatch({
        type: 'SET_ITEMS',
        payload: updateItem(state.items, modalItem.id, formData),
      });
      showToast('Item updated.');
    }
    setModalItem(undefined);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-lg p-1.5">
              {/* certificate icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Renewal Tracker</h1>
              <p className="text-xs text-gray-400">Certificate &amp; contract renewal management</p>
            </div>
          </div>
          <button
            onClick={() => setModalItem(null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Add Item
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2 flex gap-6 flex-wrap">
          {[
            { label: 'Total', count: state.items.length, color: 'text-gray-700' },
            { label: 'Not Started', count: state.items.filter((i) => i.renewalStatus === 'Not Started').length, color: 'text-gray-500' },
            { label: 'In Progress', count: state.items.filter((i) => i.renewalStatus === 'In Progress').length, color: 'text-amber-600' },
            { label: 'Completed', count: state.items.filter((i) => i.renewalStatus === 'Completed').length, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs">
              <span className={`font-bold text-sm ${s.color}`}>{s.count}</span>
              <span className="text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-5">
        <RenewalTable
          items={state.items}
          onAddRemark={handleAddRemark}
          onStatusChange={handleStatusChange}
          onPOChange={handlePOChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Modal */}
      {modalItem !== undefined && (
        <AddEditRowModal
          item={modalItem}
          onSave={handleModalSave}
          onClose={() => setModalItem(undefined)}
        />
      )}

      {/* Delete Confirm Dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Delete this item?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This action cannot be undone. The item and all its remark history will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

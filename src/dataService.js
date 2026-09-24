// dataService.js — mock data layer; swap internals for real API calls later.

const STORAGE_KEY = 'renewal_tracker_items';

function today() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const SEED_DATA = [
  {
    id: 'esmf-ssl-2022',
    systemName: 'eSMF SSL Certificate',
    renewalStatus: 'Completed',
    remarkHistory: [
      {
        date: '15/11/2022',
        author: 'Sim Keng Hwee',
        text: 'Certificate renewed and deployed to production. All services verified.',
        isSystemGenerated: false,
      },
      {
        date: '01/11/2022',
        author: 'Sim Keng Hwee',
        text: 'PO raised and approved. Awaiting vendor delivery.',
        isSystemGenerated: false,
      },
      {
        date: '10/10/2022',
        author: 'Sim Keng Hwee',
        text: 'Renewal initiated. Vendor contacted for quote.',
        isSystemGenerated: false,
      },
    ],
    primaryFA: 'Sim Keng Hwee (Synapxe)',
    secondaryFA: 'Tan Wei Ming (Synapxe)',
    manager: 'Lee Boon Huat',
    poIssueDate: '05/11/2022',
    poNumber: 'PO-2022-0447',
    poAmount: 12500,
    contractPeriodStart: '2022-11-15',
    contractPeriodEnd: '2023-11-14',
  },
  {
    id: 'esmf-ssl-2023',
    systemName: 'eSMF SSL Certificate',
    renewalStatus: 'Completed',
    remarkHistory: [
      {
        date: '12/11/2023',
        author: 'Sim Keng Hwee',
        text: 'Certificate renewed. Deployment completed without issues.',
        isSystemGenerated: false,
      },
      {
        date: '25/10/2023',
        author: 'Sim Keng Hwee',
        text: 'PO issued. Certificate generation in progress.',
        isSystemGenerated: false,
      },
      {
        date: '01/10/2023',
        author: 'Sim Keng Hwee',
        text: 'Started renewal process for FY2023/24.',
        isSystemGenerated: false,
      },
    ],
    primaryFA: 'Sim Keng Hwee (Synapxe)',
    secondaryFA: 'Tan Wei Ming (Synapxe)',
    manager: 'Lee Boon Huat',
    poIssueDate: '28/10/2023',
    poNumber: 'PO-2023-0512',
    poAmount: 13200,
    contractPeriodStart: '2023-11-15',
    contractPeriodEnd: '2024-11-14',
  },
  {
    id: 'esmf-ssl-2024',
    systemName: 'eSMF SSL Certificate',
    renewalStatus: 'In Progress',
    remarkHistory: [
      {
        date: '05/10/2024',
        author: 'Sim Keng Hwee',
        text: 'Vendor quote received. Pending finance approval.',
        isSystemGenerated: false,
      },
      {
        date: '15/09/2024',
        author: 'Sim Keng Hwee',
        text: 'Renewal process started. Vendor contacted.',
        isSystemGenerated: false,
      },
    ],
    primaryFA: 'Sim Keng Hwee (Synapxe)',
    secondaryFA: 'Tan Wei Ming (Synapxe)',
    manager: 'Lee Boon Huat',
    poIssueDate: null,
    poNumber: null,
    poAmount: null,
    contractPeriodStart: '2024-11-15',
    contractPeriodEnd: '2025-11-14',
  },
  {
    id: 'iam-cert-2024',
    systemName: 'IAM Service Certificate',
    renewalStatus: 'Not Started',
    remarkHistory: [
      {
        date: '01/08/2024',
        author: 'Ahmad Firdaus (Synapxe)',
        text: 'Certificate expires in Q1 2025. Renewal to be initiated in Oct 2024.',
        isSystemGenerated: false,
      },
    ],
    primaryFA: 'Ahmad Firdaus (Synapxe)',
    secondaryFA: 'Nurul Huda (Synapxe)',
    manager: 'Wong Chee Keong',
    poIssueDate: null,
    poNumber: null,
    poAmount: null,
    contractPeriodStart: '2024-02-01',
    contractPeriodEnd: '2025-01-31',
  },
  {
    id: 'api-gw-cert-2024',
    systemName: 'API Gateway TLS Certificate',
    renewalStatus: 'Not Started',
    remarkHistory: [],
    primaryFA: 'Priya Nair (Synapxe)',
    secondaryFA: 'Chen Jia Lin (Synapxe)',
    manager: 'Lee Boon Huat',
    poIssueDate: null,
    poNumber: null,
    poAmount: null,
    contractPeriodStart: '2024-06-01',
    contractPeriodEnd: '2025-05-31',
  },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return null;
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── Public API ──────────────────────────────────────────────────────────────

export function getItems() {
  const stored = load();
  if (stored) return stored;
  save(SEED_DATA);
  return SEED_DATA;
}

export function saveItems(items) {
  save(items);
  return items;
}

export function addRemark(items, id, remark) {
  const updated = items.map((item) =>
    item.id === id
      ? { ...item, remarkHistory: [remark, ...item.remarkHistory] }
      : item
  );
  save(updated);
  return updated;
}

export function updateStatus(items, id, newStatus) {
  const updated = items.map((item) =>
    item.id === id ? { ...item, renewalStatus: newStatus } : item
  );
  save(updated);
  return updated;
}

export function updatePO(items, id, poFields) {
  const updated = items.map((item) =>
    item.id === id ? { ...item, ...poFields } : item
  );
  save(updated);
  return updated;
}

export function addItem(items, newItem) {
  const updated = [...items, newItem];
  save(updated);
  return updated;
}

export function updateItem(items, id, fields) {
  const updated = items.map((item) =>
    item.id === id ? { ...item, ...fields } : item
  );
  save(updated);
  return updated;
}

export function deleteItem(items, id) {
  const updated = items.filter((item) => item.id !== id);
  save(updated);
  return updated;
}

export function generateId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

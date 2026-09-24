// StatusBadge.jsx
export const STATUS_CONFIG = {
  'Not Started': {
    label: 'Not Started',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    ring: 'ring-gray-300',
    dot: 'bg-gray-400',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-300',
    dot: 'bg-amber-400',
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-300',
    dot: 'bg-green-500',
  },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Not Started'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

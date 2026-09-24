// RemarkHistory.jsx
export default function RemarkHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No remarks yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {history.map((entry, idx) => (
        <li
          key={idx}
          className={`text-sm border-l-2 pl-3 ${
            entry.isSystemGenerated
              ? 'border-blue-300 bg-blue-50/60 rounded-r py-1 pr-2'
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-xs text-gray-500">
              {entry.date}
            </span>
            {entry.author && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs font-medium text-gray-600">
                  {entry.author}
                </span>
              </>
            )}
            {entry.isSystemGenerated && (
              <span className="ml-auto text-[10px] uppercase tracking-wide text-blue-500 font-semibold">
                System
              </span>
            )}
          </div>
          <p className="text-gray-700 leading-snug">{entry.text}</p>
        </li>
      ))}
    </ul>
  );
}

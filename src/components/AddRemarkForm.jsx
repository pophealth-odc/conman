// AddRemarkForm.jsx
import { useState } from 'react';

function todayDMY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;

export default function AddRemarkForm({ onAdd, onCancel }) {
  const [date, setDate] = useState(todayDMY());
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!DATE_RE.test(date)) e.date = 'Date must be DD/MM/YYYY';
    if (!text.trim()) e.text = 'Remark text is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onAdd({ date, author: author.trim(), text: text.trim(), isSystemGenerated: false });
    setDate(todayDMY());
    setAuthor('');
    setText('');
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mt-3">
      <h4 className="text-sm font-semibold text-gray-700">Add Remark</h4>
      <div className="flex gap-3 flex-wrap">
        {/* Date */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs font-medium text-gray-600">Date (DD/MM/YYYY)</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="DD/MM/YYYY"
            className={`text-sm border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.date ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
        </div>
        {/* Author */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-600">Author (optional)</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      {/* Remark text */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Remark</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Enter remark…"
          className={`text-sm border rounded px-2 py-1 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            errors.text ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.text && <p className="text-xs text-red-500">{errors.text}</p>}
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="text-sm px-4 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Add Remark
        </button>
      </div>
    </form>
  );
}

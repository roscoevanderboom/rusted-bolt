import React from "react";
import { Search, X } from "lucide-react";

interface XtermSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  className?: string;
}

const XtermSearchBar: React.FC<XtermSearchBarProps> = ({ value, onChange, onClose, className = "" }) => (
  <div className={`flex items-center gap-2 px-4 py-2 bg-stone-800 border-b border-stone-700/40 ${className}`}>
    <Search className="w-4 h-4 text-stone-400" />
    <input
      type="text"
      placeholder="Search terminal output..."
      className="flex-1 bg-transparent text-sm text-stone-200 placeholder-stone-500 outline-none"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
    <button
      onClick={onClose}
      className="p-1 text-stone-400 hover:text-stone-200 rounded"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

export default XtermSearchBar; 
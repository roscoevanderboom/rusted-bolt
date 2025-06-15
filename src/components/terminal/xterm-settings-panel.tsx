import React from "react";
import { TERMINAL_THEMES } from "@/constants/terminal-themes";

type ThemeName = keyof typeof TERMINAL_THEMES;

interface XtermSettingsPanelProps {
  currentTheme: ThemeName;
  fontSize: number;
  onThemeChange: (theme: ThemeName) => void;
  onFontSizeChange: (size: number) => void;
  className?: string;
}

const XtermSettingsPanel: React.FC<XtermSettingsPanelProps> = ({
  currentTheme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  className = "",
}) => (
  <div className={`px-4 py-3 bg-stone-800 border-b border-stone-700/40 space-y-3 ${className}`}>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-stone-300 mb-1">
          Theme
        </label>
        <select
          value={currentTheme}
          onChange={e => onThemeChange(e.target.value as ThemeName)}
          className="w-full px-2 py-1 text-xs bg-stone-900 border border-stone-600 rounded text-stone-200"
        >
          {Object.keys(TERMINAL_THEMES).map(theme => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-300 mb-1">
          Font Size
        </label>
        <input
          type="range"
          min="8"
          max="24"
          value={fontSize}
          onChange={e => onFontSizeChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-stone-400">{fontSize}px</span>
      </div>
    </div>
  </div>
);

export default XtermSettingsPanel; 
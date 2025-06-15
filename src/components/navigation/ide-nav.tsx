// ======================
// SUB-COMPONENTS

import { memo } from "react";
import { ModeToggle } from "../mode-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

// ======================
const NavigationBar = memo(
  ({
    time,
    idePanelOpen,
    onToggleIdePanel,
  }: {
    time: string;
    idePanelOpen: boolean;
    onToggleIdePanel: () => void;
  }) => (
    <nav className="flex items-center justify-between px-4 py-2 border-b border-stone-700/50 bg-stone-900/90 backdrop-blur-sm text-white shadow-lg">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold tracking-tight">Rusted Boltz</h1>
        <span className="text-xs text-stone-400 font-mono min-w-[70px] text-right">
          {time}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <button
          className="p-2 hover:bg-stone-800/70 rounded-lg transition-colors duration-200"
          onClick={onToggleIdePanel}
          title={idePanelOpen ? "Close IDE panel" : "Open IDE panel"}
          aria-label={idePanelOpen ? "Close IDE panel" : "Open IDE panel"}
        >
          {idePanelOpen ? (
            <PanelRightClose className="w-5 h-5" />
          ) : (
            <PanelRightOpen className="w-5 h-5" />
          )}
        </button>
      </div>
    </nav>
  )
);

NavigationBar.displayName = "NavigationBar";

export default NavigationBar;

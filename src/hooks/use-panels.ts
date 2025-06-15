import { useState } from "react";

export type PanelsState = {
  idePanelOpen: boolean;
  isFileTreeCollapsed: boolean;
  isConsoleCollapsed: boolean;
};

export function usePanels(initialState?: Partial<PanelsState>) {
  const [idePanelOpen, setIdePanelOpen] = useState(initialState?.idePanelOpen ?? false);
  const [isFileTreeCollapsed, setIsFileTreeCollapsed] = useState(
    initialState?.isFileTreeCollapsed ?? false
  );
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(
    initialState?.isConsoleCollapsed ?? false
  );

  // Handlers
  const toggleIdePanel = () => setIdePanelOpen((v) => !v);
  const toggleFileTree = () => setIsFileTreeCollapsed((v) => !v);
  const toggleConsole = () => setIsConsoleCollapsed((v) => !v);

  return {
    idePanelOpen,
    setIdePanelOpen,
    toggleIdePanel,
    isFileTreeCollapsed,
    setIsFileTreeCollapsed,
    toggleFileTree,
    isConsoleCollapsed,
    setIsConsoleCollapsed,
    toggleConsole,
  };
}

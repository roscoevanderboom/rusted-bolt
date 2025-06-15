// ======================
// THIRD-PARTY LIBRARIES
// ======================
import { WebContainer } from "@webcontainer/api";
import { memo, useMemo } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/sidebar";
import WebContainerHeader from "@/components/webcontainer/webcontainer-header";

import { useAppContext } from "@/App";
import { usePanels } from "@/hooks/use-panels";
import { useWebContainer } from "@/hooks/use-webcontainer";
import CodeEditor from "@/components/editor/code-editor";
import ChatComponent from "@/components/chat/chat";
import XtermTerminal from "@/components/terminal/xterm";
import { PANEL_CONSTRAINTS, PANEL_SIZES } from "@/constants/panel-sizes";
import NavigationBar from "@/components/navigation/ide-nav";
import EmptyFileState from "@/components/editor/empty-file-state";
import { WebcontainerFileNode } from "@/types/webcontainer";
import FileTree from "@/components/file-tree/filetree";

const FileTreePanel = memo(
  ({
    fileTree,
    setFileTree,
    setCurrentNode,
    currentNode,
    webcontainerInstance,
    setFilePath,
  }: {
    fileTree: WebcontainerFileNode[];
    setFileTree: React.Dispatch<React.SetStateAction<WebcontainerFileNode[]>>;
    setCurrentNode: React.Dispatch<
      React.SetStateAction<WebcontainerFileNode | null>
    >;
    currentNode: WebcontainerFileNode | null;
    webcontainerInstance: WebContainer;
    setFilePath: (path: string) => void;
  }) => (
    <ResizablePanel
      id="file-tree"
      order={1}
      defaultSize={PANEL_SIZES.FILE_TREE_DEFAULT}
      className="w-64 min-w-0 max-w-xs bg-stone-900/60 border-r border-stone-700/30 shadow-inner overflow-auto flex flex-col"
    >
      <FileTree
        fileTree={fileTree}
        setFileTree={setFileTree}
        currentNode={currentNode}
        setCurrentNode={setCurrentNode}
        webcontainerInstance={webcontainerInstance}
        setFilePath={setFilePath}
      />
    </ResizablePanel>
  )
);

FileTreePanel.displayName = "FileTreePanel";

const EditorPanel = memo(
  ({
    filePath,
    webcontainerInstance,
    fileTree,
  }: {
    filePath: string | null;
    webcontainerInstance: WebContainer;
    fileTree: WebcontainerFileNode[];
  }) => (
    <ResizablePanel
      id="editor-panel"
      order={1}
      defaultSize={PANEL_SIZES.EDITOR_DEFAULT}
      minSize={PANEL_CONSTRAINTS.EDITOR_MIN}
      className="min-h-0"
    >
      {filePath ? (
        <CodeEditor
          filePath={filePath}
          webcontainerInstance={webcontainerInstance}
          fileTree={fileTree}
        />
      ) : (
        <EmptyFileState />
      )}
    </ResizablePanel>
  )
);

EditorPanel.displayName = "EditorPanel";

const ConsolePanel = memo(
  ({ webcontainerInstance }: { webcontainerInstance: WebContainer }) => (
    <ResizablePanel
      id="console-panel"
      order={2}
      defaultSize={PANEL_SIZES.CONSOLE_DEFAULT}
      minSize={PANEL_CONSTRAINTS.CONSOLE_MIN}
      maxSize={PANEL_CONSTRAINTS.CONSOLE_MAX}
      className="overflow-hidden"
    >
      <div className="border-t border-stone-700/30 bg-stone-900/95 max-h-[60vh] min-h-[120px] h-full">
        <XtermTerminal webcontainerInstance={webcontainerInstance} />
      </div>
    </ResizablePanel>
  )
);

ConsolePanel.displayName = "ConsolePanel";

// ======================
// MAIN COMPONENT
// ======================
export default function IDE() {
  const { time, webcontainerInstance } = useAppContext();

  // Panels state
  const {
    idePanelOpen,
    toggleIdePanel,
    isFileTreeCollapsed,
    setIsFileTreeCollapsed,
    isConsoleCollapsed,
    setIsConsoleCollapsed,
  } = usePanels();

  // Centralized webcontainer state and helpers
  const { fileTree, setFileTree, currentNode, setCurrentNode, filePath, setFilePath, } =
    useWebContainer(webcontainerInstance);

  // Memoized panel sizes
  const chatPanelSize = useMemo(
    () => (idePanelOpen ? PANEL_SIZES.CHAT_DEFAULT : PANEL_SIZES.CHAT_FULL),
    [idePanelOpen]
  );

  const mainPanelSize = useMemo(
    () => (isFileTreeCollapsed ? PANEL_SIZES.FILE_TREE_COLLAPSED : 80),
    [isFileTreeCollapsed]
  );

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <div className="flex flex-col h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-stone-900 to-slate-800">
        <NavigationBar
          time={time}
          idePanelOpen={idePanelOpen}
          onToggleIdePanel={toggleIdePanel}
        />

        <ResizablePanelGroup direction="horizontal" className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
          <ResizablePanel
            defaultSize={chatPanelSize}
            minSize={PANEL_CONSTRAINTS.CHAT_MIN}
            maxSize={PANEL_CONSTRAINTS.CHAT_MAX}
            className="min-w-0 max-w-full flex flex-col"
          >
            <ChatComponent />
          </ResizablePanel>

          {idePanelOpen && <ResizableHandle withHandle />}

          {idePanelOpen && (
            <ResizablePanel
              defaultSize={PANEL_SIZES.IDE_DEFAULT}
              minSize={PANEL_CONSTRAINTS.IDE_MIN}
              className="min-w-0 max-w-full flex flex-col"
            >
              <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col">
                <WebContainerHeader
                  webcontainerInstance={webcontainerInstance}
                  isFileTreeCollapsed={isFileTreeCollapsed}
                  setIsFileTreeCollapsed={setIsFileTreeCollapsed}
                  isConsoleCollapsed={isConsoleCollapsed}
                  setIsConsoleCollapsed={setIsConsoleCollapsed}
                  currentNode={currentNode}
                />

                <ResizablePanelGroup direction="horizontal" className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
                  {!isFileTreeCollapsed && (
                    <>
                      <ResizablePanel
                        id="file-tree"
                        order={1}
                        defaultSize={PANEL_SIZES.FILE_TREE_DEFAULT}
                        className="min-w-0 max-w-xs w-64 bg-stone-900/60 border-r border-stone-700/30 shadow-inner overflow-auto flex flex-col"
                      >
                        <FileTree
                          fileTree={fileTree}
                          setFileTree={setFileTree}
                          currentNode={currentNode}
                          setCurrentNode={setCurrentNode}
                          webcontainerInstance={webcontainerInstance}
                          setFilePath={setFilePath}
                        />
                      </ResizablePanel>
                      <ResizableHandle withHandle id="file-tree-handle" />
                    </>
                  )}

                  <ResizablePanel
                    id="main"
                    order={2}
                    defaultSize={mainPanelSize}
                    className="flex-1 flex flex-col min-h-0 min-w-0 max-w-full"
                  >
                    <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0 min-w-0 max-w-full">
                      <EditorPanel
                        filePath={filePath}
                        webcontainerInstance={webcontainerInstance}
                        fileTree={fileTree}
                      />

                      {!isConsoleCollapsed && (
                        <>
                          <ResizableHandle />
                          <ConsolePanel
                            webcontainerInstance={webcontainerInstance}
                          />
                        </>
                      )}
                    </ResizablePanelGroup>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </SidebarProvider>
  );
}

import { FolderTreeIcon, Play, TerminalSquare } from "lucide-react";
import { WebContainer } from "@webcontainer/api";
import { WebcontainerFileNode } from "@/types/webcontainer";
import { useEffect, useState } from "react";
import ActionButton from "./webcontainer-action-button";

function getFolderPath(node: WebcontainerFileNode | null): string {
  if (!node) return "/";
  if (node.type === "directory") return node.path;
  // If file, use parent folder
  const segments = node.path.split("/");
  segments.pop();
  return segments.join("/") || "/";
}

const WebContainerHeader = ({
  webcontainerInstance,
  isFileTreeCollapsed,
  setIsFileTreeCollapsed,
  isConsoleCollapsed,
  setIsConsoleCollapsed,
  currentNode,
}: {
  webcontainerInstance: WebContainer | null;
  isFileTreeCollapsed: boolean;
  setIsFileTreeCollapsed: (isCollapsed: boolean) => void;
  isConsoleCollapsed: boolean;
  setIsConsoleCollapsed: (isCollapsed: boolean) => void;
  currentNode: WebcontainerFileNode | null;
}) => {
  const [runScript, setRunScript] = useState<{
    cmd: string;
    args: string[];
    reason: string;
  } | null>(null);

  useEffect(() => {
    if (!webcontainerInstance) return setRunScript(null);
    const checkRunnable = async () => {
      const folderPath = getFolderPath(currentNode);
      try {
        // Check for package.json
        const pkgPath =
          folderPath === "/" ? "/package.json" : `${folderPath}/package.json`;
        let pkgRaw = "";
        try {
          pkgRaw = await webcontainerInstance.fs.readFile(pkgPath, "utf8");
        } catch {
          setRunScript(null);
          return;
        }
        const pkg = JSON.parse(pkgRaw);
        if (!pkg.scripts) {
          setRunScript(null);
          return;
        }
        const scriptOrder = ["dev", "start", "serve", "preview"];
        const scriptName = scriptOrder.find((s) => pkg.scripts[s]);
        if (!scriptName) {
          setRunScript(null);
          return;
        }
        // Detect package manager
        let pm = "npm";
        const hasPnpm = await webcontainerInstance.fs
          .readFile(
            folderPath === "/"
              ? "/pnpm-lock.yaml"
              : `${folderPath}/pnpm-lock.yaml`,
            "utf8"
          )
          .then(
            () => true,
            () => false
          );
        const hasYarn = await webcontainerInstance.fs
          .readFile(
            folderPath === "/" ? "/yarn.lock" : `${folderPath}/yarn.lock`,
            "utf8"
          )
          .then(
            () => true,
            () => false
          );
        if (hasPnpm) pm = "pnpm";
        else if (hasYarn) pm = "yarn";
        // Build command
        let cmd = pm;
        let args: string[] = [];
        if (pm === "npm") args = ["run", scriptName];
        else if (pm === "pnpm") args = ["run", scriptName];
        else if (pm === "yarn") args = [scriptName];
        setRunScript({
          cmd,
          args,
          reason: `Found ${scriptName} script in package.json using ${pm}`,
        });
      } catch {
        setRunScript(null);
      }
    };
    checkRunnable();
  }, [webcontainerInstance, currentNode]);

  const handleStart = async () => {
    if (webcontainerInstance && runScript) {
      let process = await webcontainerInstance.spawn(
        runScript.cmd,
        runScript.args
      );
      process.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          },
        })
      );
    }
  };

  return (
    <div className="flex w-full items-center justify-between px-4 py-1 border-b border-stone-700/50 bg-stone-900/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg hover:bg-stone-800/70 transition-all"
          title="Collapse"
          onClick={() => setIsFileTreeCollapsed(!isFileTreeCollapsed)}
        >
          <FolderTreeIcon className="w-5 h-5 text-stone-400" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <ActionButton
          onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
          title={isConsoleCollapsed ? "Show Console" : "Hide Console"}
          icon={TerminalSquare}
          color="blue"
        />
        <ActionButton
          onClick={handleStart}
          title={runScript ? runScript.reason : "No runnable project found"}
          icon={Play}
          color="green"
          disabled={!runScript || !webcontainerInstance}
        />
      </div>
    </div>
  );
};
export default WebContainerHeader;

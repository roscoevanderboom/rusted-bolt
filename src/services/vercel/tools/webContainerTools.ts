import z from "zod";
import { WebContainer } from "@webcontainer/api";

// Map WebContainer instance to its process map
const processMapStore = new WeakMap<WebContainer, Record<string, any>>();

// Add logging utility
function logWebContainerActivity(message: string, data?: any) {
  if (data !== undefined) {
    console.log(`[WebContainerTools] ${message}`, data);
  } else {
    console.log(`[WebContainerTools] ${message}`);
  }
}

// Add at the top of the file, after imports
function normalizePath(filePath: string): string {
  let absPath = filePath.startsWith("/") ? filePath : "/" + filePath;
  absPath = absPath.replace(/\/+/g, "/"); // Remove duplicate slashes
  return absPath;
}

async function ensureParentDirs(fs: any, filePath: string) {
  const parent = filePath.substring(0, filePath.lastIndexOf("/")) || "/";
  try {
    await fs.mkdir(parent, { recursive: true });
  } catch (e) {
    // Ignore if already exists or error
  }
}

// Returns the webContainerTools object, given a webContainerInstance
export function getWebContainerTools(webContainerInstance: WebContainer) {
  return {
    read_root_directory: {
      description: "Read the contents of the root directory",
      parameters: z.object({}),
      execute: async () => {
        logWebContainerActivity("read_root_directory called");
        if (!webContainerInstance) {
          logWebContainerActivity(
            "read_root_directory: webContainerInstance is undefined",
          );
          return { error: "webContainerInstance is undefined" };
        }
        try {
          const result = await webContainerInstance.fs.readdir("/");
          logWebContainerActivity("read_root_directory result", result);
          return result;
        } catch (error) {
          logWebContainerActivity("read_root_directory error", error);
          console.log(error);
          return "Failed to read root directory";
        }
      },
    },
    read_directory: {
      description: "Read the contents of a directory",
      parameters: z.object({
        path: z.string().describe("The path to the directory"),
      }),
      execute: async ({ path }: { path: string }) => {
        logWebContainerActivity("read_directory called", { path });
        if (!webContainerInstance) {
          logWebContainerActivity(
            "read_directory: webContainerInstance is undefined",
          );
          return { error: "webContainerInstance is undefined" };
        }
        try {
          const result = await webContainerInstance.fs.readdir(path);
          logWebContainerActivity("read_directory result", result);
          return result;
        } catch (error) {
          logWebContainerActivity("read_directory error", error);
          console.log(error);
          return "Failed to read directory";
        }
      },
    },
    read_file: {
      description: "Read the contents of a file as text",
      parameters: z.object({
        path: z.string().describe("The path to the file"),
      }),
      execute: async ({ path }: { path: string }) => {
        logWebContainerActivity("read_file called", { path });
        if (!webContainerInstance) {
          logWebContainerActivity(
            "read_file: webContainerInstance is undefined",
          );
          return { error: "webContainerInstance is undefined" };
        }
        try {
          const result = await webContainerInstance.fs.readFile(path, "utf8");
          logWebContainerActivity("read_file result", result);
          return result;
        } catch (error) {
          logWebContainerActivity("read_file error", error);
          console.log(error);
          return "Failed to read file";
        }
      },
    },
    write_file: {
      description: "Write content to a file (overwrites if exists)",
      parameters: z.object({
        path: z.string().describe("The path to the file"),
        content: z.string().describe("The content to write"),
      }),
      execute: async (
        { path: filePath, content }: { path: string; content: string },
      ) => {
        logWebContainerActivity("write_file called", { filePath, content });
        if (!webContainerInstance) {
          logWebContainerActivity(
            "write_file: webContainerInstance is undefined",
          );
          return { error: "webContainerInstance is undefined" };
        }
        // Normalize path
        const absPath = normalizePath(filePath);
        try {
          await ensureParentDirs(webContainerInstance.fs, absPath);
          await webContainerInstance.fs.writeFile(absPath, content, "utf8");
          logWebContainerActivity("write_file success", { absPath });
          return { success: true };
        } catch (error) {
          logWebContainerActivity("write_file error", error);
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    append_file: {
      description: "Append content to a file",
      parameters: z.object({
        path: z.string().describe("The path to the file"),
        content: z.string().describe("The content to append"),
      }),
      execute: async ({ path, content }: { path: string; content: string }) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        try {
          let prev = "";
          try {
            prev = await webContainerInstance.fs.readFile(path, "utf8");
          } catch {}
          await webContainerInstance.fs.writeFile(path, prev + content, "utf8");
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    delete_file: {
      description: "Delete a file",
      parameters: z.object({
        path: z.string().describe("The path to the file"),
      }),
      execute: async ({ path }: { path: string }) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        if (!webContainerInstance.fs.rm) {
          return { error: "rm is not available on FileSystemAPI" };
        }
        try {
          await webContainerInstance.fs.rm(path);
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    move_file: {
      description: "Move (rename) a file or directory",
      parameters: z.object({
        from: z.string().describe("Source path"),
        to: z.string().describe("Destination path"),
      }),
      execute: async ({ from, to }: { from: string; to: string }) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        try {
          await webContainerInstance.fs.rename(from, to);
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    copy_file: {
      description: "Copy a file",
      parameters: z.object({
        from: z.string().describe("Source file path"),
        to: z.string().describe("Destination file path"),
      }),
      execute: async ({ from, to }: { from: string; to: string }) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        try {
          const content = await webContainerInstance.fs.readFile(from, "utf8");
          await webContainerInstance.fs.writeFile(to, content, "utf8");
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    exists: {
      description: "Check if a file or directory exists",
      parameters: z.object({
        path: z.string().describe("The path to check"),
      }),
      execute: async ({ path }: { path: string }) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        try {
          const parent = path.substring(0, path.lastIndexOf("/")) || "/";
          const name = path.split("/").pop() || "";
          const entries = await webContainerInstance.fs.readdir(parent);
          return { exists: !!entries && entries.includes(name) };
        } catch {
          return { exists: false };
        }
      },
    },
    mkdir: {
      description: "Create a directory",
      parameters: z.object({
        path: z.string().describe("The path to the directory"),
        recursive: z.boolean().optional().default(true),
      }),
      execute: async (
        { path, recursive }: { path: string; recursive?: boolean },
      ) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        try {
          if (recursive) {
            await webContainerInstance.fs.mkdir(path, { recursive: true });
          } else {
            await webContainerInstance.fs.mkdir(path);
          }
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    rmdir: {
      description: "Remove a directory",
      parameters: z.object({
        path: z.string().describe("The path to the directory"),
        recursive: z.boolean().optional().default(true),
      }),
      execute: async (
        { path, recursive }: { path: string; recursive?: boolean },
      ) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        if (!webContainerInstance.fs.rm) {
          return { error: "rm is not available on FileSystemAPI" };
        }
        try {
          await webContainerInstance.fs.rm(path, {
            recursive: recursive !== false,
          });
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    search_files: {
      description:
        "Search for files by name (case-insensitive substring match)",
      parameters: z.object({
        root: z.string().optional().default("/"),
        query: z.string().describe("The substring to search for in file names"),
      }),
      execute: async ({ root, query }: { root?: string; query: string }) => {
        if (!webContainerInstance) return [];
        async function walk(
          dir: string,
          results: string[] = [],
        ): Promise<string[]> {
          if (!webContainerInstance) return results;
          const entries = await webContainerInstance.fs.readdir(dir);
          for (const entry of entries) {
            const fullPath = dir.endsWith("/")
              ? dir + entry
              : dir + "/" + entry;
            if (entry.toLowerCase().includes(query.toLowerCase())) {
              results.push(fullPath);
            }
            if (!/\.[^/.]+$/.test(entry)) {
              try {
                results = await walk(fullPath, results);
              } catch {}
            }
          }
          return results;
        }
        try {
          const files = await walk(root || "/");
          return files;
        } catch (error) {
          console.log(error);
          return [];
        }
      },
    },
    search_content: {
      description: "Search for a string in all files (case-insensitive)",
      parameters: z.object({
        root: z.string().optional().default("/"),
        query: z.string().describe("The string to search for in file contents"),
      }),
      execute: async ({ root, query }: { root?: string; query: string }) => {
        if (!webContainerInstance) return [];
        async function walk(
          dir: string,
          results: string[] = [],
        ): Promise<string[]> {
          if (!webContainerInstance) return results;
          const entries = await webContainerInstance.fs.readdir(dir);
          for (const entry of entries) {
            const fullPath = dir.endsWith("/")
              ? dir + entry
              : dir + "/" + entry;
            if (/\.[^/.]+$/.test(entry)) {
              try {
                const content = await webContainerInstance.fs.readFile(
                  fullPath,
                  "utf8",
                );
                if (
                  content && content.toLowerCase().includes(query.toLowerCase())
                ) {
                  results.push(fullPath);
                }
              } catch {}
            } else {
              try {
                results = await walk(fullPath, results);
              } catch {}
            }
          }
          return results;
        }
        try {
          const files = await walk(root || "/");
          return files;
        } catch (error) {
          console.log(error);
          return [];
        }
      },
    },
    aggregate: {
      description:
        "Aggregate file and directory statistics recursively from a root directory",
      parameters: z.object({
        root: z.string().optional().default("/"),
      }),
      execute: async ({ root }: { root?: string }) => {
        if (!webContainerInstance) return { files: 0, dirs: 0, size: 0 };
        type AggStats = { files: number; dirs: number; size: number };
        async function walk(dir: string): Promise<AggStats> {
          if (!webContainerInstance) return { files: 0, dirs: 0, size: 0 };
          let stats: AggStats = { files: 0, dirs: 0, size: 0 };
          const entries = await webContainerInstance.fs.readdir(dir);
          for (const entry of entries) {
            const fullPath = dir.endsWith("/")
              ? dir + entry
              : dir + "/" + entry;
            if (/\.[^/.]+$/.test(entry)) {
              stats.files++;
            } else {
              stats.dirs++;
              const sub = await walk(fullPath);
              stats.files += sub.files;
              stats.dirs += sub.dirs;
              stats.size += sub.size;
            }
          }
          return stats;
        }
        try {
          const stats = await walk(root || "/");
          return stats;
        } catch (error) {
          console.log(error);
          return { files: 0, dirs: 0, size: 0 };
        }
      },
    },
    spawn_process: {
      description:
        "Spawn a process in the WebContainer (returns process id and output stream handle)",
      parameters: z.object({
        command: z.string().describe(
          "The command to run, e.g. 'npm' or 'yarn'",
        ),
        args: z.array(z.string()).optional().default([]).describe(
          "Arguments for the command",
        ),
        options: z
          .object({
            cwd: z.string().optional().describe(
              "Working directory for the process",
            ),
            env: z.record(z.union([z.string(), z.number(), z.boolean()]))
              .optional().describe("Environment variables for the process"),
            output: z.boolean().optional().describe(
              "Whether to enable output stream (default true)",
            ),
            terminal: z
              .object({
                cols: z.number().optional(),
                rows: z.number().optional(),
              })
              .optional()
              .describe("Terminal size options"),
          })
          .optional()
          .default({}),
      }),
      execute: async (
        { command, args = [], options = {} }: {
          command: string;
          args?: string[];
          options?: any;
        },
      ) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        try {
          const proc = await webContainerInstance.spawn(command, args, options);
          // Attach a unique id to the process for later control
          const procId = Math.random().toString(36).slice(2);
          let procMap = processMapStore.get(webContainerInstance);
          if (!procMap) {
            procMap = {};
            processMapStore.set(webContainerInstance, procMap);
          }
          procMap[procId] = proc;
          return {
            processId: procId,
            exit: proc.exit,
            output: proc.output,
          };
        } catch (error) {
          console.log(error);
          return {
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    kill_process: {
      description: "Kill a running process by processId",
      parameters: z.object({
        processId: z.string().describe(
          "The process id returned by spawn_process",
        ),
      }),
      execute: async ({ processId }: { processId: string }) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        const procMap = processMapStore.get(webContainerInstance);
        if (!procMap) return { error: "No process map found" };
        const proc = procMap[processId];
        if (!proc) return { error: "Process not found" };
        try {
          proc.kill();
          delete procMap[processId];
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
    resize_process: {
      description: "Resize the terminal for a running process (if attached)",
      parameters: z.object({
        processId: z.string().describe(
          "The process id returned by spawn_process",
        ),
        cols: z.number().describe("Number of columns for the terminal"),
        rows: z.number().describe("Number of rows for the terminal"),
      }),
      execute: async (
        { processId, cols, rows }: {
          processId: string;
          cols: number;
          rows: number;
        },
      ) => {
        if (!webContainerInstance) {
          return { error: "webContainerInstance is undefined" };
        }
        const procMap = processMapStore.get(webContainerInstance);
        if (!procMap) return { error: "No process map found" };
        const proc = procMap[processId];
        if (!proc) return { error: "Process not found" };
        try {
          proc.resize({ cols, rows });
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: (typeof error === "object" && error && "message" in error)
              ? (error as any).message
              : String(error),
          };
        }
      },
    },
  };
}

export default getWebContainerTools;

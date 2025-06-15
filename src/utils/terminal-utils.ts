import { WebContainerProcess } from "@webcontainer/api";

export const cleanOutput = (text: string): string =>
  text
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
    .replace(/\r/g, "")
    .replace(/\[1G\[0K[\\|/\-]/g, "")
    .replace(/[\\|/\-]+/g, "")
    .replace(/^(?:[\\|/\-])+$/gm, "")
    .replace(/\x1b/g, "")
    .replace(/\s+/g, " ")
    .trim();

export async function getProcessExitCode(process: WebContainerProcess): Promise<number> {
  return await process.exit;
}

export type TerminalMessage = {
  id: string;
  role: "user" | "system";
  content: string;
  status?: "running" | "done" | "error";
  process?: any;
};

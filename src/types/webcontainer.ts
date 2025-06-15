export interface WebcontainerFileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  content?: string;
  children?: WebcontainerFileNode[];
  lastModified?: number;
}

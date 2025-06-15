import { z } from "zod";
import { tool } from "ai";
import { invoke } from "@tauri-apps/api/core";
import { fs } from "@/services/tauri/fs";

export type FileInfo = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: string;
  created: string;
  is_hidden: boolean;
  file_type: string;
};

// This is a comment

const fsTool = {
  read_directory: tool({
    description: "Read the contents of a directory",
    parameters: z.object({
      path: z.string().describe("The path to the directory"),
    }),
    execute: async ({ path }) => {
      try {
        const result = await invoke<FileInfo[]>("read_directory", { path });
        return result;
      } catch (error) {
        console.log(error);
        return "Failed to read directory";
      }
    },
  }),
  read_text_file: tool({
    description: "Read the contents of a text file",
    parameters: z.object({
      path: z.string().describe("The path to the text file"),
    }),
    execute: async ({ path }) => {
      try {
        const text = await invoke<string>("read_text_file", { path });
        return {
          text,
          path,
        };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  read_file_metadata: tool({
    description: "Read the metadata of a file",
    parameters: z.object({
      path: z.string().describe("The path to the file"),
    }),
    execute: async ({ path }) => {
      try {
        const result = await fs.file_meta_data(path);
        const {
          atime,
          birthtime,
          mtime,
          size,
          isFile,
          isDirectory,
          isSymlink,
        } = result;
        return {
          atime,
          birthtime,
          mtime,
          size,
          isFile,
          isDirectory,
          isSymlink,
        };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  read_file: tool({
    description: "Read the contents of a file as binary (Uint8Array)",
    parameters: z.object({
      path: z.string().describe("The path to the file"),
    }),
    execute: async ({ path }) => {
      try {
        const data = await fs.read_file(path);
        // Convert Uint8Array to base64 for safe transport
        return Buffer.from(data).toString("base64");
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  read_long_text_file: tool({
    description:
      "Read a text file line by line and concatenate the result as a string (for large files)",
    parameters: z.object({
      path: z.string().describe("The path to the text file"),
    }),
    execute: async ({ path }) => {
      try {
        const text = await fs.read_long_text_file(path);
        return text;
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  delete_file: tool({
    description: "Delete a file at the specified path",
    parameters: z.object({
      path: z.string().describe("The path to the file to delete"),
    }),
    execute: async ({ path }) => {
      try {
        await fs.delete_file(path);
        return { success: true };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  file_exists: tool({
    description: "Check if a file exists at the specified path",
    parameters: z.object({
      path: z.string().describe("The path to the file"),
    }),
    execute: async ({ path }) => {
      try {
        const exists = await fs.file_exists(path);
        return { exists };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  copy_file: tool({
    description: "Copy a file from one path to another",
    parameters: z.object({
      fromPath: z.string().describe("Source file path"),
      toPath: z.string().describe("Destination file path"),
    }),
    execute: async ({ fromPath, toPath }) => {
      try {
        await fs.copy_file(fromPath, toPath);
        return { success: true };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  write_text_file: tool({
    description:
      "Write text contents to a file at the specified path (creates file if it does not exist)",
    parameters: z.object({
      path: z.string().describe("The path to the file"),
      contents: z.string().describe("Text content to write"),
    }),
    execute: async ({ path, contents }) => {
      try {
        await fs.write_text_file(path, contents);
        return { path, success: true };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  create_dir: tool({
    description: "Create a directory at the specified path",
    parameters: z.object({
      dirPath: z.string().describe("The path to the directory to create"),
    }),
    execute: async ({ dirPath }) => {
      try {
        const handle = await fs.create_dir(dirPath);
        return { success: true, handle };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
  create_file: tool({
    description: "Create a file at the specified path",
    parameters: z.object({
      path: z.string().describe("The path to the file to create"),
    }),
    execute: async ({ path }) => {
      try {
        const handle = await fs.create_file(path);
        return { success: true, handle };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  }),
};

export default fsTool;

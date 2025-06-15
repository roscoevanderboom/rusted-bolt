import {
  copyFile,
  create,
  DirEntry,
  exists,
  FileHandle,
  FileInfo,
  mkdir,
  readDir,
  readFile,
  readTextFile,
  readTextFileLines,
  remove,
  stat,
  writeTextFile,
  writeFile
} from "@tauri-apps/plugin-fs";
/**
 * File system service for interacting with the file system using Tauri
 */
export class FileSystemService {
  /**
   * Reads the contents of a text file as a string.
   * @param path Path to the file
   * @returns Promise resolving to the file contents as a string
   */
  static async read_text_file(path: string): Promise<string> {
    return await readTextFile(path);
  }

  /**
   * Reads the contents of a file as a Uint8Array (binary data).
   * @param path Path to the file
   * @returns Promise resolving to the file contents as a Uint8Array
   */
  static async read_file(path: string): Promise<Uint8Array> {
    return await readFile(path);
  }

  /**
   * Reads a text file line by line and concatenates the result as a string.
   * Useful for large files.
   * @param path Path to the file
   * @returns Promise resolving to the file contents as a string
   */
  static async read_long_text_file(path: string): Promise<string> {
    let result: string = "";
    const lines = await readTextFileLines(path);
    for await (const line of lines) {
      result += line;
    }
    return result;
  }

  /**
   * Deletes a file at the specified path.
   * @param path Path to the file
   * @returns Promise that resolves when the file is deleted
   */
  static async delete_file(path: string): Promise<void> {
    return await remove(path);
  }

  /**
   * Checks if a file exists at the specified path.
   * @param path Path to the file
   * @returns Promise resolving to true if the file exists, false otherwise
   */
  static async file_exists(path: string): Promise<boolean> {
    return await exists(path);
  }

  /**
   * Retrieves metadata for a file at the specified path.
   * @param path Path to the file
   * @returns Promise resolving to a FileInfo object
   */
  static async file_meta_data(path: string): Promise<FileInfo> {
    return await stat(path);
  }

  /**
   * Copies a file from one path to another.
   * @param fromPathBaseDir Source file path
   * @param toPathBaseDir Destination file path
   * @returns Promise that resolves when the file is copied
   */
  static async copy_file(
    fromPathBaseDir: string,
    toPathBaseDir: string,
  ): Promise<void> {
    return await copyFile(fromPathBaseDir, toPathBaseDir);
  }

  /**
   * Reads the contents of a directory.
   * @param path Path to the directory
   * @returns Promise resolving to an array of DirEntry objects
   */
  static async read_dir(path: string): Promise<DirEntry[]> {
    return await readDir(path);
  }

  /**
   * Writes text contents to a file at the specified path.
   * Creates the file if it does not exist.
   * @param path Path to the file
   * @param contents Text content to write
   * @returns Promise that resolves when the write is complete
   */
  static async write_text_file(path: string, contents: string): Promise<void> {
    return await writeTextFile(path, contents);
  }

  /**
   * Creates a directory at the specified path.
   * @param path Path to the directory
   * @returns Promise resolving to a FileHandle for the created directory
   */
  static async create_dir(path: string): Promise<void> {
    return await mkdir(path, { recursive: true });
  }

  /**
   * Creates a file at the specified path.
   * @param path Path to the file
   * @returns Promise resolving to a FileHandle for the created file
   */
  static async create_file(path: string): Promise<FileHandle> {
    return await create(path);
  }

  /**
   * Writes binary contents to a file at the specified path.
   * @param path Path to the file
   * @param contents Uint8Array binary content to write
   */
  static async create_binary(path: string, contents: Uint8Array): Promise<void> {
    return await writeFile(path, contents);
  }
}

// Export a singleton instance for convenience
export const fs = FileSystemService;

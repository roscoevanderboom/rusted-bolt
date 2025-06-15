import type { Model } from "@/types/chat";
import { FilePart, ImagePart, TextPart } from "ai";

export function getFilenameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || "file";
}

export function modelSupports(type: "image" | "audio" | "text", model: Model): boolean {
  return model.capabilities.includes(type);
}

export function filterAttachmentsByModel(
  attachments: Array<TextPart | ImagePart | FilePart>,
  model: Model
): Array<TextPart | ImagePart | FilePart> {
  const supportedTypes = model.capabilities;
  return attachments.filter((att) => {
    if (att.type === "image") return supportedTypes.includes("image");
    if (att.type === "file" && att.mimeType?.startsWith("audio/"))
      return supportedTypes.includes("audio");
    return true; // text and pdf assumed always supported
  });
}

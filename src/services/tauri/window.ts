import { getAllWindows, LogicalSize, Window } from "@tauri-apps/api/window";
import { toast } from "sonner";

async function getWindowByLabel(label: string) {
  const windows = await getAllWindows();
  return windows.find((window) => window.label === label);
}

async function controlWindow(
  label: string,
  action: "show" | "hide" | "minimize" | "maximize" | "close" | "setSize",
  args?: { width: number; height: number },
) {
  const window = await getWindowByLabel(label);
  if (!window) {
    toast.error(`Window with label ${label} not found`);
    const newWindow = new Window("browser");
    await newWindow.show();
    throw new Error(`Window with label ${label} not found`);
  }
  switch (action) {
    case "show":
      await window.show();
      break;
    case "hide":
      await window.hide();
      break;
    case "minimize":
      await window.minimize();
      break;
    case "maximize":
      await window.toggleMaximize();
      break;
    case "setSize":
      if (!args) {
        throw new Error("Width and height are required");
      }
      await window.setSize(new LogicalSize(args.width, args.height));
      break;
    default:
      break;
  }
}

export { controlWindow };

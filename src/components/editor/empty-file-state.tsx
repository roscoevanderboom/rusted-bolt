import { Folder } from "lucide-react";
import { memo } from "react";

const EmptyFileState = memo(() => (
  <div className="flex-1 flex items-center h-full justify-center bg-stone-900/30">
    <div className="text-center text-stone-500">
      <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium mb-2">No file selected</p>
      <p className="text-sm">
        Choose a file from the explorer to start editing
      </p>
    </div>
  </div>
));

EmptyFileState.displayName = "EmptyFileState";

export default EmptyFileState;

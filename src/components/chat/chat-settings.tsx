import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { WrenchIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";

interface ModelParams {
  temperature: number;
  systemPrompt: string;
}

interface ChatSettingsProps {
  modelParams: ModelParams;
  setModelParams: (params: ModelParams) => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ modelParams, setModelParams }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <WrenchIcon className="w-5 h-5 text-blue-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Temperature</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[modelParams.temperature]}
                onValueChange={([value]) => 
                  setModelParams({ ...modelParams, temperature: value })
                }
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-stone-400 w-12">
                {modelParams.temperature.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              value={modelParams.systemPrompt}
              onChange={(e) => 
                setModelParams({ ...modelParams, systemPrompt: e.target.value })
              }
              placeholder="Enter a custom system prompt..."
              className="min-h-[100px] resize-y"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSettings;

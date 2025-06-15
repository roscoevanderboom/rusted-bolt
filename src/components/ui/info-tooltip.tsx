import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  /**
   * The content to show in the tooltip
   */
  content: React.ReactNode;

  /**
   * Optional CSS class for the info icon
   */
  iconClassName?: string;

  /**
   * Optional size for the info icon (default: "3")
   */
  iconSize?: string | number;

  /**
   * Side where the tooltip should appear
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * Alignment of the tooltip
   */
  align?: "start" | "center" | "end";
}

/**
 * InfoTooltip component that displays an info icon with a hover tooltip
 */
export function InfoTooltip({
  content,
  iconClassName = "h-3 w-3 opacity-70",
  iconSize = "3",
  side = "top",
  align = "center",
}: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Info className={iconClassName} size={iconSize} />
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          {typeof content === "string"
            ? <p className="text-xs">{content}</p>
            : content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default InfoTooltip;

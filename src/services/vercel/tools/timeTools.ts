import { z } from "zod";
import { tool } from "ai";

const timeTools = {
  getCurrentTime: tool({
    description: "Get the current time",
    parameters: z.object({}),
    execute: async () => ({ time: new Date().toLocaleTimeString() }),
  }),
};

export default timeTools;

import { WebContainer } from "@webcontainer/api";
import { useState, useEffect } from "react";
import { Outlet, useLoaderData, useOutletContext } from "react-router";
import { toast } from "sonner";

export type AppContextType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  os: string;
  platform: string;
  time: string;
  appInfo: Record<string, any>;
  setAppInfo: (info: Record<string, any>) => void;
  webcontainerInstance: WebContainer;
};

let webcontainerInstance: WebContainer;

export const appLoader = async (): Promise<{
  webcontainerInstance: WebContainer;
}> => {
  if (!webcontainerInstance) {
    try {
      webcontainerInstance = await WebContainer.boot();
      await webcontainerInstance.mount({});
      // Add this where you initialize your app

      return { webcontainerInstance };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to install webcontainer: ${errorMessage}`);
      throw error;
    }
  }

  toast.info("Reusing existing WebContainer instance");
  return { webcontainerInstance };
};

function App() {
  const { webcontainerInstance } = useLoaderData<{
    webcontainerInstance: WebContainer;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [os, setOs] = useState("");
  const [platform, setPlatform] = useState("");
  const [time, setTime] = useState("");
  const [appInfo, setAppInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    setOs(window.navigator.platform || "unknown");
    setPlatform(window.navigator.platform || "unknown");
    const updateTime = () => setTime(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Outlet
      context={{
        isLoading,
        setIsLoading,
        os,
        platform,
        time,
        appInfo,
        setAppInfo,
        webcontainerInstance,
      }}
    />
  );
}

export default App;

export const useAppContext = () => {
  return useOutletContext<AppContextType>();
};

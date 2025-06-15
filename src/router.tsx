import { createBrowserRouter } from "react-router";
import App, { appLoader } from "./App";
import LoadingSpinner from "./components/loading";
import Landing from "./pages/landing";
import { CodeIcon, HomeIcon, SettingsIcon } from "lucide-react";
import IDE from "./pages/ide";
import Settings from "./pages/settings";
import CloudProviders from "./components/settings/cloud-providers";
import SettingsControlPanel from "./components/settings/settings-control-panel";
export const routerLinks = [
  {
    path: "/",
    title: "Landing",
    icon: <HomeIcon className="w-4 h-4" />,
  },
  {
    path: "/ide",
    title: "Ide",
    icon: <CodeIcon className="w-4 h-4" />,
  },
  {
    path: "/settings",
    title: "Settings",
    icon: <SettingsIcon className="w-4 h-4" />,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    hydrateFallbackElement: <LoadingSpinner />,
    loader: appLoader,
    children: [
      {
        index: true,
        path: "/",
        Component: Landing,
      },
      {
        path: "/ide",
        Component: IDE,
      },
      {
        path: "/settings",
        Component: Settings,
        children: [
          {
            index: true,
            path: "/settings",
            Component: SettingsControlPanel,
          },
          {
            path: "/settings/cloud-providers",
            Component: CloudProviders,
          },
        ],
      },
    ],
  },
]);

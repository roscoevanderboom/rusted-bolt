import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import App, { appLoader } from "./App";
import Loading from "./components/loading";
import { CodeIcon, HomeIcon, SettingsIcon } from "lucide-react";
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

// Lazy load page components for better code splitting
const LandingPage = lazy(() => import("./pages/landing"));
const IDEPage = lazy(() => import("./pages/ide"));
const SettingsPage = lazy(() => import("./pages/settings"));

// Wrapper component for lazy loaded routes with loading state
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: appLoader,
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <LandingPage />
          </LazyWrapper>
        ),
      },
      {
        path: "ide",
        element: (
          <LazyWrapper>
            <IDEPage />
          </LazyWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyWrapper>
            <SettingsPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);

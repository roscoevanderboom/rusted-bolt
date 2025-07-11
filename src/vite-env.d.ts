/// <reference types="vite/client" />

// Monaco Editor environment types
declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker?: (workerId: string, label: string) => Worker;
    };
  }
}

export {};

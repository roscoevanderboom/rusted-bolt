import { Outlet } from "react-router";
import Navbar from "@/components/navbar";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8">
        <h1 className="text-2xl font-bold text-white">Control Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-white">User Mode</span>
          <Switch className="toggle toggle-md" />
          {/* Add help icon etc. here */}
        </div>
      </div>
      {/* Grid */}
      <div className="max-w-5xl mx-auto w-full mt-10 p-6 bg-stone-900/80 rounded-xl shadow-lg">
        <Outlet />
      </div>
    </main>
  );
}

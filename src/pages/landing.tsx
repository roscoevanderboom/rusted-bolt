import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { useNavigate } from "react-router";

function Landing() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center bg-background p-8 h-full min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-stone-900/80 rounded-xl shadow-lg p-8 mt-8">
        <h1 className="text-4xl font-bold text-center mb-4 text-emerald-400 drop-shadow">
          Welcome to Rusted Boltz
        </h1>
        <p className="text-lg text-center text-stone-300 mb-6">
          Rusted Boltz is your AI-powered automation and code execution platform. Chat with AI, run code in real time, manage files, and preview your projects—all in one modern desktop app.
        </p>
        <ul className="text-stone-200 mb-8 space-y-2 text-base">
          <li>⚡ AI-powered code assistant</li>
          <li>🗂️ File explorer & editor</li>
          <li>💬 Interactive terminal</li>
          <li>🔄 Live preview</li>
          <li>🌓 Dark/Light mode</li>
        </ul>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => navigate("/ide")}>Open IDE</Button>
        </div>
      </div>
    </main>
  );
}

export default Landing;

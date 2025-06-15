import { ReactNode } from "react";
import { Link } from "react-router";

export default function ControlPanelCard({
  icon,
  title,
  description,
  badge,
  dot,
  to,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  dot?: boolean;
  to: string;
}) {
  return (
    <Link to={to} className="relative bg-stone-900/80 rounded-xl p-6 flex flex-col items-start shadow hover:shadow-lg transition">
      <div className="mb-4 text-3xl">{icon}</div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-lg text-white">{title}</span>
        {badge && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-purple-700 text-white">{badge}</span>
        )}
        {dot && (
          <span className="ml-2 w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
        )}
      </div>
      <span className="text-stone-400 text-sm">{description}</span>
    </Link>
  );
}

import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router";

const BackBtn = () => {
  return (
    <div className="flex flex-col gap-4">
      <Link to="/settings/" className="text-sm text-stone-400">
        <ArrowLeftIcon className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default BackBtn;

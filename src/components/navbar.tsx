import { routerLinks } from "@/router";
import { Link } from "react-router";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between h-10 border-b-2 px-4 py-6">
      <div className="flex items-center gap-2">
        {routerLinks.map((link) => (
          <Link to={link.path} key={link.path}>
            <Button title={link.title} variant="ghost" size="icon">
              {link.icon}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;

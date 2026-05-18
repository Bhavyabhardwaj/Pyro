import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { PyroMark } from "../ui/surface";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-zinc-950/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <PyroMark />
          <span className="text-sm font-semibold tracking-wide text-white">
            Pyro
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#realtime" className="transition-colors hover:text-white">
            Realtime
          </a>
          <a href="#developers" className="transition-colors hover:text-white">
            Developers
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/register">
              Start
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

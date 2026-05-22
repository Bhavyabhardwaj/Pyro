import { Link } from "react-router-dom";
import { PyroMark } from "../ui/surface";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-muted)] bg-[rgba(17,17,16,0.7)] backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <PyroMark />
          <span
            className="text-[13px] font-medium tracking-[-0.02em] text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pyro
          </span>
        </Link>

        <div className="flex items-center gap-6 text-[11px] font-normal tracking-[-0.005em] text-[var(--text-muted)]">
          <a href="#features" className="transition-colors hover:text-[var(--text-primary)]">
            Features
          </a>
          <a href="#developers" className="transition-colors hover:text-[var(--text-primary)]">
            Developers
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[11px] font-normal text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="rounded-full bg-[var(--text-primary)] px-3.5 py-1.5 text-[11px] font-medium tracking-tight text-[var(--bg-charcoal)] transition duration-150 hover:bg-neutral-200"
          >
            Open App
          </Link>
        </div>
      </nav>
    </header>
  );
}


import { Link } from "react-router-dom";
import { PyroMark } from "../ui/surface";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#111110]/70 backdrop-blur-md transition-all duration-300">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <PyroMark className="transition-transform duration-500 group-hover:scale-[1.02]" />
          <span
            className="text-[14px] font-semibold tracking-[-0.03em] text-[#e8e8e5] transition-colors duration-300 group-hover:text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pyro
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-[12.5px] font-normal tracking-[-0.01em] text-[#8a8a84]">
          <a 
            href="#features" 
            className="transition-colors duration-300 hover:text-[#e8e8e5] relative py-1"
          >
            Features
          </a>
          <a 
            href="#developers" 
            className="transition-colors duration-300 hover:text-[#e8e8e5] relative py-1"
          >
            Details
          </a>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-[12.5px] font-normal text-[#8a8a84] transition-colors duration-300 hover:text-[#e8e8e5]"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="rounded-full border border-white/[0.08] bg-[#1a1a19] px-4 py-1.5 text-[12px] font-medium tracking-[-0.01em] text-[#e8e8e5] transition-all duration-300 hover:bg-[#222221] hover:border-white/15 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]"
          >
            Open App
          </Link>
        </div>

      </nav>
    </header>
  );
}

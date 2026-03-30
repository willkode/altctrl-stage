import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/features" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "For Creators", path: "/for-creators" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
];

const footerLinks = [
  { label: "FAQ", path: "/faq" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
  { label: "Privacy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#02040f] text-white">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        backgroundSize: "100% 4px",
      }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-cyan-900/40 bg-[#02040f]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#02040f]" fill="currentColor" />
            </div>
            <span className="font-black uppercase tracking-widest text-white text-lg group-hover:text-cyan-400 transition-colors">ALT<span className="text-cyan-400">CTRL</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-mono uppercase tracking-widest transition-colors ${location.pathname === link.path ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}
              >
                {location.pathname === link.path && <span className="text-cyan-400 mr-1">//</span>}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/founding-creators" className="text-xs font-mono uppercase tracking-widest text-pink-400 hover:text-pink-300 transition-colors border border-pink-500/40 hover:border-pink-400 px-4 py-2 rounded hover:shadow-[0_0_15px_rgba(255,0,128,0.2)] transition-all">
              Founding Creators
            </Link>
            <Link to="/waitlist" className="text-xs font-black uppercase tracking-widest bg-cyan-400 text-[#02040f] px-4 py-2 rounded hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all">
              Join Waitlist
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-cyan-900/40 bg-[#02040f] px-4 py-4 space-y-3">
            {[...navLinks, { label: "Founding Creators", path: "/founding-creators" }, { label: "Waitlist", path: "/waitlist" }].map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`block text-sm font-mono uppercase tracking-widest py-2 ${location.pathname === link.path ? "text-cyan-400" : "text-slate-400"}`}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-900/40 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-cyan-400 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#02040f]" fill="currentColor" />
              </div>
              <span className="font-black uppercase tracking-widest text-sm">ALT<span className="text-cyan-400">CTRL</span></span>
              <span className="text-xs font-mono text-slate-600 ml-2">// AI OS FOR TIKTOK LIVE GAMING</span>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {footerLinks.map(link => (
                <Link key={link.path} to={link.path} className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cyan-900/20 text-center">
            <p className="text-xs font-mono text-slate-600">© 2026 ALTCTRL. ALL SYSTEMS ACTIVE. <span className="text-cyan-900">// SIGNAL LOCKED</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
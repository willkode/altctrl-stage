import { useState, useEffect } from "react";
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
  { label: "TikTok Appeal Helper", path: "/tiktok-appeal-helper" },
  { label: "Game Library", path: "/popular-tiktok-games" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
  { label: "Privacy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#02040f] text-white">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        backgroundSize: "100% 4px",
      }} />

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-40 border-b border-cyan-900/40 bg-[#02040f]/90 backdrop-blur-sm transition-all duration-300`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-[80px]' : 'h-[100px]'}`}>
          <Link to="/" className="flex items-center group">
            <img
              src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/9e338f22f_altctrl-logo2.png"
              alt="AltCtrl"
              className="h-9 w-auto transition-opacity group-hover:opacity-80"
            />
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
      <main className="pt-[100px]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-900/40 mt-20 bg-[#030609]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div>
              <img
                src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/9e338f22f_altctrl-logo2.png"
                alt="AltCtrl"
                className="h-7 w-auto mb-3"
              />
              <p className="text-xs font-mono text-slate-600 leading-relaxed">// AI OS FOR TIKTOK LIVE GAMING</p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 font-bold">Product</h3>
              <div className="space-y-2">
                <Link to="/features" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Features</Link>
                <Link to="/how-it-works" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">How It Works</Link>
                <Link to="/pricing" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Pricing</Link>
                <Link to="/for-creators" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">For Creators</Link>
              </div>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 font-bold">Resources</h3>
              <div className="space-y-2">
                <Link to="/faq" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">FAQ</Link>
                <Link to="/blog" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Blog</Link>
                <Link to="/popular-tiktok-games" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Game Library</Link>
                <Link to="/tiktok-appeal-helper" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Appeal Helper</Link>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 font-bold">Company</h3>
              <div className="space-y-2">
                <Link to="/about" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">About</Link>
                <Link to="/contact" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Contact</Link>
                <Link to="/privacy" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Privacy</Link>
                <Link to="/terms" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors block">Terms</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-cyan-900/20 text-center">
            <p className="text-xs font-mono text-slate-600">© 2026 ALTCTRL. ALL SYSTEMS ACTIVE. <span className="text-cyan-900">// SIGNAL LOCKED</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
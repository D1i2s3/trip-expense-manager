import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Mail, Lock, User, Sparkles, Navigation, X } from "lucide-react";
import Hls from "hls.js";
import { motion } from "motion/react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const videoSrc = "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";

  // Auth States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Form input helper
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // HLS.js implementation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error("Please enter all required fields");
    }
    if (!isLogin && !form.name) {
      return toast.error("Please enter your name");
    }

    setLoading(true);
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    try {
      const r = await api.post(endpoint, form);
      localStorage.setItem("tripsplit_token", r.data.token);
      localStorage.setItem("tripsplit_user", JSON.stringify(r.data.user));
      toast.success(isLogin ? `Welcome back, ${r.data.user.name}!` : "Account created successfully!");
      setShowAuthModal(false);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const r = await api.post("/auth/google", { token: response.credential });
      localStorage.setItem("tripsplit_token", r.data.token);
      localStorage.setItem("tripsplit_user", JSON.stringify(r.data.user));
      toast.success(`Welcome, ${r.data.user.name}!`);
      setShowAuthModal(false);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showAuthModal) return;

    const initGoogleBtn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "847175783668-j7siuel4dasehbpc1sfr0mdd0upidevq.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        const container = document.getElementById("google-signin-button");
        if (container) {
          const calculatedWidth = Math.max(200, Math.min(container.offsetWidth || (window.innerWidth - 80), 380));
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: calculatedWidth,
            shape: "pill",
          });
        }
      }
    };

    const timer = setTimeout(initGoogleBtn, 150);
    return () => clearTimeout(timer);
  }, [showAuthModal]);

  return (
    <div className="relative w-full min-h-screen bg-[#000000] text-white overflow-hidden font-sans flex flex-col">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
          poster="https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
        />
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Navbar Component */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent px-6 py-4 flex items-center justify-between">
        {/* Left Section: Sunburst Icon */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <span className="font-extrabold tracking-tight text-white font-sans text-lg">TripSplit</span>
        </div>

        {/* Center Section: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-0">
            Features <ChevronDown size={14} className="text-white/60" />
          </button>
          <a href="#stories" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Travel Stories</a>
          <a href="#resources" className="text-sm font-medium text-white/80 hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Settle Up</a>
        </nav>

        {/* Right Section: CTA buttons */}
        <div className="flex items-center gap-4">
          <button onClick={() => { setIsLogin(true); setShowAuthModal(true); }} className="hidden sm:block text-sm font-semibold text-white/80 hover:text-white cursor-pointer bg-transparent border-0">
            Book A Demo
          </button>
          <button
            onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
            className="bg-white text-black rounded-full px-5 py-2.5 font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer border-0 shadow-md shadow-white/5"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 pt-24 pb-12">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-12 mt-20">
          
          {/* Pre-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl sm:text-5xl lg:text-[48px] leading-[1.1] text-white"
          >
            Split expenses, keep the memories
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-sans font-semibold text-6xl sm:text-8xl lg:text-[136px] leading-[0.9] tracking-tighter bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text text-transparent"
          >
            Split Faster
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-sans text-lg sm:text-[20px] leading-[1.65] text-white max-w-xl"
          >
            Track group travel expenses, auto settle splits, and balance companion ledger transaction maps instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            {/* Primary Button */}
            <button
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="flex items-center pl-6 pr-2 py-2 rounded-full bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 group cursor-pointer border-0"
            >
              <span className="font-sans font-medium text-lg text-[#0a0400]">
                Start Splitting Free
              </span>
              <div className="w-10 h-10 ml-4 rounded-full bg-[#3054ff] group-hover:bg-[#2040e0] flex items-center justify-center transition-colors">
                <ArrowRight size={20} className="text-white" />
              </div>
            </button>

            {/* Secondary Button */}
            <button
              onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white/70 hover:text-white backdrop-blur-sm hover:bg-white/5 transition-all duration-300 group cursor-pointer border-0"
            >
              <span>View Trip Demo</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md relative bg-[#0d121f]/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Volumetric ambient lights in modal */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-900/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#3054ff]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Modal Brand */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Smart Travel Fintech</p>
            </div>

            {/* Tab Toggles */}
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setForm({ name: "", email: "", password: "" }); }}
                className={`text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-0 ${isLogin ? "text-blue-400" : "text-slate-500 hover:text-white"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setForm({ name: "", email: "", password: "" }); }}
                className={`text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-0 ${!isLogin ? "text-blue-400" : "text-slate-500 hover:text-white"}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
              {/* Full Name for Sign Up */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="label-premium text-[10px]">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text" required
                      className="input-premium text-xs py-2.5"
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="Enter your name"
                      value={form.name} onChange={e => set("name", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="label-premium text-[10px]">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email" required
                    className="input-premium text-xs py-2.5"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="name@example.com"
                    value={form.email} onChange={e => set("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="label-premium text-[10px]">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password" required
                    className="input-premium text-xs py-2.5"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="••••••••"
                    value={form.password} onChange={e => set("password", e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold justify-center mt-6 shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Get Started"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-black uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Google Sign In Button */}
            <div className="w-full flex justify-center">
              <div id="google-signin-button" className="w-full max-w-[380px] shadow-lg flex justify-center"></div>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-white/5 text-[10px] font-bold text-slate-500">
              {isLogin ? (
                <p>
                  Don't have an account?{" "}
                  <span onClick={() => setIsLogin(false)} className="text-blue-400 hover:underline cursor-pointer">
                    Sign Up Free
                  </span>
                </p>
              ) : (
                <p>
                  Already registered?{" "}
                  <span onClick={() => setIsLogin(true)} className="text-blue-400 hover:underline cursor-pointer">
                    Sign In Here
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

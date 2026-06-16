import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  FiTrendingUp, 
  FiArrowRight, 
  FiPieChart, 
  FiAward, 
  FiTarget, 
  FiCpu, 
  FiShield, 
  FiZap,
  FiChevronRight
} from 'react-icons/fi';

export const Home = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <FiPieChart className="w-6 h-6 text-emerald-500" />,
      title: "Real-time Analytics",
      description: "Understand where your money goes with sleek, interactive breakdown charts and cash-flow monitoring."
    },
    {
      icon: <FiAward className="w-6 h-6 text-amber-505" />,
      title: "Gamified Challenges",
      description: "Build financial discipline with customizable money challenges, active progress trackers, and achievements."
    },
    {
      icon: <FiTarget className="w-6 h-6 text-blue-500" />,
      title: "Smart Savings Tracker",
      description: "Track multiple goals concurrently with precise, boundary-aware deadline calculators."
    },
    {
      icon: <FiCpu className="w-6 h-6 text-indigo-500" />,
      title: "Gemini AI Explainer",
      description: "Get personalized, natural-language insights and 3 actionable tips based on your deterministic numbers."
    }
  ];

  const stats = [
    { value: "₹50k+", label: "Average Monthly Savings" },
    { value: "95%", label: "Budget Adherence Rate" },
    { value: "4.9/5", label: "User Satisfaction Score" },
    { value: "100%", label: "Local-First Privacy" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/30 selection:text-white overflow-x-hidden font-sans">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 transition-all duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm text-white">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-slate-950">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-slate-100">
              SpendWise
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <button
                  onClick={handleStart}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/10 transition-all active:scale-95"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <FiZap className="w-3.5 h-3.5 text-brand-455 animate-pulse" />
            Next-Gen Personal Finance
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Take Control of Your Money with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">
              SpendWise
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            A gamified personal finance & budget manager designed to build healthy saving habits, track bills, and unlock financial freedom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {user ? "Go to Dashboard" : "Start Saving Now"}
              <FiArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* MOCK PREVIEW DRAWING */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-16 md:mt-20 border border-slate-800/80 rounded-3xl bg-slate-900/20 p-3 md:p-4 shadow-2xl backdrop-blur-sm max-w-5xl mx-auto"
        >
          <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-950 flex flex-col">
            {/* Mock browser header */}
            <div className="h-10 border-b border-slate-900 bg-slate-900/40 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
              <div className="w-48 h-5 rounded-md bg-slate-900 flex items-center justify-center text-[9px] text-slate-550 font-bold select-none">
                spendwise.app/dashboard
              </div>
              <div className="w-4" />
            </div>
            
            {/* Mock dashboard content layout */}
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-4 flex flex-col justify-between h-40">
                <div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Financial Score</span>
                  <div className="text-3xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">88</div>
                  <span className="text-[10px] text-emerald-450 font-bold mt-1 block">Good Standings</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[88%]" />
                </div>
              </div>
              
              <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-4 flex flex-col justify-between h-40 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Saving Habit</span>
                  <span className="text-[9px] font-bold text-indigo-400">Target 20%</span>
                </div>
                <div className="flex gap-4 items-end mt-4">
                  <div className="flex-1 flex flex-col gap-1 items-center">
                    <div className="w-full h-12 bg-slate-900 rounded-lg relative overflow-hidden"><div className="absolute bottom-0 left-0 right-0 h-[65%] bg-slate-800" /></div>
                    <span className="text-[7.5px] text-slate-500">April</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 items-center">
                    <div className="w-full h-16 bg-slate-900 rounded-lg relative overflow-hidden"><div className="absolute bottom-0 left-0 right-0 h-[75%] bg-slate-800" /></div>
                    <span className="text-[7.5px] text-slate-500">May</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 items-center">
                    <div className="w-full h-20 bg-slate-900 rounded-lg relative overflow-hidden"><div className="absolute bottom-0 left-0 right-0 h-[90%] bg-gradient-to-t from-brand-600 to-indigo-600" /></div>
                    <span className="text-[7.5px] text-slate-300 font-bold">June</span>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-4 h-44 md:col-span-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Challenge</span>
                  <span className="text-[8.5px] px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold">In Progress</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Save ₹10,000 This Month</h4>
                  <p className="text-[9px] text-slate-550 mt-0.5">Build a net positive saving reserve across your tracker goals.</p>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-1">
                    <span>Progress: 60%</span>
                    <span>₹6,000 / ₹10,000</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 w-[60%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-900/30 border-y border-slate-900/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xl sm:text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Modern Finance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            We combined detailed mathematical finance algorithms with gamification loops to deliver a tracker that actually helps you save.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat, i) => (
            <div 
              key={i} 
              className="bg-slate-900/25 border border-slate-900/80 rounded-3xl p-6 flex gap-4 hover:border-slate-800/80 hover:bg-slate-900/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-850">
                {feat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{feat.title}</h3>
                <p className="text-xs text-slate-405 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY FIRST BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-900 text-[9px] font-bold uppercase tracking-wider text-emerald-450">
              <FiShield className="w-3.5 h-3.5" />
              100% Client-Side Privacy
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              Your Financial Data Never Leaves Your Device
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SpendWise uses local-first sandbox architecture. All ledger ledgers, budgets, challenges, and goals are stored securely inside your browser's local storage context, locked to your email profile. Zero trackers, zero cloud database logs.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="w-full md:w-auto shrink-0 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            Launch Free Sandbox
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white border border-slate-850">
              <FiTrendingUp className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-sm text-white">SpendWise</span>
          </div>
          <p className="text-[10px] text-slate-550 font-semibold">
            &copy; {new Date().getFullYear()} SpendWise Finance. Designed for privacy and discipline.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

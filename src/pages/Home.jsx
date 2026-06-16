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
  FiCheckCircle
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
      icon: <FiPieChart className="w-5 h-5 text-purple-500" />,
      title: "Expense tracking",
      description: "Understand where your money goes with category breakdowns.",
      bullets: [
        "Track every expense",
        "Categorize spending",
        "Monthly reports"
      ]
    },
    {
      icon: <FiTarget className="w-5 h-5 text-purple-500" />,
      title: "Savings goals",
      description: "Save for what matters with automated tracking.",
      bullets: [
        "Multiple goals",
        "Progress tracking",
        "Deadline reminders"
      ]
    },
    {
      icon: <FiAward className="w-5 h-5 text-purple-500" />,
      title: "Money challenges",
      description: "Build healthy habits through gamified milestones.",
      bullets: [
        "Earn badges",
        "Build saving habits",
        "Daily streaks"
      ]
    },
    {
      icon: <FiCpu className="w-5 h-5 text-purple-500" />,
      title: "Smart insights",
      description: "Get clear explanations of your financial standings.",
      bullets: [
        "Clear explanations",
        "Custom recommendations",
        "Practical advice"
      ]
    }
  ];

  const highlights = [
    { label: "Expense tracking", emoji: "💰" },
    { label: "Savings challenges", emoji: "🏆" },
    { label: "Smart reports", emoji: "📊" },
    { label: "Private & secure", emoji: "🔒" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-white overflow-x-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 transition-all duration-150">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm text-white">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white border border-slate-800">
              <FiTrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <span className="font-bold tracking-tight text-base text-slate-100">
              SpendWise
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
              >
                Dashboard
                <FiArrowRight className="w-3 h-3 text-purple-400" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  Sign in
                </Link>
                <button
                  onClick={handleStart}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] active:scale-98"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Manage your money{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              smarter
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Track expenses, build savings, complete challenges, and understand where your money goes—all in one place.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStart}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] active:scale-98 flex items-center gap-1.5"
            >
              Get started
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStart}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-slate-200 rounded-lg text-xs font-semibold transition-all duration-300"
            >
              View demo
            </button>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-10 relative max-w-4xl mx-auto group"
        >
          {/* Subtle floating glow behind preview */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 rounded-2xl blur-xl opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          {/* Floating labels */}
          <div className="absolute -left-4 top-1/4 z-10 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-bold text-slate-200 shadow-lg select-none backdrop-blur-sm transform -rotate-1">
            <span className="text-emerald-500">✓</span> Financial score: 88
          </div>
          <div className="absolute -right-4 top-1/3 z-10 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-bold text-slate-200 shadow-lg select-none backdrop-blur-sm transform rotate-1">
            <span className="text-purple-400">✓</span> Savings goal: On track
          </div>
          <div className="absolute -left-2 bottom-1/4 z-10 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-bold text-slate-200 shadow-lg select-none backdrop-blur-sm transform rotate-1">
            <span className="text-amber-500">✓</span> 3 Active challenges
          </div>

          <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl transition-all duration-500 hover:scale-[1.005] hover:border-slate-750">
            {/* Mock browser header */}
            <div className="h-9 border-b border-slate-900 bg-slate-900/40 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-850" />
                <div className="w-2 h-2 rounded-full bg-slate-850" />
                <div className="w-2 h-2 rounded-full bg-slate-850" />
              </div>
              <div className="w-40 h-4.5 rounded bg-slate-900 flex items-center justify-center text-[8.5px] text-slate-500 font-semibold select-none">
                spendwise.app/dashboard
              </div>
              <div className="w-4" />
            </div>
            
            {/* Mock dashboard visual structure */}
            <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-3.5 flex flex-col justify-between h-32">
                <div>
                  <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Financial score</span>
                  <div className="text-2xl font-black mt-1 text-emerald-450">88</div>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block">Good progress this month</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[88%]" />
                </div>
              </div>
              
              <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-3.5 flex flex-col justify-between h-32 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Saving habit</span>
                  <span className="text-[8.5px] font-semibold text-purple-400">Target 20%</span>
                </div>
                <div className="flex gap-4 items-end mt-2">
                  <div className="flex-1 flex flex-col gap-1 items-center">
                    <div className="w-full h-8 bg-slate-900 rounded-md relative overflow-hidden"><div className="absolute bottom-0 left-0 right-0 h-[65%] bg-slate-800" /></div>
                    <span className="text-[7px] text-slate-500">April</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 items-center">
                    <div className="w-full h-10 bg-slate-900 rounded-md relative overflow-hidden"><div className="absolute bottom-0 left-0 right-0 h-[75%] bg-slate-800" /></div>
                    <span className="text-[7px] text-slate-500">May</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 items-center">
                    <div className="w-full h-12 bg-slate-900 rounded-md relative overflow-hidden"><div className="absolute bottom-0 left-0 right-0 h-[90%] bg-purple-600" /></div>
                    <span className="text-[7px] text-slate-300 font-bold">June</span>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="border border-slate-900 bg-slate-900/10 rounded-xl p-3.5 h-36 md:col-span-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Active challenge</span>
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">In progress</span>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-100">Save ₹10,000 this month</h4>
                  <p className="text-[8.5px] text-slate-500 mt-0.5">Build a net positive saving reserve across your tracker goals.</p>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-semibold text-slate-400 mb-0.5">
                    <span>Progress: 60%</span>
                    <span>₹6,000 / ₹10,000</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[60%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature highlights strip */}
      <section className="bg-slate-900/20 border-y border-slate-900/60 py-6 my-2">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {highlights.map((hl, i) => (
            <div key={i} className="flex items-center justify-center gap-2 py-1">
              <span className="text-sm">{hl.emoji}</span>
              <span className="text-[11px] font-semibold tracking-wide text-slate-300">{hl.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Designed for simple finance
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            All the features you need to track your daily budget and build savings discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat, i) => (
            <div 
              key={i} 
              className="bg-slate-900/15 border border-slate-900/80 rounded-2xl p-5 hover:border-slate-850 hover:bg-slate-900/25 transition-all duration-300 flex flex-col justify-between gap-3"
            >
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-850 shrink-0">
                  {feat.icon}
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{feat.title}</h3>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                <ul className="space-y-1 pt-1 border-t border-slate-900/60">
                  {feat.bullets.map((b, idx) => (
                    <li key={idx} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-purple-500 font-bold">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy section */}
      <section className="max-w-3xl mx-auto px-4 pb-12 md:pb-16">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 text-left max-w-md">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-900 text-[8.5px] font-bold text-emerald-450 uppercase tracking-wider">
              <FiShield className="w-3 h-3 text-emerald-500" />
              Private
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Your data stays private
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              SpendWise stores your data securely in your browser. Nothing is uploaded unless you choose to export it.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="w-full md:w-auto shrink-0 px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-lg text-xs font-bold shadow-md transition-all active:scale-98"
          >
            Get started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-10 text-[11px] text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-white">
              <FiTrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>SpendWise</span>
            </div>
            <p className="text-[10px] text-slate-550 font-semibold">Made with React + Tailwind</p>
          </div>
          
          <div className="flex gap-8 justify-center">
            <div className="flex flex-col gap-1 items-center md:items-start">
              <span className="font-bold text-slate-350 text-[10px] uppercase tracking-wider mb-0.5">Product</span>
              <button onClick={() => navigate('/dashboard')} className="hover:text-slate-300">Dashboard</button>
              <a href="#features" className="hover:text-slate-300">Features</a>
            </div>
            <div className="flex flex-col gap-1 items-center md:items-start">
              <span className="font-bold text-slate-350 text-[10px] uppercase tracking-wider mb-0.5">Security</span>
              <span className="cursor-default">Privacy</span>
              <a href="https://github.com/pranet08/SpendWise" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">GitHub</a>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 mt-6 text-center text-[10px] text-slate-600 border-t border-slate-900/40 pt-4">
          &copy; 2026 SpendWise
        </div>
      </footer>
    </div>
  );
};

export default Home;

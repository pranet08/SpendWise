import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { MoneyChallenges } from './pages/MoneyChallenges';
import { SavingsTracker } from './pages/SavingsTracker';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastNotification } from './components/Toast';
import { BottomNav } from './components/BottomNav';

function App() {
  return (
    <>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 2. Guarded Dashboard Application Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                {/* Collapsible Sidebar (Desktops) */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
                  {/* Sticky Header Nav */}
                  <Navbar />
                  
                  {/* Dynamic Scrollable Body Content */}
                  <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/challenges" element={<MoneyChallenges />} />
                      <Route path="/savings" element={<SavingsTracker />} />
                      <Route path="/settings" element={<Settings />} />
                      
                      {/* Wildcard redirect back to root dashboard */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>

                  {/* Mobile Bottom Navigation (Mobiles only) */}
                  <BottomNav />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* 3. Global Toast Notifications Queue Overlay */}
      <ToastNotification />
    </>
  );
}

export default App;

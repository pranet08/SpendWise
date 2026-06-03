import React, { createContext, useState, useEffect, useContext } from 'react';
import { initialTransactions, initialUser } from '../data/mockData';

// 1. Create the Context object to hold global states
const AppContext = createContext();

// Custom hook for easier import in components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // --- 2. State Initializations (checking localStorage first, falling back to user-scoped defaults) ---

  // User auth state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [transactions, setTransactions] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const savedTxs = localStorage.getItem(`spendwise_transactions_${parsedUser.email}`);
      if (savedTxs) return JSON.parse(savedTxs);
      if (parsedUser.email === 'alex.mercer@spendwise.io') return initialTransactions;
    }
    return [];
  });

  // Monthly Budget limit
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const savedBudget = localStorage.getItem(`spendwise_budget_${parsedUser.email}`);
      return savedBudget ? Number(savedBudget) : 30000;
    }
    return 30000;
  });

  // Savings Goal details
  const [savingsGoal, setSavingsGoal] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const savedGoal = localStorage.getItem(`spendwise_savings_goal_${parsedUser.email}`);
      return savedGoal ? Number(savedGoal) : 50000;
    }
    return 50000;
  });

  // Saved Amount progress
  const [currentSavings, setCurrentSavings] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const savedAmt = localStorage.getItem(`spendwise_current_savings_${parsedUser.email}`);
      return savedAmt ? Number(savedAmt) : (parsedUser.email === 'alex.mercer@spendwise.io' ? 32000 : 0);
    }
    return 0;
  });

  // Dark Mode preference (default: true)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('spendwise_dark_mode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  // Toast notifications array (in-memory only)
  const [toasts, setToasts] = useState([]);

  // Mobile sidebar open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // --- 3. Synchronizing States to LocalStorage with useEffect hooks ---

  // Triggered when user logs in, logs out, or signs up to load their user-specific states
  useEffect(() => {
    if (user) {
      // 1. Transactions
      const txsKey = `spendwise_transactions_${user.email}`;
      const savedTxs = localStorage.getItem(txsKey);
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      } else {
        if (user.email === 'alex.mercer@spendwise.io') {
          setTransactions(initialTransactions);
        } else {
          setTransactions([]);
        }
      }

      // 2. Budget
      const budgetKey = `spendwise_budget_${user.email}`;
      const savedBudget = localStorage.getItem(budgetKey);
      setMonthlyBudget(savedBudget ? Number(savedBudget) : 30000);

      // 3. Savings Goal
      const goalKey = `spendwise_savings_goal_${user.email}`;
      const savedGoal = localStorage.getItem(goalKey);
      setSavingsGoal(savedGoal ? Number(savedGoal) : 50000);

      // 4. Current Savings
      const savingsKey = `spendwise_current_savings_${user.email}`;
      const savedAmt = localStorage.getItem(savingsKey);
      if (savedAmt) {
        setCurrentSavings(Number(savedAmt));
      } else {
        setCurrentSavings(user.email === 'alex.mercer@spendwise.io' ? 32000 : 0);
      }
    } else {
      // Clear out active workspace variables when logged out
      setTransactions([]);
      setMonthlyBudget(30000);
      setSavingsGoal(50000);
      setCurrentSavings(0);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('spendwise_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('spendwise_user');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_transactions_${user.email}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_budget_${user.email}`, monthlyBudget.toString());
    }
  }, [monthlyBudget, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_savings_goal_${user.email}`, savingsGoal.toString());
    }
  }, [savingsGoal, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_current_savings_${user.email}`, currentSavings.toString());
    }
  }, [currentSavings, user]);

  useEffect(() => {
    localStorage.setItem('spendwise_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- 4. Toast helper functions ---

  const showToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Automatically remove the toast after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // --- 5. Authentication Actions ---

  const login = (email, password) => {
    // Basic mock authentication: Accept any password (>= 6 chars) for educational ease
    if (email && password.length >= 6) {
      const mockName = email.split('@')[0];
      // Generate a user profile
      const newUser = {
        name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
        email: email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        token: 'mock-jwt-token-' + Date.now()
      };
      setUser(newUser);
      showToast(`Welcome back, ${newUser.name}!`, 'success');
      return { success: true };
    } else {
      showToast('Login failed: Password must be at least 6 characters.', 'error');
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
  };

  const signup = (name, email, password, gender) => {
    if (name && email && password.length >= 6) {
      // Preselect avatar depending on gender input
      let selectedAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'; // Male professional
      
      if (gender === 'female') {
        selectedAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'; // Female professional
      } else if (gender === 'other') {
        selectedAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'; // Other
      }

      const newUser = {
        name: name,
        email: email,
        avatar: selectedAvatar,
        token: 'mock-jwt-token-' + Date.now()
      };
      setUser(newUser);
      showToast(`Account created successfully. Welcome, ${name}!`, 'success');
      return { success: true };
    } else {
      showToast('Registration failed: Please check your inputs.', 'error');
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  // --- 6. Transaction CRUD Operations ---

  const addTransaction = (newTx) => {
    const txToAdd = {
      ...newTx,
      id: 'tx-' + Date.now(), // Generate simple unique ID
      amount: Number(newTx.amount) // Ensure amount is stored as a number
    };

    setTransactions((prevTxs) => [txToAdd, ...prevTxs]);
    showToast(`Transaction "${txToAdd.title}" added.`, 'success');

    // Trigger warning alert if it's an expense and exceeds the budget
    if (txToAdd.type === 'expense') {
      // Calculate total expense of the current month
      const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
      const thisMonthExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0) + txToAdd.amount;

      if (thisMonthExpenses > monthlyBudget) {
        showToast('Warning: Monthly budget limit exceeded!', 'warning');
      }
    }
  };

  const editTransaction = (id, updatedTx) => {
    setTransactions((prevTxs) =>
      prevTxs.map((tx) => (tx.id === id ? { ...tx, ...updatedTx, amount: Number(updatedTx.amount) } : tx))
    );
    showToast('Transaction updated successfully.', 'success');
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prevTxs) => prevTxs.filter((tx) => tx.id !== id));
    showToast(`Transaction "${tx?.title || 'item'}" deleted.`, 'info');
  };

  // --- 7. Budget & Savings updates ---

  const updateBudget = (amount) => {
    setMonthlyBudget(Number(amount));
    showToast(`Monthly budget set to ₹${Number(amount).toLocaleString('en-IN')}`, 'success');
  };

  const updateSavingsGoal = (amount) => {
    setSavingsGoal(Number(amount));
    showToast(`Savings goal set to ₹${Number(amount).toLocaleString('en-IN')}`, 'success');
  };

  const updateCurrentSavings = (amount) => {
    setCurrentSavings(Number(amount));
    showToast(`Saved amount updated to ₹${Number(amount).toLocaleString('en-IN')}`, 'success');
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Profile data update helpers
  const updateProfile = (name, email, avatar) => {
    setUser(prev => ({
      ...prev,
      name,
      email,
      avatar: avatar || prev.avatar
    }));
    showToast('Profile updated successfully.', 'success');
  };

  // Wiping all localstorage data
  const resetAllData = () => {
    setUser(null);
    setTransactions(initialTransactions);
    setMonthlyBudget(30000);
    setSavingsGoal(50000);
    setCurrentSavings(32000);
    setDarkMode(true);
    localStorage.clear();
    showToast('System reset. All default data restored.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        monthlyBudget,
        savingsGoal,
        currentSavings,
        darkMode,
        toasts,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        login,
        signup,
        logout,
        addTransaction,
        editTransaction,
        deleteTransaction,
        updateBudget,
        updateSavingsGoal,
        updateCurrentSavings,
        toggleDarkMode,
        updateProfile,
        resetAllData,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

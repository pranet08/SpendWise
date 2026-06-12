import React, { createContext, useState, useEffect, useContext } from 'react';
import { initialTransactions } from '../data/mockData';

// 1. Create the Context object
const AppContext = createContext();

// Custom hook for easier import
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // --- User Authentication ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- Theme Toggle ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('spendwise_dark_mode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  // --- In-Memory Toast Notifications ---
  const [toasts, setToasts] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // --- Dynamic states (scoped by user.email) ---
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(30000);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [currency, setCurrency] = useState('₹');

  // --- Toast helper functions ---
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Add Activity Log Helper ---
  const addActivity = (type, message) => {
    if (!user) return;
    const newActivity = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type, // 'income' | 'expense' | 'budget' | 'goal' | 'recurring' | 'system'
      message,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const updated = [newActivity, ...prev].slice(0, 50); // limit to 50 activities
      localStorage.setItem(`spendwise_activities_${user.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  // --- Add Persistent Context Notification Helper ---
  const addNotification = (title, desc, type = 'info') => {
    if (!user) return;
    const newNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      title,
      desc,
      type, // 'warning' | 'danger' | 'success' | 'info'
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      localStorage.setItem(`spendwise_notifications_${user.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationAsRead = (id) => {
    if (!user) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(`spendwise_notifications_${user.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotification = (id) => {
    if (!user) return;
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem(`spendwise_notifications_${user.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    if (!user) return;
    setNotifications([]);
    localStorage.setItem(`spendwise_notifications_${user.email}`, JSON.stringify([]));
    showToast('Notifications cleared', 'info');
  };

  // --- Synchronizing user-specific states on User Change ---
  useEffect(() => {
    if (user) {
      const email = user.email;

      // 1. Transactions
      const savedTxs = localStorage.getItem(`spendwise_transactions_${email}`);
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      } else {
        setTransactions(email === 'alex.mercer@spendwise.io' ? initialTransactions : []);
      }

      // 2. Budget
      const savedBudget = localStorage.getItem(`spendwise_budget_${email}`);
      setMonthlyBudget(savedBudget ? Number(savedBudget) : 30000);

      // 3. Savings Goals (Multiple)
      const savedGoals = localStorage.getItem(`spendwise_savings_goals_${email}`);
      if (savedGoals) {
        setSavingsGoals(JSON.parse(savedGoals));
      } else {
        // Migration of old single savings goal if present
        const oldGoal = localStorage.getItem(`spendwise_savings_goal_${email}`);
        const oldSavings = localStorage.getItem(`spendwise_current_savings_${email}`);
        if (oldGoal || oldSavings) {
          const migratedGoal = {
            id: 'goal-migrated',
            title: 'Initial Savings Goal',
            targetAmount: oldGoal ? Number(oldGoal) : 50000,
            currentSaved: oldSavings ? Number(oldSavings) : 0,
            priority: 'medium',
            deadline: '',
          };
          setSavingsGoals([migratedGoal]);
          localStorage.removeItem(`spendwise_savings_goal_${email}`);
          localStorage.removeItem(`spendwise_current_savings_${email}`);
        } else {
          setSavingsGoals(
            email === 'alex.mercer@spendwise.io'
              ? [
                  { id: 'goal-1', title: 'Emergency Fund', targetAmount: 50000, currentSaved: 32000, priority: 'high', deadline: '2026-12-31' },
                  { id: 'goal-2', title: 'New MacBook Pro', targetAmount: 150000, currentSaved: 45000, priority: 'medium', deadline: '2026-09-30' },
                  { id: 'goal-3', title: 'Europe Vacation', targetAmount: 80000, currentSaved: 10000, priority: 'low', deadline: '2027-05-15' }
                ]
              : []
          );
        }
      }

      // 4. Recurring Transactions
      const savedRecurring = localStorage.getItem(`spendwise_recurring_${email}`);
      if (savedRecurring) {
        setRecurringTransactions(JSON.parse(savedRecurring));
      } else {
        setRecurringTransactions(
          email === 'alex.mercer@spendwise.io'
            ? [
                { id: 'rec-1', title: 'Monthly Salary', amount: 75000, type: 'income', category: 'Salary', recurrence: 'Monthly', paymentMethod: 'Bank Transfer', notes: 'Primary job payout', nextDueDate: '2026-07-01', active: true },
                { id: 'rec-2', title: 'House Rent', amount: 15000, type: 'expense', category: 'Bills', recurrence: 'Monthly', paymentMethod: 'Bank Transfer', notes: 'Apartment rent', nextDueDate: '2026-07-02', active: true },
                { id: 'rec-3', title: 'Netflix Subscription', amount: 499, type: 'expense', category: 'Entertainment', recurrence: 'Monthly', paymentMethod: 'Card', notes: 'Premium UHD plan', nextDueDate: '2026-06-15', active: true },
                { id: 'rec-4', title: 'Gym Membership', amount: 1500, type: 'expense', category: 'Bills', recurrence: 'Monthly', paymentMethod: 'UPI', notes: 'Active fitness center', nextDueDate: '2026-06-20', active: true }
              ]
            : []
        );
      }

      // 5. Activities
      const savedActivities = localStorage.getItem(`spendwise_activities_${email}`);
      setActivities(savedActivities ? JSON.parse(savedActivities) : []);

      // 6. Notifications
      const savedNotifs = localStorage.getItem(`spendwise_notifications_${email}`);
      setNotifications(savedNotifs ? JSON.parse(savedNotifs) : []);

      // 7. Gemini API Key
      const savedKey = localStorage.getItem(`spendwise_gemini_key_${email}`);
      setGeminiApiKey(savedKey || '');

      // 8. Currency Preference
      const savedCurrency = localStorage.getItem(`spendwise_currency_${email}`);
      setCurrency(savedCurrency || '₹');
    } else {
      setTransactions([]);
      setMonthlyBudget(30000);
      setSavingsGoals([]);
      setRecurringTransactions([]);
      setActivities([]);
      setNotifications([]);
      setGeminiApiKey('');
      setCurrency('₹');
    }
  }, [user]);

  // --- State Sync Handlers ---
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
      localStorage.setItem(`spendwise_savings_goals_${user.email}`, JSON.stringify(savingsGoals));
    }
  }, [savingsGoals, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_recurring_${user.email}`, JSON.stringify(recurringTransactions));
    }
  }, [recurringTransactions, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_gemini_key_${user.email}`, geminiApiKey);
    }
  }, [geminiApiKey, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spendwise_currency_${user.email}`, currency);
    }
  }, [currency, user]);

  useEffect(() => {
    localStorage.setItem('spendwise_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Recurring Transactions Auto-Processing Engine ---
  useEffect(() => {
    if (!user || transactions.length === 0 || recurringTransactions.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    let transactionsAdded = false;
    let updatedRecurring = [...recurringTransactions];
    let newTxList = [...transactions];

    updatedRecurring = updatedRecurring.map((item) => {
      if (!item.active) return item;

      let nextDue = new Date(item.nextDueDate);
      const today = new Date(todayStr);

      let itemModified = false;
      // Loop to handle cases where multiple billing cycles have elapsed while user was offline
      while (nextDue <= today) {
        const nextDueStr = nextDue.toISOString().split('T')[0];

        // Create transaction entry
        const autoTx = {
          id: 'tx-auto-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          title: `${item.title} (Recurring)`,
          amount: Number(item.amount),
          type: item.type,
          category: item.category,
          date: nextDueStr,
          paymentMethod: item.paymentMethod,
          notes: item.notes || 'Automated recurring payment transaction',
          isRecurring: true,
        };

        newTxList = [autoTx, ...newTxList];
        transactionsAdded = true;
        itemModified = true;

        // Calculate next due date
        if (item.recurrence === 'Daily') {
          nextDue.setDate(nextDue.getDate() + 1);
        } else if (item.recurrence === 'Weekly') {
          nextDue.setDate(nextDue.getDate() + 7);
        } else if (item.recurrence === 'Monthly') {
          nextDue.setMonth(nextDue.getMonth() + 1);
        } else if (item.recurrence === 'Yearly') {
          nextDue.setFullYear(nextDue.getFullYear() + 1);
        }
      }

      if (itemModified) {
        const updatedNextDueDate = nextDue.toISOString().split('T')[0];
        // Add log activity
        addActivity('recurring', `Processed recurring payment for "${item.title}"`);
        addNotification(
          'Recurring Payment Processed',
          `Automated payment for "${item.title}" of ${currency}${Number(item.amount).toLocaleString('en-IN')} has been added.`,
          item.type === 'income' ? 'success' : 'info'
        );
        return { ...item, nextDueDate: updatedNextDueDate };
      }

      return item;
    });

    if (transactionsAdded) {
      setTransactions(newTxList);
      setRecurringTransactions(updatedRecurring);
      localStorage.setItem(`spendwise_transactions_${user.email}`, JSON.stringify(newTxList));
      localStorage.setItem(`spendwise_recurring_${user.email}`, JSON.stringify(updatedRecurring));
    }
  }, [user, recurringTransactions, transactions, currency]);

  // --- Authentication Actions ---
  const login = (email, password) => {
    if (email && password.length >= 6) {
      const mockName = email.split('@')[0];
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
      let selectedAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
      if (gender === 'female') {
        selectedAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
      } else if (gender === 'other') {
        selectedAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
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

  // --- Transaction CRUD ---
  const addTransaction = (newTx) => {
    const txToAdd = {
      ...newTx,
      id: 'tx-' + Date.now(),
      amount: Number(newTx.amount)
    };

    setTransactions((prev) => [txToAdd, ...prev]);
    addActivity(newTx.type, `Added transaction: "${txToAdd.title}"`);
    showToast(`Transaction "${txToAdd.title}" added.`, 'success');

    // Warning alerts
    if (txToAdd.type === 'expense') {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const thisMonthExpenses = transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0) + txToAdd.amount;

      if (thisMonthExpenses > monthlyBudget) {
        addNotification(
          'Budget Limit Exceeded',
          `This month's expenses (₹${thisMonthExpenses.toLocaleString('en-IN')}) exceed your monthly budget of ₹${monthlyBudget.toLocaleString('en-IN')}.`,
          'danger'
        );
        showToast('Warning: Monthly budget limit exceeded!', 'warning');
      } else if (thisMonthExpenses > monthlyBudget * 0.8) {
        addNotification(
          'Approaching Budget Limit',
          `You have used over 80% of your monthly budget. Current total: ₹${thisMonthExpenses.toLocaleString('en-IN')}.`,
          'warning'
        );
      }
    }
  };

  const editTransaction = (id, updatedTx) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedTx, amount: Number(updatedTx.amount) } : tx))
    );
    addActivity(updatedTx.type, `Updated transaction: "${updatedTx.title}"`);
    showToast('Transaction updated successfully.', 'success');
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addActivity('system', `Deleted transaction: "${tx.title}"`);
    showToast(`Transaction "${tx.title}" deleted.`, 'info');
  };

  // --- Budget Actions ---
  const updateBudget = (amount) => {
    setMonthlyBudget(Number(amount));
    addActivity('budget', `Updated monthly budget limit to ${currency}${Number(amount).toLocaleString('en-IN')}`);
    showToast(`Monthly budget set to ${currency}${Number(amount).toLocaleString('en-IN')}`, 'success');
  };

  // --- Savings Goals CRUD ---
  const addSavingsGoal = (newGoal) => {
    const goalToAdd = {
      ...newGoal,
      id: 'goal-' + Date.now(),
      targetAmount: Number(newGoal.targetAmount),
      currentSaved: Number(newGoal.currentSaved || 0),
    };
    setSavingsGoals((prev) => [...prev, goalToAdd]);
    addActivity('goal', `Created savings goal: "${goalToAdd.title}"`);
    showToast(`Savings goal "${goalToAdd.title}" created!`, 'success');
  };

  const editSavingsGoal = (id, updatedGoal) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedGoal, targetAmount: Number(updatedGoal.targetAmount), currentSaved: Number(updatedGoal.currentSaved) } : g))
    );
    addActivity('goal', `Updated savings goal: "${updatedGoal.title}"`);
    showToast('Savings goal updated.', 'success');
  };

  const deleteSavingsGoal = (id) => {
    const goal = savingsGoals.find((g) => g.id === id);
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    if (goal) {
      addActivity('goal', `Deleted savings goal: "${goal.title}"`);
      showToast(`Savings goal "${goal.title}" removed.`, 'info');
    }
  };

  const addSavingsProgress = (id, amount) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newSaved = g.currentSaved + Number(amount);
          addActivity('goal', `Added ${currency}${Number(amount).toLocaleString('en-IN')} to "${g.title}"`);
          
          if (newSaved >= g.targetAmount && g.currentSaved < g.targetAmount) {
            addNotification(
              'Savings Goal Completed! 🏆',
              `Congratulations! You have fully achieved your target savings goal for "${g.title}"!`,
              'success'
            );
            showToast(`Goal achieved: "${g.title}"! 🏆`, 'success');
          }
          return { ...g, currentSaved: Math.max(0, newSaved) };
        }
        return g;
      })
    );
  };

  // --- Recurring Transactions CRUD ---
  const addRecurringTransaction = (newRec) => {
    const recToAdd = {
      ...newRec,
      id: 'rec-' + Date.now(),
      amount: Number(newRec.amount),
      active: true,
    };
    setRecurringTransactions((prev) => [...prev, recToAdd]);
    addActivity('recurring', `Created recurring transaction: "${recToAdd.title}"`);
    showToast(`Recurring bill "${recToAdd.title}" created.`, 'success');
  };

  const editRecurringTransaction = (id, updatedRec) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedRec, amount: Number(updatedRec.amount) } : r))
    );
    addActivity('recurring', `Updated recurring transaction: "${updatedRec.title}"`);
    showToast('Recurring transaction updated.', 'success');
  };

  const deleteRecurringTransaction = (id) => {
    const item = recurringTransactions.find((r) => r.id === id);
    setRecurringTransactions((prev) => prev.filter((r) => r.id !== id));
    if (item) {
      addActivity('recurring', `Deleted recurring transaction: "${item.title}"`);
      showToast(`Recurring transaction "${item.title}" deleted.`, 'info');
    }
  };

  const toggleRecurringTransaction = (id) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newActive = !r.active;
          addActivity('recurring', `${newActive ? 'Enabled' : 'Disabled'} recurring transaction: "${r.title}"`);
          return { ...r, active: newActive };
        }
        return r;
      })
    );
  };

  // --- Weighted Financial Health Score Logic ---
  const calculateFinancialHealth = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const thisMonthExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    // 1. Savings Rate (25% Weight)
    // Benchmark savings rate >= 20% gets 25 points
    let savingsRateScore = 0;
    const savingsRate = thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100 : 0;
    if (savingsRate >= 20) {
      savingsRateScore = 25;
    } else if (savingsRate > 0) {
      savingsRateScore = Math.round((savingsRate / 20) * 25);
    }

    // 2. Budget Adherence (20% Weight)
    // Spending within budget limit gets 20 points
    let budgetAdherenceScore = 0;
    if (monthlyBudget > 0) {
      const budgetRatio = thisMonthExpenses / monthlyBudget;
      if (budgetRatio <= 1.0) {
        budgetAdherenceScore = 20;
      } else if (budgetRatio <= 1.2) {
        budgetAdherenceScore = 12;
      } else if (budgetRatio <= 1.5) {
        budgetAdherenceScore = 6;
      }
    } else {
      budgetAdherenceScore = 15; // neutral fallback
    }

    // 3. Monthly Cash Flow (20% Weight)
    // Positve net cash flow (Income > Expenses) gets 20 points
    let cashFlowScore = 0;
    if (thisMonthIncome > thisMonthExpenses) {
      cashFlowScore = 20;
    } else if (thisMonthIncome === thisMonthExpenses && thisMonthIncome > 0) {
      cashFlowScore = 10;
    }

    // 4. Savings Goal Progress (15% Weight)
    // Average progress percentage of active goals
    let goalsScore = 0;
    if (savingsGoals.length > 0) {
      const totalProgress = savingsGoals.reduce((sum, g) => {
        const p = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
        return sum + Math.min(p, 100);
      }, 0);
      const avgProgress = totalProgress / savingsGoals.length;
      goalsScore = Math.round((avgProgress / 100) * 15);
    } else {
      goalsScore = 10; // default points if no goals defined yet
    }

    // 5. Income Stability (10% Weight)
    // Stable if there are recurring active income sources or multiple income entries
    let incomeStabilityScore = 0;
    const activeRecurringIncomes = recurringTransactions.filter((r) => r.active && r.type === 'income').length;
    const incomeTxCount = transactions.filter((t) => t.type === 'income' && t.date.startsWith(currentMonth)).length;

    if (activeRecurringIncomes > 0 || incomeTxCount >= 2) {
      incomeStabilityScore = 10;
    } else if (incomeTxCount === 1) {
      incomeStabilityScore = 7;
    } else {
      incomeStabilityScore = 3;
    }

    // 6. Budget Utilization Buffer (10% Weight)
    // High buffer (Spending <= 70% of budget limit) gets 10 points
    let bufferScore = 0;
    if (monthlyBudget > 0) {
      const budgetRatio = thisMonthExpenses / monthlyBudget;
      if (budgetRatio <= 0.7) {
        bufferScore = 10;
      } else if (budgetRatio <= 0.9) {
        bufferScore = 6;
      } else if (budgetRatio <= 1.0) {
        bufferScore = 3;
      }
    } else {
      bufferScore = 5;
    }

    const totalScore = savingsRateScore + budgetAdherenceScore + cashFlowScore + goalsScore + incomeStabilityScore + bufferScore;
    
    // Compile factors checklist feedback
    const factors = [
      {
        id: 'savings-rate',
        label: `Savings Rate (${savingsRate.toFixed(0)}%)`,
        pass: savingsRate >= 15,
        desc: savingsRate >= 20 ? 'Excellent savings rate above 20% benchmark.' : (savingsRate >= 10 ? 'Moderate savings. Aim for at least 20%.' : 'Low or negative savings this month.')
      },
      {
        id: 'budget-adherence',
        label: 'Budget Adherence',
        pass: thisMonthExpenses <= monthlyBudget,
        desc: thisMonthExpenses <= monthlyBudget ? 'Total spending is within your budget.' : `Exceeded budget limit of ${currency}${monthlyBudget.toLocaleString('en-IN')}.`
      },
      {
        id: 'cash-flow',
        label: 'Monthly Cash Flow',
        pass: thisMonthIncome > thisMonthExpenses,
        desc: thisMonthIncome > thisMonthExpenses ? 'Positive net savings flow.' : 'Negative net savings. Expenses exceed earnings.'
      },
      {
        id: 'goals-progress',
        label: 'Goals Progression',
        pass: savingsGoals.length > 0 && (savingsGoals.reduce((sum, g) => sum + (g.currentSaved/g.targetAmount), 0)/savingsGoals.length >= 0.4),
        desc: savingsGoals.length === 0 ? 'No active savings goals set.' : 'Solid progression across active goals.'
      },
      {
        id: 'budget-buffer',
        label: 'Budget Utilization Buffer',
        pass: thisMonthExpenses <= monthlyBudget * 0.7,
        desc: thisMonthExpenses <= monthlyBudget * 0.7 ? 'Healthy safety buffer of 30%+ remaining.' : 'Low spending buffer. Monitor your subscriptions.'
      }
    ];

    let rating = 'Needs Improvement';
    if (totalScore >= 90) rating = 'Excellent';
    else if (totalScore >= 70) rating = 'Good';

    return {
      score: Math.min(100, Math.max(0, totalScore)),
      rating,
      factors,
      savingsRateScore,
      budgetAdherenceScore,
      cashFlowScore,
      goalsScore,
      incomeStabilityScore,
      bufferScore
    };
  };

  // --- Profile data update helpers ---
  const updateProfile = (name, email, avatar) => {
    setUser((prev) => ({
      ...prev,
      name,
      email,
      avatar: avatar || prev.avatar,
    }));
    addActivity('system', 'Updated profile account settings');
    showToast('Profile updated successfully.', 'success');
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // --- Reset All Data ---
  const resetAllData = () => {
    setUser(null);
    setTransactions(initialTransactions);
    setMonthlyBudget(30000);
    setSavingsGoals([
      { id: 'goal-1', title: 'Emergency Fund', targetAmount: 50000, currentSaved: 32000, priority: 'high', deadline: '2026-12-31' },
      { id: 'goal-2', title: 'New MacBook Pro', targetAmount: 150000, currentSaved: 45000, priority: 'medium', deadline: '2026-09-30' },
      { id: 'goal-3', title: 'Europe Vacation', targetAmount: 80000, currentSaved: 10000, priority: 'low', deadline: '2027-05-15' }
    ]);
    setRecurringTransactions([
      { id: 'rec-1', title: 'Monthly Salary', amount: 75000, type: 'income', category: 'Salary', recurrence: 'Monthly', paymentMethod: 'Bank Transfer', notes: 'Primary job payout', nextDueDate: '2026-07-01', active: true },
      { id: 'rec-2', title: 'House Rent', amount: 15000, type: 'expense', category: 'Bills', recurrence: 'Monthly', paymentMethod: 'Bank Transfer', notes: 'Apartment rent', nextDueDate: '2026-07-02', active: true },
      { id: 'rec-3', title: 'Netflix Subscription', amount: 499, type: 'expense', category: 'Entertainment', recurrence: 'Monthly', paymentMethod: 'Card', notes: 'Premium UHD plan', nextDueDate: '2026-06-15', active: true },
      { id: 'rec-4', title: 'Gym Membership', amount: 1500, type: 'expense', category: 'Bills', recurrence: 'Monthly', paymentMethod: 'UPI', notes: 'Active fitness center', nextDueDate: '2026-06-20', active: true }
    ]);
    setActivities([]);
    setNotifications([]);
    setGeminiApiKey('');
    setCurrency('₹');
    setDarkMode(true);
    localStorage.clear();
    showToast('All system dashboard data cleared.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        monthlyBudget,
        savingsGoals,
        recurringTransactions,
        activities,
        notifications,
        darkMode,
        toasts,
        geminiApiKey,
        currency,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        setGeminiApiKey,
        setCurrency,
        login,
        signup,
        logout,
        addTransaction,
        editTransaction,
        deleteTransaction,
        updateBudget,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        addSavingsProgress,
        addRecurringTransaction,
        editRecurringTransaction,
        deleteRecurringTransaction,
        toggleRecurringTransaction,
        calculateFinancialHealth,
        toggleDarkMode,
        updateProfile,
        resetAllData,
        showToast,
        removeToast,
        addActivity,
        addNotification,
        markNotificationAsRead,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

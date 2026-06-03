// Mock initial data for Expense Tracker Dashboard
// This helps demonstrate charts and values on the first load.

export const initialTransactions = [
  {
    id: 'tx-1',
    title: 'Monthly Salary',
    amount: 75000,
    type: 'income',
    category: 'Salary',
    date: '2026-05-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Primary job monthly salary payout'
  },
  {
    id: 'tx-2',
    title: 'House Rent',
    amount: 15000,
    type: 'expense',
    category: 'Bills',
    date: '2026-05-02',
    paymentMethod: 'Bank Transfer',
    notes: 'Apartment rent including maintenance'
  },
  {
    id: 'tx-3',
    title: 'Supermarket Groceries',
    amount: 4500,
    type: 'expense',
    category: 'Food',
    date: '2026-05-05',
    paymentMethod: 'UPI',
    notes: 'Weekly groceries from supermarket'
  },
  {
    id: 'tx-4',
    title: 'Weekend Outfit shopping',
    amount: 6200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-05-08',
    paymentMethod: 'Card',
    notes: 'Bought shirts and sneakers'
  },
  {
    id: 'tx-5',
    title: 'Fuel refilling',
    amount: 2000,
    type: 'expense',
    category: 'Travel',
    date: '2026-05-12',
    paymentMethod: 'UPI',
    notes: 'Petrol refilled for car'
  },
  {
    id: 'tx-6',
    title: 'Electricity Bill',
    amount: 3200,
    type: 'expense',
    category: 'Bills',
    date: '2026-05-15',
    paymentMethod: 'UPI',
    notes: 'Power bill payment'
  },
  {
    id: 'tx-7',
    title: 'Movie Ticket & Snacks',
    amount: 1200,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-05-18',
    paymentMethod: 'Card',
    notes: 'Watched movie with friends'
  },
  {
    id: 'tx-8',
    title: 'Freelance Web Design',
    amount: 18000,
    type: 'income',
    category: 'Salary',
    date: '2026-05-20',
    paymentMethod: 'UPI',
    notes: 'SaaS landing page project'
  },
  {
    id: 'tx-9',
    title: 'React Native Udemy Course',
    amount: 499,
    type: 'expense',
    category: 'Education',
    date: '2026-05-22',
    paymentMethod: 'UPI',
    notes: 'Mobile app development course'
  },
  {
    id: 'tx-10',
    title: 'Weekly Dinner Outing',
    amount: 2800,
    type: 'expense',
    category: 'Food',
    date: '2026-05-25',
    paymentMethod: 'UPI',
    notes: 'Family dinner at restaurant'
  },
  {
    id: 'tx-11',
    title: 'Monthly Salary Payout',
    amount: 75000,
    type: 'income',
    category: 'Salary',
    date: '2026-06-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Primary job monthly salary payout'
  },
  {
    id: 'tx-12',
    title: 'House Rent Payment',
    amount: 15000,
    type: 'expense',
    category: 'Bills',
    date: '2026-06-02',
    paymentMethod: 'Bank Transfer',
    notes: 'Apartment rent'
  },
  {
    id: 'tx-13',
    title: 'Metro Smartcard Recharge',
    amount: 1000,
    type: 'expense',
    category: 'Travel',
    date: '2026-06-03',
    paymentMethod: 'UPI',
    notes: 'Monthly commute recharge'
  }
];

export const initialUser = {
  name: 'Alex Mercer',
  email: 'alex.mercer@spendwise.io',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  token: 'mock-jwt-token-12345'
};

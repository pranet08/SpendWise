# SpendWise - Modern Expense Tracker Dashboard

SpendWise is a premium, internship-level personal finance dashboard built as a portfolio project for learning React and frontend development. It features a modern, clean SaaS aesthetic inspired by Stripe, Linear, and Vercel. 

This project is tailored to beginner-to-intermediate students, focusing on clean, readable component logic, standard React state synchronization patterns, and high-fidelity design layouts.

---

## 🚀 Live Demo & Portfolio Focus
This dashboard is fully frontend-only, compiling with zero errors. Perfect for including in internships applications to showcase core frontend competence.
- **Visual Aesthetics**: Clean spacing, rounded card elements, custom glassmorphism panels, and a modern purple/blue gradient color system.
- **Dark/Light Mode**: Persisted dynamically to `localStorage` and synchronized using root class bindings.
- **Interactive Graphs**: Responsive data layouts utilizing Recharts (Pie/Donut breakdown, Chronological Line flow, and Income vs Expenses comparisons).

---

## 🛠️ Tech Stack & Key Libraries

- **Framework Core**: React + Vite (Fast HMR compilation)
- **Programming Language**: JavaScript (ES6+ standard)
- **Styling Layouts**: Tailwind CSS v3 (Custom utility classes and Dark Mode)
- **Routing Engine**: React Router DOM (Guarded routing layout structures)
- **Animation Motion**: Framer Motion (Smooth page entries and self-dismissing alerts)
- **Visual Analytics**: Recharts (Custom SVG gradient area charts)
- **Icons Resource**: React Icons (Fi - Feather Icons kit)

---

## 📂 Project Directory Structure

```text
src/
 ├── assets/          # Static assets (Vite logo, etc.)
 ├── charts/          # Recharts visualization wrappers
 │    ├── CategoryPieChart.jsx    # Donut chart showing expense distribution
 │    ├── MonthlyBarChart.jsx     # Vertical columns comparing income vs expenses
 │    └── TrendsLineChart.jsx      # Area flow chart representing daily expenditures
 ├── components/      # Reusable dashboard widgets
 │    ├── Navbar.jsx              # Header breadcrumbs, theme toggler, and notifications
 │    ├── ProtectedRoute.jsx      # Route authorization checker
 │    ├── Sidebar.jsx             # Collapsible menu navigation and profile box
 │    ├── StatCard.jsx            # KPI metric cards with custom hover scale effects
 │    ├── Toast.jsx               # Floating self-dismissing alerts overlay
 │    └── TransactionModal.jsx    # Unified add/edit transaction form modal
 ├── context/         # Central State Provider
 │    └── AppContext.jsx          # Syncs user profile, dark theme, and transactions
 ├── data/            # Mock dataset definitions
 │    └── mockData.js             # Initial transaction history for sandbox testing
 ├── pages/           # Dynamic view controllers
 │    ├── Analytics.jsx           # Aggregated reports and full chart displays
 │    ├── BudgetPlanner.jsx       # Progress meters, warnings, and limits planner
 │    ├── Dashboard.jsx           # Core homepage with KPI grid and quick lists
 │    ├── Login.jsx               # Centered login panel with autocomplete buttons
 │    ├── SavingsTracker.jsx      # Savings milestones and motivational tips
 │    ├── Settings.jsx            # Account profile editors and data reset options
 │    └── Signup.jsx              # Account creation interface with gender select
 ├── styles/          # Styling configurations
 ├── utils/           # Formatting utilities (currency formatters, dates)
 ├── App.css          # Cleared base styling override
 ├── App.jsx          # Route mappings and layout skeletons
 ├── index.css        # Tailwind imports and custom glassmorphic rules
 └── main.jsx         # App mounting entry wrapper
```

---

## 📝 Setup and Installation Instructions

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Install Dependencies
Navigate to the root directory and install node modules:
```bash
npm install
```

### 3. Start Development Server
Launch the local development environment:
```bash
npm.cmd run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
Verify that build scripts compile cleanly:
```bash
npm run build
```
This outputs minified code bundles inside the `/dist` folder.

---

## 📖 Student Learning Takeaways

Building this dashboard will help you understand:

### 1. The Context API for State Management
Rather than relying on heavy libraries like Redux, we use React's built-in `createContext` and `useContext` hooks. This simplifies synchronizing transactions, user profiles, budget values, and theme toggling across components (e.g. adding an expense instantly recalculates the Net Balance card, triggers a warning toast if it exceeds the budget, and updates charts).

### 2. LocalStorage Persistence (User-Scoped)
Learn how to save user state across page refreshes by synchronizing React states using `useEffect` keyed to the active user:
```javascript
useEffect(() => {
  if (user) {
    localStorage.setItem(`spendwise_transactions_${user.email}`, JSON.stringify(transactions));
  }
}, [transactions, user]);
```

### 3. Reusable UI Architecture
See how components like `StatCard` and `TransactionModal` accept parameters as props to render different values. The `TransactionModal` handles both adding new transactions and editing existing ones by checking for a passed `editId`.

### 4. Guarded Routes & Redirections
Understand page routing and path protection. If a user logs out or clears localStorage, `ProtectedRoute` catches the state and redirects them to the login screen using standard router guards.

---

## 📈 Future Project Improvements
To take this project further, you can try implementing:
1. **CSV Financial Export**: Let users download their transaction history as a CSV file.
2. **Category Budget Limits**: Expand the budget planner so users can set individual limits for Food, Shopping, etc., rather than just a single monthly limit.
3. **Advanced Filters**: Allow users to filter transactions by specific date ranges using a date picker.

# Setup Notes

## Required Package Installation

To use the new navigation and routing features, you need to install `react-router-dom`:

```bash
npm install react-router-dom
```

Or if you encounter permission issues:

```bash
npm install react-router-dom --legacy-peer-deps
```

## New Features Added

1. **Navigation Bar**
   - Finance Hub logo/button that links to home (Dashboard)
   - History page link in navigation
   - Active route highlighting

2. **History Page** (`/history`)
   - Shows all transactions (regular and recurring) over time
   - Filter by type: All, Income, Expenses
   - Respects date range filter from header
   - Clickable investment transactions that open detail modal

3. **Investment Detail Modal**
   - Shows full information for investment-related transactions
   - Detects investments by category name keywords (investment, invest, stock, bond, portfolio, asset)
   - Displays category, amount, date, type, description, and recurring status

## Routes

- `/` - Dashboard (home page with metrics and charts)
- `/history` - Transaction history page

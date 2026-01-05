# Finance Hub Frontend

Modern personal finance management application with clean and premium design.

## Technologies

- **React 18** + **TypeScript**
- **Vite** - fast build tool
- **Tailwind CSS** - styling
- **Recharts** - charts
- **Lucide React** - icons

## Project Structure

```
src/
├── components/
│   ├── Header.tsx                    # Header with add transaction button
│   ├── Dashboard/
│   │   ├── Dashboard.tsx             # Main dashboard with metrics
│   │   └── MetricCard.tsx            # Metric card component
│   ├── TransactionModal/
│   │   └── TransactionModal.tsx      # Add transaction modal
│   └── Charts/
│       ├── LineChart.tsx             # Line chart component
│       ├── DonutChart.tsx            # Donut chart component
│       └── ChartsSection.tsx          # Charts section
├── App.tsx                            # Main component
├── main.tsx                           # Entry point
└── index.css                          # Global styles
```

## Installation & Running

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## UI/UX Features

### 🎨 Design
- Clean and airy interface
- Premium appearance
- Focus on numbers and data
- Minimalist Apple-style charts

### 📊 Dashboard
- **Balance** - main card (2x wider)
- **Income** - green color
- **Expenses** - red color
- **Savings** - blue color
- **Average Expense** - neutral color

### ➕ Transaction Modal
- Tabs for type selection (Income/Expense)
- Large amount input field
- Categories with icons
- Date (defaults to today)
- Comment (optional)
- Recurring transaction toggle
- Receipt attachment

### 📈 Charts
- Line charts for expenses/income over time
- Donut chart by categories
- Minimalist style without unnecessary elements

## Development

The project uses TypeScript for type safety and Tailwind CSS for styling. All components are written with focus on reusability and code cleanliness.

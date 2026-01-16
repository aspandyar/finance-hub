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

## Deployment to GitHub Pages

The frontend is automatically deployed to GitHub Pages using GitHub Actions when you push to the `main` or `master` branch.

### Setup

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: Select "GitHub Actions"

2. **Configure API Backend URL**:
   - The workflow automatically sets `VITE_API_BASE_URL` to `https://financehub-e8151e66cb7f.herokuapp.com/api`
   - This is configured in `.github/workflows/deploy.yml`

3. **Base Path Configuration** (if needed):
   - If your repository is a project page (not user/organization page), you may need to set a base path
   - Update `vite.config.ts` to set `base: '/your-repo-name/'` or set `VITE_BASE_PATH` environment variable

### Manual Deployment

You can also trigger deployment manually:
- Go to Actions tab → "Deploy to GitHub Pages" → Run workflow

### Environment Variables

For production builds, the following environment variables are used:
- `VITE_API_BASE_URL`: Backend API URL (set automatically in GitHub Actions)
- `VITE_BASE_PATH`: Base path for GitHub Pages (optional, defaults to `/`)

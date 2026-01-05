import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from 'lucide-react'
import MetricCard from './MetricCard'

// Mock sparkline component (very thin line with distinct peaks)
function Sparkline() {
  // Pattern: starts upward, dips, rises, dips, ends with slight upward trend
  // Using more points for smoother angular transitions
  const dataPoints = [
    15, 22, 18, 28, 20, 32, 25, 30, 22, 26, 24, 28
  ]
  const max = Math.max(...dataPoints)
  const min = Math.min(...dataPoints)
  const range = max - min || 1
  // Scale to use middle 60% of height (20% to 80%) for better visual balance
  const normalized = dataPoints.map(p => ((p - min) / range) * 20 + 10)

  return (
    <div className="w-full h-full overflow-hidden">
      <svg 
        className="w-full h-full" 
        viewBox="0 0 100 40" 
        preserveAspectRatio="none" 
        style={{ display: 'block' }}
      >
        <polyline
          points={normalized.map((y, i) => {
            const x = (i / (normalized.length - 1)) * 100
            return `${x},${40 - y}`
          }).join(' ')}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-4 gap-6">
        {/* Balance - Wide card */}
        <MetricCard
          title="Balance"
          value="$125,430"
          subtitle="As of today"
          isWide={true}
          sparkline={<Sparkline />}
        />

        {/* Income */}
        <MetricCard
          title="Income"
          value="$45,200"
          icon={<TrendingUp size={20} />}
          color="income"
        />

        {/* Expenses */}
        <MetricCard
          title="Expenses"
          value="$32,100"
          icon={<TrendingDown size={20} />}
          color="expense"
        />

        {/* Savings */}
        <MetricCard
          title="Savings"
          value="$112,330"
          icon={<PiggyBank size={20} />}
          color="savings"
        />

        {/* Average Expense */}
        <MetricCard
          title="Avg. Expense"
          value="$1,605"
          icon={<BarChart3 size={20} />}
          color="neutral"
        />
      </div>
    </div>
  )
}


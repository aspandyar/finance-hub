import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from 'lucide-react'
import MetricCard from './MetricCard'

// Mock sparkline component (very thin line)
function Sparkline() {
  const points = Array.from({ length: 30 }, () => Math.random() * 40 + 30)
  const max = Math.max(...points)
  const min = Math.min(...points)
  const normalized = points.map(p => ((p - min) / (max - min)) * 100)

  return (
    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
      <polyline
        points={normalized.map((y, i) => `${(i / (normalized.length - 1)) * 100},${100 - y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-gray-400"
      />
    </svg>
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


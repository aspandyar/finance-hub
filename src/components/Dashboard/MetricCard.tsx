import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: ReactNode
  color?: 'income' | 'expense' | 'savings' | 'neutral'
  isWide?: boolean
  sparkline?: ReactNode
  additionalContent?: ReactNode
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'neutral',
  isWide = false,
  sparkline,
  additionalContent
}: MetricCardProps) {
  const colorClasses = {
    income: 'text-income',
    expense: 'text-expense',
    savings: 'text-savings',
    neutral: 'text-gray-700'
  }

  return (
    <div
      className={`
        bg-white rounded-card p-6 shadow-card
        ${isWide ? 'col-span-2' : ''}
        transition-all hover:shadow-soft
      `}
    >
      {isWide ? (
        // Wide card layout (Balance)
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </h3>
            {icon && <div className={colorClasses[color]}>{icon}</div>}
          </div>
          <div className="space-y-1">
            <p className={`text-4xl font-semibold ${colorClasses[color]}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {sparkline && (
            <div className="h-12 mt-4 overflow-hidden relative">
              {sparkline}
            </div>
          )}
          {additionalContent && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {additionalContent}
            </div>
          )}
        </div>
      ) : (
        // Regular card layout
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </h3>
            {icon && <div className={colorClasses[color]}>{icon}</div>}
          </div>
          <p className={`text-2xl font-semibold ${colorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {additionalContent && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {additionalContent}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


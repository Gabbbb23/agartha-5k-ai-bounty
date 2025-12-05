import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { RiskLevel, getRiskLevelLabel } from '@/shared/types/analysis'

interface RiskIndicatorProps {
  level: RiskLevel
  score: number
}

export function RiskIndicator({ level, score }: RiskIndicatorProps) {
  const config = {
    low: {
      icon: CheckCircle,
      bgColor: 'bg-clinical-success/20',
      borderColor: 'border-clinical-success/50',
      textColor: 'text-emerald-400',
      glowClass: 'glow-success',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    medium: {
      icon: AlertCircle,
      bgColor: 'bg-clinical-warning/20',
      borderColor: 'border-clinical-warning/50',
      textColor: 'text-amber-400',
      glowClass: 'glow-warning',
      gradient: 'from-amber-500 to-orange-500',
    },
    high: {
      icon: AlertTriangle,
      bgColor: 'bg-clinical-danger/20',
      borderColor: 'border-clinical-danger/50',
      textColor: 'text-red-400',
      glowClass: 'glow-danger',
      gradient: 'from-red-500 to-red-600',
    },
    critical: {
      icon: XCircle,
      bgColor: 'bg-clinical-danger/30',
      borderColor: 'border-clinical-danger',
      textColor: 'text-red-300',
      glowClass: 'glow-danger risk-pulse',
      gradient: 'from-red-600 to-red-700',
    },
  }

  const { icon: Icon, bgColor, borderColor, textColor, glowClass, gradient } = config[level]

  return (
    <div className={`
      flex items-center gap-4 px-5 py-3 rounded-2xl border
      ${bgColor} ${borderColor} ${glowClass}
    `}>
      <div className={`
        w-14 h-14 rounded-xl bg-gradient-to-br ${gradient}
        flex items-center justify-center
      `}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <div className={`text-sm font-medium ${textColor}`}>
          {getRiskLevelLabel(level)}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-sm text-clinical-muted">/100</span>
        </div>
      </div>
      
      {/* Risk meter */}
      <div className="hidden md:block ml-4">
        <div className="w-32 h-3 bg-clinical-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-clinical-muted mt-1">
          <span>Low</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}


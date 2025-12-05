import { DrugInteraction, Contraindication, RiskFactor } from '@/shared/types/analysis'
import { AlertTriangle, XCircle, AlertCircle, Shield } from 'lucide-react'

interface SafetyAlertsProps {
  drugInteractions: DrugInteraction[]
  contraindications: Contraindication[]
  riskFactors: RiskFactor[]
}

export function SafetyAlerts({ drugInteractions, contraindications, riskFactors }: SafetyAlertsProps) {
  // Sort by severity
  const sortedInteractions = [...drugInteractions].sort((a, b) => {
    const order = { contraindicated: 0, major: 1, moderate: 2, minor: 3 }
    return order[a.severity] - order[b.severity]
  })

  const sortedContraindications = [...contraindications].sort((a, _b) => {
    return a.severity === 'absolute' ? -1 : 1
  })

  const sortedRiskFactors = [...riskFactors].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className="space-y-6">
      {/* Drug Interactions */}
      {sortedInteractions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-clinical-warning" />
            Drug Interactions ({sortedInteractions.length})
          </h4>
          <div className="space-y-3">
            {sortedInteractions.map((interaction, index) => (
              <InteractionCard key={index} interaction={interaction} />
            ))}
          </div>
        </div>
      )}

      {/* Contraindications */}
      {sortedContraindications.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-clinical-danger" />
            Contraindications ({sortedContraindications.length})
          </h4>
          <div className="space-y-3">
            {sortedContraindications.map((contraindication, index) => (
              <ContraindicationCard key={index} contraindication={contraindication} />
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {sortedRiskFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-clinical-accent" />
            Risk Factors ({sortedRiskFactors.length})
          </h4>
          <div className="space-y-3">
            {sortedRiskFactors.map((factor, index) => (
              <RiskFactorCard key={index} factor={factor} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InteractionCard({ interaction }: { interaction: DrugInteraction }) {
  const severityConfig = {
    contraindicated: {
      bg: 'bg-clinical-danger/20',
      border: 'border-clinical-danger/50',
      badge: 'badge-danger',
      icon: XCircle,
      iconColor: 'text-clinical-danger',
    },
    major: {
      bg: 'bg-clinical-danger/10',
      border: 'border-clinical-danger/30',
      badge: 'badge-danger',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
    },
    moderate: {
      bg: 'bg-clinical-warning/10',
      border: 'border-clinical-warning/30',
      badge: 'badge-warning',
      icon: AlertCircle,
      iconColor: 'text-amber-400',
    },
    minor: {
      bg: 'bg-clinical-accent/10',
      border: 'border-clinical-accent/30',
      badge: 'badge-info',
      icon: AlertCircle,
      iconColor: 'text-blue-400',
    },
  }

  const config = severityConfig[interaction.severity]
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-medium text-white">{interaction.drug1}</span>
            <span className="text-clinical-muted">+</span>
            <span className="font-medium text-white">{interaction.drug2}</span>
            <span className={`badge ${config.badge}`}>
              {interaction.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{interaction.description}</p>
          <div className="p-2 rounded-lg bg-black/20">
            <p className="text-xs text-clinical-muted">
              <strong>Recommendation:</strong> {interaction.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContraindicationCard({ contraindication }: { contraindication: Contraindication }) {
  const isAbsolute = contraindication.severity === 'absolute'

  return (
    <div className={`p-4 rounded-xl border ${
      isAbsolute 
        ? 'bg-clinical-danger/20 border-clinical-danger/50' 
        : 'bg-clinical-warning/10 border-clinical-warning/30'
    }`}>
      <div className="flex items-start gap-3">
        {isAbsolute ? (
          <XCircle className="w-5 h-5 text-clinical-danger shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-clinical-warning shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-medium text-white">{contraindication.medication}</span>
            <span className="text-clinical-muted">→</span>
            <span className="font-medium text-white">{contraindication.condition}</span>
            <span className={`badge ${isAbsolute ? 'badge-danger' : 'badge-warning'}`}>
              {isAbsolute ? 'ABSOLUTE' : 'RELATIVE'}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{contraindication.description}</p>
          <div className="p-2 rounded-lg bg-black/20">
            <p className="text-xs text-clinical-muted">
              <strong>Recommendation:</strong> {contraindication.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskFactorCard({ factor }: { factor: RiskFactor }) {
  const severityConfig = {
    high: {
      bg: 'bg-clinical-danger/10',
      border: 'border-clinical-danger/30',
      badge: 'badge-danger',
      dot: 'bg-clinical-danger',
    },
    medium: {
      bg: 'bg-clinical-warning/10',
      border: 'border-clinical-warning/30',
      badge: 'badge-warning',
      dot: 'bg-clinical-warning',
    },
    low: {
      bg: 'bg-clinical-accent/10',
      border: 'border-clinical-accent/30',
      badge: 'badge-info',
      dot: 'bg-clinical-accent',
    },
  }

  const config = severityConfig[factor.severity]

  return (
    <div className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full ${config.dot} shrink-0 mt-1.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-medium text-white">{factor.factor}</span>
            <span className={`badge ${config.badge}`}>
              {factor.severity.toUpperCase()} RISK
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{factor.description}</p>
          <div className="p-2 rounded-lg bg-black/20">
            <p className="text-xs text-clinical-muted">
              <strong>Mitigation:</strong> {factor.mitigation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


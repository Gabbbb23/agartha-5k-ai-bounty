import { TreatmentRecommendation } from '@/shared/types/analysis'
import { Pill, Clock, Calendar, Droplets, TrendingUp, AlertTriangle, Eye } from 'lucide-react'

interface TreatmentCardProps {
  recommendation: TreatmentRecommendation
}

export function TreatmentCard({ recommendation }: TreatmentCardProps) {
  const confidenceColor = 
    recommendation.confidenceScore >= 80 ? 'text-emerald-400' :
    recommendation.confidenceScore >= 60 ? 'text-amber-400' :
    'text-red-400'

  return (
    <div className="space-y-6">
      {/* Main recommendation */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Medication info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-clinical-accent to-purple-600 
                            flex items-center justify-center shrink-0">
              <Pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{recommendation.medication}</h3>
              <p className="text-clinical-muted text-sm">Primary recommendation</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoBadge 
              icon={Droplets} 
              label="Dosage" 
              value={recommendation.dosage} 
            />
            <InfoBadge 
              icon={Clock} 
              label="Frequency" 
              value={recommendation.frequency} 
            />
            <InfoBadge 
              icon={Calendar} 
              label="Duration" 
              value={recommendation.duration} 
            />
            <InfoBadge 
              icon={Pill} 
              label="Route" 
              value={recommendation.route} 
            />
          </div>
        </div>

        {/* Confidence score */}
        <div className="md:w-48 shrink-0">
          <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 text-center">
            <TrendingUp className={`w-6 h-6 ${confidenceColor} mx-auto mb-2`} />
            <div className={`text-3xl font-bold ${confidenceColor}`}>
              {recommendation.confidenceScore}%
            </div>
            <div className="text-xs text-clinical-muted">Confidence Score</div>
            <div className="mt-3 w-full h-2 bg-clinical-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  recommendation.confidenceScore >= 80 ? 'bg-clinical-success' :
                  recommendation.confidenceScore >= 60 ? 'bg-clinical-warning' :
                  'bg-clinical-danger'
                }`}
                style={{ width: `${recommendation.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rationale */}
      <div className="p-4 rounded-xl bg-clinical-accent/10 border border-clinical-accent/20">
        <h4 className="text-sm font-semibold text-clinical-accent mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-clinical-accent" />
          Clinical Rationale
        </h4>
        <p className="text-gray-300">{recommendation.rationale}</p>
      </div>

      {/* Monitoring and Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monitoring */}
        {recommendation.monitoringRequired.length > 0 && (
          <div className="p-4 rounded-xl bg-clinical-secondary/30 border border-white/10">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-clinical-accent" />
              Monitoring Required
            </h4>
            <ul className="space-y-2">
              {recommendation.monitoringRequired.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-clinical-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-accent mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {recommendation.warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-clinical-warning/10 border border-clinical-warning/20">
            <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings
            </h4>
            <ul className="space-y-2">
              {recommendation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-300/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-warning mt-1.5 shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

interface InfoBadgeProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

function InfoBadge({ icon: Icon, label, value }: InfoBadgeProps) {
  return (
    <div className="p-3 rounded-lg bg-clinical-secondary/50 border border-white/10">
      <div className="flex items-center gap-2 text-clinical-muted text-xs mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
  )
}


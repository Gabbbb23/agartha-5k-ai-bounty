import { useState } from 'react'
import { AnalysisResult } from '@/shared/types/analysis'
import { useAppStore } from '@/shared/store/appStore'
import { RiskIndicator } from './RiskIndicator'
import { TreatmentCard } from './TreatmentCard'
import { SafetyAlerts } from './SafetyAlerts'
import { AlternativesList } from './AlternativesList'
import { RecommendationsList } from './RecommendationsList'
import { DoctorActions } from './DoctorActions'
import { AuditLog } from './AuditLog'
import { 
  AlertTriangle, 
  FileText, 
  Pill, 
  Stethoscope, 
  History,
  ChevronDown
} from 'lucide-react'

interface DashboardProps {
  analysisResult: AnalysisResult
}

export function Dashboard({ analysisResult }: DashboardProps) {
  const { patientData, doctorDecision } = useAppStore()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['treatment', 'safety'])
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const hasHighRisks = analysisResult.drugInteractions.some(
    i => i.severity === 'major' || i.severity === 'contraindicated'
  ) || analysisResult.contraindications.some(c => c.severity === 'absolute')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clinical Decision Dashboard</h1>
          <p className="text-clinical-muted">
            {patientData?.firstName} {patientData?.lastName} • {patientData?.primaryComplaint}
          </p>
        </div>
        <RiskIndicator 
          level={analysisResult.overallRiskLevel}
          score={analysisResult.riskScore}
        />
      </div>

      {/* Summary Assessment */}
      <div className={`card ${
        hasHighRisks ? 'border-clinical-danger/50 glow-danger' : 'border-white/10'
      }`}>
        <div className="flex items-start gap-4">
          {hasHighRisks && (
            <div className="w-12 h-12 rounded-xl bg-clinical-danger/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-clinical-danger" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white mb-2">Clinical Summary</h3>
            <p className="text-gray-300">{analysisResult.summaryAssessment}</p>
          </div>
        </div>
      </div>

      {/* Safety Alerts - Always show first if there are issues */}
      {(analysisResult.drugInteractions.length > 0 || 
        analysisResult.contraindications.length > 0 ||
        analysisResult.riskFactors.length > 0) && (
        <CollapsibleSection
          id="safety"
          title="Safety Alerts"
          icon={AlertTriangle}
          badge={
            analysisResult.drugInteractions.filter(i => i.severity === 'contraindicated' || i.severity === 'major').length +
            analysisResult.contraindications.filter(c => c.severity === 'absolute').length
          }
          badgeColor="danger"
          expanded={expandedSections.has('safety')}
          onToggle={() => toggleSection('safety')}
        >
          <SafetyAlerts
            drugInteractions={analysisResult.drugInteractions}
            contraindications={analysisResult.contraindications}
            riskFactors={analysisResult.riskFactors}
          />
        </CollapsibleSection>
      )}

      {/* Treatment Plan */}
      <CollapsibleSection
        id="treatment"
        title="Recommended Treatment"
        icon={Pill}
        expanded={expandedSections.has('treatment')}
        onToggle={() => toggleSection('treatment')}
      >
        <TreatmentCard recommendation={analysisResult.primaryRecommendation} />
      </CollapsibleSection>

      {/* Alternative Treatments */}
      {analysisResult.alternativeTreatments.length > 0 && (
        <CollapsibleSection
          id="alternatives"
          title="Alternative Options"
          icon={Stethoscope}
          badge={analysisResult.alternativeTreatments.length}
          badgeColor="info"
          expanded={expandedSections.has('alternatives')}
          onToggle={() => toggleSection('alternatives')}
        >
          <AlternativesList alternatives={analysisResult.alternativeTreatments} />
        </CollapsibleSection>
      )}

      {/* Recommendations */}
      <CollapsibleSection
        id="recommendations"
        title="Additional Recommendations"
        icon={FileText}
        expanded={expandedSections.has('recommendations')}
        onToggle={() => toggleSection('recommendations')}
      >
        <RecommendationsList
          lifestyle={analysisResult.lifestyleRecommendations}
          followUp={analysisResult.followUpRecommendations}
          labTests={analysisResult.labTestsRecommended}
        />
      </CollapsibleSection>

      {/* Doctor Actions */}
      <DoctorActions 
        analysisResult={analysisResult}
        existingDecision={doctorDecision}
      />

      {/* Audit Log */}
      <CollapsibleSection
        id="audit"
        title="Audit Log"
        icon={History}
        expanded={expandedSections.has('audit')}
        onToggle={() => toggleSection('audit')}
      >
        <AuditLog />
      </CollapsibleSection>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-clinical-secondary/30 border border-white/10">
        <p className="text-xs text-clinical-muted">
          <strong>Disclaimer:</strong> {analysisResult.disclaimer}
        </p>
        <p className="text-xs text-clinical-muted mt-2">
          Analysis performed: {new Date(analysisResult.analysisTimestamp).toLocaleString()} | 
          Model: {analysisResult.modelVersion}
        </p>
      </div>
    </div>
  )
}

// Collapsible section component
interface CollapsibleSectionProps {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  badgeColor?: 'danger' | 'warning' | 'success' | 'info'
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  icon: Icon,
  badge,
  badgeColor = 'info',
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const badgeColorClasses = {
    danger: 'bg-clinical-danger/20 text-red-400 border-clinical-danger/30',
    warning: 'bg-clinical-warning/20 text-amber-400 border-clinical-warning/30',
    success: 'bg-clinical-success/20 text-emerald-400 border-clinical-success/30',
    info: 'bg-clinical-accent/20 text-blue-400 border-clinical-accent/30',
  }

  return (
    <div className="card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            badgeColor === 'danger' ? 'bg-clinical-danger/20' :
            badgeColor === 'warning' ? 'bg-clinical-warning/20' :
            'bg-clinical-accent/20'
          }`}>
            <Icon className={`w-5 h-5 ${
              badgeColor === 'danger' ? 'text-clinical-danger' :
              badgeColor === 'warning' ? 'text-clinical-warning' :
              'text-clinical-accent'
            }`} />
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {badge !== undefined && badge > 0 && (
            <span className={`badge ${badgeColorClasses[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-clinical-muted transition-transform duration-200 ${
          expanded ? 'rotate-180' : ''
        }`} />
      </button>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}


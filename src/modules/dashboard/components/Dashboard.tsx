import { useState } from 'react'
import { AnalysisResult } from '@/shared/types/analysis'
import { PatientData, calculateBMI, getBMICategory } from '@/shared/types/patient'
import { useAppStore } from '@/shared/store/appStore'
import { RiskIndicator } from './RiskIndicator'
import { TreatmentCard } from './TreatmentCard'
import { SafetyAlerts } from './SafetyAlerts'
import { AlternativesList } from './AlternativesList'
import { RecommendationsList } from './RecommendationsList'
import { DoctorActions } from './DoctorActions'
import { AuditLog } from './AuditLog'
import { ExportButton } from '@/shared/components/ExportButton'
import { exportAnalysisToJson, exportAnalysisToCsv } from '@/shared/services/exportService'
import { 
  AlertTriangle, 
  FileText, 
  Pill, 
  Stethoscope, 
  History,
  ChevronDown,
  User,
  Heart,
  Activity,
  Cigarette,
  Wine,
  Dumbbell
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
        <div className="flex items-center gap-3">
          {patientData && (
            <ExportButton
              label="Export Analysis"
              options={[
                {
                  label: 'Export as JSON',
                  format: 'json',
                  onClick: () => exportAnalysisToJson(patientData, analysisResult),
                },
                {
                  label: 'Export as CSV',
                  format: 'csv',
                  onClick: () => exportAnalysisToCsv(patientData, analysisResult),
                },
              ]}
            />
          )}
          <RiskIndicator 
            level={analysisResult.overallRiskLevel}
            score={analysisResult.riskScore}
          />
        </div>
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

      {/* Patient Intake Details */}
      {patientData && (
        <CollapsibleSection
          id="patient-details"
          title="Patient Intake Details"
          icon={User}
          expanded={expandedSections.has('patient-details')}
          onToggle={() => toggleSection('patient-details')}
        >
          <PatientDetailsView patient={patientData} />
        </CollapsibleSection>
      )}

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

// Patient Details View component
interface PatientDetailsViewProps {
  patient: PatientData
}

function PatientDetailsView({ patient }: PatientDetailsViewProps) {
  const bmi = calculateBMI(patient.healthMetrics.weight, patient.healthMetrics.height)
  const bmiCategory = getBMICategory(bmi)

  const smokingLabels: Record<string, string> = {
    never: 'Never smoked',
    former: 'Former smoker',
    current: 'Current smoker',
  }

  const alcoholLabels: Record<string, string> = {
    none: 'None',
    occasional: 'Occasional (1-2/week)',
    moderate: 'Moderate (3-7/week)',
    heavy: 'Heavy (8+/week)',
  }

  const exerciseLabels: Record<string, string> = {
    sedentary: 'Sedentary',
    light: 'Light (1-2 days/week)',
    moderate: 'Moderate (3-4 days/week)',
    active: 'Active (5+ days/week)',
  }

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <div>
        <h4 className="text-sm font-semibold text-clinical-accent mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Demographics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Full Name</span>
            <span className="text-white font-medium">{patient.firstName} {patient.lastName}</span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Date of Birth</span>
            <span className="text-white font-medium">{patient.dateOfBirth}</span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Age</span>
            <span className="text-white font-medium">{patient.healthMetrics.age} years</span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Sex</span>
            <span className="text-white font-medium capitalize">{patient.sex}</span>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Health Metrics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Weight</span>
            <span className="text-white font-medium">{patient.healthMetrics.weight} kg</span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Height</span>
            <span className="text-white font-medium">{patient.healthMetrics.height} cm</span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">BMI</span>
            <span className={`font-medium ${
              bmi < 18.5 || bmi >= 30 ? 'text-clinical-danger' : 
              bmi >= 25 ? 'text-clinical-warning' : 'text-clinical-success'
            }`}>{bmi} ({bmiCategory})</span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block">Blood Pressure</span>
            <span className={`font-medium ${
              patient.healthMetrics.bloodPressureSystolic >= 140 || patient.healthMetrics.bloodPressureDiastolic >= 90
                ? 'text-clinical-danger' : 'text-white'
            }`}>
              {patient.healthMetrics.bloodPressureSystolic}/{patient.healthMetrics.bloodPressureDiastolic} mmHg
            </span>
          </div>
          {patient.healthMetrics.heartRate && (
            <div className="bg-clinical-secondary/30 rounded-lg p-3">
              <span className="text-xs text-clinical-muted block">Heart Rate</span>
              <span className="text-white font-medium">{patient.healthMetrics.heartRate} bpm</span>
            </div>
          )}
          {patient.healthMetrics.bloodGlucose && (
            <div className="bg-clinical-secondary/30 rounded-lg p-3">
              <span className="text-xs text-clinical-muted block">Blood Glucose</span>
              <span className="text-white font-medium">{patient.healthMetrics.bloodGlucose} mg/dL</span>
            </div>
          )}
        </div>
      </div>

      {/* Medical History */}
      <div>
        <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Medical History
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block mb-2">Conditions</span>
            {patient.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.conditions.map((condition, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-clinical-muted text-sm">None reported</span>
            )}
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block mb-2">Allergies</span>
            {patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((allergy, i) => (
                  <span key={i} className="px-2 py-1 bg-clinical-danger/20 text-red-300 rounded text-xs">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-clinical-success text-sm">NKDA</span>
            )}
          </div>
        </div>
      </div>

      {/* Current Medications */}
      <div>
        <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
          <Pill className="w-4 h-4" />
          Current Medications ({patient.currentMedications.length})
        </h4>
        {patient.currentMedications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient.currentMedications.map((med, i) => (
              <div key={i} className="bg-clinical-secondary/30 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-white font-medium block">{med.name}</span>
                  <span className="text-xs text-clinical-muted">{med.dosage} • {med.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-clinical-muted text-sm bg-clinical-secondary/30 rounded-lg p-3">No current medications</p>
        )}
      </div>

      {/* Lifestyle */}
      <div>
        <h4 className="text-sm font-semibold text-pink-400 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Lifestyle Factors
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block flex items-center gap-1">
              <Cigarette className="w-3 h-3" /> Smoking
            </span>
            <span className={`font-medium ${
              patient.lifestyle.smokingStatus === 'current' ? 'text-clinical-danger' :
              patient.lifestyle.smokingStatus === 'former' ? 'text-clinical-warning' : 'text-clinical-success'
            }`}>
              {smokingLabels[patient.lifestyle.smokingStatus]}
            </span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block flex items-center gap-1">
              <Wine className="w-3 h-3" /> Alcohol
            </span>
            <span className={`font-medium ${
              patient.lifestyle.alcoholUse === 'heavy' ? 'text-clinical-danger' :
              patient.lifestyle.alcoholUse === 'moderate' ? 'text-clinical-warning' : 'text-white'
            }`}>
              {alcoholLabels[patient.lifestyle.alcoholUse]}
            </span>
          </div>
          <div className="bg-clinical-secondary/30 rounded-lg p-3">
            <span className="text-xs text-clinical-muted block flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> Exercise
            </span>
            <span className="text-white font-medium">
              {exerciseLabels[patient.lifestyle.exerciseFrequency]}
            </span>
          </div>
          {patient.lifestyle.sleepHours && (
            <div className="bg-clinical-secondary/30 rounded-lg p-3">
              <span className="text-xs text-clinical-muted block">Sleep</span>
              <span className={`font-medium ${
                patient.lifestyle.sleepHours < 6 ? 'text-clinical-warning' : 'text-white'
              }`}>
                {patient.lifestyle.sleepHours} hours/night
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Complaint */}
      <div>
        <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Primary Complaint
        </h4>
        <div className="bg-clinical-secondary/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-clinical-muted block">Complaint</span>
              <span className="text-white font-medium">{patient.primaryComplaint}</span>
            </div>
            <div>
              <span className="text-xs text-clinical-muted block">Duration</span>
              <span className="text-white font-medium">{patient.complaintDuration}</span>
            </div>
            <div>
              <span className="text-xs text-clinical-muted block">Severity</span>
              <span className={`font-medium capitalize ${
                patient.complaintSeverity === 'severe' ? 'text-clinical-danger' :
                patient.complaintSeverity === 'moderate' ? 'text-clinical-warning' : 'text-clinical-success'
              }`}>
                {patient.complaintSeverity}
              </span>
            </div>
          </div>
          {patient.additionalNotes && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-clinical-muted block mb-1">Additional Notes</span>
              <p className="text-gray-300 text-sm">{patient.additionalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


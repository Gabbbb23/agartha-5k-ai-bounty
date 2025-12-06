import { useState } from 'react'
import { Users, AlertTriangle, AlertCircle, CheckCircle, XCircle, ChevronDown, Database, Brain } from 'lucide-react'
import { samplePatients } from '../constants/samplePatients'
import { useAppStore } from '@/shared/store/appStore'

export function SamplePatientSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { setPatientData, setCurrentStep } = useAppStore()

  const handleSelectPatient = (patientData: typeof samplePatients[0]['data']) => {
    setPatientData(patientData, true) // true = isSamplePatient
    setCurrentStep(1)
  }

  const getRiskIcon = (riskPreview: string) => {
    if (riskPreview.includes('CRITICAL')) return <XCircle className="w-5 h-5 text-red-500" />
    if (riskPreview.includes('HIGH')) return <AlertTriangle className="w-5 h-5 text-red-400" />
    if (riskPreview.includes('MEDIUM')) return <AlertCircle className="w-5 h-5 text-amber-400" />
    return <CheckCircle className="w-5 h-5 text-emerald-400" />
  }

  const getRiskBadgeClass = (riskPreview: string) => {
    if (riskPreview.includes('CRITICAL')) return 'badge-danger glow-danger'
    if (riskPreview.includes('HIGH')) return 'badge-danger'
    if (riskPreview.includes('MEDIUM')) return 'badge-warning'
    return 'badge-success'
  }

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Quick Start: Load Sample Patient</h3>
            <p className="text-sm text-clinical-muted">Demo patients showing drug interactions, contraindications & allergy checks</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-clinical-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fade-in">
          {/* Info banner */}
          <div className="p-3 rounded-lg bg-clinical-accent/10 border border-clinical-accent/30 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <div className="flex items-center gap-1 text-clinical-accent shrink-0">
                <Brain className="w-4 h-4" />
                <span>+</span>
                <Database className="w-4 h-4" />
              </div>
              <p className="text-gray-300">
                These samples demonstrate the <strong className="text-clinical-accent">two-layer safety approach</strong>: 
                LLM medical intelligence + Database validation (drug interactions, contraindications, allergy cross-reactivity)
              </p>
            </div>
          </div>

          {samplePatients.map((patient, index) => (
            <button
              key={index}
              onClick={() => handleSelectPatient(patient.data)}
              className="w-full p-4 rounded-xl bg-clinical-secondary/50 border border-white/5 
                         hover:border-white/20 hover:bg-clinical-secondary transition-all duration-200
                         text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getRiskIcon(patient.riskPreview)}
                    <span className="font-medium text-white group-hover:text-clinical-accent transition-colors">
                      {patient.label}
                    </span>
                  </div>
                  <p className="text-sm text-clinical-muted mb-2">{patient.description}</p>
                  
                  {/* What this sample demonstrates */}
                  <div className="flex items-center gap-1.5 mb-2 text-xs">
                    {patient.demonstratesFeature.includes('DB:') ? (
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Brain className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span className={`${patient.demonstratesFeature.includes('DB:') ? 'text-cyan-300' : 'text-purple-300'}`}>
                      {patient.demonstratesFeature}
                    </span>
                  </div>
                  
                  <span className={`badge ${getRiskBadgeClass(patient.riskPreview)}`}>
                    {patient.riskPreview}
                  </span>
                </div>
                <div className="text-xs text-clinical-muted text-right">
                  <div>{patient.data.currentMedications.length} meds</div>
                  <div>{patient.data.conditions.length} conditions</div>
                  <div>{patient.data.allergies.length} allergies</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


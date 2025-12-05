import { useEffect } from 'react'
import { PatientData } from '@/shared/types/patient'
import { useAppStore } from '@/shared/store/appStore'
import { analyzePatient } from '../services/analysisService'
import { Loader2, Brain, Shield, AlertTriangle, CheckCircle, Stethoscope } from 'lucide-react'

interface AnalysisViewProps {
  patientData: PatientData
}

export function AnalysisView({ patientData }: AnalysisViewProps) {
  const { 
    setAnalysisResult, 
    setIsAnalyzing, 
    setAnalysisError, 
    setCurrentStep,
    isAnalyzing,
    analysisError 
  } = useAppStore()

  useEffect(() => {
    let mounted = true

    async function runAnalysis() {
      setIsAnalyzing(true)
      setAnalysisError(null)

      try {
        const result = await analyzePatient(patientData)
        
        if (mounted) {
          setAnalysisResult(result)
          setCurrentStep(2) // Move to dashboard
        }
      } catch (error) {
        if (mounted) {
          setAnalysisError(error instanceof Error ? error.message : 'Analysis failed')
        }
      } finally {
        if (mounted) {
          setIsAnalyzing(false)
        }
      }
    }

    runAnalysis()

    return () => {
      mounted = false
    }
  }, [patientData, setAnalysisResult, setIsAnalyzing, setAnalysisError, setCurrentStep])

  const analysisSteps = [
    { icon: Stethoscope, label: 'Processing patient data', delay: '0s' },
    { icon: Shield, label: 'Checking drug interactions', delay: '0.5s' },
    { icon: AlertTriangle, label: 'Identifying contraindications', delay: '1s' },
    { icon: Brain, label: 'Generating treatment plan', delay: '1.5s' },
    { icon: CheckCircle, label: 'Validating recommendations', delay: '2s' },
  ]

  if (analysisError) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-clinical-danger/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-clinical-danger" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
        <p className="text-clinical-muted mb-6">{analysisError}</p>
        <button
          onClick={() => {
            setAnalysisError(null)
            setCurrentStep(0)
          }}
          className="btn-secondary"
        >
          Go Back to Intake
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-clinical-accent to-purple-600 
                        flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Patient Data</h2>
        <p className="text-clinical-muted">
          AI is reviewing medical history, medications, and generating a personalized treatment plan
        </p>
      </div>

      {/* Patient summary */}
      <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-clinical-accent/20 flex items-center justify-center">
            <span className="text-xl font-bold text-clinical-accent">
              {patientData.firstName[0]}{patientData.lastName[0]}
            </span>
          </div>
          <div>
            <div className="font-semibold text-white">
              {patientData.firstName} {patientData.lastName}
            </div>
            <div className="text-sm text-clinical-muted">
              {patientData.healthMetrics.age}yo {patientData.sex} • {patientData.primaryComplaint}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{patientData.currentMedications.length}</div>
            <div className="text-xs text-clinical-muted">Medications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{patientData.conditions.length}</div>
            <div className="text-xs text-clinical-muted">Conditions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{patientData.allergies.length}</div>
            <div className="text-xs text-clinical-muted">Allergies</div>
          </div>
        </div>
      </div>

      {/* Analysis steps */}
      <div className="space-y-3">
        {analysisSteps.map((step, index) => (
          <div
            key={step.label}
            className="flex items-center gap-4 p-3 rounded-lg bg-clinical-secondary/30 animate-fade-in"
            style={{ animationDelay: step.delay }}
          >
            <div className="w-10 h-10 rounded-lg bg-clinical-accent/10 flex items-center justify-center">
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 text-clinical-accent animate-spin" />
              ) : (
                <step.icon className="w-5 h-5 text-clinical-accent" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-gray-300">{step.label}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-clinical-accent animate-pulse" 
                 style={{ animationDelay: `${index * 0.3}s` }} />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="h-2 bg-clinical-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-clinical-accent to-purple-600 rounded-full 
                       animate-pulse transition-all duration-1000"
            style={{ width: isAnalyzing ? '90%' : '100%' }}
          />
        </div>
        <p className="text-center text-sm text-clinical-muted mt-3">
          {isAnalyzing ? 'This may take a few moments...' : 'Analysis complete!'}
        </p>
      </div>
    </div>
  )
}


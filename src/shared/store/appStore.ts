import { create } from 'zustand'
import { PatientData } from '../types/patient'
import { AnalysisResult, AuditLogEntry, DoctorDecision } from '../types/analysis'

interface AppState {
  // Navigation
  currentStep: number
  setCurrentStep: (step: number) => void
  
  // Patient data
  patientData: PatientData | null
  setPatientData: (data: PatientData) => void
  clearPatientData: () => void
  
  // Analysis
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  analysisError: string | null
  setAnalysisError: (error: string | null) => void
  
  // Doctor decision
  doctorDecision: DoctorDecision | null
  setDoctorDecision: (decision: DoctorDecision) => void
  
  // Audit log
  auditLog: AuditLogEntry[]
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void
  
  // Reset
  resetAll: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  
  // Patient data
  patientData: null,
  setPatientData: (data) => {
    set({ patientData: data })
    get().addAuditEntry({
      action: 'created',
      userId: 'system',
      userName: 'System',
      patientId: `${data.firstName}-${data.lastName}`,
      details: 'Patient intake data submitted',
    })
  },
  clearPatientData: () => set({ patientData: null }),
  
  // Analysis
  analysisResult: null,
  setAnalysisResult: (result) => {
    set({ analysisResult: result })
    const patientData = get().patientData
    if (patientData) {
      get().addAuditEntry({
        action: 'created',
        userId: 'ai-system',
        userName: 'AI Clinical Assistant',
        patientId: `${patientData.firstName}-${patientData.lastName}`,
        details: `Analysis completed with risk level: ${result.overallRiskLevel}`,
      })
    }
  },
  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  analysisError: null,
  setAnalysisError: (error) => set({ analysisError: error }),
  
  // Doctor decision
  doctorDecision: null,
  setDoctorDecision: (decision) => {
    set({ doctorDecision: decision })
    const patientData = get().patientData
    if (patientData) {
      get().addAuditEntry({
        action: decision.approved ? 'approved' : 'rejected',
        userId: decision.doctorId,
        userName: decision.doctorName,
        patientId: `${patientData.firstName}-${patientData.lastName}`,
        details: decision.approved 
          ? `Treatment plan approved${decision.modifications.length > 0 ? ' with modifications' : ''}`
          : `Treatment plan rejected: ${decision.rejectionReason}`,
      })
    }
  },
  
  // Audit log
  auditLog: [],
  addAuditEntry: (entry) => set((state) => ({
    auditLog: [
      ...state.auditLog,
      {
        ...entry,
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      },
    ],
  })),
  
  // Reset
  resetAll: () => set({
    currentStep: 0,
    patientData: null,
    analysisResult: null,
    isAnalyzing: false,
    analysisError: null,
    doctorDecision: null,
    auditLog: [],
  }),
}))


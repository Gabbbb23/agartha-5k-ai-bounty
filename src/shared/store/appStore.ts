import { create } from 'zustand'
import { PatientData } from '../types/patient'
import { 
  AnalysisResult, 
  AuditLogEntry, 
  DoctorDecision,
  generateDataHash,
  generateSessionId,
} from '../types/analysis'
import { saveAuditEntry, loadAuditEntries, getClientInfo } from '../services/auditService'
import { isSupabaseConfigured } from '../services/supabase'

// Generate a session ID when the store is created
const currentSessionId = generateSessionId()

interface AppState {
  // Session
  sessionId: string
  
  // Navigation
  currentStep: number
  setCurrentStep: (step: number) => void
  
  // Patient data
  patientData: PatientData | null
  currentPatientId: string | null // Track patient ID for consistent audit logging
  setPatientData: (data: PatientData, isSamplePatient?: boolean) => void
  loadPatientForReanalysis: (data: PatientData, existingPatientId: string) => void // Load without new audit entry
  clearPatientData: () => void
  
  // Analysis
  analysisResult: AnalysisResult | null
  analysisId: string | null
  setAnalysisResult: (result: AnalysisResult) => void
  loadAnalysisFromHistory: (result: AnalysisResult) => void // Load without creating audit entry
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  analysisError: string | null
  setAnalysisError: (error: string | null) => void
  
  // Doctor decision
  doctorDecision: DoctorDecision | null
  setDoctorDecision: (decision: DoctorDecision) => void
  
  // Audit log
  auditLog: AuditLogEntry[]
  addAuditEntry: (entry: Partial<AuditLogEntry> & { action: AuditLogEntry['action']; details: string }) => void
  loadAuditLog: () => Promise<void>
  isAuditLogLoading: boolean
  supabaseConnected: boolean
  
  // Reset
  resetAll: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Session
  sessionId: currentSessionId,
  
  // Navigation
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  
  // Patient data
  patientData: null,
  currentPatientId: null,
  setPatientData: (data, isSamplePatient = false) => {
    // Generate a consistent patientId that will be used for all audit entries for this patient
    const patientId = `${data.firstName}-${data.lastName}-${Date.now()}`
    set({ patientData: data, currentPatientId: patientId })
    
    get().addAuditEntry({
      action: 'created',
      userId: isSamplePatient ? 'system' : 'intake-form',
      userName: isSamplePatient ? 'System (Sample Patient)' : 'Intake Form',
      patientId,
      details: isSamplePatient 
        ? `Sample patient loaded: ${data.firstName} ${data.lastName}` 
        : `Patient intake completed: ${data.firstName} ${data.lastName}`,
      patientDataHash: generateDataHash(data),
      patientSnapshot: data as unknown as Record<string, unknown>,
    })
  },
  // Load patient for reanalysis - uses existing patientId, doesn't create new audit entry
  loadPatientForReanalysis: (data, existingPatientId) => {
    set({ patientData: data, currentPatientId: existingPatientId })
    // No audit entry created - the analysis will update the existing patient's record
  },
  clearPatientData: () => set({ patientData: null, currentPatientId: null }),
  
  // Analysis
  analysisResult: null,
  analysisId: null,
  setAnalysisResult: (result) => {
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set({ analysisResult: result, analysisId })
    
    const patientData = get().patientData
    const patientId = get().currentPatientId
    if (patientData && patientId) {
      get().addAuditEntry({
        action: 'created',
        userId: 'ai-system',
        userName: 'AI Clinical Assistant',
        patientId,
        details: `Analysis completed with risk level: ${result.overallRiskLevel.toUpperCase()}`,
        analysisId,
        riskLevel: result.overallRiskLevel,
        riskScore: result.riskScore,
        confidenceScore: result.primaryRecommendation.confidenceScore,
        drugInteractionsCount: result.drugInteractions.length,
        contraindicationsCount: result.contraindications.length,
        treatmentMedication: result.primaryRecommendation.medication,
        treatmentDosage: result.primaryRecommendation.dosage,
        // Store the FULL analysis result so it can be restored from history
        analysisSnapshot: result as unknown as Record<string, unknown>,
      })
    }
  },
  // Load analysis from history without creating a new audit entry
  loadAnalysisFromHistory: (result) => {
    const analysisId = `history-${Date.now()}`
    set({ analysisResult: result, analysisId })
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
    const patientId = get().currentPatientId
    const analysisResult = get().analysisResult
    const analysisId = get().analysisId
    
    if (patientData && patientId) {
      const status = decision.status || (decision.approved ? 'approved' : 'rejected')
      
      // Determine action and details based on status
      let action: 'approved' | 'rejected' | 'deferred' = status
      let details: string
      
      if (status === 'approved') {
        details = `Treatment plan approved${decision.modifications.length > 0 ? ` with ${decision.modifications.length} modification(s)` : ''}`
      } else if (status === 'deferred') {
        details = `Review deferred: ${decision.deferralReason || 'No reason provided'}`
      } else {
        details = `Treatment plan rejected: ${decision.rejectionReason}`
      }
      
      get().addAuditEntry({
        action,
        userId: decision.doctorId,
        userName: decision.doctorName,
        patientId,
        details,
        analysisId: analysisId || undefined,
        riskLevel: analysisResult?.overallRiskLevel,
        riskScore: analysisResult?.riskScore,
        confidenceScore: analysisResult?.primaryRecommendation.confidenceScore,
        drugInteractionsCount: analysisResult?.drugInteractions.length,
        contraindicationsCount: analysisResult?.contraindications.length,
        treatmentMedication: analysisResult?.primaryRecommendation.medication,
        treatmentDosage: analysisResult?.primaryRecommendation.dosage,
        modificationsJson: decision.modifications.length > 0 ? decision.modifications : undefined,
        newValue: decision.additionalNotes,
      })
    }
  },
  
  // Audit log
  auditLog: [],
  isAuditLogLoading: false,
  supabaseConnected: isSupabaseConfigured(),
  
  addAuditEntry: (partialEntry) => {
    const { ipAddress, userAgent } = getClientInfo()
    const sessionId = get().sessionId
    
    const newEntry: AuditLogEntry = {
      // Generate ID and timestamp
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId,
      
      // Required fields with defaults
      action: partialEntry.action,
      details: partialEntry.details,
      userId: partialEntry.userId || 'unknown',
      userName: partialEntry.userName || 'Unknown User',
      patientId: partialEntry.patientId || 'unknown',
      
      // Client info
      ipAddress,
      userAgent,
      
      // Optional fields from partial entry
      patientDataHash: partialEntry.patientDataHash,
      patientSnapshot: partialEntry.patientSnapshot,
      analysisId: partialEntry.analysisId,
      riskLevel: partialEntry.riskLevel,
      riskScore: partialEntry.riskScore,
      confidenceScore: partialEntry.confidenceScore,
      drugInteractionsCount: partialEntry.drugInteractionsCount,
      contraindicationsCount: partialEntry.contraindicationsCount,
      analysisSnapshot: partialEntry.analysisSnapshot,
      treatmentMedication: partialEntry.treatmentMedication,
      treatmentDosage: partialEntry.treatmentDosage,
      previousValue: partialEntry.previousValue,
      newValue: partialEntry.newValue,
      modificationsJson: partialEntry.modificationsJson,
    }
    
    // Add to local state immediately
    set((state) => ({
      auditLog: [...state.auditLog, newEntry],
    }))
    
    // Persist to Supabase (async, non-blocking)
    saveAuditEntry(newEntry).then((success) => {
      if (success) {
        set({ supabaseConnected: true })
      }
    })
  },
  
  loadAuditLog: async () => {
    set({ isAuditLogLoading: true })
    try {
      const entries = await loadAuditEntries()
      set({ 
        auditLog: entries,
        supabaseConnected: isSupabaseConfigured(),
        isAuditLogLoading: false,
      })
    } catch (error) {
      console.error('Failed to load audit log:', error)
      set({ isAuditLogLoading: false })
    }
  },
  
  // Reset (keeps audit log in database, just clears local state)
  // Note: If review was skipped, the case remains as "pending" in history - no fake rejection is logged
  resetAll: () => {
    set({
      currentStep: 0,
      patientData: null,
      currentPatientId: null,
      analysisResult: null,
      analysisId: null,
      isAnalyzing: false,
      analysisError: null,
      doctorDecision: null,
      // Note: We don't clear auditLog or sessionId to preserve history
    })
  },
}))

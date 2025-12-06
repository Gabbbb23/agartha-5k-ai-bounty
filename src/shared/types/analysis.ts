import { z } from 'zod'
import { RiskLevel } from './patient'

// Re-export RiskLevel for convenience
export type { RiskLevel }

// JSON Schema for LLM response validation
export const DrugInteractionSchema = z.object({
  drug1: z.string(),
  drug2: z.string(),
  severity: z.enum(['minor', 'moderate', 'major', 'contraindicated']),
  description: z.string(),
  recommendation: z.string(),
})

export const ContraindicationSchema = z.object({
  medication: z.string(),
  condition: z.string(),
  severity: z.enum(['relative', 'absolute']),
  description: z.string(),
  recommendation: z.string(),
})

export const TreatmentRecommendationSchema = z.object({
  medication: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  route: z.string(), // oral, topical, injection, etc.
  confidenceScore: z.number().min(0).max(100),
  rationale: z.string(),
  monitoringRequired: z.array(z.string()),
  warnings: z.array(z.string()),
})

export const AlternativeTreatmentSchema = z.object({
  medication: z.string(),
  dosage: z.string(),
  rationale: z.string(),
  confidenceScore: z.number().min(0).max(100),
  considerations: z.array(z.string()),
})

export const RiskFactorSchema = z.object({
  factor: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  mitigation: z.string(),
})

export const AnalysisResultSchema = z.object({
  // Overall assessment
  overallRiskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  riskScore: z.number().min(0).max(100),
  summaryAssessment: z.string(),
  
  // Treatment plan
  primaryRecommendation: TreatmentRecommendationSchema,
  alternativeTreatments: z.array(AlternativeTreatmentSchema),
  
  // Safety checks
  drugInteractions: z.array(DrugInteractionSchema),
  contraindications: z.array(ContraindicationSchema),
  riskFactors: z.array(RiskFactorSchema),
  
  // Additional guidance
  lifestyleRecommendations: z.array(z.string()),
  followUpRecommendations: z.array(z.string()),
  labTestsRecommended: z.array(z.string()),
  
  // Metadata
  analysisTimestamp: z.string(),
  modelVersion: z.string(),
  disclaimer: z.string(),
})

export type DrugInteraction = z.infer<typeof DrugInteractionSchema>
export type Contraindication = z.infer<typeof ContraindicationSchema>
export type TreatmentRecommendation = z.infer<typeof TreatmentRecommendationSchema>
export type AlternativeTreatment = z.infer<typeof AlternativeTreatmentSchema>
export type RiskFactor = z.infer<typeof RiskFactorSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

// Enhanced audit log entry for medical compliance
export interface AuditLogEntry {
  // Core identification
  id: string
  timestamp: string
  sessionId: string
  
  // Action details
  action: 'created' | 'viewed' | 'approved' | 'modified' | 'rejected' | 'deferred'
  details: string
  
  // User information
  userId: string
  userName: string
  ipAddress?: string
  userAgent?: string
  
  // Patient reference
  patientId: string
  patientDataHash?: string
  patientSnapshot?: Record<string, unknown>
  
  // Analysis context
  analysisId?: string
  riskLevel?: RiskLevel
  riskScore?: number
  confidenceScore?: number
  drugInteractionsCount?: number
  contraindicationsCount?: number
  analysisSnapshot?: Record<string, unknown>
  
  // Treatment details
  treatmentMedication?: string
  treatmentDosage?: string
  
  // Change tracking
  previousValue?: string
  newValue?: string
  modificationsJson?: string[]
}

// Helper to generate a simple hash for data integrity verification
export function generateDataHash(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `hash-${Math.abs(hash).toString(16)}`
}

// Generate a session ID for grouping related actions
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Doctor decision status
export type DecisionStatus = 'approved' | 'rejected' | 'deferred'

// Doctor decision
export interface DoctorDecision {
  approved: boolean // Keep for backward compatibility (true = approved, false = rejected/deferred)
  status: DecisionStatus
  modifications: string[]
  rejectionReason?: string
  deferralReason?: string
  additionalNotes?: string
  timestamp: string
  doctorId: string
  doctorName: string
}

// Risk level utilities
export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'success'
    case 'medium': return 'warning'
    case 'high': return 'danger'
    case 'critical': return 'danger'
  }
}

export function getRiskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Low Risk'
    case 'medium': return 'Medium Risk'
    case 'high': return 'High Risk'
    case 'critical': return 'Critical Risk'
  }
}


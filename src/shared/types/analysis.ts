import { z } from 'zod'
import { RiskLevel } from './patient'

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

// Audit log entry
export interface AuditLogEntry {
  id: string
  timestamp: string
  action: 'created' | 'viewed' | 'approved' | 'modified' | 'rejected'
  userId: string
  userName: string
  patientId: string
  details: string
  previousValue?: string
  newValue?: string
}

// Doctor decision
export interface DoctorDecision {
  approved: boolean
  modifications: string[]
  rejectionReason?: string
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


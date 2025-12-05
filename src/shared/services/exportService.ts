import { AnalysisResult, AuditLogEntry } from '../types/analysis'
import { PatientData } from '../types/patient'
import { 
  DrugInteractionEntry, 
  ContraindicationEntry, 
  AllergyMappingEntry 
} from './medicalDatabaseService'

// ==================== JSON Export ====================

export function exportToJson(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, `${filename}.json`, 'application/json')
}

// ==================== CSV Export ====================

export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle arrays, objects, and special characters
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ]

  const csvString = csvRows.join('\n')
  downloadFile(csvString, `${filename}.csv`, 'text/csv')
}

// ==================== Download Helper ====================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ==================== Analysis Export ====================

export interface AnalysisExportData {
  exportDate: string
  patient: PatientData
  analysis: AnalysisResult
}

export function exportAnalysisToJson(patient: PatientData, analysis: AnalysisResult): void {
  const exportData: AnalysisExportData = {
    exportDate: new Date().toISOString(),
    patient,
    analysis,
  }
  const filename = `analysis_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}`
  exportToJson(exportData, filename)
}

export function exportAnalysisToCsv(patient: PatientData, analysis: AnalysisResult): void {
  const flatData = [{
    // Patient Info
    patientName: `${patient.firstName} ${patient.lastName}`,
    dateOfBirth: patient.dateOfBirth,
    age: patient.healthMetrics.age,
    sex: patient.sex,
    primaryComplaint: patient.primaryComplaint,
    complaintDuration: patient.complaintDuration,
    complaintSeverity: patient.complaintSeverity,
    conditions: patient.conditions.join('; '),
    allergies: patient.allergies.join('; '),
    currentMedications: patient.currentMedications.map(m => `${m.name} ${m.dosage}`).join('; '),
    
    // Health Metrics
    weight: patient.healthMetrics.weight,
    height: patient.healthMetrics.height,
    bloodPressure: `${patient.healthMetrics.bloodPressureSystolic}/${patient.healthMetrics.bloodPressureDiastolic}`,
    heartRate: patient.healthMetrics.heartRate,
    bloodGlucose: patient.healthMetrics.bloodGlucose,
    
    // Lifestyle
    smokingStatus: patient.lifestyle.smokingStatus,
    alcoholUse: patient.lifestyle.alcoholUse,
    exerciseFrequency: patient.lifestyle.exerciseFrequency,
    sleepHours: patient.lifestyle.sleepHours,
    
    // Analysis Results
    overallRiskLevel: analysis.overallRiskLevel,
    riskScore: analysis.riskScore,
    summaryAssessment: analysis.summaryAssessment,
    
    // Treatment
    recommendedMedication: analysis.primaryRecommendation.medication,
    recommendedDosage: analysis.primaryRecommendation.dosage,
    recommendedFrequency: analysis.primaryRecommendation.frequency,
    recommendedDuration: analysis.primaryRecommendation.duration,
    treatmentRationale: analysis.primaryRecommendation.rationale,
    confidenceScore: analysis.primaryRecommendation.confidenceScore,
    
    // Safety
    drugInteractionsCount: analysis.drugInteractions.length,
    drugInteractions: analysis.drugInteractions.map(i => `${i.drug1}+${i.drug2} (${i.severity})`).join('; '),
    contraindicationsCount: analysis.contraindications.length,
    contraindications: analysis.contraindications.map(c => `${c.medication}: ${c.condition} (${c.severity})`).join('; '),
    riskFactorsCount: analysis.riskFactors.length,
    riskFactors: analysis.riskFactors.map(r => `${r.factor} (${r.severity})`).join('; '),
    
    // Recommendations
    lifestyleRecommendations: analysis.lifestyleRecommendations.join('; '),
    followUpRecommendations: analysis.followUpRecommendations.join('; '),
    labTestsRecommended: analysis.labTestsRecommended.join('; '),
    
    // Metadata
    analysisTimestamp: analysis.analysisTimestamp,
    modelVersion: analysis.modelVersion,
    exportDate: new Date().toISOString(),
  }]

  const filename = `analysis_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}`
  exportToCsv(flatData, filename)
}

// ==================== Audit Log Export ====================

export function exportAuditLogToJson(auditLog: AuditLogEntry[]): void {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalEntries: auditLog.length,
    entries: auditLog,
  }
  const filename = `audit_log_${new Date().toISOString().split('T')[0]}`
  exportToJson(exportData, filename)
}

export function exportAuditLogToCsv(auditLog: AuditLogEntry[]): void {
  const flatData = auditLog.map(entry => ({
    id: entry.id,
    timestamp: entry.timestamp,
    sessionId: entry.sessionId,
    action: entry.action,
    userId: entry.userId,
    userName: entry.userName,
    patientId: entry.patientId,
    details: entry.details,
    riskLevel: entry.riskLevel || '',
    riskScore: entry.riskScore ?? '',
    confidenceScore: entry.confidenceScore ?? '',
    treatmentMedication: entry.treatmentMedication || '',
    treatmentDosage: entry.treatmentDosage || '',
    drugInteractionsCount: entry.drugInteractionsCount ?? '',
    contraindicationsCount: entry.contraindicationsCount ?? '',
    ipAddress: entry.ipAddress || '',
    userAgent: entry.userAgent || '',
  }))

  const filename = `audit_log_${new Date().toISOString().split('T')[0]}`
  exportToCsv(flatData, filename)
}

// ==================== Medical Database Export ====================

export interface MedicalDatabaseExportData {
  exportDate: string
  drugInteractions: DrugInteractionEntry[]
  contraindications: ContraindicationEntry[]
  allergyMappings: AllergyMappingEntry[]
  statistics: {
    totalDrugInteractions: number
    totalContraindications: number
    totalAllergyMappings: number
  }
}

export function exportMedicalDatabaseToJson(
  drugInteractions: DrugInteractionEntry[],
  contraindications: ContraindicationEntry[],
  allergyMappings: AllergyMappingEntry[]
): void {
  const exportData: MedicalDatabaseExportData = {
    exportDate: new Date().toISOString(),
    drugInteractions,
    contraindications,
    allergyMappings,
    statistics: {
      totalDrugInteractions: drugInteractions.length,
      totalContraindications: contraindications.length,
      totalAllergyMappings: allergyMappings.length,
    },
  }
  const filename = `medical_database_${new Date().toISOString().split('T')[0]}`
  exportToJson(exportData, filename)
}

export function exportDrugInteractionsToCsv(drugInteractions: DrugInteractionEntry[]): void {
  const flatData = drugInteractions.map(entry => ({
    id: entry.id || '',
    drug1: entry.drug1,
    drug2: entry.drug2,
    severity: entry.severity,
    description: entry.description,
    mechanism: entry.mechanism || '',
    source: entry.source || '',
    isVerified: entry.is_verified ? 'Yes' : 'No',
    createdAt: entry.created_at || '',
  }))

  const filename = `drug_interactions_${new Date().toISOString().split('T')[0]}`
  exportToCsv(flatData, filename)
}

export function exportContraindicationsToCsv(contraindications: ContraindicationEntry[]): void {
  const flatData = contraindications.map(entry => ({
    id: entry.id || '',
    drug: entry.drug,
    condition: entry.condition,
    severity: entry.severity,
    description: entry.description,
    source: entry.source || '',
    isVerified: entry.is_verified ? 'Yes' : 'No',
    createdAt: entry.created_at || '',
  }))

  const filename = `contraindications_${new Date().toISOString().split('T')[0]}`
  exportToCsv(flatData, filename)
}

export function exportAllergyMappingsToCsv(allergyMappings: AllergyMappingEntry[]): void {
  const flatData = allergyMappings.map(entry => ({
    id: entry.id || '',
    allergy: entry.allergy,
    drugClasses: entry.drug_classes.join('; '),
    crossReactants: entry.cross_reactants.join('; '),
    notes: entry.notes || '',
    isVerified: entry.is_verified ? 'Yes' : 'No',
    createdAt: entry.created_at || '',
  }))

  const filename = `allergy_mappings_${new Date().toISOString().split('T')[0]}`
  exportToCsv(flatData, filename)
}

// ==================== Full Report Export ====================

export interface FullReportExportData {
  exportDate: string
  patient: PatientData | null
  analysis: AnalysisResult | null
  auditLog: AuditLogEntry[]
  medicalDatabase: {
    drugInteractions: DrugInteractionEntry[]
    contraindications: ContraindicationEntry[]
    allergyMappings: AllergyMappingEntry[]
  }
}

export function exportFullReportToJson(
  patient: PatientData | null,
  analysis: AnalysisResult | null,
  auditLog: AuditLogEntry[],
  drugInteractions: DrugInteractionEntry[],
  contraindications: ContraindicationEntry[],
  allergyMappings: AllergyMappingEntry[]
): void {
  const exportData: FullReportExportData = {
    exportDate: new Date().toISOString(),
    patient,
    analysis,
    auditLog,
    medicalDatabase: {
      drugInteractions,
      contraindications,
      allergyMappings,
    },
  }
  
  const patientName = patient ? `${patient.firstName}_${patient.lastName}` : 'no_patient'
  const filename = `full_report_${patientName}_${new Date().toISOString().split('T')[0]}`
  exportToJson(exportData, filename)
}


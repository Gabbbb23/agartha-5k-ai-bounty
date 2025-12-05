import { supabase, isSupabaseConfigured } from './supabase'
import { AuditLogEntry } from '../types/analysis'

// Database table type (matches enhanced Supabase schema)
interface AuditLogRow {
  id: string
  timestamp: string
  session_id: string | null
  action: string
  details: string
  user_id: string
  user_name: string
  ip_address: string | null
  user_agent: string | null
  patient_id: string
  patient_data_hash: string | null
  patient_snapshot: Record<string, unknown> | null
  analysis_id: string | null
  risk_level: string | null
  risk_score: number | null
  confidence_score: number | null
  drug_interactions_count: number | null
  contraindications_count: number | null
  analysis_snapshot: Record<string, unknown> | null
  treatment_medication: string | null
  treatment_dosage: string | null
  previous_value: string | null
  new_value: string | null
  modifications_json: string[] | null
  created_at?: string
}

// Convert database row to app type
function rowToEntry(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    sessionId: row.session_id || '',
    action: row.action as AuditLogEntry['action'],
    details: row.details,
    userId: row.user_id,
    userName: row.user_name,
    ipAddress: row.ip_address || undefined,
    userAgent: row.user_agent || undefined,
    patientId: row.patient_id,
    patientDataHash: row.patient_data_hash || undefined,
    patientSnapshot: row.patient_snapshot || undefined,
    analysisId: row.analysis_id || undefined,
    riskLevel: row.risk_level as AuditLogEntry['riskLevel'],
    riskScore: row.risk_score || undefined,
    confidenceScore: row.confidence_score || undefined,
    drugInteractionsCount: row.drug_interactions_count || undefined,
    contraindicationsCount: row.contraindications_count || undefined,
    analysisSnapshot: row.analysis_snapshot || undefined,
    treatmentMedication: row.treatment_medication || undefined,
    treatmentDosage: row.treatment_dosage || undefined,
    previousValue: row.previous_value || undefined,
    newValue: row.new_value || undefined,
    modificationsJson: row.modifications_json || undefined,
  }
}

// Convert app type to database row
function entryToRow(entry: AuditLogEntry): Omit<AuditLogRow, 'created_at'> {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    session_id: entry.sessionId || null,
    action: entry.action,
    details: entry.details,
    user_id: entry.userId,
    user_name: entry.userName,
    ip_address: entry.ipAddress || null,
    user_agent: entry.userAgent || null,
    patient_id: entry.patientId,
    patient_data_hash: entry.patientDataHash || null,
    patient_snapshot: entry.patientSnapshot || null,
    analysis_id: entry.analysisId || null,
    risk_level: entry.riskLevel || null,
    risk_score: entry.riskScore || null,
    confidence_score: entry.confidenceScore || null,
    drug_interactions_count: entry.drugInteractionsCount || null,
    contraindications_count: entry.contraindicationsCount || null,
    analysis_snapshot: entry.analysisSnapshot || null,
    treatment_medication: entry.treatmentMedication || null,
    treatment_dosage: entry.treatmentDosage || null,
    previous_value: entry.previousValue || null,
    new_value: entry.newValue || null,
    modifications_json: entry.modificationsJson || null,
  }
}

/**
 * Get client information for audit logging
 */
export function getClientInfo(): { ipAddress: string; userAgent: string } {
  return {
    // In a real app, IP would come from server. For client-side, we mark it as client-side
    ipAddress: 'client-side',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  }
}

/**
 * Save an audit entry to Supabase
 */
export async function saveAuditEntry(entry: AuditLogEntry): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase not configured, audit entry not persisted:', entry.id)
    return false
  }

  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert(entryToRow(entry))

    if (error) {
      console.error('Failed to save audit entry:', error)
      return false
    }

    console.log('✓ Audit entry saved:', entry.action, entry.details)
    return true
  } catch (err) {
    console.error('Error saving audit entry:', err)
    return false
  }
}

/**
 * Load all audit entries from Supabase
 */
export async function loadAuditEntries(): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase not configured, returning empty audit log')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: true })
      .limit(500) // Limit for performance

    if (error) {
      console.error('Failed to load audit entries:', error)
      return []
    }

    console.log(`✓ Loaded ${data?.length || 0} audit entries from Supabase`)
    return (data || []).map(rowToEntry)
  } catch (err) {
    console.error('Error loading audit entries:', err)
    return []
  }
}

/**
 * Load audit entries for a specific patient
 */
export async function loadAuditEntriesForPatient(patientId: string): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Failed to load audit entries for patient:', error)
      return []
    }

    return (data || []).map(rowToEntry)
  } catch (err) {
    console.error('Error loading audit entries for patient:', err)
    return []
  }
}

/**
 * Load audit entries for a specific session
 */
export async function loadAuditEntriesForSession(sessionId: string): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Failed to load audit entries for session:', error)
      return []
    }

    return (data || []).map(rowToEntry)
  } catch (err) {
    console.error('Error loading audit entries for session:', err)
    return []
  }
}

/**
 * Get compliance summary for a date range
 */
export async function getComplianceSummary(startDate: string, endDate: string): Promise<{
  totalActions: number
  approvals: number
  rejections: number
  highRiskDecisions: number
  uniquePatients: number
  uniqueUsers: number
} | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, risk_level, patient_id, user_id')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)

    if (error) {
      console.error('Failed to get compliance summary:', error)
      return null
    }

    const entries = data || []
    return {
      totalActions: entries.length,
      approvals: entries.filter(e => e.action === 'approved').length,
      rejections: entries.filter(e => e.action === 'rejected').length,
      highRiskDecisions: entries.filter(e => 
        e.risk_level === 'high' || e.risk_level === 'critical'
      ).length,
      uniquePatients: new Set(entries.map(e => e.patient_id)).size,
      uniqueUsers: new Set(entries.map(e => e.user_id)).size,
    }
  } catch (err) {
    console.error('Error getting compliance summary:', err)
    return null
  }
}

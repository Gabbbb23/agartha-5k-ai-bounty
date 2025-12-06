import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/shared/store/appStore'
import { ExportButton } from '@/shared/components/ExportButton'
import { AuditLogEntry } from '@/shared/types/analysis'
import { PatientData } from '@/shared/types/patient'
import { 
  Clock, 
  User, 
  FileText, 
  Check, 
  X, 
  Database, 
  CloudOff, 
  Loader2,
  AlertTriangle,
  Pill,
  Activity,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Download,
  Heart,
  Cigarette,
  BedDouble,
  Dumbbell,
  Utensils,
  Wine,
  Stethoscope,
  AlertCircle,
  ShieldAlert,
  ClipboardList,
  Edit,
  Brain,
  Users
} from 'lucide-react'
import { format as formatDate } from 'date-fns'

// Represents a patient record derived from audit log entries
interface DrugInteractionDetail {
  drugs: string
  severity: string
}

interface ContraindicationDetail {
  medication: string
  condition: string
  severity: string
}

type DecisionStatus = 'approved' | 'rejected' | 'deferred' | 'pending'

interface PatientRecord {
  id: string
  patientId: string
  patientName: string
  intakeDate: string
  patientData: PatientData | null
  analysisResult: {
    overallRiskLevel: string
    riskScore: number
    primaryMedication: string
    primaryDosage: string
    confidenceScore: number
    drugInteractionsCount: number
    contraindicationsCount: number
    drugInteractions: DrugInteractionDetail[]
    contraindications: ContraindicationDetail[]
  } | null
  decision: {
    status: DecisionStatus
    approved: boolean
    doctorName: string
    decisionDate: string
    modifications: string[]
    additionalNotes?: string
    rejectionReason?: string
    deferralReason?: string
  } | null
  relatedEntries: AuditLogEntry[]
}

interface PatientHistoryPageProps {
  onReanalyzePatient?: (patientData: PatientData, existingPatientId: string) => void
}

export function PatientHistoryPage({ onReanalyzePatient }: PatientHistoryPageProps) {
  const { auditLog, loadAuditLog, isAuditLogLoading, supabaseConnected } = useAppStore()
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterDecision, setFilterDecision] = useState<string>('all')
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null)

  // Load audit log from Supabase on component mount
  useEffect(() => {
    loadAuditLog()
  }, [loadAuditLog])

  const handleReanalyze = (record: PatientRecord) => {
    if (!record.patientData || !onReanalyzePatient) return
    setLoadingPatientId(record.id)
    // Pass the existing patientId so we don't create a duplicate entry
    onReanalyzePatient(record.patientData, record.patientId)
  }

  // Process audit log into patient records
  const patientRecords: PatientRecord[] = useMemo(() => {
    const records: Map<string, PatientRecord> = new Map()
    
    // Sort entries by timestamp
    const sortedEntries = [...auditLog].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    
    for (const entry of sortedEntries) {
      // Skip entries without meaningful patient data
      if (!entry.patientId || entry.patientId === 'unknown') continue
      
      // Group by patientId only (patientId already includes timestamp for uniqueness)
      // This allows re-analysis entries to be grouped with the original patient
      const recordKey = entry.patientId
      
      if (!records.has(recordKey)) {
        records.set(recordKey, {
          id: recordKey,
          patientId: entry.patientId,
          patientName: entry.patientId.replace(/-\d+$/, '').replace(/-/g, ' '),
          intakeDate: entry.timestamp,
          patientData: null,
          analysisResult: null,
          decision: null,
          relatedEntries: []
        })
      }
      
      const record = records.get(recordKey)!
      record.relatedEntries.push(entry)
      
      // Extract patient data from intake entry
      if (entry.action === 'created' && entry.patientSnapshot && !record.patientData) {
        record.patientData = entry.patientSnapshot as unknown as PatientData
      }
      
      // Extract analysis result from AI entry
      if (entry.action === 'created' && entry.analysisSnapshot && entry.userId === 'ai-system') {
        const snapshot = entry.analysisSnapshot as {
          drugInteractions?: DrugInteractionDetail[]
          contraindications?: ContraindicationDetail[]
        }
        
        record.analysisResult = {
          overallRiskLevel: entry.riskLevel || 'unknown',
          riskScore: entry.riskScore || 0,
          primaryMedication: entry.treatmentMedication || 'Unknown',
          primaryDosage: entry.treatmentDosage || '',
          confidenceScore: entry.confidenceScore || 0,
          drugInteractionsCount: entry.drugInteractionsCount || 0,
          contraindicationsCount: entry.contraindicationsCount || 0,
          drugInteractions: snapshot.drugInteractions || [],
          contraindications: snapshot.contraindications || [],
        }
      }
      
      // Extract decision from approval/rejection entry
      if (entry.action === 'approved' || entry.action === 'rejected' || entry.action === 'deferred') {
        const status: DecisionStatus = entry.action as DecisionStatus
        record.decision = {
          status,
          approved: entry.action === 'approved',
          doctorName: entry.userName,
          decisionDate: entry.timestamp,
          modifications: entry.modificationsJson || [],
          additionalNotes: entry.newValue,
          rejectionReason: entry.action === 'rejected' ? entry.details : undefined,
          deferralReason: entry.action === 'deferred' ? entry.details : undefined,
        }
      }
    }
    
    // Convert to array and sort by most recent first
    return Array.from(records.values())
      .filter(r => r.patientData || r.analysisResult || r.decision) // Only show meaningful records
      .sort((a, b) => new Date(b.intakeDate).getTime() - new Date(a.intakeDate).getTime())
  }, [auditLog])

  // Filter records
  const filteredRecords = useMemo(() => {
    return patientRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.analysisResult?.primaryMedication.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRisk = filterRisk === 'all' || 
        record.analysisResult?.overallRiskLevel === filterRisk
      
      const isPending = !record.decision && record.analysisResult
      const matchesDecision = filterDecision === 'all' ||
        (filterDecision === 'approved' && record.decision?.approved === true) ||
        (filterDecision === 'rejected' && record.decision?.approved === false) ||
        (filterDecision === 'pending' && isPending)
      
      return matchesSearch && matchesRisk && matchesDecision
    })
  }, [patientRecords, searchTerm, filterRisk, filterDecision])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRecords)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRecords(newExpanded)
  }

  const exportPatientRecord = (record: PatientRecord) => {
    const exportData = {
      patientInfo: {
        name: record.patientName,
        id: record.patientId,
        intakeDate: record.intakeDate,
      },
      patientData: record.patientData,
      analysisResult: record.analysisResult,
      decision: record.decision,
      auditTrail: record.relatedEntries,
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient-${record.patientName.replace(/\s+/g, '-')}-${formatDate(new Date(record.intakeDate), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAllRecords = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const exportData = filteredRecords.map(record => ({
        patientInfo: {
          name: record.patientName,
          id: record.patientId,
          intakeDate: record.intakeDate,
        },
        patientData: record.patientData,
        analysisResult: record.analysisResult,
        decision: record.decision,
      }))
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patient-history-${formatDate(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const headers = [
        'Patient Name', 'Patient ID', 'Intake Date', 'Risk Level', 'Risk Score',
        'Recommended Medication', 'Dosage', 'Confidence', 'Drug Interactions',
        'Contraindications', 'Decision', 'Doctor', 'Decision Date', 'Modifications', 'Notes'
      ]
      
      const rows = filteredRecords.map(record => [
        record.patientName,
        record.patientId,
        formatDate(new Date(record.intakeDate), 'yyyy-MM-dd HH:mm'),
        record.analysisResult?.overallRiskLevel || '',
        record.analysisResult?.riskScore?.toString() || '',
        record.analysisResult?.primaryMedication || '',
        record.analysisResult?.primaryDosage || '',
        record.analysisResult?.confidenceScore ? `${record.analysisResult.confidenceScore}%` : '',
        record.analysisResult?.drugInteractionsCount?.toString() || '',
        record.analysisResult?.contraindicationsCount?.toString() || '',
        record.decision ? (record.decision.approved ? 'Approved' : 'Rejected') : 'Pending',
        record.decision?.doctorName || '',
        record.decision ? formatDate(new Date(record.decision.decisionDate), 'yyyy-MM-dd HH:mm') : '',
        record.decision?.modifications?.join('; ') || '',
        record.decision?.additionalNotes || '',
      ])
      
      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patient-history-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getRiskBadge = (level?: string) => {
    if (!level || level === 'unknown') return null
    const config = {
      low: { bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400', icon: Check },
      medium: { bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-400', icon: AlertCircle },
      high: { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-400', icon: AlertTriangle },
      critical: { bg: 'bg-red-600/30 border-red-500/50', text: 'text-red-300', icon: ShieldAlert },
    }
    const cfg = config[level as keyof typeof config] || config.low
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${cfg.bg} ${cfg.text} border`}>
        <Icon className="w-3.5 h-3.5" />
        {level.toUpperCase()}
      </span>
    )
  }

  // Stats
  const stats = useMemo(() => ({
    total: patientRecords.length,
    approved: patientRecords.filter(r => r.decision?.approved === true).length,
    rejected: patientRecords.filter(r => r.decision?.approved === false).length,
    pending: patientRecords.filter(r => !r.decision && r.analysisResult).length,
    highRisk: patientRecords.filter(r => r.analysisResult?.overallRiskLevel === 'high' || r.analysisResult?.overallRiskLevel === 'critical').length,
  }), [patientRecords])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            Patient History
          </h1>
          <p className="text-clinical-muted mt-1">
            Review past patient records, analyses, and treatment decisions
          </p>
        </div>

        {/* Connection status */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
          supabaseConnected 
            ? 'bg-clinical-success/10 border border-clinical-success/30' 
            : 'bg-clinical-warning/10 border border-clinical-warning/30'
        }`}>
          {supabaseConnected ? (
            <>
              <Database className="w-5 h-5 text-clinical-success" />
              <div>
                <div className="text-sm font-medium text-emerald-400">Connected to Supabase</div>
                <div className="text-xs text-clinical-muted">Records are persisted</div>
              </div>
            </>
          ) : (
            <>
              <CloudOff className="w-5 h-5 text-clinical-warning" />
              <div>
                <div className="text-sm font-medium text-amber-400">In-Memory Only</div>
                <div className="text-xs text-clinical-muted">Records will be lost on refresh</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Patients" value={stats.total} icon={Users} color="text-cyan-400" />
        <StatCard label="Approved" value={stats.approved} icon={Check} color="text-clinical-success" />
        <StatCard label="Rejected" value={stats.rejected} icon={X} color="text-clinical-danger" />
        <StatCard label="Pending Review" value={stats.pending} icon={Clock} color="text-amber-400" />
        <StatCard label="High Risk" value={stats.highRisk} icon={AlertTriangle} color="text-red-400" />
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-clinical-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, ID, or medication..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted text-sm focus:outline-none focus:border-clinical-accent"
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-clinical-muted" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Decisions</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">⚠️ Pending Review</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => loadAuditLog()}
              className="px-3 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-clinical-muted hover:text-white hover:border-white/20 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isAuditLogLoading ? 'animate-spin' : ''}`} />
            </button>
            <ExportButton
              label="Export"
              disabled={filteredRecords.length === 0}
              options={[
                { label: 'Export as JSON', format: 'json', onClick: () => exportAllRecords('json') },
                { label: 'Export as CSV', format: 'csv', onClick: () => exportAllRecords('csv') },
              ]}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-clinical-muted mt-3">
          Showing {filteredRecords.length} of {patientRecords.length} patient records
        </div>
      </div>

      {/* Patient Records */}
      <div className="space-y-4">
        {isAuditLogLoading ? (
          <div className="card">
            <div className="flex items-center justify-center py-12 text-clinical-muted">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span>Loading patient history...</span>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="card">
            <div className="text-center py-12 text-clinical-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No patient records found</p>
              <p className="text-sm mt-1">
                {patientRecords.length > 0 ? 'Try adjusting your filters' : 'Complete a patient workflow to see records here'}
              </p>
            </div>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedRecords.has(record.id)
            
            return (
              <div key={record.id} className="card overflow-hidden p-0">
                {/* Header Row */}
                <button
                  onClick={() => toggleExpanded(record.id)}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-cyan-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-semibold text-white">
                        {record.patientName}
                      </span>
                      {record.analysisResult && getRiskBadge(record.analysisResult.overallRiskLevel)}
                      {record.decision?.approved === true && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium border bg-clinical-success/20 border-clinical-success/30 text-clinical-success">
                          <Check className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                      {record.decision?.approved === false && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium border bg-clinical-danger/20 border-clinical-danger/30 text-clinical-danger">
                          <X className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      )}
                      {!record.decision && record.analysisResult && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium bg-amber-500/20 border border-amber-500/30 text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Review
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Info */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-clinical-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(new Date(record.intakeDate), 'MMM d, yyyy h:mm a')}
                      </span>
                      {record.analysisResult && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5" />
                            {record.analysisResult.primaryMedication}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5" />
                            {record.analysisResult.confidenceScore}% confidence
                          </span>
                        </>
                      )}
                      {record.decision && (
                        <span className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5" />
                          Dr. {record.decision.doctorName.replace('Dr. ', '')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-clinical-muted" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-clinical-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-white/10 space-y-5">
                    {/* Action button for pending patients */}
                    {record.patientData && onReanalyzePatient && !record.decision && record.analysisResult && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pending Physician Review
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            This patient needs a physician decision. Re-analyze to load the case and make a decision.
                          </p>
                        </div>
                        <div className="shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReanalyze(record)
                            }}
                            disabled={loadingPatientId === record.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                       bg-clinical-accent text-white
                                       hover:bg-clinical-accent/80 transition-colors disabled:opacity-50"
                          >
                            <Brain className="w-4 h-4" />
                            {loadingPatientId === record.id ? 'Loading...' : 'Re-Analyze'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Export button */}
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          exportPatientRecord(record)
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                                   bg-cyan-500/10 text-cyan-400 border border-cyan-500/30
                                   hover:bg-cyan-500/20 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Record
                      </button>
                    </div>

                    {/* Patient Demographics & Health */}
                    {record.patientData && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-cyan-400" />
                          Patient Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Demographics */}
                          <InfoCard title="Demographics" icon={User} color="cyan">
                            <InfoRow label="Name" value={`${record.patientData.firstName} ${record.patientData.lastName}`} />
                            <InfoRow label="Date of Birth" value={record.patientData.dateOfBirth} />
                            <InfoRow label="Sex" value={record.patientData.sex} />
                            <InfoRow label="Age" value={`${record.patientData.healthMetrics?.age || 'N/A'} years`} />
                          </InfoCard>

                          {/* Health Metrics */}
                          {record.patientData.healthMetrics && (
                            <InfoCard title="Health Metrics" icon={Heart} color="rose">
                              <InfoRow label="Weight" value={`${record.patientData.healthMetrics.weight} kg`} />
                              <InfoRow label="Height" value={`${record.patientData.healthMetrics.height} cm`} />
                              <InfoRow 
                                label="Blood Pressure" 
                                value={`${record.patientData.healthMetrics.bloodPressureSystolic}/${record.patientData.healthMetrics.bloodPressureDiastolic}`} 
                              />
                              <InfoRow label="Heart Rate" value={`${record.patientData.healthMetrics.heartRate} bpm`} />
                              <InfoRow label="Blood Glucose" value={`${record.patientData.healthMetrics.bloodGlucose} mg/dL`} />
                            </InfoCard>
                          )}

                          {/* Lifestyle */}
                          {record.patientData.lifestyle && (
                            <InfoCard title="Lifestyle" icon={Dumbbell} color="green">
                              <InfoRow label="Smoking" value={record.patientData.lifestyle.smokingStatus} icon={Cigarette} />
                              <InfoRow label="Alcohol" value={record.patientData.lifestyle.alcoholUse} icon={Wine} />
                              <InfoRow label="Exercise" value={record.patientData.lifestyle.exerciseFrequency} icon={Dumbbell} />
                              <InfoRow label="Diet" value={record.patientData.lifestyle.dietType || 'Not specified'} icon={Utensils} />
                              <InfoRow label="Sleep" value={`${record.patientData.lifestyle.sleepHours} hours`} icon={BedDouble} />
                            </InfoCard>
                          )}
                        </div>

                        {/* Conditions, Allergies, Medications */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <ListCard 
                            title="Medical Conditions" 
                            items={record.patientData.conditions} 
                            emptyText="No conditions recorded"
                            color="amber"
                          />
                          <ListCard 
                            title="Allergies" 
                            items={record.patientData.allergies} 
                            emptyText="No allergies recorded"
                            color="red"
                          />
                          <ListCard 
                            title="Current Medications" 
                            items={record.patientData.currentMedications.map(m => `${m.name} ${m.dosage} (${m.frequency})`)} 
                            emptyText="No medications"
                            color="purple"
                          />
                        </div>

                        {/* Chief Complaint */}
                        <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Chief Complaint</h5>
                          <p className="text-white font-medium">{record.patientData.primaryComplaint}</p>
                          <div className="flex gap-4 mt-2 text-sm text-clinical-muted">
                            <span>Duration: {record.patientData.complaintDuration}</span>
                            <span>Severity: {record.patientData.complaintSeverity}</span>
                          </div>
                          {record.patientData.additionalNotes && (
                            <p className="mt-2 text-sm text-gray-400 italic">"{record.patientData.additionalNotes}"</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Results */}
                    {record.analysisResult && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          AI Analysis Results
                        </h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MetricCard 
                            label="Risk Score" 
                            value={record.analysisResult.riskScore.toString()}
                            subtext={`Level: ${record.analysisResult.overallRiskLevel.toUpperCase()}`}
                            color="text-clinical-accent"
                          />
                          <MetricCard 
                            label="Confidence" 
                            value={`${record.analysisResult.confidenceScore}%`}
                            subtext="AI confidence"
                            color="text-purple-400"
                          />
                          <MetricCard 
                            label="Drug Interactions" 
                            value={record.analysisResult.drugInteractionsCount.toString()}
                            subtext="Found"
                            color={record.analysisResult.drugInteractionsCount > 0 ? 'text-red-400' : 'text-emerald-400'}
                          />
                          <MetricCard 
                            label="Contraindications" 
                            value={record.analysisResult.contraindicationsCount.toString()}
                            subtext="Found"
                            color={record.analysisResult.contraindicationsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
                          />
                        </div>

                        {/* Drug Interactions Details */}
                        {record.analysisResult.drugInteractions.length > 0 && (
                          <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                              <h5 className="font-semibold text-red-400">
                                Drug Interactions ({record.analysisResult.drugInteractions.length})
                              </h5>
                            </div>
                            <div className="space-y-2">
                              {record.analysisResult.drugInteractions.map((interaction, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                                  <div className="flex items-center gap-3">
                                    <Pill className="w-4 h-4 text-red-400" />
                                    <span className="text-white font-medium">{interaction.drugs}</span>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                                    interaction.severity === 'contraindicated' 
                                      ? 'bg-red-600/30 text-red-300 border border-red-500/50' 
                                      : interaction.severity === 'major'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {interaction.severity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contraindications Details */}
                        {record.analysisResult.contraindications.length > 0 && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <ShieldAlert className="w-5 h-5 text-amber-400" />
                              <h5 className="font-semibold text-amber-400">
                                Contraindications ({record.analysisResult.contraindications.length})
                              </h5>
                            </div>
                            <div className="space-y-2">
                              {record.analysisResult.contraindications.map((ci, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Pill className="w-4 h-4 text-amber-400" />
                                      <span className="text-white font-medium">{ci.medication}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1 ml-6">
                                      Due to: <span className="text-amber-300">{ci.condition}</span>
                                    </p>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase shrink-0 ${
                                    ci.severity === 'absolute' 
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {ci.severity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No Safety Issues */}
                        {record.analysisResult.drugInteractions.length === 0 && record.analysisResult.contraindications.length === 0 && (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2">
                              <Check className="w-5 h-5 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">No drug interactions or contraindications detected</span>
                            </div>
                          </div>
                        )}

                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                          <h5 className="text-sm font-medium text-purple-400 mb-2">Recommended Treatment</h5>
                          <div className="flex items-center gap-3">
                            <Pill className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-semibold">{record.analysisResult.primaryMedication}</span>
                            <span className="text-gray-400">{record.analysisResult.primaryDosage}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Physician Decision */}
                    {record.decision && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                          Physician Decision
                        </h4>
                        
                        <div className={`p-4 rounded-xl border-2 ${
                          record.decision.approved 
                            ? 'bg-clinical-success/10 border-clinical-success/30' 
                            : 'bg-clinical-danger/10 border-clinical-danger/30'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {record.decision.approved ? (
                                <Check className="w-6 h-6 text-clinical-success" />
                              ) : (
                                <X className="w-6 h-6 text-clinical-danger" />
                              )}
                              <span className={`text-lg font-semibold ${
                                record.decision.approved ? 'text-clinical-success' : 'text-clinical-danger'
                              }`}>
                                {record.decision.approved ? 'Treatment Approved' : 'Treatment Rejected'}
                              </span>
                            </div>
                            <span className="text-sm text-clinical-muted">
                              {formatDate(new Date(record.decision.decisionDate), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-400">
                            Reviewed by: <span className="text-white font-medium">{record.decision.doctorName}</span>
                          </div>

                          {!record.decision.approved && record.decision.rejectionReason && (
                            <div className="mt-3 p-3 rounded-lg bg-clinical-danger/10">
                              <p className="text-sm text-gray-300">{record.decision.rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Modifications */}
                        {record.decision.modifications && record.decision.modifications.length > 0 && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Edit className="w-5 h-5 text-amber-400" />
                              <h5 className="font-medium text-amber-400">
                                Physician Modifications ({record.decision.modifications.length})
                              </h5>
                            </div>
                            <ul className="space-y-2">
                              {record.decision.modifications.map((mod, i) => (
                                <li key={i} className="flex items-start gap-3 bg-amber-500/10 rounded-lg p-3">
                                  <span className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                                    {i + 1}
                                  </span>
                                  <span className="text-gray-200">{mod}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Additional Notes */}
                        {record.decision.additionalNotes && (
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-blue-400" />
                              <h5 className="font-medium text-blue-400">Additional Notes</h5>
                            </div>
                            <p className="text-gray-200">{record.decision.additionalNotes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-clinical-muted" />
                        Activity Timeline ({record.relatedEntries.length} events)
                      </h4>
                      <div className="space-y-2">
                        {record.relatedEntries.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              entry.action === 'approved' ? 'bg-clinical-success' :
                              entry.action === 'rejected' ? 'bg-clinical-danger' :
                              'bg-clinical-accent'
                            }`} />
                            <span className="text-clinical-muted w-32 shrink-0">
                              {formatDate(new Date(entry.timestamp), 'HH:mm:ss')}
                            </span>
                            <span className="text-gray-400">{entry.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ 
  label, 
  value, 
  icon: Icon,
  color = 'text-clinical-accent'
}: { 
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color?: string
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-clinical-muted">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function InfoCard({ 
  title, 
  icon: Icon, 
  color, 
  children 
}: { 
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  children: React.ReactNode 
}) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  }
  const colorClass = colorMap[color] || colorMap.cyan
  
  return (
    <div className={`p-4 rounded-xl border ${colorClass.split(' ').slice(1).join(' ')}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
        <h5 className={`text-sm font-medium ${colorClass.split(' ')[0]}`}>{title}</h5>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function InfoRow({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className="text-gray-300 font-medium capitalize">{value}</span>
    </div>
  )
}

function ListCard({ 
  title, 
  items, 
  emptyText, 
  color 
}: { 
  title: string
  items: string[]
  emptyText: string
  color: string
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; pill: string }> = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', pill: 'bg-amber-500/20 text-amber-300' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', pill: 'bg-red-500/20 text-red-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', pill: 'bg-purple-500/20 text-purple-300' },
  }
  const cfg = colorMap[color] || colorMap.amber
  
  return (
    <div className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border}`}>
      <h5 className={`text-sm font-medium ${cfg.text} mb-2`}>{title}</h5>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-xs ${cfg.pill}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">{emptyText}</p>
      )}
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  subtext, 
  color 
}: { 
  label: string
  value: string
  subtext: string
  color: string
}) {
  return (
    <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 text-center">
      <div className="text-xs text-clinical-muted mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </div>
  )
}


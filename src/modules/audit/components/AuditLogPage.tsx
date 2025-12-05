import { useEffect, useState } from 'react'
import { useAppStore } from '@/shared/store/appStore'
import { 
  Clock, 
  User, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Database, 
  CloudOff, 
  Loader2,
  AlertTriangle,
  Pill,
  Activity,
  Hash,
  Monitor,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'

export function AuditLogPage() {
  const { auditLog, loadAuditLog, isAuditLogLoading, supabaseConnected, sessionId } = useAppStore()
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')

  // Load audit log from Supabase on component mount
  useEffect(() => {
    loadAuditLog()
  }, [loadAuditLog])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEntries(newExpanded)
  }

  // Filter entries
  const filteredEntries = auditLog.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === 'all' || entry.action === filterAction
    const matchesRisk = filterRisk === 'all' || entry.riskLevel === filterRisk
    
    return matchesSearch && matchesAction && matchesRisk
  })

  const actionConfig = {
    created: { icon: FileText, color: 'text-clinical-accent', bg: 'bg-clinical-accent/20', label: 'Created' },
    viewed: { icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Viewed' },
    approved: { icon: Check, color: 'text-clinical-success', bg: 'bg-clinical-success/20', label: 'Approved' },
    modified: { icon: Edit, color: 'text-clinical-warning', bg: 'bg-clinical-warning/20', label: 'Modified' },
    rejected: { icon: X, color: 'text-clinical-danger', bg: 'bg-clinical-danger/20', label: 'Rejected' },
  }

  const getRiskBadge = (level?: string) => {
    if (!level) return null
    const config = {
      low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      critical: 'bg-red-600/30 text-red-300 border-red-500/50',
    }
    return (
      <span className={`badge ${config[level as keyof typeof config] || config.low}`}>
        {level.toUpperCase()}
      </span>
    )
  }

  const handleExport = () => {
    const data = JSON.stringify(filteredEntries, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            Audit Log
          </h1>
          <p className="text-clinical-muted mt-1">
            Complete compliance trail for all clinical decisions
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
                <div className="text-xs text-clinical-muted">Logs are persisted</div>
              </div>
            </>
          ) : (
            <>
              <CloudOff className="w-5 h-5 text-clinical-warning" />
              <div>
                <div className="text-sm font-medium text-amber-400">In-Memory Only</div>
                <div className="text-xs text-clinical-muted">Configure Supabase to persist</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          label="Total Actions" 
          value={auditLog.length} 
          icon={Activity}
          color="text-clinical-accent"
        />
        <StatCard 
          label="Approvals" 
          value={auditLog.filter(e => e.action === 'approved').length}
          icon={Check}
          color="text-clinical-success"
        />
        <StatCard 
          label="Rejections" 
          value={auditLog.filter(e => e.action === 'rejected').length}
          icon={X}
          color="text-clinical-danger"
        />
        <StatCard 
          label="High Risk Decisions" 
          value={auditLog.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length}
          icon={AlertTriangle}
          color="text-clinical-warning"
        />
        <StatCard 
          label="Unique Sessions" 
          value={new Set(auditLog.map(e => e.sessionId)).size}
          icon={Monitor}
          color="text-purple-400"
        />
      </div>

      {/* Current Session Info */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-clinical-accent" />
          <div>
            <div className="text-sm text-clinical-muted">Current Session ID</div>
            <div className="font-mono text-white">{sessionId}</div>
          </div>
        </div>
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
              placeholder="Search by details, user, or patient..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted text-sm focus:outline-none focus:border-clinical-accent"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-clinical-muted" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="modified">Modified</option>
              <option value="viewed">Viewed</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
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
            <button
              onClick={handleExport}
              className="px-3 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-clinical-muted hover:text-white hover:border-white/20 transition-colors"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-clinical-muted mt-3">
          Showing {filteredEntries.length} of {auditLog.length} entries
        </div>
      </div>

      {/* Audit Entries */}
      <div className="card">
        {isAuditLogLoading ? (
          <div className="flex items-center justify-center py-12 text-clinical-muted">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span>Loading audit log...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-clinical-muted">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No audit entries found</p>
            <p className="text-sm mt-1">
              {auditLog.length > 0 ? 'Try adjusting your filters' : 'Start a patient workflow to generate entries'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...filteredEntries].reverse().map((entry) => {
              const config = actionConfig[entry.action]
              const Icon = config.icon
              const isExpanded = expandedEntries.has(entry.id)

              return (
                <div
                  key={entry.id}
                  className="rounded-xl bg-clinical-secondary/30 border border-white/5 
                             hover:border-white/10 transition-all overflow-hidden"
                >
                  {/* Main row */}
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="w-full flex items-start gap-4 p-4 text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                        {entry.riskLevel && getRiskBadge(entry.riskLevel)}
                        {entry.riskScore !== undefined && (
                          <span className="text-xs text-clinical-muted bg-clinical-secondary/50 px-2 py-0.5 rounded">
                            Score: {entry.riskScore}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">{entry.details}</p>
                      
                      <div className="flex items-center gap-6 mt-2 text-sm text-clinical-muted">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {entry.userName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(entry.timestamp), 'HH:mm:ss')}
                        </span>
                        {entry.treatmentMedication && (
                          <span className="flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5" />
                            {entry.treatmentMedication}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-clinical-muted" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-clinical-muted" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/5">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <DetailItem label="Entry ID" value={entry.id} icon={Hash} mono />
                        <DetailItem label="Session ID" value={entry.sessionId} icon={Monitor} mono />
                        <DetailItem label="Patient ID" value={entry.patientId} icon={User} />
                        <DetailItem label="User ID" value={entry.userId} icon={User} />
                        
                        {entry.analysisId && (
                          <DetailItem label="Analysis ID" value={entry.analysisId} icon={Activity} mono />
                        )}
                        {entry.confidenceScore !== undefined && (
                          <DetailItem label="Confidence Score" value={`${entry.confidenceScore}%`} icon={Activity} />
                        )}
                        {entry.drugInteractionsCount !== undefined && (
                          <DetailItem label="Drug Interactions" value={entry.drugInteractionsCount.toString()} icon={AlertTriangle} />
                        )}
                        {entry.contraindicationsCount !== undefined && (
                          <DetailItem label="Contraindications" value={entry.contraindicationsCount.toString()} icon={AlertTriangle} />
                        )}
                        {entry.treatmentDosage && (
                          <DetailItem label="Dosage" value={entry.treatmentDosage} icon={Pill} />
                        )}
                        {entry.patientDataHash && (
                          <DetailItem label="Data Integrity Hash" value={entry.patientDataHash} icon={Hash} mono />
                        )}
                      </div>

                      {entry.userAgent && (
                        <div className="mt-4 p-3 rounded-lg bg-black/20">
                          <div className="text-xs text-clinical-muted mb-1 font-medium">User Agent / Device</div>
                          <div className="text-xs text-gray-400 font-mono break-all">
                            {entry.userAgent}
                          </div>
                        </div>
                      )}

                      {entry.modificationsJson && entry.modificationsJson.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-clinical-warning/10 border border-clinical-warning/20">
                          <div className="text-sm text-amber-400 font-medium mb-2">Doctor Modifications</div>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {entry.modificationsJson.map((mod, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-400">•</span> {mod}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.analysisSnapshot && (
                        <div className="mt-4 p-3 rounded-lg bg-black/20">
                          <div className="text-xs text-clinical-muted mb-2 font-medium">Analysis Snapshot (at time of decision)</div>
                          <pre className="text-xs text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(entry.analysisSnapshot, null, 2)}
                          </pre>
                        </div>
                      )}

                      {entry.patientSnapshot && (
                        <div className="mt-4 p-3 rounded-lg bg-black/20">
                          <div className="text-xs text-clinical-muted mb-2 font-medium">Patient Data Snapshot</div>
                          <pre className="text-xs text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {JSON.stringify(entry.patientSnapshot, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card bg-clinical-secondary/30">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-clinical-muted shrink-0 mt-0.5" />
          <div className="text-sm text-clinical-muted">
            <p className="font-medium text-gray-300 mb-1">About Audit Logging</p>
            <p>
              This audit log captures all clinical workflow actions for HIPAA compliance and medical record-keeping. 
              Each entry includes session tracking, data integrity hashes, user identification, and complete 
              snapshots of patient data and AI analysis at the time of each decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components
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

function DetailItem({ 
  label, 
  value, 
  icon: Icon,
  mono = false
}: { 
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-clinical-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-clinical-muted">{label}</div>
        <div className={`text-sm text-gray-300 break-all ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </div>
      </div>
    </div>
  )
}


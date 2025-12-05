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
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'

export function AuditLog() {
  const { auditLog, loadAuditLog, isAuditLogLoading, supabaseConnected, sessionId } = useAppStore()
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())

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

  const actionConfig = {
    created: { icon: FileText, color: 'text-clinical-accent', bg: 'bg-clinical-accent/20' },
    viewed: { icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    approved: { icon: Check, color: 'text-clinical-success', bg: 'bg-clinical-success/20' },
    modified: { icon: Edit, color: 'text-clinical-warning', bg: 'bg-clinical-warning/20' },
    rejected: { icon: X, color: 'text-clinical-danger', bg: 'bg-clinical-danger/20' },
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

  return (
    <div className="space-y-3">
      {/* Connection status */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${
        supabaseConnected 
          ? 'bg-clinical-success/10 border border-clinical-success/30' 
          : 'bg-clinical-warning/10 border border-clinical-warning/30'
      }`}>
        <div className="flex items-center gap-2">
          {supabaseConnected ? (
            <>
              <Database className="w-4 h-4 text-clinical-success" />
              <span className="text-sm text-emerald-400">Connected to Supabase</span>
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4 text-clinical-warning" />
              <span className="text-sm text-amber-400">In-memory only</span>
            </>
          )}
        </div>
        <div className="text-xs text-clinical-muted font-mono">
          Session: {sessionId.slice(0, 20)}...
        </div>
      </div>

      {/* Stats summary */}
      {auditLog.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <StatCard 
            label="Total Actions" 
            value={auditLog.length} 
            icon={Activity}
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
            label="High Risk" 
            value={auditLog.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length}
            icon={AlertTriangle}
            color="text-clinical-warning"
          />
        </div>
      )}

      <div className="text-sm text-clinical-muted mb-4">
        Complete audit trail for medical compliance and record-keeping
      </div>

      {isAuditLogLoading ? (
        <div className="flex items-center justify-center py-8 text-clinical-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading audit log...</span>
        </div>
      ) : auditLog.length === 0 ? (
        <div className="text-center py-8 text-clinical-muted">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No audit entries yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...auditLog].reverse().map((entry) => {
            const config = actionConfig[entry.action]
            const Icon = config.icon
            const isExpanded = expandedEntries.has(entry.id)

            return (
              <div
                key={entry.id}
                className="rounded-lg bg-clinical-secondary/30 border border-white/5 
                           hover:border-white/10 transition-all overflow-hidden"
              >
                {/* Main row */}
                <button
                  onClick={() => toggleExpanded(entry.id)}
                  className="w-full flex items-start gap-3 p-3 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${config.color} capitalize`}>
                        {entry.action}
                      </span>
                      {entry.riskLevel && getRiskBadge(entry.riskLevel)}
                      {entry.riskScore !== undefined && (
                        <span className="text-xs text-clinical-muted">
                          Score: {entry.riskScore}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mt-0.5">{entry.details}</p>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-clinical-muted">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {entry.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(entry.timestamp), 'MMM d, HH:mm:ss')}
                      </span>
                      {entry.treatmentMedication && (
                        <span className="flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          {entry.treatmentMedication}
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-clinical-muted shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-clinical-muted shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-0">
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <DetailItem label="Entry ID" value={entry.id} icon={Hash} mono />
                      <DetailItem label="Session ID" value={entry.sessionId} icon={Monitor} mono />
                      <DetailItem label="Patient ID" value={entry.patientId} icon={User} />
                      <DetailItem label="User ID" value={entry.userId} icon={User} />
                      
                      {entry.analysisId && (
                        <DetailItem label="Analysis ID" value={entry.analysisId} icon={Activity} mono />
                      )}
                      {entry.confidenceScore !== undefined && (
                        <DetailItem label="Confidence" value={`${entry.confidenceScore}%`} icon={Activity} />
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
                        <DetailItem label="Data Hash" value={entry.patientDataHash} icon={Hash} mono />
                      )}
                    </div>

                    {entry.userAgent && (
                      <div className="mt-3 p-2 rounded bg-black/20">
                        <div className="text-xs text-clinical-muted mb-1">User Agent</div>
                        <div className="text-xs text-gray-400 font-mono break-all">
                          {entry.userAgent.slice(0, 100)}...
                        </div>
                      </div>
                    )}

                    {entry.modificationsJson && entry.modificationsJson.length > 0 && (
                      <div className="mt-3 p-2 rounded bg-clinical-warning/10 border border-clinical-warning/20">
                        <div className="text-xs text-amber-400 font-medium mb-1">Modifications Made</div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {entry.modificationsJson.map((mod, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-amber-400">•</span> {mod}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.analysisSnapshot && (
                      <div className="mt-3 p-2 rounded bg-black/20">
                        <div className="text-xs text-clinical-muted mb-1">Analysis Snapshot</div>
                        <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
                          {JSON.stringify(entry.analysisSnapshot, null, 2)}
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

      <div className="pt-4 border-t border-white/10 mt-4">
        <p className="text-xs text-clinical-muted">
          {supabaseConnected ? (
            <>📋 Audit entries are persisted to Supabase with full compliance data including session tracking, data hashes, and analysis snapshots.</>
          ) : (
            <>📋 Configure Supabase to persist audit logs with full compliance tracking.</>
          )}
        </p>
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
    <div className="p-2 rounded-lg bg-clinical-secondary/30 border border-white/5">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-xs text-clinical-muted">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
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
      <Icon className="w-3 h-3 text-clinical-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-clinical-muted">{label}</div>
        <div className={`text-xs text-gray-300 truncate ${mono ? 'font-mono' : ''}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

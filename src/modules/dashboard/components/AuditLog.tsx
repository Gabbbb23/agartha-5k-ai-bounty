import { useAppStore } from '@/shared/store/appStore'
import { Clock, User, FileText, Check, X, Eye, Edit } from 'lucide-react'
import { format } from 'date-fns'

export function AuditLog() {
  const { auditLog } = useAppStore()

  if (auditLog.length === 0) {
    return (
      <div className="text-center py-8 text-clinical-muted">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No audit entries yet</p>
      </div>
    )
  }

  const actionConfig = {
    created: { icon: FileText, color: 'text-clinical-accent', bg: 'bg-clinical-accent/20' },
    viewed: { icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    approved: { icon: Check, color: 'text-clinical-success', bg: 'bg-clinical-success/20' },
    modified: { icon: Edit, color: 'text-clinical-warning', bg: 'bg-clinical-warning/20' },
    rejected: { icon: X, color: 'text-clinical-danger', bg: 'bg-clinical-danger/20' },
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-clinical-muted mb-4">
        Complete audit trail for compliance and record-keeping
      </div>

      <div className="space-y-2">
        {[...auditLog].reverse().map((entry) => {
          const config = actionConfig[entry.action]
          const Icon = config.icon

          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-clinical-secondary/30 
                         border border-white/5 hover:border-white/10 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium ${config.color} capitalize`}>
                    {entry.action}
                  </span>
                  <span className="text-clinical-muted">•</span>
                  <span className="text-gray-300">{entry.details}</span>
                </div>
                
                <div className="flex items-center gap-4 mt-1 text-xs text-clinical-muted">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {entry.userName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </span>
                </div>

                {entry.previousValue && entry.newValue && (
                  <div className="mt-2 p-2 rounded bg-black/20 text-xs">
                    <span className="text-red-400 line-through">{entry.previousValue}</span>
                    {' → '}
                    <span className="text-emerald-400">{entry.newValue}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-white/10 mt-4">
        <p className="text-xs text-clinical-muted">
          📋 Audit log entries are timestamped and immutable. This log provides a complete 
          record of all actions taken on this patient's treatment plan for compliance purposes.
        </p>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { AnalysisResult, DoctorDecision } from '@/shared/types/analysis'
import { useAppStore } from '@/shared/store/appStore'
import { Check, X, Edit3, User, Send } from 'lucide-react'

interface DoctorActionsProps {
  analysisResult: AnalysisResult
  existingDecision: DoctorDecision | null
}

export function DoctorActions({ analysisResult, existingDecision }: DoctorActionsProps) {
  const { setDoctorDecision } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [doctorName, setDoctorName] = useState('')
  const [modifications, setModifications] = useState<string[]>([])
  const [newModification, setNewModification] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  const handleApprove = () => {
    if (!doctorName.trim()) {
      alert('Please enter your name to approve')
      return
    }

    setDoctorDecision({
      approved: true,
      modifications,
      additionalNotes: additionalNotes || undefined,
      timestamp: new Date().toISOString(),
      doctorId: `dr-${Date.now()}`,
      doctorName: doctorName.trim(),
    })

    setIsEditing(false)
  }

  const handleReject = () => {
    if (!doctorName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setDoctorDecision({
      approved: false,
      modifications: [],
      rejectionReason: rejectionReason.trim(),
      additionalNotes: additionalNotes || undefined,
      timestamp: new Date().toISOString(),
      doctorId: `dr-${Date.now()}`,
      doctorName: doctorName.trim(),
    })

    setShowRejectForm(false)
  }

  const addModification = () => {
    if (newModification.trim()) {
      setModifications([...modifications, newModification.trim()])
      setNewModification('')
    }
  }

  const removeModification = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index))
  }

  // If already decided
  if (existingDecision) {
    return (
      <div className={`card ${
        existingDecision.approved 
          ? 'border-clinical-success/50 bg-clinical-success/5' 
          : 'border-clinical-danger/50 bg-clinical-danger/5'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {existingDecision.approved ? (
            <div className="w-12 h-12 rounded-xl bg-clinical-success/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-clinical-success" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-clinical-danger/20 flex items-center justify-center">
              <X className="w-6 h-6 text-clinical-danger" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white">
              {existingDecision.approved ? 'Treatment Plan Approved' : 'Treatment Plan Rejected'}
            </h3>
            <p className="text-sm text-clinical-muted">
              By {existingDecision.doctorName} on {new Date(existingDecision.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {existingDecision.approved && existingDecision.modifications.length > 0 && (
          <div className="p-3 rounded-lg bg-clinical-warning/10 border border-clinical-warning/20 mb-3">
            <h4 className="text-sm font-medium text-amber-400 mb-2">Modifications Made:</h4>
            <ul className="space-y-1">
              {existingDecision.modifications.map((mod, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-warning mt-1.5" />
                  {mod}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!existingDecision.approved && existingDecision.rejectionReason && (
          <div className="p-3 rounded-lg bg-clinical-danger/10 border border-clinical-danger/20 mb-3">
            <h4 className="text-sm font-medium text-red-400 mb-1">Rejection Reason:</h4>
            <p className="text-sm text-gray-300">{existingDecision.rejectionReason}</p>
          </div>
        )}

        {existingDecision.additionalNotes && (
          <div className="p-3 rounded-lg bg-clinical-secondary/50 border border-white/10">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Additional Notes:</h4>
            <p className="text-sm text-gray-300">{existingDecision.additionalNotes}</p>
          </div>
        )}
      </div>
    )
  }

  // Rejection form
  if (showRejectForm) {
    return (
      <div className="card border-clinical-danger/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <X className="w-5 h-5 text-clinical-danger" />
          Reject Treatment Plan
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-clinical-danger">*</span>
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. John Smith"
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejection Reason <span className="text-clinical-danger">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Explain why this treatment plan is being rejected..."
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes or alternative suggestions..."
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRejectForm(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Edit/Approve form
  if (isEditing) {
    return (
      <div className="card border-clinical-accent/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-clinical-accent" />
          Review & Approve Treatment Plan
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Your Name <span className="text-clinical-danger">*</span>
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. John Smith"
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted focus:outline-none"
            />
          </div>

          {/* Modifications */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modifications (optional)
            </label>
            
            {modifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {modifications.map((mod, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg 
                               bg-clinical-warning/20 text-amber-300 border border-clinical-warning/30 text-sm"
                  >
                    {mod}
                    <button
                      onClick={() => removeModification(index)}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newModification}
                onChange={(e) => setNewModification(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModification())}
                placeholder="e.g., 'Reduce dosage to 25mg', 'Add monitoring every 2 weeks'"
                className="flex-1 px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                           text-white placeholder-clinical-muted text-sm focus:outline-none"
              />
              <button
                onClick={addModification}
                className="px-4 py-2.5 rounded-lg bg-clinical-warning/20 border border-clinical-warning/30 
                           text-amber-300 hover:bg-clinical-warning/30 transition-colors text-sm"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              placeholder="Any additional clinical notes..."
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default action buttons
  const isCritical = analysisResult.overallRiskLevel === 'critical'

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-clinical-accent" />
        Physician Review Required
      </h3>

      {isCritical && (
        <div className="p-4 rounded-xl bg-clinical-danger/20 border border-clinical-danger/50 mb-4">
          <p className="text-sm text-red-300">
            <strong>⚠️ Critical Risk Alert:</strong> This treatment plan contains critical safety concerns.
            Please review all flagged interactions and contraindications carefully before making a decision.
          </p>
        </div>
      )}

      <p className="text-clinical-muted mb-6">
        As the treating physician, please review the AI-generated treatment recommendations 
        and make a clinical decision. You may approve as-is, approve with modifications, or reject.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setIsEditing(true)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Review & Approve
        </button>
        <button
          onClick={() => setShowRejectForm(true)}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 
                     border-clinical-danger/30 hover:bg-clinical-danger/10 hover:border-clinical-danger/50"
        >
          <X className="w-4 h-4 text-clinical-danger" />
          <span className="text-red-400">Reject Plan</span>
        </button>
      </div>
    </div>
  )
}


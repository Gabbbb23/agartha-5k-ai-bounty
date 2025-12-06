import { useState } from 'react'
import { Activity, RefreshCw, AlertTriangle, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function Header() {
  const { resetAll, currentStep, analysisResult, doctorDecision, isAnalyzing } = useAppStore()
  const [showWarning, setShowWarning] = useState(false)

  // Check if review is required (analysis exists but no doctor decision yet)
  const reviewRequired = analysisResult !== null && doctorDecision === null

  const handleNewPatient = () => {
    if (isAnalyzing) return // Don't allow during analysis
    if (reviewRequired) {
      setShowWarning(true)
    } else {
      resetAll()
    }
  }

  const handleForceReset = () => {
    setShowWarning(false)
    resetAll() // Case will remain as "pending" in history
  }

  return (
    <>
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-clinical-accent to-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  MedAssist AI
                </h1>
                <p className="text-xs text-clinical-muted">Clinical Decision Support</p>
              </div>
            </div>
            
            {currentStep > 0 && (
              <div className="flex items-center gap-2">
                {reviewRequired && (
                  <span className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-clinical-warning/20 border border-clinical-warning/30 text-amber-300 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Review Required
                  </span>
                )}
                <button
                  onClick={handleNewPatient}
                  disabled={isAnalyzing}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg 
                    border transition-all duration-200
                    ${isAnalyzing
                      ? 'bg-clinical-secondary/30 border-white/5 text-clinical-muted cursor-not-allowed opacity-50'
                      : reviewRequired 
                        ? 'bg-clinical-secondary/50 border-clinical-warning/30 text-amber-300 hover:border-clinical-warning/50' 
                        : 'bg-clinical-secondary border-white/10 text-gray-300 hover:text-white hover:border-white/20'}
                  `}
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">{isAnalyzing ? 'Analyzing...' : 'New Patient'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWarning(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-clinical-dark border border-clinical-warning/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 text-clinical-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-clinical-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-clinical-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Physician Review Required</h3>
                <p className="text-sm text-clinical-muted">Treatment plan not yet reviewed</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              The AI-generated treatment plan for the current patient has not been reviewed by a physician. 
              For compliance and patient safety, please <strong>approve or reject</strong> the treatment plan 
              before starting a new patient intake.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-clinical-accent text-white font-medium 
                           hover:bg-clinical-accent/90 transition-colors"
              >
                Go to Review
              </button>
              <button
                onClick={handleForceReset}
                className="px-4 py-2.5 rounded-xl border border-clinical-danger/30 text-clinical-danger 
                           hover:bg-clinical-danger/10 transition-colors text-sm"
              >
                Skip Anyway
              </button>
            </div>

            <p className="mt-4 text-xs text-clinical-muted text-center">
              ℹ️ This case will remain as "Pending" in Patient History
            </p>
          </div>
        </div>
      )}
    </>
  )
}

import { Activity, RefreshCw } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function Header() {
  const { resetAll, currentStep } = useAppStore()

  return (
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
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-clinical-secondary 
                         border border-white/10 text-gray-300 hover:text-white hover:border-white/20
                         transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">New Patient</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}


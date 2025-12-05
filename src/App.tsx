import { useState } from 'react'
import { useAppStore } from '@/shared/store/appStore'
import { IntakeWizard } from '@/modules/intake/components/IntakeWizard'
import { AnalysisView } from '@/modules/analysis/components/AnalysisView'
import { Dashboard } from '@/modules/dashboard/components/Dashboard'
import { Header } from '@/shared/components/Header'
import { SamplePatientSelector } from '@/modules/intake/components/SamplePatientSelector'
import { TabNavigation, TabId } from '@/shared/components/TabNavigation'
import { AuditLogPage } from '@/modules/audit/components/AuditLogPage'

function App() {
  const { currentStep, patientData, analysisResult } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabId>('workflow')

  return (
    <div className="min-h-screen bg-pattern">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'workflow' ? (
          <>
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
              {['Intake', 'Analysis', 'Review'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-xs md:text-sm
                    transition-all duration-300
                    ${currentStep > index 
                      ? 'bg-clinical-success text-white' 
                      : currentStep === index 
                        ? 'bg-clinical-accent text-white glow-accent' 
                        : 'bg-clinical-secondary text-clinical-muted border border-white/10'}
                  `}>
                    {currentStep > index ? '✓' : index + 1}
                  </div>
                  <span className={`ml-1 md:ml-2 font-medium text-xs md:text-base ${
                    currentStep >= index ? 'text-gray-100' : 'text-clinical-muted'
                  }`}>
                    {step}
                  </span>
                  {index < 2 && (
                    <div className={`w-4 md:w-16 h-0.5 mx-2 md:mx-4 rounded-full ${
                      currentStep > index ? 'bg-clinical-success' : 'bg-clinical-secondary'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="animate-fade-in">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <SamplePatientSelector />
                  <IntakeWizard />
                </div>
              )}
              {currentStep === 1 && patientData && (
                <AnalysisView patientData={patientData} />
              )}
              {currentStep === 2 && analysisResult && (
                <Dashboard analysisResult={analysisResult} />
              )}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <AuditLogPage />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

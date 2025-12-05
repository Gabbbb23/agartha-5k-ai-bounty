import { useIntakeForm } from '../hooks/useIntakeForm'
import { DemographicsStep } from './steps/DemographicsStep'
import { MedicalHistoryStep } from './steps/MedicalHistoryStep'
import { MedicationsStep } from './steps/MedicationsStep'
import { HealthMetricsStep } from './steps/HealthMetricsStep'
import { LifestyleStep } from './steps/LifestyleStep'
import { ComplaintStep } from './steps/ComplaintStep'
import { ChevronLeft, ChevronRight, Send, User, FileText, Pill, Activity, Heart, Stethoscope, AlertCircle } from 'lucide-react'

const stepIcons = [User, FileText, Pill, Activity, Heart, Stethoscope]

export function IntakeWizard() {
  const {
    form,
    stepErrors,
    wizardStep,
    wizardSteps,
    isFirstStep,
    isLastStep,
    isCurrentStepValid,
    nextStep,
    prevStep,
    goToStep,
    addMedication,
    removeMedication,
    addCondition,
    removeCondition,
    addAllergy,
    removeAllergy,
    onSubmit,
  } = useIntakeForm()

  const { handleSubmit } = form

  const renderStep = () => {
    switch (wizardStep) {
      case 0:
        return <DemographicsStep form={form} />
      case 1:
        return (
          <MedicalHistoryStep
            form={form}
            addCondition={addCondition}
            removeCondition={removeCondition}
            addAllergy={addAllergy}
            removeAllergy={removeAllergy}
          />
        )
      case 2:
        return (
          <MedicationsStep
            form={form}
            addMedication={addMedication}
            removeMedication={removeMedication}
          />
        )
      case 3:
        return <HealthMetricsStep form={form} />
      case 4:
        return <LifestyleStep form={form} />
      case 5:
        return <ComplaintStep form={form} />
      default:
        return null
    }
  }

  const handleNextStep = async () => {
    await nextStep()
  }

  return (
    <div className="card">
      {/* Step indicator with arrows */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
        {wizardSteps.map((step, index) => {
          const Icon = stepIcons[index]
          const isActive = index === wizardStep
          const isCompleted = index < wizardStep

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => goToStep(index)}
                className={`
                  flex flex-col items-center gap-2 min-w-[80px] p-2 rounded-lg transition-all duration-200
                  ${isActive ? 'bg-clinical-accent/20' : 'hover:bg-white/5'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                  ${isActive 
                    ? 'bg-clinical-accent text-white ring-4 ring-clinical-accent/30' 
                    : isCompleted 
                      ? 'bg-clinical-success text-white' 
                      : 'bg-clinical-secondary text-clinical-muted border border-white/10'}
                `}>
                  {isCompleted ? '✓' : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium text-center ${isActive ? 'text-white' : 'text-clinical-muted'}`}>
                  {step.title}
                </span>
              </button>
              
              {/* Arrow between steps */}
              {index < wizardSteps.length - 1 && (
                <div className="flex items-center mx-2">
                  <div className={`
                    h-0.5 w-6 
                    ${index < wizardStep ? 'bg-clinical-success' : 'bg-white/20'}
                  `} />
                  <ChevronRight className={`
                    w-6 h-6 -ml-1
                    ${index < wizardStep ? 'text-clinical-success' : 'text-white/40'}
                  `} />
                  <div className={`
                    h-0.5 w-6 -ml-1
                    ${index < wizardStep ? 'bg-clinical-success' : 'bg-white/20'}
                  `} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="animate-slide-up">
          {renderStep()}
        </div>

        {/* Step validation errors */}
        {stepErrors.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-clinical-danger/10 border border-clinical-danger/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-clinical-danger" />
              <p className="text-sm text-red-400 font-medium">Please complete the required fields:</p>
            </div>
            <ul className="text-sm text-red-300 space-y-1 ml-6">
              {stepErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirstStep}
            className={`
              flex items-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-medium transition-all duration-200 text-sm md:text-base
              ${isFirstStep 
                ? 'text-clinical-muted cursor-not-allowed' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'}
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-clinical-muted">
            Step {wizardStep + 1} of {wizardSteps.length}
          </div>

          {isLastStep ? (
            <button
              type="submit"
              className="btn-primary flex items-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base"
            >
              Analyze Patient
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className={`
                flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base
                ${isCurrentStepValid() 
                  ? 'bg-gradient-to-r from-clinical-accent to-purple-600 text-white hover:shadow-lg hover:shadow-clinical-accent/25 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gradient-to-r from-clinical-accent to-purple-600 text-white hover:shadow-lg hover:shadow-clinical-accent/25'}
              `}
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

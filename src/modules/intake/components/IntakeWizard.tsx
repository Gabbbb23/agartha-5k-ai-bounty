import { useIntakeForm } from '../hooks/useIntakeForm'
import { DemographicsStep } from './steps/DemographicsStep'
import { MedicalHistoryStep } from './steps/MedicalHistoryStep'
import { MedicationsStep } from './steps/MedicationsStep'
import { HealthMetricsStep } from './steps/HealthMetricsStep'
import { LifestyleStep } from './steps/LifestyleStep'
import { ComplaintStep } from './steps/ComplaintStep'
import { ChevronLeft, ChevronRight, Send, User, FileText, Pill, Activity, Heart, Stethoscope } from 'lucide-react'

const stepIcons = [User, FileText, Pill, Activity, Heart, Stethoscope]

export function IntakeWizard() {
  const {
    form,
    wizardStep,
    wizardSteps,
    isFirstStep,
    isLastStep,
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

  const { handleSubmit, formState: { errors } } = form

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

  return (
    <div className="card">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {wizardSteps.map((step, index) => {
          const Icon = stepIcons[index]
          const isActive = index === wizardStep
          const isCompleted = index < wizardStep

          return (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`
                flex flex-col items-center gap-2 min-w-[80px] p-2 rounded-lg transition-all duration-200
                ${isActive ? 'bg-clinical-accent/20' : 'hover:bg-white/5'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                ${isActive 
                  ? 'bg-clinical-accent text-white' 
                  : isCompleted 
                    ? 'bg-clinical-success text-white' 
                    : 'bg-clinical-secondary text-clinical-muted border border-white/10'}
              `}>
                {isCompleted ? '✓' : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-clinical-muted'}`}>
                {step.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="animate-slide-up">
          {renderStep()}
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-clinical-danger/10 border border-clinical-danger/30">
            <p className="text-sm text-red-400 font-medium mb-2">Please fix the following errors:</p>
            <ul className="text-xs text-red-300 space-y-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>• {error?.message?.toString() || `Invalid ${key}`}</li>
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
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200
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
              className="btn-primary flex items-center gap-2"
            >
              Analyze Patient
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
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


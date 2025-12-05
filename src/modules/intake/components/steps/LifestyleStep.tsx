import { UseFormReturn } from 'react-hook-form'
import { PatientData } from '@/shared/types/patient'
import { Heart, Cigarette, Wine, Dumbbell, Moon, Utensils, Info } from 'lucide-react'

interface LifestyleStepProps {
  form: UseFormReturn<PatientData>
}

export function LifestyleStep({ form }: LifestyleStepProps) {
  const { register, watch } = form
  const lifestyle = watch('lifestyle')

  const smokingOptions = [
    { value: 'never', label: 'Never smoked', icon: '✅' },
    { value: 'former', label: 'Former smoker', icon: '⚠️' },
    { value: 'current', label: 'Current smoker', icon: '🚨' },
  ]

  const alcoholOptions = [
    { value: 'none', label: 'None', description: 'No alcohol consumption' },
    { value: 'occasional', label: 'Occasional', description: '1-2 drinks per week' },
    { value: 'moderate', label: 'Moderate', description: '3-7 drinks per week' },
    { value: 'heavy', label: 'Heavy', description: '8+ drinks per week' },
  ]

  const exerciseOptions = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'light', label: 'Light', description: '1-2 days per week' },
    { value: 'moderate', label: 'Moderate', description: '3-4 days per week' },
    { value: 'active', label: 'Active', description: '5+ days per week' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Lifestyle Factors</h2>
          <p className="text-sm text-clinical-muted">Habits and behaviors that affect treatment</p>
        </div>
      </div>

      {/* Required fields notice */}
      <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-start gap-2">
        <Info className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
        <p className="text-sm text-pink-300">
          Smoking, alcohol, and exercise fields (<span className="text-clinical-danger">*</span>) are required as they impact medication safety. Sleep and diet are optional.
        </p>
      </div>

      {/* Smoking Status */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Cigarette className="w-4 h-4" />
          Smoking Status
          <span className="text-clinical-danger text-xs">*Required</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {smokingOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200
                border ${lifestyle?.smokingStatus === option.value 
                  ? 'bg-clinical-accent/20 border-clinical-accent ring-1 ring-clinical-accent/30' 
                  : 'bg-clinical-secondary/50 border-white/10 hover:border-white/20'}
              `}
            >
              <input
                {...register('lifestyle.smokingStatus')}
                type="radio"
                value={option.value}
                className="sr-only"
              />
              <span className="text-xl">{option.icon}</span>
              <span className="text-white font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        {lifestyle?.smokingStatus === 'current' && (
          <div className="p-3 rounded-lg bg-clinical-danger/10 border border-clinical-danger/20">
            <p className="text-xs text-red-300">
              <strong>Note:</strong> Current smoking status may affect treatment options and increase certain risks.
            </p>
          </div>
        )}
      </div>

      {/* Alcohol Use */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Wine className="w-4 h-4" />
          Alcohol Consumption
          <span className="text-clinical-danger text-xs">*Required</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alcoholOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200
                border ${lifestyle?.alcoholUse === option.value 
                  ? 'bg-clinical-accent/20 border-clinical-accent ring-1 ring-clinical-accent/30' 
                  : 'bg-clinical-secondary/50 border-white/10 hover:border-white/20'}
              `}
            >
              <input
                {...register('lifestyle.alcoholUse')}
                type="radio"
                value={option.value}
                className="sr-only"
              />
              <span className="text-white font-medium">{option.label}</span>
              <span className="text-xs text-clinical-muted">{option.description}</span>
            </label>
          ))}
        </div>
        {lifestyle?.alcoholUse === 'heavy' && (
          <div className="p-3 rounded-lg bg-clinical-warning/10 border border-clinical-warning/20">
            <p className="text-xs text-amber-300">
              <strong>Note:</strong> Heavy alcohol use may interact with certain medications and affect liver function.
            </p>
          </div>
        )}
      </div>

      {/* Exercise Frequency */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          Exercise Frequency
          <span className="text-clinical-danger text-xs">*Required</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exerciseOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200
                border ${lifestyle?.exerciseFrequency === option.value 
                  ? 'bg-clinical-accent/20 border-clinical-accent ring-1 ring-clinical-accent/30' 
                  : 'bg-clinical-secondary/50 border-white/10 hover:border-white/20'}
              `}
            >
              <input
                {...register('lifestyle.exerciseFrequency')}
                type="radio"
                value={option.value}
                className="sr-only"
              />
              <span className="text-white font-medium">{option.label}</span>
              <span className="text-xs text-clinical-muted">{option.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sleep Hours */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Moon className="w-4 h-4" />
          Average Sleep (hours per night)
          <span className="text-clinical-muted text-xs">(Optional)</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            {...register('lifestyle.sleepHours', { valueAsNumber: true })}
            type="range"
            min="0.5"
            max="12"
            step="0.5"
            className="flex-1 h-2 bg-clinical-secondary rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                       [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-clinical-accent 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-2xl font-bold text-white w-16 text-center">
            {lifestyle?.sleepHours ?? 7}h
          </span>
        </div>
        {(lifestyle?.sleepHours ?? 7) < 6 && (
          <p className="text-xs text-amber-300">
            ⚠️ Less than 6 hours of sleep may impact overall health and medication effectiveness.
          </p>
        )}
      </div>

      {/* Diet Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          Diet Type
          <span className="text-clinical-muted text-xs">(Optional)</span>
        </label>
        <input
          {...register('lifestyle.dietType')}
          type="text"
          placeholder="e.g., Vegetarian, Low-sodium, Diabetic diet"
          className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                     text-white placeholder-clinical-muted focus:outline-none"
        />
      </div>
    </div>
  )
}

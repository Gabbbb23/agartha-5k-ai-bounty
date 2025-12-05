import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientData } from '@/shared/types/patient'
import { commonConditions, commonAllergies } from '../../constants/samplePatients'
import { FileText, X, Plus, AlertTriangle, Info } from 'lucide-react'

interface MedicalHistoryStepProps {
  form: UseFormReturn<PatientData>
  addCondition: (condition: string) => void
  removeCondition: (condition: string) => void
  addAllergy: (allergy: string) => void
  removeAllergy: (allergy: string) => void
}

export function MedicalHistoryStep({ 
  form, 
  addCondition, 
  removeCondition,
  addAllergy,
  removeAllergy
}: MedicalHistoryStepProps) {
  const { watch } = form
  const conditions = watch('conditions') || []
  const allergies = watch('allergies') || []
  
  const [customCondition, setCustomCondition] = useState('')
  const [customAllergy, setCustomAllergy] = useState('')
  const [showConditionDropdown, setShowConditionDropdown] = useState(false)
  const [showAllergyDropdown, setShowAllergyDropdown] = useState(false)

  const handleAddCustomCondition = () => {
    if (customCondition.trim()) {
      addCondition(customCondition.trim())
      setCustomCondition('')
    }
  }

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      addAllergy(customAllergy.trim())
      setCustomAllergy('')
    }
  }

  const availableConditions = commonConditions.filter(c => !conditions.includes(c))
  const availableAllergies = commonAllergies.filter(a => !allergies.includes(a))

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Medical History</h2>
          <p className="text-sm text-clinical-muted">Pre-existing conditions and allergies</p>
        </div>
      </div>

      {/* Optional fields notice */}
      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
        <p className="text-sm text-purple-300">
          All fields in this section are <strong>optional</strong>. Add any relevant conditions or allergies, or skip to the next step.
        </p>
      </div>

      {/* Conditions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Medical Conditions
          <span className="text-xs text-clinical-muted font-normal">(Optional)</span>
        </h3>

        {/* Selected conditions */}
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg 
                         bg-purple-500/20 text-purple-300 border border-purple-500/30"
            >
              {condition}
              <button
                type="button"
                onClick={() => removeCondition(condition)}
                className="hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
          {conditions.length === 0 && (
            <span className="text-clinical-muted text-sm">No conditions added</span>
          )}
        </div>

        {/* Add condition */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onFocus={() => setShowConditionDropdown(true)}
                onBlur={() => setTimeout(() => setShowConditionDropdown(false), 200)}
                placeholder="Type or select a condition..."
                className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                           text-white placeholder-clinical-muted focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCondition())}
              />
              
              {showConditionDropdown && availableConditions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 max-h-48 overflow-y-auto rounded-xl 
                                bg-clinical-secondary border border-white/10 shadow-xl">
                  {availableConditions
                    .filter(c => c.toLowerCase().includes(customCondition.toLowerCase()))
                    .slice(0, 8)
                    .map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => {
                          addCondition(condition)
                          setCustomCondition('')
                        }}
                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 
                                   hover:text-white transition-colors"
                      >
                        {condition}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddCustomCondition}
              className="px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 
                         text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-clinical-danger" />
          Allergies
          <span className="text-xs text-clinical-muted font-normal">(Optional - but important for safety)</span>
        </h3>

        {/* Selected allergies */}
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy) => (
            <span
              key={allergy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg 
                         bg-clinical-danger/20 text-red-300 border border-clinical-danger/30"
            >
              {allergy}
              <button
                type="button"
                onClick={() => removeAllergy(allergy)}
                className="hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
          {allergies.length === 0 && (
            <span className="text-clinical-muted text-sm">No allergies recorded (NKDA)</span>
          )}
        </div>

        {/* Add allergy */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onFocus={() => setShowAllergyDropdown(true)}
                onBlur={() => setTimeout(() => setShowAllergyDropdown(false), 200)}
                placeholder="Type or select an allergy..."
                className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                           text-white placeholder-clinical-muted focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAllergy())}
              />
              
              {showAllergyDropdown && availableAllergies.length > 0 && (
                <div className="absolute z-10 w-full mt-2 max-h-48 overflow-y-auto rounded-xl 
                                bg-clinical-secondary border border-white/10 shadow-xl">
                  {availableAllergies
                    .filter(a => a.toLowerCase().includes(customAllergy.toLowerCase()))
                    .slice(0, 8)
                    .map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => {
                          addAllergy(allergy)
                          setCustomAllergy('')
                        }}
                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 
                                   hover:text-white transition-colors"
                      >
                        {allergy}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddCustomAllergy}
              className="px-4 py-3 rounded-xl bg-clinical-danger/20 border border-clinical-danger/30 
                         text-red-300 hover:bg-clinical-danger/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {allergies.length > 0 && (
          <div className="p-4 rounded-xl bg-clinical-danger/10 border border-clinical-danger/20">
            <p className="text-sm text-red-300">
              <strong>⚠️ Allergy Alert:</strong> Patient has {allergies.length} documented allergy(ies). 
              These will be cross-checked against any treatment recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

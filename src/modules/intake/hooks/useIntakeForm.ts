import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PatientData, PatientDataSchema, Medication } from '@/shared/types/patient'
import { useAppStore } from '@/shared/store/appStore'

const defaultValues: Partial<PatientData> = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: 'male',
  conditions: [],
  allergies: [],
  familyHistory: [],
  surgicalHistory: [],
  currentMedications: [],
  healthMetrics: {
    age: 30,
    weight: 70,
    height: 170,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    bloodGlucose: 100,
  },
  lifestyle: {
    smokingStatus: 'never',
    alcoholUse: 'none',
    exerciseFrequency: 'moderate',
    dietType: '',
    sleepHours: 7,
  },
  primaryComplaint: '',
  complaintDuration: '',
  complaintSeverity: 'moderate',
  additionalNotes: '',
}

// Define required fields per step for validation
const stepValidationFields: Record<number, string[]> = {
  0: ['firstName', 'lastName', 'dateOfBirth', 'sex'], // Demographics - all required
  1: [], // Medical History - conditions and allergies are optional
  2: [], // Medications - optional
  3: ['healthMetrics.age', 'healthMetrics.weight', 'healthMetrics.height', 'healthMetrics.bloodPressureSystolic', 'healthMetrics.bloodPressureDiastolic'], // Health Metrics - core fields required
  4: ['lifestyle.smokingStatus', 'lifestyle.alcoholUse', 'lifestyle.exerciseFrequency'], // Lifestyle - main fields required
  5: ['primaryComplaint', 'complaintDuration', 'complaintSeverity'], // Complaint - all required
}

export function useIntakeForm() {
  const [wizardStep, setWizardStep] = useState(0)
  const [stepErrors, setStepErrors] = useState<string[]>([])
  const { setPatientData, setCurrentStep } = useAppStore()

  const form = useForm<PatientData>({
    resolver: zodResolver(PatientDataSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { watch, setValue, getValues, trigger, formState: { errors } } = form
  const formData = watch()

  // Wizard navigation
  const wizardSteps = [
    { id: 'demographics', title: 'Demographics', fields: ['firstName', 'lastName', 'dateOfBirth', 'sex'] },
    { id: 'medical-history', title: 'Medical History', fields: ['conditions', 'allergies'] },
    { id: 'medications', title: 'Current Medications', fields: ['currentMedications'] },
    { id: 'health-metrics', title: 'Health Metrics', fields: ['healthMetrics'] },
    { id: 'lifestyle', title: 'Lifestyle', fields: ['lifestyle'] },
    { id: 'complaint', title: 'Primary Complaint', fields: ['primaryComplaint', 'complaintDuration', 'complaintSeverity'] },
  ]

  const currentStepData = wizardSteps[wizardStep]
  const isFirstStep = wizardStep === 0
  const isLastStep = wizardStep === wizardSteps.length - 1

  // Custom validation for current step
  const validateCurrentStep = useCallback((): { isValid: boolean; errors: string[] } => {
    const requiredFields = stepValidationFields[wizardStep] || []
    const validationErrors: string[] = []
    
    for (const field of requiredFields) {
      const parts = field.split('.')
      let value: unknown = formData
      
      for (const part of parts) {
        value = (value as Record<string, unknown>)?.[part]
      }
      
      if (value === undefined || value === null || value === '') {
        const fieldName = parts[parts.length - 1]
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
        validationErrors.push(`${fieldName} is required`)
      }
    }
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    }
  }, [wizardStep, formData])

  const nextStep = useCallback(async () => {
    // First, validate using react-hook-form's trigger
    const fieldsToValidate = currentStepData.fields as (keyof PatientData)[]
    await trigger(fieldsToValidate)
    
    // Then do our custom validation
    const { isValid, errors: validationErrors } = validateCurrentStep()
    setStepErrors(validationErrors)
    
    if (isValid && !isLastStep) {
      setWizardStep((prev) => prev + 1)
      setStepErrors([])
    }
    
    return isValid
  }, [currentStepData, isLastStep, trigger, validateCurrentStep])

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setWizardStep((prev) => prev - 1)
      setStepErrors([])
    }
  }, [isFirstStep])

  const goToStep = useCallback(async (step: number) => {
    // Only allow going to previous steps freely
    // For forward navigation, must validate current step first
    if (step < wizardStep) {
      setWizardStep(step)
      setStepErrors([])
    } else if (step > wizardStep) {
      // Validate current step before allowing forward navigation
      const { isValid } = validateCurrentStep()
      if (isValid) {
        setWizardStep(step)
        setStepErrors([])
      }
    }
  }, [wizardStep, validateCurrentStep])

  // Check if current step is valid (for button state)
  const isCurrentStepValid = useCallback((): boolean => {
    const { isValid } = validateCurrentStep()
    return isValid
  }, [validateCurrentStep])

  // Medication management
  const addMedication = useCallback((medication: Medication) => {
    const current = getValues('currentMedications') || []
    setValue('currentMedications', [...current, medication])
  }, [getValues, setValue])

  const removeMedication = useCallback((index: number) => {
    const current = getValues('currentMedications') || []
    setValue('currentMedications', current.filter((_, i) => i !== index))
  }, [getValues, setValue])

  // Condition management
  const addCondition = useCallback((condition: string) => {
    const current = getValues('conditions') || []
    if (!current.includes(condition)) {
      setValue('conditions', [...current, condition])
    }
  }, [getValues, setValue])

  const removeCondition = useCallback((condition: string) => {
    const current = getValues('conditions') || []
    setValue('conditions', current.filter((c) => c !== condition))
  }, [getValues, setValue])

  // Allergy management
  const addAllergy = useCallback((allergy: string) => {
    const current = getValues('allergies') || []
    if (!current.includes(allergy)) {
      setValue('allergies', [...current, allergy])
    }
  }, [getValues, setValue])

  const removeAllergy = useCallback((allergy: string) => {
    const current = getValues('allergies') || []
    setValue('allergies', current.filter((a) => a !== allergy))
  }, [getValues, setValue])

  // Load sample patient
  const loadSamplePatient = useCallback((patient: PatientData) => {
    Object.entries(patient).forEach(([key, value]) => {
      setValue(key as keyof PatientData, value as never)
    })
  }, [setValue])

  // Submit handler
  const onSubmit = useCallback((data: PatientData) => {
    setPatientData(data)
    setCurrentStep(1) // Move to analysis step
  }, [setPatientData, setCurrentStep])

  return {
    form,
    formData,
    errors,
    stepErrors,
    wizardStep,
    wizardSteps,
    currentStepData,
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
    loadSamplePatient,
    onSubmit,
  }
}

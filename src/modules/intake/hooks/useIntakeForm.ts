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

export function useIntakeForm() {
  const [wizardStep, setWizardStep] = useState(0)
  const { setPatientData, setCurrentStep } = useAppStore()

  const form = useForm<PatientData>({
    resolver: zodResolver(PatientDataSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { watch, setValue, getValues, trigger } = form
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

  const nextStep = useCallback(async () => {
    const fieldsToValidate = currentStepData.fields as (keyof PatientData)[]
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && !isLastStep) {
      setWizardStep((prev) => prev + 1)
    }
  }, [currentStepData, isLastStep, trigger])

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setWizardStep((prev) => prev - 1)
    }
  }, [isFirstStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < wizardSteps.length) {
      setWizardStep(step)
    }
  }, [wizardSteps.length])

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
    wizardStep,
    wizardSteps,
    currentStepData,
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
    loadSamplePatient,
    onSubmit,
  }
}


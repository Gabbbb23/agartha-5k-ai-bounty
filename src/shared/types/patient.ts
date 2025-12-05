import { z } from 'zod'

// Zod schemas for validation
export const MedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
})

export const HealthMetricsSchema = z.object({
  age: z.number().min(0).max(150),
  weight: z.number().min(0).max(500), // kg
  height: z.number().min(0).max(300), // cm
  bloodPressureSystolic: z.number().min(50).max(250),
  bloodPressureDiastolic: z.number().min(30).max(150),
  heartRate: z.number().min(30).max(250).optional(),
  bloodGlucose: z.number().optional(),
})

export const LifestyleSchema = z.object({
  smokingStatus: z.enum(['never', 'former', 'current']),
  alcoholUse: z.enum(['none', 'occasional', 'moderate', 'heavy']),
  exerciseFrequency: z.enum(['sedentary', 'light', 'moderate', 'active']),
  dietType: z.string().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
})

export const PatientDataSchema = z.object({
  // Demographics
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string(),
  sex: z.enum(['male', 'female', 'other']),
  
  // Medical history
  conditions: z.array(z.string()),
  allergies: z.array(z.string()),
  familyHistory: z.array(z.string()).optional(),
  surgicalHistory: z.array(z.string()).optional(),
  
  // Current medications
  currentMedications: z.array(MedicationSchema),
  
  // Health metrics
  healthMetrics: HealthMetricsSchema,
  
  // Lifestyle
  lifestyle: LifestyleSchema,
  
  // Primary complaint
  primaryComplaint: z.string().min(1, 'Primary complaint is required'),
  complaintDuration: z.string(),
  complaintSeverity: z.enum(['mild', 'moderate', 'severe']),
  additionalNotes: z.string().optional(),
})

// TypeScript types derived from schemas
export type Medication = z.infer<typeof MedicationSchema>
export type HealthMetrics = z.infer<typeof HealthMetricsSchema>
export type Lifestyle = z.infer<typeof LifestyleSchema>
export type PatientData = z.infer<typeof PatientDataSchema>

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

// Calculated BMI helper
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  if (bmi < 35) return 'Obese Class I'
  if (bmi < 40) return 'Obese Class II'
  return 'Obese Class III'
}


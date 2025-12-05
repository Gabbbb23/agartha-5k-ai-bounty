import { UseFormReturn } from 'react-hook-form'
import { PatientData, calculateBMI, getBMICategory } from '@/shared/types/patient'
import { Activity, Scale, Ruler, Heart, Droplet } from 'lucide-react'

interface HealthMetricsStepProps {
  form: UseFormReturn<PatientData>
}

export function HealthMetricsStep({ form }: HealthMetricsStepProps) {
  const { register, watch, formState: { errors } } = form
  const healthMetrics = watch('healthMetrics')
  
  const bmi = healthMetrics?.weight && healthMetrics?.height 
    ? calculateBMI(healthMetrics.weight, healthMetrics.height)
    : 0
  const bmiCategory = getBMICategory(bmi)
  
  const getBMIColor = () => {
    if (bmi < 18.5 || bmi >= 30) return 'text-clinical-danger'
    if (bmi >= 25) return 'text-clinical-warning'
    return 'text-clinical-success'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Health Metrics</h2>
          <p className="text-sm text-clinical-muted">Current vital signs and measurements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Age */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Age (years)
          </label>
          <input
            {...register('healthMetrics.age', { valueAsNumber: true })}
            type="number"
            min="0"
            max="150"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Weight (kg)
          </label>
          <input
            {...register('healthMetrics.weight', { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Height (cm)
          </label>
          <input
            {...register('healthMetrics.height', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>

        {/* Blood Pressure Systolic */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
            <Heart className="w-4 h-4 text-clinical-danger" />
            Systolic BP (mmHg)
          </label>
          <input
            {...register('healthMetrics.bloodPressureSystolic', { valueAsNumber: true })}
            type="number"
            min="50"
            max="250"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>

        {/* Blood Pressure Diastolic */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
            <Heart className="w-4 h-4 text-clinical-accent" />
            Diastolic BP (mmHg)
          </label>
          <input
            {...register('healthMetrics.bloodPressureDiastolic', { valueAsNumber: true })}
            type="number"
            min="30"
            max="150"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>

        {/* Heart Rate */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Heart Rate (bpm)
          </label>
          <input
            {...register('healthMetrics.heartRate', { valueAsNumber: true })}
            type="number"
            min="30"
            max="250"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>

        {/* Blood Glucose */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-pink-400" />
            Blood Glucose (mg/dL)
          </label>
          <input
            {...register('healthMetrics.bloodGlucose', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white focus:outline-none"
          />
        </div>
      </div>

      {/* BMI Display */}
      {bmi > 0 && (
        <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-clinical-muted">Calculated BMI</span>
              <div className={`text-2xl font-bold ${getBMIColor()}`}>
                {bmi} <span className="text-sm font-normal">kg/m²</span>
              </div>
            </div>
            <div className={`badge ${
              bmi < 18.5 || bmi >= 30 ? 'badge-danger' : bmi >= 25 ? 'badge-warning' : 'badge-success'
            }`}>
              {bmiCategory}
            </div>
          </div>
        </div>
      )}

      {/* BP Warning */}
      {(healthMetrics?.bloodPressureSystolic >= 140 || healthMetrics?.bloodPressureDiastolic >= 90) && (
        <div className="p-4 rounded-xl bg-clinical-warning/10 border border-clinical-warning/20">
          <p className="text-sm text-amber-300">
            <strong>⚠️ Elevated Blood Pressure:</strong> Current reading ({healthMetrics.bloodPressureSystolic}/{healthMetrics.bloodPressureDiastolic} mmHg) 
            indicates hypertension. This will be factored into treatment recommendations.
          </p>
        </div>
      )}

      {errors.healthMetrics && (
        <div className="p-4 rounded-xl bg-clinical-danger/10 border border-clinical-danger/20">
          <p className="text-sm text-red-300">Please ensure all health metrics are within valid ranges.</p>
        </div>
      )}
    </div>
  )
}


import { UseFormReturn } from 'react-hook-form'
import { PatientData, calculateBMI, getBMICategory } from '@/shared/types/patient'
import { Activity, Scale, Ruler, Heart, Droplet, Info } from 'lucide-react'

interface HealthMetricsStepProps {
  form: UseFormReturn<PatientData>
}

// Helper component for field labels
function FieldLabel({ 
  children, 
  required = false,
  icon: Icon
}: { 
  children: React.ReactNode
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <label className="block text-sm font-medium text-gray-300 mb-2">
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-clinical-muted" />}
        {children}
        {required ? (
          <span className="text-clinical-danger text-xs">*</span>
        ) : (
          <span className="text-clinical-muted text-xs">(Optional)</span>
        )}
      </span>
    </label>
  )
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

      {/* Required fields notice */}
      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-sm text-cyan-300">
          Core metrics (<span className="text-clinical-danger">*</span>) are required for accurate dosage recommendations. Optional metrics provide additional context.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Age */}
        <div className="space-y-1">
          <FieldLabel required>Age (years)</FieldLabel>
          <input
            {...register('healthMetrics.age', { valueAsNumber: true })}
            type="number"
            min="0"
            max="150"
            className={`w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
                       ${healthMetrics?.age ? 'border-clinical-success/50 ring-1 ring-clinical-success/30' : 'border-clinical-danger/50'}
                       text-white focus:outline-none`}
          />
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <FieldLabel required icon={Scale}>Weight (kg)</FieldLabel>
          <input
            {...register('healthMetrics.weight', { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            className={`w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
                       ${healthMetrics?.weight ? 'border-clinical-success/50 ring-1 ring-clinical-success/30' : 'border-clinical-danger/50'}
                       text-white focus:outline-none`}
          />
        </div>

        {/* Height */}
        <div className="space-y-1">
          <FieldLabel required icon={Ruler}>Height (cm)</FieldLabel>
          <input
            {...register('healthMetrics.height', { valueAsNumber: true })}
            type="number"
            min="0"
            className={`w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
                       ${healthMetrics?.height ? 'border-clinical-success/50 ring-1 ring-clinical-success/30' : 'border-clinical-danger/50'}
                       text-white focus:outline-none`}
          />
        </div>

        {/* Blood Pressure Systolic */}
        <div className="space-y-1">
          <FieldLabel required icon={Heart}>Systolic BP (mmHg)</FieldLabel>
          <input
            {...register('healthMetrics.bloodPressureSystolic', { valueAsNumber: true })}
            type="number"
            min="50"
            max="250"
            className={`w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
                       ${healthMetrics?.bloodPressureSystolic ? 'border-clinical-success/50 ring-1 ring-clinical-success/30' : 'border-clinical-danger/50'}
                       text-white focus:outline-none`}
          />
        </div>

        {/* Blood Pressure Diastolic */}
        <div className="space-y-1">
          <FieldLabel required icon={Heart}>Diastolic BP (mmHg)</FieldLabel>
          <input
            {...register('healthMetrics.bloodPressureDiastolic', { valueAsNumber: true })}
            type="number"
            min="30"
            max="150"
            className={`w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
                       ${healthMetrics?.bloodPressureDiastolic ? 'border-clinical-success/50 ring-1 ring-clinical-success/30' : 'border-clinical-danger/50'}
                       text-white focus:outline-none`}
          />
        </div>

        {/* Heart Rate */}
        <div className="space-y-1">
          <FieldLabel>Heart Rate (bpm)</FieldLabel>
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
        <div className="space-y-1 md:col-span-2 lg:col-span-1">
          <FieldLabel icon={Droplet}>Blood Glucose (mg/dL)</FieldLabel>
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

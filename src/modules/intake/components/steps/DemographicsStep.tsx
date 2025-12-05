import { UseFormReturn } from 'react-hook-form'
import { PatientData } from '@/shared/types/patient'
import { User, Calendar, Users } from 'lucide-react'

interface DemographicsStepProps {
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
          <span className="text-clinical-danger text-xs">*Required</span>
        ) : (
          <span className="text-clinical-muted text-xs">(Optional)</span>
        )}
      </span>
    </label>
  )
}

export function DemographicsStep({ form }: DemographicsStepProps) {
  const { register, formState: { errors }, watch } = form
  const firstName = watch('firstName')
  const lastName = watch('lastName')
  const dateOfBirth = watch('dateOfBirth')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-clinical-accent/20 flex items-center justify-center">
          <User className="w-6 h-6 text-clinical-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Patient Demographics</h2>
          <p className="text-sm text-clinical-muted">Basic patient identification information</p>
        </div>
      </div>

      {/* Required fields notice */}
      <div className="p-3 rounded-lg bg-clinical-accent/10 border border-clinical-accent/20">
        <p className="text-sm text-blue-300">
          <span className="text-clinical-danger">*</span> All fields in this section are required to proceed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-1">
          <FieldLabel required>First Name</FieldLabel>
          <input
            {...register('firstName')}
            type="text"
            placeholder="Enter first name"
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.firstName || !firstName ? 'border-clinical-danger/50' : 'border-clinical-success/50'}
              text-white placeholder-clinical-muted focus:outline-none
              ${firstName ? 'ring-1 ring-clinical-success/30' : ''}
            `}
          />
          {errors.firstName && (
            <p className="text-xs text-clinical-danger">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <FieldLabel required>Last Name</FieldLabel>
          <input
            {...register('lastName')}
            type="text"
            placeholder="Enter last name"
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.lastName || !lastName ? 'border-clinical-danger/50' : 'border-clinical-success/50'}
              text-white placeholder-clinical-muted focus:outline-none
              ${lastName ? 'ring-1 ring-clinical-success/30' : ''}
            `}
          />
          {errors.lastName && (
            <p className="text-xs text-clinical-danger">{errors.lastName.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1">
          <FieldLabel required icon={Calendar}>Date of Birth</FieldLabel>
          <input
            {...register('dateOfBirth')}
            type="date"
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.dateOfBirth || !dateOfBirth ? 'border-clinical-danger/50' : 'border-clinical-success/50'}
              text-white focus:outline-none
              [color-scheme:dark]
              ${dateOfBirth ? 'ring-1 ring-clinical-success/30' : ''}
            `}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-clinical-danger">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Sex */}
        <div className="space-y-1">
          <FieldLabel required icon={Users}>Biological Sex</FieldLabel>
          <select
            {...register('sex')}
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-clinical-success/50
              text-white focus:outline-none cursor-pointer ring-1 ring-clinical-success/30
            `}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.sex && (
            <p className="text-xs text-clinical-danger">{errors.sex.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-clinical-secondary/50 border border-white/10">
        <p className="text-sm text-clinical-muted">
          <strong className="text-gray-300">Note:</strong> All patient information is handled securely and in compliance with healthcare privacy regulations.
        </p>
      </div>
    </div>
  )
}

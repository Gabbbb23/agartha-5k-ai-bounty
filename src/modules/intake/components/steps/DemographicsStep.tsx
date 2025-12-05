import { UseFormReturn } from 'react-hook-form'
import { PatientData } from '@/shared/types/patient'
import { User, Calendar, Users } from 'lucide-react'

interface DemographicsStepProps {
  form: UseFormReturn<PatientData>
}

export function DemographicsStep({ form }: DemographicsStepProps) {
  const { register, formState: { errors } } = form

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            First Name <span className="text-clinical-danger">*</span>
          </label>
          <input
            {...register('firstName')}
            type="text"
            placeholder="Enter first name"
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.firstName ? 'border-clinical-danger' : 'border-white/10'}
              text-white placeholder-clinical-muted focus:outline-none
            `}
          />
          {errors.firstName && (
            <p className="text-xs text-clinical-danger">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Last Name <span className="text-clinical-danger">*</span>
          </label>
          <input
            {...register('lastName')}
            type="text"
            placeholder="Enter last name"
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.lastName ? 'border-clinical-danger' : 'border-white/10'}
              text-white placeholder-clinical-muted focus:outline-none
            `}
          />
          {errors.lastName && (
            <p className="text-xs text-clinical-danger">{errors.lastName.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date of Birth <span className="text-clinical-danger">*</span>
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.dateOfBirth ? 'border-clinical-danger' : 'border-white/10'}
              text-white focus:outline-none
              [color-scheme:dark]
            `}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-clinical-danger">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Sex */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Users className="w-4 h-4 inline mr-2" />
            Biological Sex <span className="text-clinical-danger">*</span>
          </label>
          <select
            {...register('sex')}
            className={`
              w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
              ${errors.sex ? 'border-clinical-danger' : 'border-white/10'}
              text-white focus:outline-none cursor-pointer
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

      <div className="mt-6 p-4 rounded-xl bg-clinical-accent/10 border border-clinical-accent/20">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> All patient information is handled securely and in compliance with healthcare privacy regulations.
        </p>
      </div>
    </div>
  )
}


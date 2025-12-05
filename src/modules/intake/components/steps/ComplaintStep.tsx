import { UseFormReturn } from 'react-hook-form'
import { PatientData } from '@/shared/types/patient'
import { primaryComplaints } from '../../constants/samplePatients'
import { Stethoscope, Clock, AlertCircle, FileText, Info } from 'lucide-react'

interface ComplaintStepProps {
  form: UseFormReturn<PatientData>
}

export function ComplaintStep({ form }: ComplaintStepProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const primaryComplaint = watch('primaryComplaint')
  const complaintSeverity = watch('complaintSeverity')
  const complaintDuration = watch('complaintDuration')

  const severityOptions = [
    { value: 'mild', label: 'Mild', description: 'Minor discomfort, manageable', color: 'emerald' },
    { value: 'moderate', label: 'Moderate', description: 'Noticeable impact on daily life', color: 'amber' },
    { value: 'severe', label: 'Severe', description: 'Significant impairment', color: 'red' },
  ]

  const durationOptions = [
    'Less than 1 week',
    '1-2 weeks',
    '2-4 weeks',
    '1-3 months',
    '3-6 months',
    '6-12 months',
    'Over 1 year',
    'Over 2 years',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Primary Complaint</h2>
          <p className="text-sm text-clinical-muted">What brings the patient in today?</p>
        </div>
      </div>

      {/* Required fields notice */}
      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-2">
        <Info className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
        <p className="text-sm text-orange-300">
          <span className="text-clinical-danger">*</span> Complaint, duration, and severity are all required to proceed with the analysis.
        </p>
      </div>

      {/* Primary Complaint Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Primary Complaint <span className="text-clinical-danger text-xs">*Required</span>
        </label>
        
        {/* Quick select common complaints */}
        <div className="flex flex-wrap gap-2 mb-3">
          {primaryComplaints.slice(0, 8).map((complaint) => (
            <button
              key={complaint}
              type="button"
              onClick={() => setValue('primaryComplaint', complaint)}
              className={`
                px-3 py-1.5 rounded-lg text-sm transition-all duration-200
                ${primaryComplaint === complaint 
                  ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50' 
                  : 'bg-clinical-secondary/50 text-clinical-muted border border-white/10 hover:text-white hover:border-white/20'}
              `}
            >
              {complaint}
            </button>
          ))}
        </div>

        <input
          {...register('primaryComplaint')}
          type="text"
          placeholder="Describe the primary complaint..."
          className={`
            w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
            ${!primaryComplaint ? 'border-clinical-danger/50' : 'border-clinical-success/50 ring-1 ring-clinical-success/30'}
            text-white placeholder-clinical-muted focus:outline-none
          `}
        />
        {errors.primaryComplaint && (
          <p className="text-xs text-clinical-danger">{errors.primaryComplaint.message}</p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Duration of Symptoms <span className="text-clinical-danger text-xs">*Required</span>
        </label>
        <select
          {...register('complaintDuration')}
          className={`
            w-full px-4 py-3 rounded-xl bg-clinical-secondary border 
            ${!complaintDuration ? 'border-clinical-danger/50' : 'border-clinical-success/50 ring-1 ring-clinical-success/30'}
            text-white focus:outline-none cursor-pointer
          `}
        >
          <option value="">Select duration...</option>
          {durationOptions.map((duration) => (
            <option key={duration} value={duration}>{duration}</option>
          ))}
        </select>
        {errors.complaintDuration && (
          <p className="text-xs text-clinical-danger">{errors.complaintDuration.message}</p>
        )}
      </div>

      {/* Severity */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Symptom Severity <span className="text-clinical-danger text-xs">*Required</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {severityOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200
                border ${complaintSeverity === option.value 
                  ? option.color === 'emerald' 
                    ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500/30' 
                    : option.color === 'amber' 
                      ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500/30' 
                      : 'bg-red-500/20 border-red-500 ring-1 ring-red-500/30'
                  : 'bg-clinical-secondary/50 border-white/10 hover:border-white/20'}
              `}
            >
              <input
                {...register('complaintSeverity')}
                type="radio"
                value={option.value}
                className="sr-only"
              />
              <span className={`text-white font-medium ${
                complaintSeverity === option.value 
                  ? option.color === 'emerald' 
                    ? 'text-emerald-300' 
                    : option.color === 'amber' 
                      ? 'text-amber-300' 
                      : 'text-red-300'
                  : ''
              }`}>
                {option.label}
              </span>
              <span className="text-xs text-clinical-muted">{option.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Additional Notes
          <span className="text-clinical-muted text-xs">(Optional)</span>
        </label>
        <textarea
          {...register('additionalNotes')}
          rows={4}
          placeholder="Any additional information relevant to the complaint, previous treatments tried, patient preferences, etc."
          className="w-full px-4 py-3 rounded-xl bg-clinical-secondary border border-white/10 
                     text-white placeholder-clinical-muted focus:outline-none resize-none"
        />
      </div>

      {/* Summary card */}
      {primaryComplaint && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 
                        border border-orange-500/20">
          <h4 className="text-sm font-semibold text-white mb-2">Intake Summary</h4>
          <div className="text-sm text-clinical-muted space-y-1">
            <p><strong className="text-gray-300">Complaint:</strong> {primaryComplaint}</p>
            <p><strong className="text-gray-300">Duration:</strong> {complaintDuration || 'Not specified'}</p>
            <p><strong className="text-gray-300">Severity:</strong> {complaintSeverity || 'moderate'}</p>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-clinical-accent/10 border border-clinical-accent/20">
        <p className="text-sm text-blue-300">
          <strong>🔒 Ready for Analysis:</strong> Click "Analyze Patient" to generate a personalized treatment plan 
          with safety checks for drug interactions and contraindications.
        </p>
      </div>
    </div>
  )
}

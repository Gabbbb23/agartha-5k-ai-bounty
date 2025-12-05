import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientData, Medication } from '@/shared/types/patient'
import { Pill, X, Plus, Clock, Droplets, Info } from 'lucide-react'

interface MedicationsStepProps {
  form: UseFormReturn<PatientData>
  addMedication: (medication: Medication) => void
  removeMedication: (index: number) => void
}

const frequencyOptions = [
  'once daily',
  'twice daily',
  'three times daily',
  'four times daily',
  'every 4 hours',
  'every 6 hours',
  'every 8 hours',
  'every 12 hours',
  'once weekly',
  'as needed',
  'at bedtime',
  'with meals',
]

export function MedicationsStep({ form, addMedication, removeMedication }: MedicationsStepProps) {
  const { watch } = form
  const medications = watch('currentMedications') || []
  
  const [newMed, setNewMed] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: 'once daily',
    duration: '',
  })

  const handleAdd = () => {
    if (newMed.name.trim() && newMed.dosage.trim()) {
      addMedication(newMed)
      setNewMed({ name: '', dosage: '', frequency: 'once daily', duration: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Pill className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Current Medications</h2>
          <p className="text-sm text-clinical-muted">List all medications the patient is currently taking</p>
        </div>
      </div>

      {/* Optional fields notice */}
      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-sm text-emerald-300">
          Medications are <strong>optional</strong> but highly recommended for accurate drug interaction analysis. Skip if patient is not on any medications.
        </p>
      </div>

      {/* Current medications list */}
      <div className="space-y-3">
        {medications.length > 0 ? (
          medications.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-clinical-secondary/50 
                         border border-white/10 group hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{med.name}</div>
                  <div className="flex items-center gap-3 text-sm text-clinical-muted">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      {med.dosage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {med.frequency}
                    </span>
                    {med.duration && <span>({med.duration})</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="p-2 rounded-lg text-clinical-muted hover:text-clinical-danger 
                           hover:bg-clinical-danger/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-xl border-2 border-dashed border-white/10 text-center">
            <Pill className="w-8 h-8 text-clinical-muted mx-auto mb-2" />
            <p className="text-clinical-muted">No medications added yet</p>
          </div>
        )}
      </div>

      {/* Add new medication form */}
      <div className="p-4 rounded-xl bg-clinical-secondary/30 border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Medication
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-clinical-muted">
              Medication Name
            </label>
            <input
              type="text"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="e.g., Metformin"
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-clinical-muted">
              Dosage
            </label>
            <input
              type="text"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
              placeholder="e.g., 500mg"
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-clinical-muted">
              Frequency
            </label>
            <select
              value={newMed.frequency}
              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white text-sm focus:outline-none cursor-pointer"
            >
              {frequencyOptions.map((freq) => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-clinical-muted">
              Duration (optional)
            </label>
            <input
              type="text"
              value={newMed.duration || ''}
              onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
              placeholder="e.g., ongoing, 2 weeks"
              className="w-full px-4 py-2.5 rounded-lg bg-clinical-secondary border border-white/10 
                         text-white placeholder-clinical-muted text-sm focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!newMed.name.trim() || !newMed.dosage.trim()}
          className={`
            w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200
            flex items-center justify-center gap-2
            ${newMed.name.trim() && newMed.dosage.trim()
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              : 'bg-clinical-secondary text-clinical-muted border border-white/10 cursor-not-allowed'}
          `}
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {medications.length > 0 && (
        <div className="p-4 rounded-xl bg-clinical-accent/10 border border-clinical-accent/20">
          <p className="text-sm text-blue-300">
            <strong>ℹ️ Drug Interaction Check:</strong> The AI will analyze all {medications.length} medication(s) 
            for potential drug-drug interactions and contraindications with any new treatments.
          </p>
        </div>
      )}
    </div>
  )
}


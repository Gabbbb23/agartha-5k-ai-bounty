import { AlternativeTreatment } from '@/shared/types/analysis'
import { Pill, TrendingUp, Info } from 'lucide-react'

interface AlternativesListProps {
  alternatives: AlternativeTreatment[]
}

export function AlternativesList({ alternatives }: AlternativesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alternatives.map((alt, index) => (
        <div
          key={index}
          className="p-4 rounded-xl bg-clinical-secondary/30 border border-white/10 
                     hover:border-white/20 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Pill className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">{alt.medication}</h4>
                <p className="text-sm text-clinical-muted">{alt.dosage}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className={`w-4 h-4 ${
                alt.confidenceScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
              }`} />
              <span className={
                alt.confidenceScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
              }>
                {alt.confidenceScore}%
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-3">{alt.rationale}</p>

          {alt.considerations.length > 0 && (
            <div className="p-3 rounded-lg bg-black/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-clinical-muted mb-1">
                <Info className="w-3 h-3" />
                Considerations
              </div>
              {alt.considerations.map((consideration, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  {consideration}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


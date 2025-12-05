import { Heart, Calendar, TestTube } from 'lucide-react'

interface RecommendationsListProps {
  lifestyle: string[]
  followUp: string[]
  labTests: string[]
}

export function RecommendationsList({ lifestyle, followUp, labTests }: RecommendationsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Lifestyle Recommendations */}
      <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-pink-400" />
          <h4 className="font-medium text-white">Lifestyle</h4>
        </div>
        {lifestyle.length > 0 ? (
          <ul className="space-y-2">
            {lifestyle.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-clinical-muted">No specific lifestyle changes recommended</p>
        )}
      </div>

      {/* Follow-up Recommendations */}
      <div className="p-4 rounded-xl bg-clinical-accent/10 border border-clinical-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-clinical-accent" />
          <h4 className="font-medium text-white">Follow-up</h4>
        </div>
        {followUp.length > 0 ? (
          <ul className="space-y-2">
            {followUp.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-accent mt-1.5 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-clinical-muted">Standard follow-up schedule</p>
        )}
      </div>

      {/* Lab Tests */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-3">
          <TestTube className="w-5 h-5 text-emerald-400" />
          <h4 className="font-medium text-white">Recommended Labs</h4>
        </div>
        {labTests.length > 0 ? (
          <ul className="space-y-2">
            {labTests.map((test, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                {test}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-clinical-muted">No additional lab tests required</p>
        )}
      </div>
    </div>
  )
}


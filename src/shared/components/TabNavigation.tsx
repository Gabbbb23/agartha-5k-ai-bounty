import { Activity, History, FileText } from 'lucide-react'

export type TabId = 'workflow' | 'audit'

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  { id: 'workflow' as const, label: 'Clinical Workflow', icon: Activity },
  { id: 'audit' as const, label: 'Audit Log', icon: History },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-clinical-secondary/50 border border-white/10">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-200
              ${isActive 
                ? 'bg-clinical-accent text-white shadow-lg shadow-clinical-accent/25' 
                : 'text-clinical-muted hover:text-white hover:bg-white/5'}
            `}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}


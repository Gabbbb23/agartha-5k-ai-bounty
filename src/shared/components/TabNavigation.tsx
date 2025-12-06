import { Activity, History, Database, Users } from 'lucide-react'

export type TabId = 'workflow' | 'history' | 'audit' | 'medical-db'

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  { id: 'workflow' as const, label: 'Clinical Workflow', shortLabel: 'Workflow', icon: Activity },
  { id: 'history' as const, label: 'Patient History', shortLabel: 'History', icon: Users },
  { id: 'audit' as const, label: 'Audit Log', shortLabel: 'Audit', icon: History },
  { id: 'medical-db' as const, label: 'Medical Database', shortLabel: 'Database', icon: Database },
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
              flex items-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-2.5 rounded-lg font-medium text-xs md:text-sm
              transition-all duration-200
              ${isActive 
                ? 'bg-clinical-accent text-white shadow-lg shadow-clinical-accent/25' 
                : 'text-clinical-muted hover:text-white hover:bg-white/5'}
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

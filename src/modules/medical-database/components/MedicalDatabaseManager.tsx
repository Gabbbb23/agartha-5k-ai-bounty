import { useState, useEffect } from 'react'
import {
  fetchDrugInteractions,
  fetchContraindications,
  fetchAllergyMappings,
  addDrugInteraction,
  addContraindication,
  addAllergyMapping,
  deleteDrugInteraction,
  deleteContraindication,
  deleteAllergyMapping,
  DrugInteractionEntry,
  ContraindicationEntry,
  AllergyMappingEntry,
} from '@/shared/services/medicalDatabaseService'
import { isSupabaseConfigured } from '@/shared/services/supabase'
import { ExportButton } from '@/shared/components/ExportButton'
import {
  exportMedicalDatabaseToJson,
  exportDrugInteractionsToCsv,
  exportContraindicationsToCsv,
  exportAllergyMappingsToCsv,
} from '@/shared/services/exportService'
import {
  Database,
  Plus,
  Trash2,
  AlertTriangle,
  Pill,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react'

type TabType = 'interactions' | 'contraindications' | 'allergies'

export function MedicalDatabaseManager() {
  const [activeTab, setActiveTab] = useState<TabType>('interactions')
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Data states
  const [drugInteractions, setDrugInteractions] = useState<DrugInteractionEntry[]>([])
  const [contraindications, setContraindications] = useState<ContraindicationEntry[]>([])
  const [allergyMappings, setAllergyMappings] = useState<AllergyMappingEntry[]>([])
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const connected = isSupabaseConfigured()
    setIsConnected(connected)

    if (connected) {
      const [interactions, contras, allergies] = await Promise.all([
        fetchDrugInteractions(),
        fetchContraindications(),
        fetchAllergyMappings(),
      ])
      setDrugInteractions(interactions)
      setContraindications(contras)
      setAllergyMappings(allergies)
    }
    setIsLoading(false)
  }

  // Filter data based on search
  const filteredInteractions = drugInteractions.filter(
    i => i.drug1.toLowerCase().includes(searchTerm.toLowerCase()) ||
         i.drug2.toLowerCase().includes(searchTerm.toLowerCase()) ||
         i.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredContraindications = contraindications.filter(
    c => c.drug.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAllergies = allergyMappings.filter(
    a => a.allergy.toLowerCase().includes(searchTerm.toLowerCase()) ||
         a.cross_reactants.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async (type: TabType, id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    let success = false
    switch (type) {
      case 'interactions':
        success = await deleteDrugInteraction(id)
        if (success) setDrugInteractions(prev => prev.filter(i => i.id !== id))
        break
      case 'contraindications':
        success = await deleteContraindication(id)
        if (success) setContraindications(prev => prev.filter(c => c.id !== id))
        break
      case 'allergies':
        success = await deleteAllergyMapping(id)
        if (success) setAllergyMappings(prev => prev.filter(a => a.id !== id))
        break
    }
  }

  const tabs = [
    { id: 'interactions' as const, label: 'Drug Interactions', icon: Pill, count: drugInteractions.length },
    { id: 'contraindications' as const, label: 'Contraindications', icon: AlertTriangle, count: contraindications.length },
    { id: 'allergies' as const, label: 'Allergy Mappings', icon: AlertCircle, count: allergyMappings.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clinical-accent to-purple-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Medical Database</h1>
            <p className="text-clinical-muted text-sm">
              Manage drug interactions, contraindications, and allergy mappings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            isConnected 
              ? 'bg-clinical-success/20 text-emerald-400 border border-clinical-success/30' 
              : 'bg-clinical-warning/20 text-amber-400 border border-clinical-warning/30'
          }`}>
            {isConnected ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {isConnected ? 'Supabase Connected' : 'Local Mode Only'}
          </span>
          <ExportButton
            label="Export"
            disabled={drugInteractions.length === 0 && contraindications.length === 0 && allergyMappings.length === 0}
            options={[
              {
                label: 'Export All (JSON)',
                format: 'json',
                onClick: () => exportMedicalDatabaseToJson(drugInteractions, contraindications, allergyMappings),
              },
              {
                label: 'Drug Interactions (CSV)',
                format: 'csv',
                onClick: () => exportDrugInteractionsToCsv(drugInteractions),
              },
              {
                label: 'Contraindications (CSV)',
                format: 'csv',
                onClick: () => exportContraindicationsToCsv(contraindications),
              },
              {
                label: 'Allergy Mappings (CSV)',
                format: 'csv',
                onClick: () => exportAllergyMappingsToCsv(allergyMappings),
              },
            ]}
          />
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 
                       text-gray-300 hover:text-white hover:border-white/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="p-4 rounded-xl bg-clinical-warning/10 border border-clinical-warning/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-clinical-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium">Supabase Not Configured</p>
            <p className="text-amber-300/70 text-sm mt-1">
              To enable database management, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, 
              then run the SQL migration in supabase/migrations/003_medical_database.sql
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-clinical-accent text-white'
                  : 'text-clinical-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-clinical-secondary border border-white/10 
                       text-white placeholder-clinical-muted focus:outline-none focus:border-clinical-accent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isConnected && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-clinical-accent text-white font-medium
                       hover:bg-clinical-accent/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-clinical-accent animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab === 'interactions' && (
            filteredInteractions.length > 0 ? (
              filteredInteractions.map(interaction => (
                <DrugInteractionCard
                  key={interaction.id}
                  interaction={interaction}
                  onDelete={() => interaction.id && handleDelete('interactions', interaction.id)}
                  canDelete={isConnected}
                />
              ))
            ) : (
              <EmptyState message="No drug interactions found" />
            )
          )}

          {activeTab === 'contraindications' && (
            filteredContraindications.length > 0 ? (
              filteredContraindications.map(contra => (
                <ContraindicationCard
                  key={contra.id}
                  contraindication={contra}
                  onDelete={() => contra.id && handleDelete('contraindications', contra.id)}
                  canDelete={isConnected}
                />
              ))
            ) : (
              <EmptyState message="No contraindications found" />
            )
          )}

          {activeTab === 'allergies' && (
            filteredAllergies.length > 0 ? (
              filteredAllergies.map(allergy => (
                <AllergyMappingCard
                  key={allergy.id}
                  mapping={allergy}
                  onDelete={() => allergy.id && handleDelete('allergies', allergy.id)}
                  canDelete={isConnected}
                />
              ))
            ) : (
              <EmptyState message="No allergy mappings found" />
            )
          )}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <AddEntryModal
          type={activeTab}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// Card Components
function DrugInteractionCard({ 
  interaction, 
  onDelete, 
  canDelete 
}: { 
  interaction: DrugInteractionEntry
  onDelete: () => void
  canDelete: boolean
}) {
  const severityColors = {
    minor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    moderate: 'bg-clinical-warning/20 text-amber-400 border-clinical-warning/30',
    major: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    contraindicated: 'bg-clinical-danger/20 text-red-400 border-clinical-danger/30',
  }

  return (
    <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-white">{interaction.drug1}</span>
            <span className="text-clinical-muted">+</span>
            <span className="font-medium text-white">{interaction.drug2}</span>
            <span className={`px-2 py-0.5 rounded text-xs border ${severityColors[interaction.severity]}`}>
              {interaction.severity.toUpperCase()}
            </span>
            {interaction.is_verified && (
              <span title="Verified">
                <CheckCircle className="w-4 h-4 text-clinical-success" />
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm">{interaction.description}</p>
          {interaction.mechanism && (
            <p className="text-clinical-muted text-xs mt-1">
              <span className="font-medium">Mechanism:</span> {interaction.mechanism}
            </p>
          )}
          {interaction.source && (
            <p className="text-clinical-muted text-xs mt-1">
              <span className="font-medium">Source:</span> {interaction.source}
            </p>
          )}
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-clinical-muted hover:text-clinical-danger hover:bg-clinical-danger/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function ContraindicationCard({ 
  contraindication, 
  onDelete, 
  canDelete 
}: { 
  contraindication: ContraindicationEntry
  onDelete: () => void
  canDelete: boolean
}) {
  return (
    <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-white">{contraindication.drug}</span>
            <span className="text-clinical-muted">→</span>
            <span className="text-gray-300">{contraindication.condition}</span>
            <span className={`px-2 py-0.5 rounded text-xs border ${
              contraindication.severity === 'absolute' 
                ? 'bg-clinical-danger/20 text-red-400 border-clinical-danger/30'
                : 'bg-clinical-warning/20 text-amber-400 border-clinical-warning/30'
            }`}>
              {contraindication.severity.toUpperCase()}
            </span>
            {contraindication.is_verified && (
              <span title="Verified">
                <CheckCircle className="w-4 h-4 text-clinical-success" />
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm">{contraindication.description}</p>
          {contraindication.source && (
            <p className="text-clinical-muted text-xs mt-1">
              <span className="font-medium">Source:</span> {contraindication.source}
            </p>
          )}
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-clinical-muted hover:text-clinical-danger hover:bg-clinical-danger/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function AllergyMappingCard({ 
  mapping, 
  onDelete, 
  canDelete 
}: { 
  mapping: AllergyMappingEntry
  onDelete: () => void
  canDelete: boolean
}) {
  return (
    <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-white capitalize">{mapping.allergy}</span>
            {mapping.is_verified && (
              <span title="Verified">
                <CheckCircle className="w-4 h-4 text-clinical-success" />
              </span>
            )}
          </div>
          <div className="mb-2">
            <span className="text-xs text-clinical-muted">Drug Classes:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {mapping.drug_classes.map((cls, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {cls}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-clinical-muted">Cross-Reactants:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {mapping.cross_reactants.map((reactant, i) => (
                <span key={i} className="px-2 py-0.5 bg-clinical-danger/20 text-red-300 rounded text-xs">
                  {reactant}
                </span>
              ))}
            </div>
          </div>
          {mapping.notes && (
            <p className="text-clinical-muted text-xs mt-2">
              <span className="font-medium">Notes:</span> {mapping.notes}
            </p>
          )}
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-clinical-muted hover:text-clinical-danger hover:bg-clinical-danger/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-clinical-muted">
      <Database className="w-12 h-12 mb-3 opacity-50" />
      <p>{message}</p>
    </div>
  )
}

// Add Entry Modal
function AddEntryModal({ 
  type, 
  onClose, 
  onSuccess 
}: { 
  type: TabType
  onClose: () => void
  onSuccess: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [drug, setDrug] = useState('')
  const [condition, setCondition] = useState('')
  const [allergy, setAllergy] = useState('')
  const [severity, setSeverity] = useState<string>('moderate')
  const [description, setDescription] = useState('')
  const [mechanism, setMechanism] = useState('')
  const [source, setSource] = useState('')
  const [drugClasses, setDrugClasses] = useState('')
  const [crossReactants, setCrossReactants] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      let result = null

      switch (type) {
        case 'interactions':
          if (!drug1 || !drug2 || !description) {
            throw new Error('Please fill in all required fields')
          }
          result = await addDrugInteraction({
            drug1,
            drug2,
            severity: severity as DrugInteractionEntry['severity'],
            description,
            mechanism: mechanism || undefined,
            source: source || undefined,
            is_verified: false,
          })
          break

        case 'contraindications':
          if (!drug || !condition || !description) {
            throw new Error('Please fill in all required fields')
          }
          result = await addContraindication({
            drug,
            condition,
            severity: severity as ContraindicationEntry['severity'],
            description,
            source: source || undefined,
            is_verified: false,
          })
          break

        case 'allergies':
          if (!allergy || !drugClasses || !crossReactants) {
            throw new Error('Please fill in all required fields')
          }
          result = await addAllergyMapping({
            allergy,
            drug_classes: drugClasses.split(',').map(s => s.trim()).filter(Boolean),
            cross_reactants: crossReactants.split(',').map(s => s.trim()).filter(Boolean),
            notes: notes || undefined,
            is_verified: false,
          })
          break
      }

      if (result) {
        onSuccess()
      } else {
        throw new Error('Failed to add entry')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const titles = {
    interactions: 'Add Drug Interaction',
    contraindications: 'Add Contraindication',
    allergies: 'Add Allergy Mapping',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-clinical-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-clinical-muted hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">{titles[type]}</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-clinical-danger/10 border border-clinical-danger/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'interactions' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Drug 1 *</label>
                  <input
                    type="text"
                    value={drug1}
                    onChange={(e) => setDrug1(e.target.value)}
                    placeholder="e.g., warfarin"
                    className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Drug 2 *</label>
                  <input
                    type="text"
                    value={drug2}
                    onChange={(e) => setDrug2(e.target.value)}
                    placeholder="e.g., aspirin"
                    className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Severity *</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="major">Major</option>
                  <option value="contraindicated">Contraindicated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mechanism</label>
                <input
                  type="text"
                  value={mechanism}
                  onChange={(e) => setMechanism(e.target.value)}
                  placeholder="How the interaction occurs..."
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                />
              </div>
            </>
          )}

          {type === 'contraindications' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Drug *</label>
                <input
                  type="text"
                  value={drug}
                  onChange={(e) => setDrug(e.target.value)}
                  placeholder="e.g., metformin"
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Condition *</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g., severe renal impairment"
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Severity *</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                >
                  <option value="relative">Relative</option>
                  <option value="absolute">Absolute</option>
                </select>
              </div>
            </>
          )}

          {type === 'allergies' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Allergy *</label>
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                  placeholder="e.g., penicillin"
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Drug Classes * (comma-separated)</label>
                <input
                  type="text"
                  value={drugClasses}
                  onChange={(e) => setDrugClasses(e.target.value)}
                  placeholder="e.g., penicillins, aminopenicillins"
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cross-Reactants * (comma-separated)</label>
                <input
                  type="text"
                  value={crossReactants}
                  onChange={(e) => setCrossReactants(e.target.value)}
                  placeholder="e.g., amoxicillin, ampicillin"
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white resize-none"
                />
              </div>
            </>
          )}

          {type !== 'allergies' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the interaction/contraindication..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white resize-none"
                required
              />
            </div>
          )}

          {type !== 'allergies' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., FDA Guidelines"
                className="w-full px-4 py-2 rounded-lg bg-clinical-secondary border border-white/10 text-white"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-clinical-accent text-white font-medium hover:bg-clinical-accent/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


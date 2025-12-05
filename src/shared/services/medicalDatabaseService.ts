import { supabase, isSupabaseConfigured } from './supabase'

// Types for medical database entries
export interface DrugInteractionEntry {
  id?: string
  drug1: string
  drug2: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  description: string
  mechanism?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  is_verified?: boolean
  source?: string
}

export interface ContraindicationEntry {
  id?: string
  drug: string
  condition: string
  severity: 'relative' | 'absolute'
  description: string
  created_at?: string
  updated_at?: string
  created_by?: string
  is_verified?: boolean
  source?: string
}

export interface AllergyMappingEntry {
  id?: string
  allergy: string
  drug_classes: string[]
  cross_reactants: string[]
  created_at?: string
  updated_at?: string
  created_by?: string
  is_verified?: boolean
  notes?: string
}

// Cache for medical data
let drugInteractionsCache: DrugInteractionEntry[] | null = null
let contraindicationsCache: ContraindicationEntry[] | null = null
let allergyMappingsCache: AllergyMappingEntry[] | null = null

// ==================== Drug Interactions ====================

export async function fetchDrugInteractions(): Promise<DrugInteractionEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured, using local fallback')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('drug_interactions')
      .select('*')
      .order('drug1', { ascending: true })

    if (error) {
      console.error('Error fetching drug interactions:', error)
      return []
    }

    drugInteractionsCache = data || []
    return drugInteractionsCache
  } catch (err) {
    console.error('Failed to fetch drug interactions:', err)
    return []
  }
}

export async function addDrugInteraction(entry: Omit<DrugInteractionEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DrugInteractionEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('drug_interactions')
      .insert([entry])
      .select()
      .single()

    if (error) {
      console.error('Error adding drug interaction:', error)
      return null
    }

    // Invalidate cache
    drugInteractionsCache = null
    return data
  } catch (err) {
    console.error('Failed to add drug interaction:', err)
    return null
  }
}

export async function updateDrugInteraction(id: string, entry: Partial<DrugInteractionEntry>): Promise<DrugInteractionEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('drug_interactions')
      .update({ ...entry, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating drug interaction:', error)
      return null
    }

    drugInteractionsCache = null
    return data
  } catch (err) {
    console.error('Failed to update drug interaction:', err)
    return null
  }
}

export async function deleteDrugInteraction(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  try {
    const { error } = await supabase
      .from('drug_interactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting drug interaction:', error)
      return false
    }

    drugInteractionsCache = null
    return true
  } catch (err) {
    console.error('Failed to delete drug interaction:', err)
    return false
  }
}

// ==================== Contraindications ====================

export async function fetchContraindications(): Promise<ContraindicationEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('contraindications')
      .select('*')
      .order('drug', { ascending: true })

    if (error) {
      console.error('Error fetching contraindications:', error)
      return []
    }

    contraindicationsCache = data || []
    return contraindicationsCache
  } catch (err) {
    console.error('Failed to fetch contraindications:', err)
    return []
  }
}

export async function addContraindication(entry: Omit<ContraindicationEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ContraindicationEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('contraindications')
      .insert([entry])
      .select()
      .single()

    if (error) {
      console.error('Error adding contraindication:', error)
      return null
    }

    contraindicationsCache = null
    return data
  } catch (err) {
    console.error('Failed to add contraindication:', err)
    return null
  }
}

export async function updateContraindication(id: string, entry: Partial<ContraindicationEntry>): Promise<ContraindicationEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('contraindications')
      .update({ ...entry, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating contraindication:', error)
      return null
    }

    contraindicationsCache = null
    return data
  } catch (err) {
    console.error('Failed to update contraindication:', err)
    return null
  }
}

export async function deleteContraindication(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  try {
    const { error } = await supabase
      .from('contraindications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contraindication:', error)
      return false
    }

    contraindicationsCache = null
    return true
  } catch (err) {
    console.error('Failed to delete contraindication:', err)
    return false
  }
}

// ==================== Allergy Mappings ====================

export async function fetchAllergyMappings(): Promise<AllergyMappingEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('allergy_mappings')
      .select('*')
      .order('allergy', { ascending: true })

    if (error) {
      console.error('Error fetching allergy mappings:', error)
      return []
    }

    allergyMappingsCache = data || []
    return allergyMappingsCache
  } catch (err) {
    console.error('Failed to fetch allergy mappings:', err)
    return []
  }
}

export async function addAllergyMapping(entry: Omit<AllergyMappingEntry, 'id' | 'created_at' | 'updated_at'>): Promise<AllergyMappingEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('allergy_mappings')
      .insert([entry])
      .select()
      .single()

    if (error) {
      console.error('Error adding allergy mapping:', error)
      return null
    }

    allergyMappingsCache = null
    return data
  } catch (err) {
    console.error('Failed to add allergy mapping:', err)
    return null
  }
}

export async function updateAllergyMapping(id: string, entry: Partial<AllergyMappingEntry>): Promise<AllergyMappingEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('allergy_mappings')
      .update({ ...entry, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating allergy mapping:', error)
      return null
    }

    allergyMappingsCache = null
    return data
  } catch (err) {
    console.error('Failed to update allergy mapping:', err)
    return null
  }
}

export async function deleteAllergyMapping(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false
  }

  try {
    const { error } = await supabase
      .from('allergy_mappings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting allergy mapping:', error)
      return false
    }

    allergyMappingsCache = null
    return true
  } catch (err) {
    console.error('Failed to delete allergy mapping:', err)
    return false
  }
}

// ==================== Utility Functions ====================

export function getCachedDrugInteractions(): DrugInteractionEntry[] | null {
  return drugInteractionsCache
}

export function getCachedContraindications(): ContraindicationEntry[] | null {
  return contraindicationsCache
}

export function getCachedAllergyMappings(): AllergyMappingEntry[] | null {
  return allergyMappingsCache
}

export function clearMedicalDatabaseCache(): void {
  drugInteractionsCache = null
  contraindicationsCache = null
  allergyMappingsCache = null
}

// Get database statistics
export async function getMedicalDatabaseStats(): Promise<{
  drugInteractions: number
  contraindications: number
  allergyMappings: number
  isConnected: boolean
}> {
  if (!isSupabaseConfigured()) {
    return {
      drugInteractions: 0,
      contraindications: 0,
      allergyMappings: 0,
      isConnected: false,
    }
  }

  const [interactions, contras, allergies] = await Promise.all([
    fetchDrugInteractions(),
    fetchContraindications(),
    fetchAllergyMappings(),
  ])

  return {
    drugInteractions: interactions.length,
    contraindications: contras.length,
    allergyMappings: allergies.length,
    isConnected: true,
  }
}


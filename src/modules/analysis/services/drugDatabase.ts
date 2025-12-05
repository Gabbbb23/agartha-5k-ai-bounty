// Drug interaction database with Supabase integration and local fallback
import {
  fetchDrugInteractions,
  fetchContraindications,
  fetchAllergyMappings,
  getCachedDrugInteractions,
  getCachedContraindications,
  getCachedAllergyMappings,
  DrugInteractionEntry,
  ContraindicationEntry,
  AllergyMappingEntry,
} from '@/shared/services/medicalDatabaseService'

// Local fallback data (used when Supabase is not available)
const localDrugInteractionDatabase: DrugInteractionEntry[] = [
  {
    drug1: 'sildenafil',
    drug2: 'nitroglycerin',
    severity: 'contraindicated',
    description: 'Can cause severe, potentially fatal hypotension',
    mechanism: 'Both drugs cause vasodilation via different mechanisms, effects are synergistic'
  },
  {
    drug1: 'sildenafil',
    drug2: 'isosorbide',
    severity: 'contraindicated',
    description: 'Can cause severe, potentially fatal hypotension',
    mechanism: 'Both drugs cause vasodilation via different mechanisms'
  },
  {
    drug1: 'tadalafil',
    drug2: 'nitroglycerin',
    severity: 'contraindicated',
    description: 'Can cause severe, potentially fatal hypotension',
    mechanism: 'Both drugs cause vasodilation via different mechanisms'
  },
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'major',
    description: 'Increased risk of bleeding',
    mechanism: 'Both drugs affect hemostasis through different mechanisms'
  },
  {
    drug1: 'warfarin',
    drug2: 'ibuprofen',
    severity: 'major',
    description: 'Significantly increased risk of GI bleeding',
    mechanism: 'NSAIDs inhibit platelet function and can cause GI ulcers'
  },
  {
    drug1: 'sertraline',
    drug2: 'sumatriptan',
    severity: 'major',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Both drugs increase serotonin activity'
  },
  {
    drug1: 'metformin',
    drug2: 'contrast dye',
    severity: 'major',
    description: 'Risk of lactic acidosis',
    mechanism: 'Contrast can cause acute kidney injury, impairing metformin clearance'
  },
  {
    drug1: 'lisinopril',
    drug2: 'spironolactone',
    severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'Both drugs can increase potassium levels'
  },
  {
    drug1: 'clopidogrel',
    drug2: 'omeprazole',
    severity: 'major',
    description: 'Reduced antiplatelet effect of clopidogrel',
    mechanism: 'Omeprazole inhibits CYP2C19 needed for clopidogrel activation'
  },
  {
    drug1: 'simvastatin',
    drug2: 'gemfibrozil',
    severity: 'major',
    description: 'Increased risk of myopathy and rhabdomyolysis',
    mechanism: 'Gemfibrozil inhibits statin metabolism'
  },
  {
    drug1: 'lisinopril',
    drug2: 'ibuprofen',
    severity: 'moderate',
    description: 'May reduce antihypertensive effect and increase renal risk',
    mechanism: 'NSAIDs inhibit prostaglandins needed for ACE inhibitor effect'
  },
  {
    drug1: 'levothyroxine',
    drug2: 'calcium',
    severity: 'moderate',
    description: 'Reduced levothyroxine absorption',
    mechanism: 'Calcium binds to levothyroxine in GI tract'
  }
]

const localContraindicationDatabase: ContraindicationEntry[] = [
  {
    drug: 'sildenafil',
    condition: 'recent myocardial infarction',
    severity: 'absolute',
    description: 'Cardiovascular stress from sexual activity is contraindicated within 90 days of MI'
  },
  {
    drug: 'sildenafil',
    condition: 'unstable angina',
    severity: 'absolute',
    description: 'Cardiovascular risk too high'
  },
  {
    drug: 'sildenafil',
    condition: 'severe heart failure',
    severity: 'absolute',
    description: 'Cannot tolerate hemodynamic changes'
  },
  {
    drug: 'finasteride',
    condition: 'pregnancy',
    severity: 'absolute',
    description: 'Causes birth defects in male fetuses'
  },
  {
    drug: 'semaglutide',
    condition: 'medullary thyroid carcinoma',
    severity: 'absolute',
    description: 'GLP-1 agonists associated with thyroid C-cell tumors'
  },
  {
    drug: 'metformin',
    condition: 'chronic kidney disease stage 4-5',
    severity: 'absolute',
    description: 'Risk of lactic acidosis when GFR <30'
  },
  {
    drug: 'lisinopril',
    condition: 'angioedema history',
    severity: 'absolute',
    description: 'High risk of recurrent, potentially fatal angioedema'
  },
  {
    drug: 'lisinopril',
    condition: 'pregnancy',
    severity: 'absolute',
    description: 'Fetotoxic - causes fetal renal failure'
  },
  {
    drug: 'metoprolol',
    condition: 'severe bradycardia',
    severity: 'absolute',
    description: 'Will worsen bradycardia'
  },
  {
    drug: 'metoprolol',
    condition: 'asthma',
    severity: 'relative',
    description: 'May trigger bronchospasm even with cardioselective agents'
  }
]

const localAllergyMappings: AllergyMappingEntry[] = [
  {
    allergy: 'penicillin',
    drug_classes: ['penicillins', 'aminopenicillins'],
    cross_reactants: ['amoxicillin', 'ampicillin', 'piperacillin', 'cephalosporins (1-10% cross-reactivity)']
  },
  {
    allergy: 'sulfa drugs',
    drug_classes: ['sulfonamide antibiotics'],
    cross_reactants: ['sulfamethoxazole', 'sulfasalazine', 'possibly thiazide diuretics', 'possibly sulfonylureas']
  },
  {
    allergy: 'aspirin',
    drug_classes: ['NSAIDs', 'salicylates'],
    cross_reactants: ['ibuprofen', 'naproxen', 'ketorolac', 'meloxicam', 'celecoxib (lower risk)']
  },
  {
    allergy: 'nsaids',
    drug_classes: ['NSAIDs'],
    cross_reactants: ['aspirin', 'ibuprofen', 'naproxen', 'meloxicam', 'ketorolac']
  },
  {
    allergy: 'ace inhibitors',
    drug_classes: ['ACE inhibitors'],
    cross_reactants: ['lisinopril', 'enalapril', 'ramipril', 'benazepril', 'ARBs (use with caution)']
  },
  {
    allergy: 'codeine',
    drug_classes: ['opioids'],
    cross_reactants: ['morphine', 'hydrocodone', 'oxycodone', 'tramadol (may be safer)']
  },
  {
    allergy: 'iodine',
    drug_classes: ['iodine-containing compounds'],
    cross_reactants: ['contrast dye', 'amiodarone', 'povidone-iodine']
  },
  {
    allergy: 'contrast dye',
    drug_classes: ['radiographic contrast'],
    cross_reactants: ['all iodinated contrast agents']
  }
]

// Get drug interactions (from Supabase or local fallback)
async function getDrugInteractionData(): Promise<DrugInteractionEntry[]> {
  // First check cache
  const cached = getCachedDrugInteractions()
  if (cached && cached.length > 0) {
    return cached
  }

  // Try to fetch from Supabase
  const supabaseData = await fetchDrugInteractions()
  if (supabaseData.length > 0) {
    return supabaseData
  }

  // Fallback to local data
  return localDrugInteractionDatabase
}

// Get contraindications (from Supabase or local fallback)
async function getContraindicationData(): Promise<ContraindicationEntry[]> {
  const cached = getCachedContraindications()
  if (cached && cached.length > 0) {
    return cached
  }

  const supabaseData = await fetchContraindications()
  if (supabaseData.length > 0) {
    return supabaseData
  }

  return localContraindicationDatabase
}

// Get allergy mappings (from Supabase or local fallback)
async function getAllergyMappingData(): Promise<AllergyMappingEntry[]> {
  const cached = getCachedAllergyMappings()
  if (cached && cached.length > 0) {
    return cached
  }

  const supabaseData = await fetchAllergyMappings()
  if (supabaseData.length > 0) {
    return supabaseData
  }

  return localAllergyMappings
}

// ==================== Check Functions ====================

export async function checkDrugInteractions(medications: string[]): Promise<DrugInteractionEntry[]> {
  const normalizedMeds = medications.map(m => m.toLowerCase().split(' ')[0])
  const interactions: DrugInteractionEntry[] = []
  const database = await getDrugInteractionData()
  
  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med1 = normalizedMeds[i]
      const med2 = normalizedMeds[j]
      
      const interaction = database.find(entry => 
        (entry.drug1.toLowerCase().includes(med1) || med1.includes(entry.drug1.toLowerCase())) &&
        (entry.drug2.toLowerCase().includes(med2) || med2.includes(entry.drug2.toLowerCase())) ||
        (entry.drug1.toLowerCase().includes(med2) || med2.includes(entry.drug1.toLowerCase())) &&
        (entry.drug2.toLowerCase().includes(med1) || med1.includes(entry.drug2.toLowerCase()))
      )
      
      if (interaction) {
        interactions.push(interaction)
      }
    }
  }
  
  return interactions
}

export async function checkContraindications(drug: string, conditions: string[]): Promise<ContraindicationEntry[]> {
  const normalizedDrug = drug.toLowerCase()
  const normalizedConditions = conditions.map(c => c.toLowerCase())
  const database = await getContraindicationData()
  
  return database.filter(entry => {
    const drugMatch = normalizedDrug.includes(entry.drug.toLowerCase()) || 
                      entry.drug.toLowerCase().includes(normalizedDrug)
    const conditionMatch = normalizedConditions.some(c => 
      c.includes(entry.condition.toLowerCase()) || 
      entry.condition.toLowerCase().includes(c)
    )
    
    return drugMatch && conditionMatch
  })
}

export async function checkAllergyConflicts(allergies: string[], proposedDrug: string): Promise<AllergyMappingEntry[]> {
  const normalizedAllergies = allergies.map(a => a.toLowerCase())
  const normalizedDrug = proposedDrug.toLowerCase()
  const database = await getAllergyMappingData()
  
  return database.filter(mapping => {
    const hasAllergy = normalizedAllergies.some(a => 
      a.includes(mapping.allergy.toLowerCase()) || 
      mapping.allergy.toLowerCase().includes(a)
    )
    
    if (!hasAllergy) return false
    
    const drugConflict = mapping.cross_reactants.some(r => 
      normalizedDrug.includes(r.toLowerCase()) || 
      r.toLowerCase().includes(normalizedDrug)
    )
    
    return drugConflict
  })
}

// ==================== Sync Check Functions (for immediate use) ====================
// These use cached data or local fallback synchronously

export function checkDrugInteractionsSync(medications: string[]): DrugInteractionEntry[] {
  const normalizedMeds = medications.map(m => m.toLowerCase().split(' ')[0])
  const interactions: DrugInteractionEntry[] = []
  const database = getCachedDrugInteractions() || localDrugInteractionDatabase
  
  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med1 = normalizedMeds[i]
      const med2 = normalizedMeds[j]
      
      const interaction = database.find(entry => 
        (entry.drug1.toLowerCase().includes(med1) || med1.includes(entry.drug1.toLowerCase())) &&
        (entry.drug2.toLowerCase().includes(med2) || med2.includes(entry.drug2.toLowerCase())) ||
        (entry.drug1.toLowerCase().includes(med2) || med2.includes(entry.drug1.toLowerCase())) &&
        (entry.drug2.toLowerCase().includes(med1) || med1.includes(entry.drug2.toLowerCase()))
      )
      
      if (interaction) {
        interactions.push(interaction)
      }
    }
  }
  
  return interactions
}

export function checkContraindicationsSync(drug: string, conditions: string[]): ContraindicationEntry[] {
  const normalizedDrug = drug.toLowerCase()
  const normalizedConditions = conditions.map(c => c.toLowerCase())
  const database = getCachedContraindications() || localContraindicationDatabase
  
  return database.filter(entry => {
    const drugMatch = normalizedDrug.includes(entry.drug.toLowerCase()) || 
                      entry.drug.toLowerCase().includes(normalizedDrug)
    const conditionMatch = normalizedConditions.some(c => 
      c.includes(entry.condition.toLowerCase()) || 
      entry.condition.toLowerCase().includes(c)
    )
    
    return drugMatch && conditionMatch
  })
}

export function checkAllergyConflictsSync(allergies: string[], proposedDrug: string): AllergyMappingEntry[] {
  const normalizedAllergies = allergies.map(a => a.toLowerCase())
  const normalizedDrug = proposedDrug.toLowerCase()
  const database = getCachedAllergyMappings() || localAllergyMappings
  
  return database.filter(mapping => {
    const hasAllergy = normalizedAllergies.some(a => 
      a.includes(mapping.allergy.toLowerCase()) || 
      mapping.allergy.toLowerCase().includes(a)
    )
    
    if (!hasAllergy) return false
    
    const drugConflict = mapping.cross_reactants.some(r => 
      normalizedDrug.includes(r.toLowerCase()) || 
      r.toLowerCase().includes(normalizedDrug)
    )
    
    return drugConflict
  })
}

// ==================== Utility Functions ====================

export function getDrugClassInfo(drugName: string): string | null {
  const drugClasses: Record<string, string[]> = {
    'PDE5 inhibitors': ['sildenafil', 'tadalafil', 'vardenafil', 'avanafil'],
    'ACE inhibitors': ['lisinopril', 'enalapril', 'ramipril', 'benazepril', 'captopril'],
    'ARBs': ['losartan', 'valsartan', 'irbesartan', 'olmesartan', 'candesartan'],
    'Beta blockers': ['metoprolol', 'carvedilol', 'atenolol', 'propranolol', 'bisoprolol'],
    'Statins': ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lovastatin'],
    'SSRIs': ['sertraline', 'fluoxetine', 'paroxetine', 'citalopram', 'escitalopram'],
    'Biguanides': ['metformin'],
    '5-alpha reductase inhibitors': ['finasteride', 'dutasteride'],
    'GLP-1 agonists': ['semaglutide', 'liraglutide', 'dulaglutide', 'exenatide'],
    'Anticoagulants': ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran', 'edoxaban'],
    'Antiplatelet agents': ['aspirin', 'clopidogrel', 'prasugrel', 'ticagrelor'],
    'Nitrates': ['nitroglycerin', 'isosorbide', 'isordil'],
    'Triptans': ['sumatriptan', 'rizatriptan', 'zolmitriptan', 'eletriptan'],
    'Opioids': ['morphine', 'codeine', 'oxycodone', 'hydrocodone', 'fentanyl', 'tramadol'],
    'NSAIDs': ['ibuprofen', 'naproxen', 'meloxicam', 'ketorolac', 'celecoxib', 'diclofenac']
  }
  
  const normalizedDrug = drugName.toLowerCase()
  
  for (const [className, drugs] of Object.entries(drugClasses)) {
    if (drugs.some(d => normalizedDrug.includes(d) || d.includes(normalizedDrug))) {
      return className
    }
  }
  
  return null
}

// Pre-load data from Supabase on module import
export async function initializeMedicalDatabase(): Promise<void> {
  await Promise.all([
    getDrugInteractionData(),
    getContraindicationData(),
    getAllergyMappingData(),
  ])
  console.log('Medical database initialized')
}

// Simulated drug interaction database for validation/enrichment of LLM output

export interface DrugInteractionEntry {
  drug1: string
  drug2: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  description: string
  mechanism: string
}

export interface ContraindicationEntry {
  drug: string
  condition: string
  severity: 'relative' | 'absolute'
  description: string
}

export interface AllergyMapping {
  allergy: string
  drugClasses: string[]
  crossReactants: string[]
}

// Drug interaction database
export const drugInteractionDatabase: DrugInteractionEntry[] = [
  // PDE5 inhibitors interactions
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
    drug1: 'sildenafil',
    drug2: 'doxazosin',
    severity: 'major',
    description: 'May cause severe hypotension',
    mechanism: 'Both drugs lower blood pressure'
  },
  {
    drug1: 'sildenafil',
    drug2: 'tamsulosin',
    severity: 'major',
    description: 'May cause orthostatic hypotension',
    mechanism: 'Both drugs affect blood pressure through different mechanisms'
  },
  
  // Warfarin interactions
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
    drug1: 'warfarin',
    drug2: 'naproxen',
    severity: 'major',
    description: 'Significantly increased risk of GI bleeding',
    mechanism: 'NSAIDs inhibit platelet function and can cause GI ulcers'
  },
  
  // SSRI interactions
  {
    drug1: 'sertraline',
    drug2: 'sumatriptan',
    severity: 'major',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Both drugs increase serotonin activity'
  },
  {
    drug1: 'fluoxetine',
    drug2: 'tramadol',
    severity: 'major',
    description: 'Risk of serotonin syndrome and seizures',
    mechanism: 'Both drugs affect serotonin reuptake'
  },
  
  // Metformin interactions
  {
    drug1: 'metformin',
    drug2: 'contrast dye',
    severity: 'major',
    description: 'Risk of lactic acidosis',
    mechanism: 'Contrast can cause acute kidney injury, impairing metformin clearance'
  },
  
  // Heart medications
  {
    drug1: 'metoprolol',
    drug2: 'verapamil',
    severity: 'major',
    description: 'Risk of severe bradycardia and heart block',
    mechanism: 'Both drugs slow AV node conduction'
  },
  {
    drug1: 'carvedilol',
    drug2: 'diltiazem',
    severity: 'major',
    description: 'Risk of severe bradycardia and heart block',
    mechanism: 'Both drugs slow AV node conduction'
  },
  {
    drug1: 'lisinopril',
    drug2: 'spironolactone',
    severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'Both drugs can increase potassium levels'
  },
  
  // Clopidogrel
  {
    drug1: 'clopidogrel',
    drug2: 'omeprazole',
    severity: 'major',
    description: 'Reduced antiplatelet effect of clopidogrel',
    mechanism: 'Omeprazole inhibits CYP2C19 needed for clopidogrel activation'
  },
  
  // Statin interactions
  {
    drug1: 'simvastatin',
    drug2: 'gemfibrozil',
    severity: 'major',
    description: 'Increased risk of myopathy and rhabdomyolysis',
    mechanism: 'Gemfibrozil inhibits statin metabolism'
  },
  {
    drug1: 'atorvastatin',
    drug2: 'clarithromycin',
    severity: 'major',
    description: 'Increased statin levels, risk of myopathy',
    mechanism: 'CYP3A4 inhibition increases statin exposure'
  },
  
  // Moderate interactions
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
  },
  {
    drug1: 'metformin',
    drug2: 'alcohol',
    severity: 'moderate',
    description: 'Increased risk of lactic acidosis',
    mechanism: 'Alcohol impairs lactate metabolism'
  }
]

// Contraindication database
export const contraindicationDatabase: ContraindicationEntry[] = [
  // PDE5 inhibitors
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
    drug: 'sildenafil',
    condition: 'severe hypotension',
    severity: 'absolute',
    description: 'Further blood pressure reduction is dangerous'
  },
  {
    drug: 'tadalafil',
    condition: 'coronary artery disease',
    severity: 'relative',
    description: 'Use with caution, assess cardiovascular risk'
  },
  
  // Finasteride
  {
    drug: 'finasteride',
    condition: 'pregnancy',
    severity: 'absolute',
    description: 'Causes birth defects in male fetuses - women should not even handle crushed tablets'
  },
  {
    drug: 'finasteride',
    condition: 'liver disease',
    severity: 'relative',
    description: 'Metabolized by liver, may accumulate'
  },
  
  // GLP-1 agonists
  {
    drug: 'semaglutide',
    condition: 'medullary thyroid carcinoma',
    severity: 'absolute',
    description: 'GLP-1 agonists associated with thyroid C-cell tumors in rodents'
  },
  {
    drug: 'semaglutide',
    condition: 'MEN2 syndrome',
    severity: 'absolute',
    description: 'High risk of medullary thyroid carcinoma'
  },
  {
    drug: 'semaglutide',
    condition: 'pancreatitis',
    severity: 'relative',
    description: 'May increase pancreatitis risk'
  },
  
  // Metformin
  {
    drug: 'metformin',
    condition: 'chronic kidney disease stage 4-5',
    severity: 'absolute',
    description: 'Risk of lactic acidosis when GFR <30'
  },
  {
    drug: 'metformin',
    condition: 'lactic acidosis history',
    severity: 'absolute',
    description: 'Prior lactic acidosis is a contraindication'
  },
  
  // ACE inhibitors
  {
    drug: 'lisinopril',
    condition: 'angioedema history',
    severity: 'absolute',
    description: 'High risk of recurrent, potentially fatal angioedema'
  },
  {
    drug: 'lisinopril',
    condition: 'bilateral renal artery stenosis',
    severity: 'absolute',
    description: 'Can cause acute renal failure'
  },
  {
    drug: 'lisinopril',
    condition: 'pregnancy',
    severity: 'absolute',
    description: 'Fetotoxic - causes fetal renal failure'
  },
  
  // Beta blockers
  {
    drug: 'metoprolol',
    condition: 'severe bradycardia',
    severity: 'absolute',
    description: 'Will worsen bradycardia'
  },
  {
    drug: 'metoprolol',
    condition: 'decompensated heart failure',
    severity: 'absolute',
    description: 'Can precipitate cardiogenic shock'
  },
  {
    drug: 'metoprolol',
    condition: 'asthma',
    severity: 'relative',
    description: 'May trigger bronchospasm even with cardioselective agents'
  }
]

// Allergy cross-reactivity mapping
export const allergyMappings: AllergyMapping[] = [
  {
    allergy: 'penicillin',
    drugClasses: ['penicillins', 'aminopenicillins'],
    crossReactants: ['amoxicillin', 'ampicillin', 'piperacillin', 'cephalosporins (1-10% cross-reactivity)']
  },
  {
    allergy: 'sulfa drugs',
    drugClasses: ['sulfonamide antibiotics'],
    crossReactants: ['sulfamethoxazole', 'sulfasalazine', 'possibly thiazide diuretics', 'possibly loop diuretics', 'possibly sulfonylureas']
  },
  {
    allergy: 'aspirin',
    drugClasses: ['NSAIDs', 'salicylates'],
    crossReactants: ['ibuprofen', 'naproxen', 'ketorolac', 'meloxicam', 'celecoxib (lower risk)']
  },
  {
    allergy: 'nsaids',
    drugClasses: ['NSAIDs'],
    crossReactants: ['aspirin', 'ibuprofen', 'naproxen', 'meloxicam', 'ketorolac']
  },
  {
    allergy: 'ace inhibitors',
    drugClasses: ['ACE inhibitors'],
    crossReactants: ['lisinopril', 'enalapril', 'ramipril', 'benazepril', 'ARBs (use with caution)']
  },
  {
    allergy: 'codeine',
    drugClasses: ['opioids'],
    crossReactants: ['morphine', 'hydrocodone', 'oxycodone', 'tramadol (may be safer)']
  },
  {
    allergy: 'morphine',
    drugClasses: ['opioids'],
    crossReactants: ['codeine', 'hydrocodone', 'oxycodone', 'fentanyl (may be safer)']
  },
  {
    allergy: 'iodine',
    drugClasses: ['iodine-containing compounds'],
    crossReactants: ['contrast dye', 'amiodarone', 'povidone-iodine']
  },
  {
    allergy: 'contrast dye',
    drugClasses: ['radiographic contrast'],
    crossReactants: ['all iodinated contrast agents']
  }
]

// Helper functions
export function checkDrugInteractions(medications: string[]): DrugInteractionEntry[] {
  const normalizedMeds = medications.map(m => m.toLowerCase().split(' ')[0])
  const interactions: DrugInteractionEntry[] = []
  
  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med1 = normalizedMeds[i]
      const med2 = normalizedMeds[j]
      
      const interaction = drugInteractionDatabase.find(entry => 
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

export function checkContraindications(drug: string, conditions: string[]): ContraindicationEntry[] {
  const normalizedDrug = drug.toLowerCase()
  const normalizedConditions = conditions.map(c => c.toLowerCase())
  
  return contraindicationDatabase.filter(entry => {
    const drugMatch = normalizedDrug.includes(entry.drug.toLowerCase()) || 
                      entry.drug.toLowerCase().includes(normalizedDrug)
    const conditionMatch = normalizedConditions.some(c => 
      c.includes(entry.condition.toLowerCase()) || 
      entry.condition.toLowerCase().includes(c)
    )
    
    return drugMatch && conditionMatch
  })
}

export function checkAllergyConflicts(allergies: string[], proposedDrug: string): AllergyMapping[] {
  const normalizedAllergies = allergies.map(a => a.toLowerCase())
  const normalizedDrug = proposedDrug.toLowerCase()
  
  return allergyMappings.filter(mapping => {
    const hasAllergy = normalizedAllergies.some(a => 
      a.includes(mapping.allergy.toLowerCase()) || 
      mapping.allergy.toLowerCase().includes(a)
    )
    
    if (!hasAllergy) return false
    
    const drugConflict = mapping.crossReactants.some(r => 
      normalizedDrug.includes(r.toLowerCase()) || 
      r.toLowerCase().includes(normalizedDrug)
    )
    
    return drugConflict
  })
}

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


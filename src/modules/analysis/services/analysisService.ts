import { PatientData } from '@/shared/types/patient'
import { AnalysisResult, AnalysisResultSchema } from '@/shared/types/analysis'
import { buildMedicalSystemPrompt, buildPatientContext } from './medicalPrompt'
import { checkDrugInteractions, checkContraindications, checkAllergyConflicts } from './drugDatabase'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function analyzePatient(patient: PatientData): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    // Return mock analysis if no API key
    console.warn('No API key provided, returning mock analysis')
    return generateMockAnalysis(patient)
  }

  const systemPrompt = buildMedicalSystemPrompt()
  const userPrompt = buildPatientContext(patient)

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('API Error:', error)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Parse and validate the JSON response
    let parsed: unknown
    try {
      // Extract JSON from response (in case there's any extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate against schema
    const validated = AnalysisResultSchema.parse(parsed)

    // Enrich with local database checks
    const enrichedResult = enrichAnalysisWithDatabase(validated, patient)

    return enrichedResult
  } catch (error) {
    console.error('Analysis failed:', error)
    // Fall back to mock analysis
    return generateMockAnalysis(patient)
  }
}

function enrichAnalysisWithDatabase(
  analysis: AnalysisResult,
  patient: PatientData
): AnalysisResult {
  // Check for any drug interactions in the database that weren't caught
  const currentMedNames = patient.currentMedications.map(m => m.name)
  const allMeds = [...currentMedNames, analysis.primaryRecommendation.medication]
  
  const dbInteractions = checkDrugInteractions(allMeds)
  
  // Add any database interactions not already in analysis
  for (const dbInt of dbInteractions) {
    const exists = analysis.drugInteractions.some(
      ai => ai.drug1.toLowerCase().includes(dbInt.drug1.toLowerCase()) ||
            ai.drug2.toLowerCase().includes(dbInt.drug2.toLowerCase())
    )
    
    if (!exists) {
      analysis.drugInteractions.push({
        drug1: dbInt.drug1,
        drug2: dbInt.drug2,
        severity: dbInt.severity,
        description: dbInt.description,
        recommendation: `Database flagged: ${dbInt.mechanism}`,
      })
    }
  }

  // Check contraindications
  const dbContraindications = checkContraindications(
    analysis.primaryRecommendation.medication,
    patient.conditions
  )

  for (const dbContra of dbContraindications) {
    const exists = analysis.contraindications.some(
      ac => ac.medication.toLowerCase().includes(dbContra.drug.toLowerCase()) &&
            ac.condition.toLowerCase().includes(dbContra.condition.toLowerCase())
    )

    if (!exists) {
      analysis.contraindications.push({
        medication: dbContra.drug,
        condition: dbContra.condition,
        severity: dbContra.severity,
        description: dbContra.description,
        recommendation: `Verified by drug database`,
      })
    }
  }

  // Check allergy conflicts
  const allergyConflicts = checkAllergyConflicts(
    patient.allergies,
    analysis.primaryRecommendation.medication
  )

  for (const conflict of allergyConflicts) {
    const exists = analysis.contraindications.some(
      ac => ac.condition.toLowerCase().includes('allergy')
    )

    if (!exists && conflict) {
      analysis.contraindications.push({
        medication: analysis.primaryRecommendation.medication,
        condition: `Allergy to ${conflict.allergy}`,
        severity: 'absolute',
        description: `Patient has allergy to ${conflict.allergy} which may cross-react with ${analysis.primaryRecommendation.medication}`,
        recommendation: `Consider alternative medication. Cross-reactants: ${conflict.crossReactants.join(', ')}`,
      })
      
      // Elevate risk level if allergy conflict found
      if (analysis.overallRiskLevel === 'low') {
        analysis.overallRiskLevel = 'high'
        analysis.riskScore = Math.max(analysis.riskScore, 75)
      }
    }
  }

  // Recalculate risk score based on findings
  const majorInteractions = analysis.drugInteractions.filter(
    i => i.severity === 'major' || i.severity === 'contraindicated'
  ).length
  const absoluteContraindications = analysis.contraindications.filter(
    c => c.severity === 'absolute'
  ).length

  if (absoluteContraindications > 0 || analysis.drugInteractions.some(i => i.severity === 'contraindicated')) {
    analysis.overallRiskLevel = 'critical'
    analysis.riskScore = Math.max(analysis.riskScore, 90)
  } else if (majorInteractions > 1 || absoluteContraindications > 0) {
    analysis.overallRiskLevel = 'high'
    analysis.riskScore = Math.max(analysis.riskScore, 70)
  }

  return analysis
}

function generateMockAnalysis(patient: PatientData): AnalysisResult {
  // Generate realistic mock data based on patient information
  const hasWarfarin = patient.currentMedications.some(m => 
    m.name.toLowerCase().includes('warfarin')
  )
  const hasNitrates = patient.currentMedications.some(m => 
    m.name.toLowerCase().includes('nitro') || m.name.toLowerCase().includes('isosorbide')
  )
  const hasBetaBlocker = patient.currentMedications.some(m =>
    m.name.toLowerCase().includes('metoprolol') || m.name.toLowerCase().includes('carvedilol')
  )
  const hasHeartCondition = patient.conditions.some(c => 
    c.toLowerCase().includes('heart') || c.toLowerCase().includes('cardiac') || c.toLowerCase().includes('coronary')
  )
  const hasDiabetes = patient.conditions.some(c => 
    c.toLowerCase().includes('diabetes')
  )
  const hasKidneyDisease = patient.conditions.some(c => 
    c.toLowerCase().includes('kidney') || c.toLowerCase().includes('renal')
  )
  const hasPenicillinAllergy = patient.allergies.some(a => 
    a.toLowerCase().includes('penicillin')
  )
  const isEdComplaint = patient.primaryComplaint.toLowerCase().includes('erectile') || 
                         patient.primaryComplaint.toLowerCase().includes('ed')
  const isHairLoss = patient.primaryComplaint.toLowerCase().includes('hair')
  const isWeightLoss = patient.primaryComplaint.toLowerCase().includes('weight')

  // Determine risk level based on patient factors
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let riskScore = 25

  const drugInteractions: AnalysisResult['drugInteractions'] = []
  const contraindications: AnalysisResult['contraindications'] = []
  const riskFactors: AnalysisResult['riskFactors'] = []

  // Check for critical interactions
  if (isEdComplaint && hasNitrates) {
    riskLevel = 'critical'
    riskScore = 95
    drugInteractions.push({
      drug1: 'Sildenafil (proposed)',
      drug2: 'Nitrates (current)',
      severity: 'contraindicated',
      description: 'LIFE-THREATENING: Combination can cause severe, potentially fatal hypotension',
      recommendation: 'DO NOT prescribe PDE5 inhibitors. Consider alternative treatments for ED.'
    })
  }

  if (hasWarfarin && patient.currentMedications.some(m => m.name.toLowerCase().includes('aspirin'))) {
    drugInteractions.push({
      drug1: 'Warfarin',
      drug2: 'Aspirin',
      severity: 'major',
      description: 'Significantly increased bleeding risk',
      recommendation: 'If combination is intentional, ensure regular INR monitoring and GI protection'
    })
    if (riskLevel === 'low') {
      riskLevel = 'medium'
      riskScore = Math.max(riskScore, 55)
    }
  }

  // Age-related risks
  if (patient.healthMetrics.age >= 65) {
    riskFactors.push({
      factor: 'Advanced age',
      severity: 'medium',
      description: `Patient is ${patient.healthMetrics.age} years old - increased sensitivity to medications`,
      mitigation: 'Start with lower doses, monitor closely for side effects'
    })
    riskScore = Math.max(riskScore, 45)
    if (riskLevel === 'low') riskLevel = 'medium'
  }

  // Cardiovascular risks for ED treatment
  if (isEdComplaint && hasHeartCondition) {
    contraindications.push({
      medication: 'PDE5 inhibitors',
      condition: 'Cardiovascular disease',
      severity: 'relative',
      description: 'Sexual activity may pose cardiac risk; PDE5 inhibitors affect blood pressure',
      recommendation: 'Assess cardiovascular fitness for sexual activity before prescribing'
    })
    riskFactors.push({
      factor: 'Cardiovascular disease',
      severity: 'high',
      description: 'Underlying heart condition increases risk with ED medications',
      mitigation: 'Cardiac clearance recommended, start with lowest dose'
    })
    if (riskLevel !== 'critical') {
      riskLevel = 'high'
      riskScore = Math.max(riskScore, 70)
    }
  }

  // Kidney disease
  if (hasKidneyDisease) {
    riskFactors.push({
      factor: 'Chronic Kidney Disease',
      severity: 'high',
      description: 'Impaired drug clearance - dose adjustments required',
      mitigation: 'Use renal dosing guidelines, avoid nephrotoxic drugs'
    })
    if (riskLevel === 'low') {
      riskLevel = 'medium'
      riskScore = Math.max(riskScore, 50)
    }
  }

  // Diabetes
  if (hasDiabetes && hasBetaBlocker) {
    drugInteractions.push({
      drug1: 'Beta-blocker',
      drug2: 'Diabetes medications',
      severity: 'moderate',
      description: 'Beta-blockers may mask symptoms of hypoglycemia',
      recommendation: 'Educate patient on alternate hypoglycemia symptoms, consider cardioselective beta-blocker'
    })
  }

  // Polypharmacy
  if (patient.currentMedications.length >= 5) {
    riskFactors.push({
      factor: 'Polypharmacy',
      severity: 'medium',
      description: `Patient on ${patient.currentMedications.length} medications - increased interaction risk`,
      mitigation: 'Review medication list for deprescribing opportunities, careful monitoring'
    })
    if (riskLevel === 'low') {
      riskLevel = 'medium'
      riskScore = Math.max(riskScore, 50)
    }
  }

  // Build treatment recommendation based on complaint
  let primaryRecommendation: AnalysisResult['primaryRecommendation']
  let alternativeTreatments: AnalysisResult['alternativeTreatments'] = []

  if (isEdComplaint) {
    if (hasNitrates) {
      primaryRecommendation = {
        medication: 'Vacuum Erection Device (non-pharmacological)',
        dosage: 'N/A',
        frequency: 'As needed',
        duration: 'Ongoing',
        route: 'External device',
        confidenceScore: 75,
        rationale: 'PDE5 inhibitors are contraindicated due to nitrate use. VED is a safe alternative.',
        monitoringRequired: ['Patient satisfaction', 'Proper technique'],
        warnings: ['Do not use for more than 30 minutes at a time']
      }
      alternativeTreatments = [
        {
          medication: 'Alprostadil (intracavernosal)',
          dosage: '10-20 mcg',
          rationale: 'Direct injection therapy, does not interact with nitrates',
          confidenceScore: 65,
          considerations: ['Requires injection training', 'Risk of priapism', 'Penile fibrosis with long-term use']
        }
      ]
    } else {
      primaryRecommendation = {
        medication: 'Sildenafil',
        dosage: patient.healthMetrics.age >= 65 ? '25mg' : '50mg',
        frequency: 'As needed, 1 hour before sexual activity',
        duration: 'Ongoing',
        route: 'Oral',
        confidenceScore: hasHeartCondition ? 65 : 85,
        rationale: 'First-line treatment for erectile dysfunction. Effective in most cases.',
        monitoringRequired: ['Blood pressure', 'Efficacy assessment at follow-up'],
        warnings: hasHeartCondition 
          ? ['Start with lower dose', 'Assess cardiovascular fitness', 'Do not use with nitrates']
          : ['Do not use with nitrates', 'Avoid grapefruit juice']
      }
      alternativeTreatments = [
        {
          medication: 'Tadalafil',
          dosage: '10mg',
          rationale: 'Longer duration of action (up to 36 hours), may be preferred for spontaneity',
          confidenceScore: 80,
          considerations: ['Once-daily dosing option available', 'More back pain reported']
        }
      ]
    }
  } else if (isHairLoss) {
    const isFemale = patient.sex === 'female'
    if (isFemale) {
      primaryRecommendation = {
        medication: 'Minoxidil 2% topical solution',
        dosage: '1mL',
        frequency: 'Twice daily',
        duration: 'Ongoing - takes 4-6 months to see results',
        route: 'Topical',
        confidenceScore: 80,
        rationale: 'FDA-approved for female pattern hair loss. Safe and well-tolerated.',
        monitoringRequired: ['Scalp irritation', 'Efficacy at 6 months'],
        warnings: ['May cause initial shedding', 'Must continue for maintenance']
      }
    } else {
      primaryRecommendation = {
        medication: 'Finasteride',
        dosage: '1mg',
        frequency: 'Once daily',
        duration: 'Ongoing - takes 6-12 months for full effect',
        route: 'Oral',
        confidenceScore: 85,
        rationale: 'First-line oral treatment for male pattern baldness. Blocks DHT conversion.',
        monitoringRequired: ['PSA levels (baseline)', 'Sexual function questionnaire'],
        warnings: ['May affect PSA levels', 'Do not donate blood while taking', 'Sexual side effects possible (1-2%)']
      }
      alternativeTreatments = [
        {
          medication: 'Minoxidil 5% topical',
          dosage: '1mL',
          rationale: 'Can be used alone or in combination with finasteride for enhanced effect',
          confidenceScore: 75,
          considerations: ['Topical application', 'Twice daily application required']
        }
      ]
    }
  } else if (isWeightLoss) {
    primaryRecommendation = {
      medication: 'Semaglutide',
      dosage: '0.25mg weekly, titrate to 2.4mg',
      frequency: 'Once weekly',
      duration: '16 weeks minimum, typically ongoing',
      route: 'Subcutaneous injection',
      confidenceScore: 90,
      rationale: 'GLP-1 agonist FDA-approved for weight management. Average 15% body weight loss.',
      monitoringRequired: ['Weight', 'Blood glucose', 'GI tolerability'],
      warnings: ['Do not use if history of medullary thyroid carcinoma', 'GI side effects common initially', 'Slow titration required']
    }
    alternativeTreatments = [
      {
        medication: 'Phentermine-Topiramate',
        dosage: '3.75mg/23mg, titrate up',
        rationale: 'Alternative for those who cannot use GLP-1 agonists',
        confidenceScore: 70,
        considerations: ['Contraindicated in cardiovascular disease', 'Controlled substance', 'Avoid in pregnancy']
      }
    ]
  } else {
    // Generic recommendation
    primaryRecommendation = {
      medication: 'Clinical evaluation needed',
      dosage: 'N/A',
      frequency: 'N/A',
      duration: 'N/A',
      route: 'N/A',
      confidenceScore: 50,
      rationale: 'Further clinical evaluation needed to determine appropriate treatment',
      monitoringRequired: ['Complete diagnostic workup'],
      warnings: ['Additional assessment required']
    }
  }

  // Lifestyle recommendations
  const lifestyleRecommendations: string[] = []
  if (patient.lifestyle.smokingStatus === 'current') {
    lifestyleRecommendations.push('Smoking cessation strongly recommended - improves cardiovascular health and treatment outcomes')
  }
  if (patient.lifestyle.alcoholUse === 'heavy') {
    lifestyleRecommendations.push('Reduce alcohol consumption - may interact with medications and affect treatment efficacy')
  }
  if (patient.lifestyle.exerciseFrequency === 'sedentary') {
    lifestyleRecommendations.push('Increase physical activity - aim for 150 minutes moderate exercise per week')
  }
  if (patient.healthMetrics.bloodPressureSystolic >= 140) {
    lifestyleRecommendations.push('DASH diet recommended for blood pressure control')
  }

  // Labs
  const labTests: string[] = ['Complete metabolic panel']
  if (hasDiabetes) labTests.push('HbA1c')
  if (hasKidneyDisease) labTests.push('GFR/Creatinine')
  if (isEdComplaint) labTests.push('Testosterone level', 'Lipid panel')
  if (isHairLoss && patient.sex === 'female') labTests.push('TSH', 'Iron studies', 'DHEA-S')

  return {
    overallRiskLevel: riskLevel,
    riskScore,
    summaryAssessment: `${patient.firstName} ${patient.lastName}, ${patient.healthMetrics.age}yo ${patient.sex}, presenting with ${patient.primaryComplaint}. ${
      riskLevel === 'critical' ? 'CRITICAL: Contraindicated drug combination identified. ' :
      riskLevel === 'high' ? 'HIGH RISK: Multiple significant risk factors present. ' :
      riskLevel === 'medium' ? 'MODERATE RISK: Some risk factors require monitoring. ' :
      'LOW RISK: Few complicating factors. '
    }${patient.currentMedications.length} current medications, ${patient.conditions.length} active conditions, ${patient.allergies.length} documented allergies.`,
    primaryRecommendation,
    alternativeTreatments,
    drugInteractions,
    contraindications,
    riskFactors,
    lifestyleRecommendations,
    followUpRecommendations: [
      'Follow-up in 4-6 weeks to assess treatment efficacy',
      'Earlier if side effects occur',
      riskLevel === 'high' || riskLevel === 'critical' 
        ? 'Consider specialist referral'
        : 'Routine monitoring as indicated'
    ],
    labTestsRecommended: labTests,
    analysisTimestamp: new Date().toISOString(),
    modelVersion: 'mock-analysis-v1',
    disclaimer: 'This is a clinical decision support tool. All recommendations must be reviewed and approved by a licensed healthcare provider. This mock analysis is for demonstration purposes.'
  }
}


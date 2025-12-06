-- Medical Database Tables for Drug Interactions, Contraindications, and Allergy Mappings

-- Drug Interactions Table
CREATE TABLE IF NOT EXISTS drug_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drug1 TEXT NOT NULL,
  drug2 TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'contraindicated')),
  description TEXT NOT NULL,
  mechanism TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  source TEXT
);

-- Contraindications Table
CREATE TABLE IF NOT EXISTS contraindications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drug TEXT NOT NULL,
  condition TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('relative', 'absolute')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  source TEXT
);

-- Allergy Mappings Table
CREATE TABLE IF NOT EXISTS allergy_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  allergy TEXT NOT NULL,
  drug_classes TEXT[] NOT NULL,
  cross_reactants TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug1 ON drug_interactions (LOWER(drug1));
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug2 ON drug_interactions (LOWER(drug2));
CREATE INDEX IF NOT EXISTS idx_contraindications_drug ON contraindications (LOWER(drug));
CREATE INDEX IF NOT EXISTS idx_contraindications_condition ON contraindications (LOWER(condition));
CREATE INDEX IF NOT EXISTS idx_allergy_mappings_allergy ON allergy_mappings (LOWER(allergy));

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contraindications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergy_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust for production)
CREATE POLICY "Allow public read access on drug_interactions" ON drug_interactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on drug_interactions" ON drug_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on drug_interactions" ON drug_interactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on drug_interactions" ON drug_interactions FOR DELETE USING (true);

CREATE POLICY "Allow public read access on contraindications" ON contraindications FOR SELECT USING (true);
CREATE POLICY "Allow public insert on contraindications" ON contraindications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on contraindications" ON contraindications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on contraindications" ON contraindications FOR DELETE USING (true);

CREATE POLICY "Allow public read access on allergy_mappings" ON allergy_mappings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on allergy_mappings" ON allergy_mappings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on allergy_mappings" ON allergy_mappings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on allergy_mappings" ON allergy_mappings FOR DELETE USING (true);

-- Insert default data from existing local database

-- Drug Interactions
INSERT INTO drug_interactions (drug1, drug2, severity, description, mechanism, is_verified, source) VALUES
('sildenafil', 'nitroglycerin', 'contraindicated', 'Can cause severe, potentially fatal hypotension', 'Both drugs cause vasodilation via different mechanisms, effects are synergistic', TRUE, 'FDA Guidelines'),
('sildenafil', 'isosorbide', 'contraindicated', 'Can cause severe, potentially fatal hypotension', 'Both drugs cause vasodilation via different mechanisms', TRUE, 'FDA Guidelines'),
('tadalafil', 'nitroglycerin', 'contraindicated', 'Can cause severe, potentially fatal hypotension', 'Both drugs cause vasodilation via different mechanisms', TRUE, 'FDA Guidelines'),
('sildenafil', 'doxazosin', 'major', 'May cause severe hypotension', 'Both drugs lower blood pressure', TRUE, 'Clinical Practice'),
('sildenafil', 'tamsulosin', 'major', 'May cause orthostatic hypotension', 'Both drugs affect blood pressure through different mechanisms', TRUE, 'Clinical Practice'),
('warfarin', 'aspirin', 'major', 'Increased risk of bleeding', 'Both drugs affect hemostasis through different mechanisms', TRUE, 'FDA Guidelines'),
('warfarin', 'ibuprofen', 'major', 'Significantly increased risk of GI bleeding', 'NSAIDs inhibit platelet function and can cause GI ulcers', TRUE, 'FDA Guidelines'),
('warfarin', 'naproxen', 'major', 'Significantly increased risk of GI bleeding', 'NSAIDs inhibit platelet function and can cause GI ulcers', TRUE, 'FDA Guidelines'),
('sertraline', 'sumatriptan', 'major', 'Risk of serotonin syndrome', 'Both drugs increase serotonin activity', TRUE, 'FDA Guidelines'),
('fluoxetine', 'tramadol', 'major', 'Risk of serotonin syndrome and seizures', 'Both drugs affect serotonin reuptake', TRUE, 'FDA Guidelines'),
('metformin', 'contrast dye', 'major', 'Risk of lactic acidosis', 'Contrast can cause acute kidney injury, impairing metformin clearance', TRUE, 'Radiology Guidelines'),
('metoprolol', 'verapamil', 'major', 'Risk of severe bradycardia and heart block', 'Both drugs slow AV node conduction', TRUE, 'Cardiology Guidelines'),
('carvedilol', 'diltiazem', 'major', 'Risk of severe bradycardia and heart block', 'Both drugs slow AV node conduction', TRUE, 'Cardiology Guidelines'),
('lisinopril', 'spironolactone', 'major', 'Risk of hyperkalemia', 'Both drugs can increase potassium levels', TRUE, 'FDA Guidelines'),
('clopidogrel', 'omeprazole', 'major', 'Reduced antiplatelet effect of clopidogrel', 'Omeprazole inhibits CYP2C19 needed for clopidogrel activation', TRUE, 'FDA Guidelines'),
('simvastatin', 'gemfibrozil', 'major', 'Increased risk of myopathy and rhabdomyolysis', 'Gemfibrozil inhibits statin metabolism', TRUE, 'FDA Guidelines'),
('atorvastatin', 'clarithromycin', 'major', 'Increased statin levels, risk of myopathy', 'CYP3A4 inhibition increases statin exposure', TRUE, 'FDA Guidelines'),
('lisinopril', 'ibuprofen', 'moderate', 'May reduce antihypertensive effect and increase renal risk', 'NSAIDs inhibit prostaglandins needed for ACE inhibitor effect', TRUE, 'Clinical Practice'),
('levothyroxine', 'calcium', 'moderate', 'Reduced levothyroxine absorption', 'Calcium binds to levothyroxine in GI tract', TRUE, 'FDA Guidelines'),
('metformin', 'alcohol', 'moderate', 'Increased risk of lactic acidosis', 'Alcohol impairs lactate metabolism', TRUE, 'FDA Guidelines');

-- Contraindications
INSERT INTO contraindications (drug, condition, severity, description, is_verified, source) VALUES
('sildenafil', 'recent myocardial infarction', 'absolute', 'Cardiovascular stress from sexual activity is contraindicated within 90 days of MI', TRUE, 'FDA Guidelines'),
('sildenafil', 'unstable angina', 'absolute', 'Cardiovascular risk too high', TRUE, 'FDA Guidelines'),
('sildenafil', 'severe heart failure', 'absolute', 'Cannot tolerate hemodynamic changes', TRUE, 'Cardiology Guidelines'),
('sildenafil', 'severe hypotension', 'absolute', 'Further blood pressure reduction is dangerous', TRUE, 'FDA Guidelines'),
('tadalafil', 'coronary artery disease', 'relative', 'Use with caution, assess cardiovascular risk', TRUE, 'Clinical Practice'),
('finasteride', 'pregnancy', 'absolute', 'Causes birth defects in male fetuses - women should not even handle crushed tablets', TRUE, 'FDA Guidelines'),
('finasteride', 'liver disease', 'relative', 'Metabolized by liver, may accumulate', TRUE, 'FDA Guidelines'),
('semaglutide', 'medullary thyroid carcinoma', 'absolute', 'GLP-1 agonists associated with thyroid C-cell tumors in rodents', TRUE, 'FDA Guidelines'),
('semaglutide', 'MEN2 syndrome', 'absolute', 'High risk of medullary thyroid carcinoma', TRUE, 'FDA Guidelines'),
('semaglutide', 'pancreatitis', 'relative', 'May increase pancreatitis risk', TRUE, 'FDA Guidelines'),
('metformin', 'chronic kidney disease stage 4-5', 'absolute', 'Risk of lactic acidosis when GFR <30', TRUE, 'FDA Guidelines'),
('metformin', 'lactic acidosis history', 'absolute', 'Prior lactic acidosis is a contraindication', TRUE, 'FDA Guidelines'),
('lisinopril', 'angioedema history', 'absolute', 'High risk of recurrent, potentially fatal angioedema', TRUE, 'FDA Guidelines'),
('lisinopril', 'bilateral renal artery stenosis', 'absolute', 'Can cause acute renal failure', TRUE, 'Nephrology Guidelines'),
('lisinopril', 'pregnancy', 'absolute', 'Fetotoxic - causes fetal renal failure', TRUE, 'FDA Guidelines'),
('metoprolol', 'severe bradycardia', 'absolute', 'Will worsen bradycardia', TRUE, 'Cardiology Guidelines'),
('metoprolol', 'decompensated heart failure', 'absolute', 'Can precipitate cardiogenic shock', TRUE, 'Cardiology Guidelines'),
('metoprolol', 'asthma', 'relative', 'May trigger bronchospasm even with cardioselective agents', TRUE, 'Pulmonology Guidelines');

-- Allergy Mappings
INSERT INTO allergy_mappings (allergy, drug_classes, cross_reactants, is_verified, notes) VALUES
('penicillin', ARRAY['penicillins', 'aminopenicillins'], ARRAY['amoxicillin', 'ampicillin', 'piperacillin', 'cephalosporins (1-10% cross-reactivity)'], TRUE, '1-10% cross-react with cephalosporins'),
('sulfa drugs', ARRAY['sulfonamide antibiotics'], ARRAY['sulfamethoxazole', 'sulfasalazine', 'possibly thiazide diuretics', 'possibly loop diuretics', 'possibly sulfonylureas'], TRUE, 'Cross-reactivity with non-antibiotic sulfonamides is debated'),
('aspirin', ARRAY['NSAIDs', 'salicylates'], ARRAY['ibuprofen', 'naproxen', 'ketorolac', 'meloxicam', 'celecoxib (lower risk)'], TRUE, 'COX-2 selective may be safer'),
('nsaids', ARRAY['NSAIDs'], ARRAY['aspirin', 'ibuprofen', 'naproxen', 'meloxicam', 'ketorolac'], TRUE, 'May react to all NSAIDs'),
('ace inhibitors', ARRAY['ACE inhibitors'], ARRAY['lisinopril', 'enalapril', 'ramipril', 'benazepril', 'ARBs (use with caution)'], TRUE, 'Do NOT give ARBs within 4 weeks of ACE inhibitor angioedema'),
('codeine', ARRAY['opioids'], ARRAY['morphine', 'hydrocodone', 'oxycodone', 'tramadol (may be safer)'], TRUE, 'True allergy is rare, often intolerance'),
('morphine', ARRAY['opioids'], ARRAY['codeine', 'hydrocodone', 'oxycodone', 'fentanyl (may be safer)'], TRUE, 'Fentanyl may be safer alternative'),
('iodine', ARRAY['iodine-containing compounds'], ARRAY['contrast dye', 'amiodarone', 'povidone-iodine'], TRUE, 'Shellfish allergy does NOT indicate iodine allergy'),
('contrast dye', ARRAY['radiographic contrast'], ARRAY['all iodinated contrast agents'], TRUE, 'Premedication may allow safe use');



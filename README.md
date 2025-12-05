# MedAssist AI - Clinical Decision Support System

An AI-powered clinical assistant that turns patient intake data and medical history into personalized, safety-checked treatment plans.

![Risk Score](https://img.shields.io/badge/Safety%20First-Clinical%20AI-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

## 🏥 Overview

MedAssist AI helps doctors make faster, data-driven decisions by:
- **Flagging drug interactions** between current and proposed medications
- **Identifying contraindications** based on patient conditions and allergies
- **Checking dosage appropriateness** considering age, weight, and health factors
- **Producing structured, parseable output** with risk scores and rationale

> ⚠️ **Disclaimer**: This is a clinical decision support tool. All recommendations must be reviewed and approved by a licensed healthcare provider.

## ✨ Features

### Core Functionality
- 📋 **Multi-step Patient Intake Wizard** - Comprehensive data collection
- 🤖 **AI-Powered Analysis** - Claude API integration with medical guidelines
- 🛡️ **Safety Risk Scoring** - Low/Medium/High/Critical risk assessment
- 💊 **Drug Interaction Database** - Built-in validation layer
- 📊 **Clinical Dashboard** - Clear visualization of recommendations

### Safety Features
- Aggressive risk flagging (false positives preferred over misses)
- Cross-reactivity checking for allergies
- Contraindication detection (absolute and relative)
- Polypharmacy warnings
- Age and organ function considerations

### Bonus Features
- ✅ JSON Schema validation for LLM responses
- ✅ Drug interaction database for cross-checking
- ✅ Multi-step wizard (Intake → Analysis → Review → Approval)
- ✅ Confidence scores per recommendation
- ✅ Alternative treatment options
- ✅ Audit logging for medical compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd "AGARTHIAN TECH WITH CURSOR"

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your Anthropic API key to .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> **Note**: The app includes a comprehensive mock analysis system that works without an API key for demonstration purposes.

## 📁 Project Structure

```
src/
├── modules/
│   ├── intake/           # Patient intake wizard
│   │   ├── components/   # Form steps and wizard
│   │   ├── hooks/        # Form state management
│   │   └── constants/    # Sample patients, conditions
│   │
│   ├── analysis/         # AI analysis engine
│   │   ├── components/   # Analysis view
│   │   └── services/     # LLM integration, drug database
│   │
│   └── dashboard/        # Clinical decision dashboard
│       └── components/   # Risk indicators, treatment cards
│
├── shared/
│   ├── components/       # Shared UI components
│   ├── store/           # Zustand state management
│   └── types/           # TypeScript types & Zod schemas
│
└── App.tsx              # Main application
```

## 🧪 Sample Patients

The app includes 4 pre-configured sample patients demonstrating various risk scenarios:

| Patient | Risk Level | Scenario |
|---------|------------|----------|
| John Smith | 🔴 HIGH | Elderly with multiple interactions (ED + nitrates) |
| Maria Garcia | 🟡 MEDIUM | Contraindications present (hair loss + DVT history) |
| David Chen | 🟢 LOW | Healthy patient with minor complaint |
| Robert Johnson | ⛔ CRITICAL | Multiple severe allergies, complex cardiac history |

## 🔬 Technical Details

### Drug Interaction Database

The built-in database includes:
- **Critical Interactions**: PDE5 + Nitrates, SSRIs + MAOIs, etc.
- **Major Interactions**: Warfarin + NSAIDs, Clopidogrel + PPIs
- **Allergy Cross-Reactivity**: Penicillin → Cephalosporins, Sulfa → Thiazides

### LLM Integration

The system prompt encodes:
- Drug interaction knowledge base
- Contraindications by condition
- Allergy cross-reactivity mappings
- Dosing adjustment guidelines (renal, hepatic, elderly)
- Risk scoring criteria

### Output Schema

```typescript
interface AnalysisResult {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number // 0-100
  summaryAssessment: string
  primaryRecommendation: TreatmentRecommendation
  alternativeTreatments: AlternativeTreatment[]
  drugInteractions: DrugInteraction[]
  contraindications: Contraindication[]
  riskFactors: RiskFactor[]
  lifestyleRecommendations: string[]
  followUpRecommendations: string[]
  labTestsRecommended: string[]
}
```

## 🎨 UI/UX Design

The interface is designed for busy clinicians:

- **Critical risks first** - Red alerts at the top
- **Traffic light system** - 🟢 Green / 🟡 Amber / 🔴 Red indicators
- **Collapsible sections** - Focus on what matters
- **One-click actions** - Approve, modify, or reject plans
- **Dark theme** - Reduced eye strain during long shifts

## 📝 Audit Logging

All actions are logged for compliance:
- Patient data submission timestamps
- AI analysis completion with risk level
- Doctor review decisions
- Modifications made to treatment plans
- Approval/rejection with rationale

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 🔒 Security Considerations

- API keys stored in environment variables only
- No patient data persisted (session-only)
- Audit trail for all clinical decisions
- Clear disclaimers on AI-generated content

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a hackathon project. Feel free to fork and extend!

---

Built with ❤️ for healthcare professionals by the Agarthian Tech team


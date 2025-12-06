import { PatientData } from "@/shared/types/patient";
import { AnalysisResult, AnalysisResultSchema } from "@/shared/types/analysis";
import { buildMedicalSystemPrompt, buildPatientContext } from "./medicalPrompt";
import {
  checkDrugInteractionsSync,
  checkContraindicationsSync,
  checkAllergyConflictsSync,
} from "./drugDatabase";

// Google Gemini API endpoint - using gemini-2.0-flash
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// Custom error class for analysis failures
export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NO_API_KEY"
      | "API_ERROR"
      | "PARSE_ERROR"
      | "VALIDATION_ERROR"
      | "NETWORK_ERROR",
    public readonly details?: string
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

export async function analyzePatient(
  patient: PatientData
): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new AnalysisError(
      "No API key configured",
      "NO_API_KEY",
      "Please add VITE_GEMINI_API_KEY to your .env file. Get a free API key from Google AI Studio."
    );
  }

  const systemPrompt = buildMedicalSystemPrompt();
  const userPrompt = buildPatientContext(patient);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n---\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);

      // Parse error for better messaging
      let errorMessage = `API request failed with status ${response.status}`;
      let errorDetails = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
          if (errorJson.error.status === "RESOURCE_EXHAUSTED") {
            errorMessage = "API quota exceeded";
            errorDetails =
              "You have exceeded your Gemini API quota. Please wait or check your API plan.";
          } else if (errorJson.error.status === "INVALID_ARGUMENT") {
            errorMessage = "Invalid API request";
            errorDetails = "The API request was malformed. Please try again.";
          } else if (errorJson.error.status === "NOT_FOUND") {
            errorMessage = "API model not found";
            errorDetails =
              "The specified AI model is not available. Please contact support.";
          }
        }
      } catch {
        // Keep original error text
      }

      throw new AnalysisError(errorMessage, "API_ERROR", errorDetails);
    }

    const data = await response.json();

    // Extract content from Gemini response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No content in Gemini response:", data);

      // Check for safety blocks
      if (data.candidates?.[0]?.finishReason === "SAFETY") {
        throw new AnalysisError(
          "Response blocked by safety filters",
          "API_ERROR",
          "The AI response was blocked due to safety filters. Please modify the patient information and try again."
        );
      }

      throw new AnalysisError(
        "No content in AI response",
        "API_ERROR",
        "The AI did not return a valid response. Please try again."
      );
    }

    // Parse and validate the JSON response
    let parsed: unknown;
    try {
      // Extract JSON from response (in case there's any extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", content);
      throw new AnalysisError(
        "Failed to parse AI response",
        "PARSE_ERROR",
        "The AI returned an invalid response format. Please try again."
      );
    }

    // Validate against schema
    try {
      const validated = AnalysisResultSchema.parse(parsed);

      // Update model version to reflect Gemini
      validated.modelVersion = "gemini-2.0-flash";

      // Enrich with local database checks
      const enrichedResult = enrichAnalysisWithDatabase(validated, patient);

      return enrichedResult;
    } catch (validationError) {
      console.error("Schema validation failed:", validationError);
      throw new AnalysisError(
        "AI response validation failed",
        "VALIDATION_ERROR",
        "The AI response did not match the expected format. Please try again."
      );
    }
  } catch (error) {
    // Re-throw AnalysisError as-is
    if (error instanceof AnalysisError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new AnalysisError(
        "Network error",
        "NETWORK_ERROR",
        "Failed to connect to the AI service. Please check your internet connection."
      );
    }

    // Handle other errors
    console.error("Analysis failed:", error);
    throw new AnalysisError(
      "Analysis failed",
      "API_ERROR",
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again."
    );
  }
}

function enrichAnalysisWithDatabase(
  analysis: AnalysisResult,
  patient: PatientData
): AnalysisResult {
  // Check for any drug interactions in the database that weren't caught
  const currentMedNames = patient.currentMedications.map((m) => m.name);
  const allMeds = [
    ...currentMedNames,
    analysis.primaryRecommendation.medication,
  ];

  const dbInteractions = checkDrugInteractionsSync(allMeds);

  // Add any database interactions not already in analysis
  for (const dbInt of dbInteractions) {
    const exists = analysis.drugInteractions.some(
      (ai) =>
        ai.drug1.toLowerCase().includes(dbInt.drug1.toLowerCase()) ||
        ai.drug2.toLowerCase().includes(dbInt.drug2.toLowerCase())
    );

    if (!exists) {
      analysis.drugInteractions.push({
        drug1: dbInt.drug1,
        drug2: dbInt.drug2,
        severity: dbInt.severity,
        description: dbInt.description,
        recommendation: `Database flagged: ${dbInt.mechanism}`,
      });
    }
  }

  // Check contraindications
  const dbContraindications = checkContraindicationsSync(
    analysis.primaryRecommendation.medication,
    patient.conditions
  );

  for (const dbContra of dbContraindications) {
    const exists = analysis.contraindications.some(
      (ac) =>
        ac.medication.toLowerCase().includes(dbContra.drug.toLowerCase()) &&
        ac.condition.toLowerCase().includes(dbContra.condition.toLowerCase())
    );

    if (!exists) {
      analysis.contraindications.push({
        medication: dbContra.drug,
        condition: dbContra.condition,
        severity: dbContra.severity,
        description: dbContra.description,
        recommendation: `Verified by drug database`,
      });
    }
  }

  // Check allergy conflicts
  const allergyConflicts = checkAllergyConflictsSync(
    patient.allergies,
    analysis.primaryRecommendation.medication
  );

  for (const conflict of allergyConflicts) {
    const exists = analysis.contraindications.some((ac) =>
      ac.condition.toLowerCase().includes("allergy")
    );

    if (!exists && conflict) {
      analysis.contraindications.push({
        medication: analysis.primaryRecommendation.medication,
        condition: `Allergy to ${conflict.allergy}`,
        severity: "absolute",
        description: `Patient has allergy to ${conflict.allergy} which may cross-react with ${analysis.primaryRecommendation.medication}`,
        recommendation: `Consider alternative medication. Cross-reactants: ${conflict.cross_reactants.join(
          ", "
        )}`,
      });

      // Elevate risk level if allergy conflict found
      if (analysis.overallRiskLevel === "low") {
        analysis.overallRiskLevel = "high";
        analysis.riskScore = Math.max(analysis.riskScore, 75);
      }
    }
  }

  // Recalculate risk score based on findings
  const majorInteractions = analysis.drugInteractions.filter(
    (i) => i.severity === "major" || i.severity === "contraindicated"
  ).length;
  const absoluteContraindications = analysis.contraindications.filter(
    (c) => c.severity === "absolute"
  ).length;

  if (
    absoluteContraindications > 0 ||
    analysis.drugInteractions.some((i) => i.severity === "contraindicated")
  ) {
    analysis.overallRiskLevel = "critical";
    analysis.riskScore = Math.max(analysis.riskScore, 90);
  } else if (majorInteractions > 1 || absoluteContraindications > 0) {
    analysis.overallRiskLevel = "high";
    analysis.riskScore = Math.max(analysis.riskScore, 70);
  }

  return analysis;
}

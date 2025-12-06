import { useEffect, useState, useCallback } from "react";
import { PatientData } from "@/shared/types/patient";
import { useAppStore } from "@/shared/store/appStore";
import { analyzePatient, AnalysisError } from "../services/analysisService";
import {
  Loader2,
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  RefreshCw,
  ArrowLeft,
  Key,
  Wifi,
  FileWarning,
} from "lucide-react";

interface AnalysisViewProps {
  patientData: PatientData;
}

interface ErrorState {
  message: string;
  code?: string;
  details?: string;
}

export function AnalysisView({ patientData }: AnalysisViewProps) {
  const {
    setAnalysisResult,
    setIsAnalyzing,
    setAnalysisError,
    setCurrentStep,
    isAnalyzing,
    analysisError,
  } = useAppStore();

  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setErrorState(null);

    try {
      const result = await analyzePatient(patientData);
      setAnalysisResult(result);
      setCurrentStep(2); // Move to dashboard
    } catch (error) {
      if (error instanceof AnalysisError) {
        setErrorState({
          message: error.message,
          code: error.code,
          details: error.details,
        });
        setAnalysisError(error.message);
      } else {
        const message =
          error instanceof Error ? error.message : "Analysis failed";
        setErrorState({
          message,
          details: "An unexpected error occurred. Please try again.",
        });
        setAnalysisError(message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    patientData,
    setAnalysisResult,
    setIsAnalyzing,
    setAnalysisError,
    setCurrentStep,
  ]);

  useEffect(() => {
    runAnalysis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const analysisSteps = [
    { icon: Stethoscope, label: "Processing patient data", delay: "0s" },
    { icon: Shield, label: "Checking drug interactions", delay: "0.5s" },
    {
      icon: AlertTriangle,
      label: "Identifying contraindications",
      delay: "1s",
    },
    { icon: Brain, label: "Generating treatment plan", delay: "1.5s" },
    { icon: CheckCircle, label: "Validating recommendations", delay: "2s" },
  ];

  const getErrorIcon = (code?: string) => {
    switch (code) {
      case "NO_API_KEY":
        return Key;
      case "NETWORK_ERROR":
        return Wifi;
      case "PARSE_ERROR":
      case "VALIDATION_ERROR":
        return FileWarning;
      default:
        return AlertTriangle;
    }
  };

  const getErrorColor = (code?: string) => {
    switch (code) {
      case "NO_API_KEY":
        return "bg-amber-500/20 text-amber-400";
      case "NETWORK_ERROR":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-clinical-danger/20 text-clinical-danger";
    }
  };

  if (analysisError && errorState) {
    const ErrorIcon = getErrorIcon(errorState.code);
    const errorColorClass = getErrorColor(errorState.code);

    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-full ${errorColorClass} flex items-center justify-center mx-auto mb-4`}
          >
            <ErrorIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
          <p className="text-lg text-gray-300 mb-2">{errorState.message}</p>
          {errorState.details && (
            <p className="text-sm text-clinical-muted mb-6 max-w-md mx-auto">
              {errorState.details}
            </p>
          )}

          {/* Error code badge */}
          {errorState.code && (
            <div className="inline-block px-3 py-1 rounded-full bg-clinical-secondary text-xs text-clinical-muted mb-6">
              Error Code: {errorState.code}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setAnalysisError(null);
              setErrorState(null);
              setCurrentStep(0);
            }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Intake
          </button>
          <button
            onClick={runAnalysis}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>

        {/* Helpful tips based on error type */}
        {errorState.code === "NO_API_KEY" && (
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">
              How to fix this:
            </h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-clinical-accent underline"
                >
                  Google AI Studio
                </a>{" "}
                and create an API key
              </li>
              <li>
                Create a{" "}
                <code className="px-1.5 py-0.5 bg-clinical-secondary rounded text-xs">
                  .env
                </code>{" "}
                file in the project root
              </li>
              <li>
                Add:{" "}
                <code className="px-1.5 py-0.5 bg-clinical-secondary rounded text-xs">
                  VITE_GEMINI_API_KEY=your_api_key_here
                </code>
              </li>
              <li>Restart the development server</li>
            </ol>
          </div>
        )}

        {errorState.code === "API_ERROR" &&
          errorState.message.includes("quota") && (
            <div className="mt-8 p-4 rounded-xl bg-clinical-danger/10 border border-clinical-danger/30">
              <h3 className="text-sm font-semibold text-red-400 mb-2">
                Quota Exceeded
              </h3>
              <p className="text-sm text-gray-300">
                Your Gemini API quota has been exhausted. Please wait a few
                minutes before trying again, or upgrade your API plan at{" "}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-clinical-accent underline"
                >
                  Google AI Studio
                </a>
                .
              </p>
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-clinical-accent to-purple-600 
                        flex items-center justify-center mx-auto mb-4 animate-pulse-slow"
        >
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Analyzing Patient Data
        </h2>
        <p className="text-clinical-muted">
          AI is reviewing medical history, medications, and generating a
          personalized treatment plan
        </p>
      </div>

      {/* Patient summary */}
      <div className="p-4 rounded-xl bg-clinical-secondary/50 border border-white/10 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-clinical-accent/20 flex items-center justify-center">
            <span className="text-xl font-bold text-clinical-accent">
              {patientData.firstName[0]}
              {patientData.lastName[0]}
            </span>
          </div>
          <div>
            <div className="font-semibold text-white">
              {patientData.firstName} {patientData.lastName}
            </div>
            <div className="text-sm text-clinical-muted">
              {patientData.healthMetrics.age}yo {patientData.sex} •{" "}
              {patientData.primaryComplaint}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {patientData.currentMedications.length}
            </div>
            <div className="text-xs text-clinical-muted">Medications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {patientData.conditions.length}
            </div>
            <div className="text-xs text-clinical-muted">Conditions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {patientData.allergies.length}
            </div>
            <div className="text-xs text-clinical-muted">Allergies</div>
          </div>
        </div>
      </div>

      {/* Analysis steps */}
      <div className="space-y-3">
        {analysisSteps.map((step, index) => (
          <div
            key={step.label}
            className="flex items-center gap-4 p-3 rounded-lg bg-clinical-secondary/30 animate-fade-in"
            style={{ animationDelay: step.delay }}
          >
            <div className="w-10 h-10 rounded-lg bg-clinical-accent/10 flex items-center justify-center">
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 text-clinical-accent animate-spin" />
              ) : (
                <step.icon className="w-5 h-5 text-clinical-accent" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-gray-300">{step.label}</span>
            </div>
            <div
              className="w-2 h-2 rounded-full bg-clinical-accent animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="h-2 bg-clinical-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-clinical-accent to-purple-600 rounded-full 
                       animate-pulse transition-all duration-1000"
            style={{ width: isAnalyzing ? "90%" : "100%" }}
          />
        </div>
        <p className="text-center text-sm text-clinical-muted mt-3">
          {isAnalyzing
            ? "This may take a few moments..."
            : "Analysis complete!"}
        </p>
      </div>
    </div>
  );
}

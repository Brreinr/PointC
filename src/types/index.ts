export interface ProcessSentence {
  text: string;
  isEnd: boolean;
}

export interface ProcessBlock {
  id: string;
  name: string;
  rawText: string;
  sentences: string[];
}

export interface AstSummaryItem {
  processName: string;
  sentences: string[];
}

export interface OptimizationItem {
  title: string;
  category: string;
  impact: string;
  description: string;
  cDiff?: string;
  cppDiff?: string;
}

export interface MemoryAudit {
  stackUsageEstimate: string;
  heapAllocations: string[];
  leaksOrRisks: string[];
}

export interface UsageStats {
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
  tokensPerCredit: number; // 2000 tokens = 1 credit
  creditsDeducted: number;
}

export interface TranslationResponse {
  cCode: string;
  cppCode: string;
  explanation: string;
  astSummary?: AstSummaryItem[];
  optimizations?: OptimizationItem[];
  memoryAudit?: MemoryAudit;
  compilerFlagsRecommended?: string[];
  usage?: UsageStats;
}

export interface OptimizationResponse {
  optimizedPointC: string;
  optimizedCCode: string;
  optimizedCppCode: string;
  optimizationsApplied: Array<{
    category: string;
    technique: string;
    explanation: string;
    speedupEstimate: string;
  }>;
  assemblyInsights?: string;
  recommendedGccCommand?: string;
  usage?: UsageStats;
}

export interface StackVariable {
  name: string;
  type: string;
  value: string;
  address: string;
}

export interface StackFrame {
  functionName: string;
  variables: StackVariable[];
}

export interface HeapAllocation {
  address: string;
  sizeBytes: number;
  type: string;
  status: 'allocated' | 'freed';
  preview: string;
}

export interface PointerInfo {
  name: string;
  pointsToAddress: string;
  dereferencedValue: string;
}

export interface MemoryMap {
  stackFrames: StackFrame[];
  heapAllocations: HeapAllocation[];
  pointers: PointerInfo[];
}

export interface ExecutionStep {
  step: number;
  line: number;
  description: string;
  stdoutSnippet: string;
}

export interface FutureErrorItem {
  id: string;
  type: 'syntax' | 'memory_leak' | 'null_dereference' | 'buffer_overflow' | 'type_mismatch' | 'logic_risk';
  severity: 'critico' | 'advertencia' | 'preventivo';
  title: string;
  location?: string;
  description: string;
  preventiveAdvice: string;
  suggestedFix?: string;
}

export interface VerificationReport {
  isValid: boolean;
  errorsCount: number;
  warningsCount: number;
  futureRisksCount: number;
  diagnostics: FutureErrorItem[];
  compilerOutput: string;
  safetyScore: number; // 0 to 100
  rectifiedPointC?: string;
  rectifiedCCode?: string;
  rectifiedCppCode?: string;
  appliedStandard?: string;
  appliedOptimization?: string;
  memorySafetyAnalysis: {
    stackSafety: string;
    heapSafety: string;
    pointerSafety: string;
  };
  usage?: UsageStats;
}

export interface SimulationResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryMap?: MemoryMap;
  stepByStepExecution?: ExecutionStep[];
  usage?: UsageStats;
}

export interface ExamplePreset {
  id: string;
  title: string;
  category: string;
  description: string;
  pointcCode: string;
  tags: string[];
}

export interface ProjectFile {
  id: string;
  name: string; // e.g. "algoritmo.pointc"
  content: string;
  cCode?: string;
  cppCode?: string;
  updatedAt: number;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  totalTokensSpent?: number;
  language?: 'es' | 'en';
  plan: 'Gratuito' | 'Pro' | 'Enterprise';
  createdAt: number;
}

export interface Transaction {
  id: string;
  date: string;
  planName: string;
  creditsAdded: number;
  amountUsd: number;
  status: 'Completado' | 'Procesando';
}

export interface BuildConfig {
  cStandard: 'C99' | 'C11' | 'C17' | 'C23';
  cppStandard: 'C++14' | 'C++17' | 'C++20' | 'C++23';
  optimizationLevel: 'O0' | 'O1' | 'O2' | 'O3' | 'Os' | 'Ofast';
  enableWarnings: boolean;
  enableSanitizer: boolean;
  enableLTO: boolean;
  enableFastMath: boolean;
  targetArchitecture?: string;
}


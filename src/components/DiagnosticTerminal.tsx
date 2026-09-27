import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Zap,
  HardDrive,
  Layers,
  Link,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
  Bug,
  Flame,
  FileCheck2,
  Check
} from 'lucide-react';
import { VerificationReport, FutureErrorItem, SimulationResponse } from '../types';
import { Copy } from 'lucide-react';

interface DiagnosticTerminalProps {
  diagnosticData: VerificationReport | null;
  simulationData: SimulationResponse | null;
  onRunDiagnostic: () => void;
  onRunSimulation: (stdin: string) => void;
  onApplyRectifiedCode: (rectifiedCode: string) => void;
  onApplyRectifiedCCode?: (rectifiedCCode: string) => void;
  onApplyRectifiedCppCode?: (rectifiedCppCode: string) => void;
  isDiagnosing: boolean;
  isSimulating: boolean;
  activeLanguage: 'c' | 'cpp';
  hasCode: boolean;
}

export const DiagnosticTerminal: React.FC<DiagnosticTerminalProps> = ({
  diagnosticData,
  simulationData,
  onRunDiagnostic,
  onRunSimulation,
  onApplyRectifiedCode,
  onApplyRectifiedCCode,
  onApplyRectifiedCppCode,
  isDiagnosing,
  isSimulating,
  activeLanguage,
  hasCode,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'console' | 'memory' | 'rectified'>('diagnostics');
  const [rectifiedViewLang, setRectifiedViewLang] = useState<'pointc' | 'c' | 'cpp'>('pointc');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [stdinInput, setStdinInput] = useState('');
  const [rectifiedApplied, setRectifiedApplied] = useState(false);

  const handleApplyPointCFix = () => {
    if (diagnosticData?.rectifiedPointC) {
      onApplyRectifiedCode(diagnosticData.rectifiedPointC);
      setRectifiedApplied(true);
      setTimeout(() => setRectifiedApplied(false), 3000);
    }
  };

  const handleApplyCFix = () => {
    if (diagnosticData?.rectifiedCCode && onApplyRectifiedCCode) {
      onApplyRectifiedCCode(diagnosticData.rectifiedCCode);
      setRectifiedApplied(true);
      setTimeout(() => setRectifiedApplied(false), 3000);
    }
  };

  const handleApplyCppFix = () => {
    if (diagnosticData?.rectifiedCppCode && onApplyRectifiedCppCode) {
      onApplyRectifiedCppCode(diagnosticData.rectifiedCppCode);
      setRectifiedApplied(true);
      setTimeout(() => setRectifiedApplied(false), 3000);
    }
  };

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteConsole = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onRunSimulation(stdinInput);
  };

  const errorsCount = diagnosticData?.errorsCount ?? 0;
  const warningsCount = diagnosticData?.warningsCount ?? 0;
  const futureRisksCount = diagnosticData?.futureRisksCount ?? 0;
  const totalIssues = errorsCount + warningsCount + futureRisksCount;
  const safetyScore = diagnosticData?.safetyScore ?? 100;

  const memoryMap = simulationData?.memoryMap;

  return (
    <div className="flex flex-col h-full bg-[#0b101c] font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navigation Tabs */}
      <div className="bg-[#080c16] px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* Diagnostic & Rectification Tab */}
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'diagnostics'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagnóstico y Rectificación de Errores</span>
            {totalIssues > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {totalIssues}
              </span>
            ) : diagnosticData ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                ✓
              </span>
            ) : null}
          </button>

          {/* Rectified Code Tab */}
          {diagnosticData && (diagnosticData.rectifiedPointC || diagnosticData.rectifiedCCode || diagnosticData.rectifiedCppCode) && (
            <button
              onClick={() => setActiveTab('rectified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'rectified'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Código Rectificado (C / C++ / pointC)</span>
            </button>
          )}

          {/* Verification / Compiler Output Tab */}
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'console'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Salida de Compilador & Linter</span>
          </button>

          {/* Memory Inspector Tab */}
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'memory'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>Auditoría de Memoria (Stack/Heap)</span>
          </button>
        </div>

        {/* Action button in bar */}
        <div className="flex items-center gap-2">
          {activeTab === 'diagnostics' ? (
            <button
              onClick={onRunDiagnostic}
              disabled={isDiagnosing || !hasCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm shadow-cyan-500/20 disabled:opacity-50"
              title="Analizar código y prevenir errores futuros"
            >
              <Wrench className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Analizando...' : 'Analizar & Rectificar'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleExecuteConsole()}
              disabled={isSimulating || !hasCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : 'fill-white'}`} />
              <span>{isSimulating ? 'Verificando...' : 'Re-verificar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-5">
        {/* TAB 1: DIAGNOSTICS & RECTIFICATION */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-5 max-w-5xl mx-auto">
            {/* Summary Banner Card */}
            {diagnosticData ? (
              <div className="bg-[#090d18] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  {/* Safety Score Radial-like badge */}
                  <div
                    className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${
                      safetyScore >= 90
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : safetyScore >= 70
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <span className="text-lg font-black font-mono leading-none">{safetyScore}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight opacity-80 mt-0.5">Seguridad</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Auditoría Estática y Prevención de Riesgos</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {activeLanguage.toUpperCase()} Standard
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {totalIssues === 0
                        ? '¡Código óptimo y blindado! No se detectaron riesgos futuros de memoria ni violaciones sintácticas.'
                        : `Se detectaron ${totalIssues} observaciones preventivas para evitar fallos en compilación o ejecución.`}
                    </p>
                  </div>
                </div>

                {/* Multi-Language Rectify Action Buttons */}
                {diagnosticData && (diagnosticData.rectifiedPointC || diagnosticData.rectifiedCCode || diagnosticData.rectifiedCppCode) && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Rectify pointC */}
                    {diagnosticData.rectifiedPointC && (
                      <button
                        onClick={handleApplyPointCFix}
                        className="px-3.5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-[0.98] transition flex items-center gap-1.5"
                        title="Rectificar sintaxis y memoria en pointC"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Rectificar pointC</span>
                      </button>
                    )}

                    {/* Rectify C */}
                    {diagnosticData.rectifiedCCode && onApplyRectifiedCCode && (
                      <button
                        onClick={handleApplyCFix}
                        className="px-3 py-2 rounded-xl font-bold text-xs bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-200 transition flex items-center gap-1.5"
                        title="Rectificar y aplicar código C blindado"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Rectificar C</span>
                      </button>
                    )}

                    {/* Rectify C++ */}
                    {diagnosticData.rectifiedCppCode && onApplyRectifiedCppCode && (
                      <button
                        onClick={handleApplyCppFix}
                        className="px-3 py-2 rounded-xl font-bold text-xs bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 transition flex items-center gap-1.5"
                        title="Rectificar y aplicar código C++ moderno"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Rectificar C++</span>
                      </button>
                    )}

                    {/* View all button */}
                    <button
                      onClick={() => setActiveTab('rectified')}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
                      title="Ver comparativa de código rectificado"
                    >
                      <span>Ver Código</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#090d18] border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <div className="p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 w-fit mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-sm font-bold text-white">Terminal de Rectificación de Errores Futuros</h4>
                  <p className="text-xs text-slate-400">
                    Analiza y anticipa fallos como segmentation faults, fugas de memoria, punteros nulos o sintaxis incompleta antes de compilar.
                  </p>
                </div>
                <button
                  onClick={onRunDiagnostic}
                  disabled={isDiagnosing || !hasCode}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition inline-flex items-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{isDiagnosing ? 'Analizando...' : 'Iniciar Análisis de Errores'}</span>
                </button>
              </div>
            )}

            {/* Diagnostics Cards Grid */}
            {diagnosticData && diagnosticData.diagnostics && diagnosticData.diagnostics.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Riesgos Detectados y Puntos a Rectificar ({diagnosticData.diagnostics.length})</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {diagnosticData.diagnostics.map((item, idx) => {
                    const isCrit = item.severity === 'critico';
                    const isWarn = item.severity === 'advertencia';

                    return (
                      <div
                        key={item.id || idx}
                        className={`border rounded-xl p-4 space-y-3 transition ${
                          isCrit
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : isWarn
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-blue-950/20 border-blue-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {isCrit ? (
                              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            ) : isWarn ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-white text-xs sm:text-sm">{item.title}</h5>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                                    isCrit
                                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                      : isWarn
                                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                      : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                                  }`}
                                >
                                  {item.severity}
                                </span>
                                {item.location && (
                                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                                    📍 {item.location}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Preventive Advice & Fix */}
                        <div className="bg-[#070a12] p-3 rounded-lg border border-slate-800/90 space-y-2 text-xs">
                          <div className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">🛡️ Prevención futura:</span>
                            <span>{item.preventiveAdvice}</span>
                          </div>

                          {item.suggestedFix && (
                            <div className="pt-1.5 border-t border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                                Corrección recomendada:
                              </span>
                              <pre className="text-[11px] font-mono p-2 rounded bg-[#04060c] text-emerald-300 overflow-x-auto border border-slate-800">
                                {item.suggestedFix}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Memory Safety Quick Overview */}
            {diagnosticData?.memorySafetyAnalysis && (
              <div className="bg-[#090d18] border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Evaluación de Seguridad de Memoria</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-blue-300 block">Stack & Variables</span>
                    <p className="text-slate-400 text-[11px]">{diagnosticData.memorySafetyAnalysis.stackSafety}</p>
                  </div>
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-300 block">Heap & Asignaciones</span>
                    <p className="text-slate-400 text-[11px]">{diagnosticData.memorySafetyAnalysis.heapSafety}</p>
                  </div>
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-300 block">Punteros & NULOS</span>
                    <p className="text-slate-400 text-[11px]">{diagnosticData.memorySafetyAnalysis.pointerSafety}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPILER & LINTER OUTPUT */}
        {activeTab === 'console' && (
          <div className="flex flex-col h-full space-y-3 max-w-5xl mx-auto">
            <div className="bg-[#050811] border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 overflow-auto shadow-inner flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-slate-400 text-[11px] select-none flex items-center justify-between pb-2 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">$ gcc -Wall -Wextra -Werror -fsanitize=address</span>
                    <span>(Validador y Linter Estático)</span>
                  </div>
                  {diagnosticData && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Score: {safetyScore}%
                    </span>
                  )}
                </div>

                {diagnosticData?.compilerOutput ? (
                  <pre className="text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {diagnosticData.compilerOutput}
                  </pre>
                ) : simulationData?.stdout ? (
                  <pre className="text-emerald-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {simulationData.stdout}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic">
                    Presiona "Analizar & Rectificar" o "Re-verificar" para emitir el reporte del compilador.
                  </p>
                )}

                {simulationData?.stderr && (
                  <pre className="text-rose-400 font-mono text-xs whitespace-pre-wrap leading-relaxed mt-2 p-2 rounded bg-rose-950/30 border border-rose-500/30">
                    {simulationData.stderr}
                  </pre>
                )}
              </div>
            </div>

            {/* Stdin input */}
            <form onSubmit={handleExecuteConsole} className="flex gap-2">
              <input
                type="text"
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                placeholder="Entrada estándar de prueba (stdin)..."
                className="flex-1 bg-[#050811] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isSimulating}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Enviar</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MEMORY AUDIT */}
        {activeTab === 'memory' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stack frames */}
              <div className="bg-[#090d18] border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Marcos de Pila (Stack Frames)
                </span>
                {memoryMap?.stackFrames && memoryMap.stackFrames.length > 0 ? (
                  <div className="space-y-2">
                    {memoryMap.stackFrames.map((frame, idx) => (
                      <div key={idx} className="bg-[#060912] p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                        <span className="text-cyan-300 font-bold">{frame.functionName}()</span>
                        <div className="space-y-1">
                          {frame.variables.map((v, vIdx) => (
                            <div key={vIdx} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded">
                              <span className="text-blue-300 font-semibold">{v.type} {v.name}</span>
                              <span className="text-emerald-400">{v.value}</span>
                              <span className="text-slate-500 text-[10px]">{v.address}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    Variables locales asignadas limpiamente en el marco de ejecución.
                  </p>
                )}
              </div>

              {/* Heap & Pointer tracking */}
              <div className="bg-[#090d18] border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  Montículo (Heap & Punteros)
                </span>
                {memoryMap?.heapAllocations && memoryMap.heapAllocations.length > 0 ? (
                  <div className="space-y-2">
                    {memoryMap.heapAllocations.map((alloc, idx) => (
                      <div key={idx} className="bg-[#060912] p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-bold">{alloc.type} ({alloc.sizeBytes} bytes)</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${alloc.status === 'freed' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                            {alloc.status}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px] block">{alloc.address}</span>
                        <div className="text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded">
                          {alloc.preview}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    Sin fugas de memoria detectadas. Las reservas dinámicas se liberan de forma segura.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-LANGUAGE RECTIFIED CODE VIEWER */}
        {activeTab === 'rectified' && diagnosticData && (
          <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-full">
            {/* Language Selector Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090d18] border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-1.5 bg-[#060812] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setRectifiedViewLang('pointc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    rectifiedViewLang === 'pointc'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>pointC</span>
                  <span className="text-[10px] opacity-75 font-normal">Blindado</span>
                </button>
                <button
                  onClick={() => setRectifiedViewLang('c')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    rectifiedViewLang === 'c'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>C Estándar</span>
                  <span className="text-[10px] opacity-75 font-normal">Rectificado</span>
                </button>
                <button
                  onClick={() => setRectifiedViewLang('cpp')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    rectifiedViewLang === 'cpp'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>C++ Moderno</span>
                  <span className="text-[10px] opacity-75 font-normal">Rectificado</span>
                </button>
              </div>

              {/* Action for selected language */}
              <div className="flex items-center gap-2">
                {rectifiedViewLang === 'pointc' && diagnosticData.rectifiedPointC && (
                  <>
                    <button
                      onClick={() => handleCopyCode(diagnosticData.rectifiedPointC!, 'pointc')}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 font-medium"
                    >
                      {copiedKey === 'pointc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'pointc' ? 'Copiado' : 'Copiar pointC'}</span>
                    </button>
                    <button
                      onClick={handleApplyPointCFix}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Aplicar a Editor pointC</span>
                    </button>
                  </>
                )}

                {rectifiedViewLang === 'c' && diagnosticData.rectifiedCCode && (
                  <>
                    <button
                      onClick={() => handleCopyCode(diagnosticData.rectifiedCCode!, 'c')}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 font-medium"
                    >
                      {copiedKey === 'c' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'c' ? 'Copiado' : 'Copiar C'}</span>
                    </button>
                    {onApplyRectifiedCCode && (
                      <button
                        onClick={handleApplyCFix}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Aplicar a Salida C</span>
                      </button>
                    )}
                  </>
                )}

                {rectifiedViewLang === 'cpp' && diagnosticData.rectifiedCppCode && (
                  <>
                    <button
                      onClick={() => handleCopyCode(diagnosticData.rectifiedCppCode!, 'cpp')}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 font-medium"
                    >
                      {copiedKey === 'cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'cpp' ? 'Copiado' : 'Copiar C++'}</span>
                    </button>
                    {onApplyRectifiedCppCode && (
                      <button
                        onClick={handleApplyCppFix}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Aplicar a Salida C++</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Code Display Area */}
            <div className="flex-1 bg-[#050811] border border-slate-800 rounded-2xl p-4 overflow-auto font-mono text-xs text-slate-100 shadow-inner min-h-[300px]">
              {rectifiedViewLang === 'pointc' && (
                <pre className="text-cyan-200 whitespace-pre-wrap leading-relaxed selection:bg-cyan-500/30">
                  {diagnosticData.rectifiedPointC || '// Sin versión pointC rectificada generada.'}
                </pre>
              )}

              {rectifiedViewLang === 'c' && (
                <pre className="text-blue-200 whitespace-pre-wrap leading-relaxed selection:bg-blue-500/30">
                  {diagnosticData.rectifiedCCode || '// Sin versión C rectificada generada.'}
                </pre>
              )}

              {rectifiedViewLang === 'cpp' && (
                <pre className="text-purple-200 whitespace-pre-wrap leading-relaxed selection:bg-purple-500/30">
                  {diagnosticData.rectifiedCppCode || '// Sin versión C++ rectificada generada.'}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

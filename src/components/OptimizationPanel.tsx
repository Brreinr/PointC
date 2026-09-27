import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Cpu,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Terminal,
  TrendingUp,
  AlertOctagon,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';
import { OptimizationResponse, TranslationResponse } from '../types';

interface OptimizationPanelProps {
  translationData: TranslationResponse | null;
  optimizationData: OptimizationResponse | null;
  onApplyOptimization: (newPointC: string, newC: string, newCpp: string) => void;
  isOptimizing: boolean;
  onTriggerOptimize: (goal: string) => void;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  translationData,
  optimizationData,
  onApplyOptimization,
  isOptimizing,
  onTriggerOptimize,
}) => {
  const [selectedGoal, setSelectedGoal] = useState('rendimiento_maximo');

  const optimizations = translationData?.optimizations || [];
  const memoryAudit = translationData?.memoryAudit;
  const compilerFlags = translationData?.compilerFlagsRecommended || ['-O3', '-march=native', '-flto', '-Wall'];

  return (
    <div className="flex flex-col h-full bg-[#0d121f] overflow-y-auto p-4 space-y-4">
      {/* Optimization Actions Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900 border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Motor de Optimización pointC & C/C++</h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Analiza complejidad algorítmica, fugas de memoria en Heap, vectorización SIMD y flags de compilador.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-400"
          >
            <option value="rendimiento_maximo">🚀 Máximo Rendimiento (-O3, SIMD)</option>
            <option value="minima_memoria">💾 Mínimo Consumo de Memoria</option>
            <option value="seguridad_estricta">🛡️ Seguridad Estricta (Anti-Leaks)</option>
            <option value="paralelismo_hilos">⚡ Paralelismo y Concurrencia</option>
          </select>

          <button
            onClick={() => onTriggerOptimize(selectedGoal)}
            disabled={isOptimizing}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition shadow-md shrink-0 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Zap className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizando...' : 'Optimizar Ahora'}</span>
          </button>
        </div>
      </div>

      {/* Applied Deep Optimizations (if generated) */}
      {optimizationData && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Optimizaciones Avanzadas Generadas</span>
            </div>
            <button
              onClick={() =>
                onApplyOptimization(
                  optimizationData.optimizedPointC,
                  optimizationData.optimizedCCode,
                  optimizationData.optimizedCppCode
                )
              }
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Aplicar al Código</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {optimizationData.optimizationsApplied?.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">{item.technique}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
                    {item.speedupEstimate}
                  </span>
                </div>
                <div className="text-[11px] text-purple-300 font-semibold">{item.category}</div>
                <p className="text-xs text-slate-300">{item.explanation}</p>
              </div>
            ))}
          </div>

          {optimizationData.assemblyInsights && (
            <div className="bg-[#0a0e1a] border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Análisis a Nivel de Ensamblador (GCC/Clang & Instrucciones CPU)</span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {optimizationData.assemblyInsights}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Memory & Safety Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Memory Safety Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Auditoría de Memoria & Punteros</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Estimación de Marco Stack:</span>
              <span className="font-mono font-bold text-cyan-300">
                {memoryAudit?.stackUsageEstimate || 'Calculando...'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">Asignaciones en Heap:</span>
              {memoryAudit?.heapAllocations?.length ? (
                <ul className="list-disc list-inside text-emerald-300 font-mono text-[11px] space-y-0.5">
                  {memoryAudit.heapAllocations.map((alloc, i) => (
                    <li key={i}>{alloc}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-[11px] italic">Sin reservas dinámicas manuales</span>
              )}
            </div>

            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">Diagnóstico de Fugas (Leak Check):</span>
              <div className="text-xs text-slate-200">
                {memoryAudit?.leaksOrRisks?.join(' ') || 'Memoria gestionada correctamente sin punteros colgantes.'}
              </div>
            </div>
          </div>
        </div>

        {/* Compiler Flags & Performance Tips */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Flags de Compilación Recomendados (GCC / Clang)</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 space-y-2">
            <div className="text-[11px] text-slate-400">Comando de optimización máxima:</div>
            <code className="text-emerald-300 block bg-black/40 p-2 rounded border border-slate-800 overflow-x-auto">
              gcc -O3 -march=native -flto -Wall -Wextra -Wconversion main.c -o main
            </code>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {compilerFlags.map((flag, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-300 text-[11px]">
                  {flag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Localidad de Caché & SIMD</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Para C++, se recomienda usar <code className="text-purple-300">std::span</code> y <code className="text-purple-300">std::vector::reserve()</code> para prevenir realocaciones consecutivas de Heap.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Optimization Items List */}
      {optimizations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            Sugerencias de Optimización Semántica
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {optimizations.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {item.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      item.impact === 'Crítico' || item.impact === 'Alto'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    Impacto: {item.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{item.description}</p>
                {(item.cDiff || item.cppDiff) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    {item.cDiff && (
                      <div className="p-2 rounded bg-slate-950 border border-blue-900/40 text-blue-300">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Optimización C:</span>
                        <code>{item.cDiff}</code>
                      </div>
                    )}
                    {item.cppDiff && (
                      <div className="p-2 rounded bg-slate-950 border border-purple-900/40 text-purple-300">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Optimización C++:</span>
                        <code>{item.cppDiff}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

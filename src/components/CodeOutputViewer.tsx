import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { TranslationResponse } from '../types';

interface CodeOutputViewerProps {
  language: 'c' | 'cpp';
  code: string;
  translationData: TranslationResponse | null;
  onSimulate: () => void;
  isSimulating: boolean;
}

export const CodeOutputViewer: React.FC<CodeOutputViewerProps> = ({
  language,
  code,
  translationData,
  onSimulate,
  isSimulating,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = language === 'c' ? 'main.c' : 'main.cpp';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = code ? code.split('\n') : ['// Esperando traducción pointC...'];

  const langConfig = language === 'c' ? {
    title: 'Código C (ISO C17 / C23)',
    badge: 'C99 / C11 / C17',
    badgeColor: 'bg-blue-950/80 border-blue-500/40 text-blue-300',
    headerIcon: 'C',
    compiler: 'gcc -Wall -Wextra -O2 main.c -o main',
  } : {
    title: 'Código C++ Moderno (C++20 / C++23)',
    badge: 'C++17 / C++20 STL & RAII',
    badgeColor: 'bg-purple-950/80 border-purple-500/40 text-purple-300',
    headerIcon: 'C++',
    compiler: 'g++ -std=c++20 -O2 main.cpp -o main',
  };

  return (
    <div className="flex flex-col h-full bg-[#0d121f] relative">
      {/* Top Header */}
      <div className="bg-[#090d16] px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded font-bold font-mono text-xs bg-slate-900 border border-slate-700 text-white">
            <FileCode className={`w-3.5 h-3.5 ${language === 'c' ? 'text-blue-400' : 'text-purple-400'}`} />
            <span>{langConfig.title}</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${langConfig.badgeColor}`}>
            {langConfig.badge}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition border ${
              showExplanation
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Explicación de la traducción semántica"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Explicación</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!code}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-40"
            title={`Descargar ${language === 'c' ? 'main.c' : 'main.cpp'}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-40"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation Banner (Collapsible) */}
      {showExplanation && translationData?.explanation && (
        <div className="bg-[#121829] border-b border-cyan-900/40 p-3 text-xs text-slate-300 flex flex-col gap-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-cyan-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Mapeo Semántico pointC ➔ {language.toUpperCase()}
            </span>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed text-slate-300">{translationData.explanation}</p>
          {translationData.memoryAudit && (
            <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                Stack: {translationData.memoryAudit.stackUsageEstimate}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300">
                Heap: {translationData.memoryAudit.heapAllocations?.length || 0} asignaciones
              </span>
            </div>
          )}
        </div>
      )}

      {/* Code Editor View */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs md:text-sm leading-6">
        {/* Line Numbers */}
        <div className="w-11 bg-[#090d17] border-r border-slate-800/70 text-slate-400 select-none py-3 px-1 text-right text-xs font-mono shrink-0 overflow-y-auto opacity-60">
          {lines.map((_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Output Text */}
        <div className="flex-1 p-3 overflow-auto bg-[#0b101d] text-slate-200">
          <pre className="font-mono text-xs md:text-[13px] leading-6 whitespace-pre font-medium">
            <code>
              {lines.map((line, idx) => {
                // Highlighting heuristics for standard C/C++ tokens
                const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
                const isInclude = line.trim().startsWith('#include') || line.trim().startsWith('#define');
                
                if (isComment) {
                  return (
                    <span key={idx} className="text-slate-500 italic block">
                      {line}
                    </span>
                  );
                }
                if (isInclude) {
                  return (
                    <span key={idx} className="text-purple-400 font-semibold block">
                      {line}
                    </span>
                  );
                }
                return (
                  <span key={idx} className="block text-slate-200">
                    {line}
                  </span>
                );
              })}
            </code>
          </pre>
        </div>
      </div>

      {/* Bottom Command Helper */}
      <div className="bg-[#090d16] px-3 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 overflow-hidden">
          <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="text-slate-500">Compilación recomendada:</span>
          <code className="text-cyan-300 font-bold truncate">{langConfig.compiler}</code>
        </div>
        <button
          onClick={onSimulate}
          disabled={!code || isSimulating}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
        >
          <span>Ejecutar</span>
          ➔
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Layers, ArrowRightLeft, Sparkles, Shield, Cpu } from 'lucide-react';

interface DiffViewerProps {
  cCode: string;
  cppCode: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ cCode, cppCode }) => {
  const cLines = cCode ? cCode.split('\n') : ['// Esperando traducción C...'];
  const cppLines = cppCode ? cppCode.split('\n') : ['// Esperando traducción C++...'];

  return (
    <div className="flex flex-col h-full bg-[#0d121f]">
      {/* Top Banner */}
      <div className="bg-[#090d16] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-semibold">
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Comparador Semántico: C (Bajo Nivel) vs C++ (Moderno RAII)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Compara la gestión manual de memoria en C frente a abstracciones de coste cero en C++
        </div>
      </div>

      {/* Side-by-side Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* C Column */}
        <div className="flex flex-col h-full overflow-hidden bg-[#0b101d]">
          <div className="bg-[#0e1424] px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              C Estándar (C17 / C99)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">malloc / free / punteros crudos</span>
          </div>
          <div className="flex-1 p-3 overflow-auto font-mono text-xs leading-6 text-slate-200">
            <pre className="whitespace-pre">
              <code>
                {cLines.map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                    <span className="text-slate-300">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* C++ Column */}
        <div className="flex flex-col h-full overflow-hidden bg-[#0c0f1c]">
          <div className="bg-[#0e1424] px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              C++ Moderno (C++20 / C++23)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">std::vector / RAII / smart ptrs</span>
          </div>
          <div className="flex-1 p-3 overflow-auto font-mono text-xs leading-6 text-slate-200">
            <pre className="whitespace-pre">
              <code>
                {cppLines.map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                    <span className="text-purple-100">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Difference Highlights Bar */}
      <div className="bg-[#090d16] p-2.5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="px-2.5 py-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="text-[11px]">
            <strong className="text-slate-200 block">Gestión de Memoria:</strong>
            <span className="text-slate-400">C requiere free() explícito; C++ aplica RAII automático.</span>
          </div>
        </div>
        <div className="px-2.5 py-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <div className="text-[11px]">
            <strong className="text-slate-200 block">Seguridad de Tipos:</strong>
            <span className="text-slate-400">C++ proporciona templates y std::span con comprobación de límites.</span>
          </div>
        </div>
        <div className="px-2.5 py-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="text-[11px]">
            <strong className="text-slate-200 block">E/S & Formato:</strong>
            <span className="text-slate-400">printf vs std::cout / std::format de tipo seguro.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

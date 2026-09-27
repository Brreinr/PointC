import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Layers,
  Cpu,
  Database,
  Link,
  CheckCircle2,
  Clock,
  HardDrive,
  Send
} from 'lucide-react';
import { SimulationResponse } from '../types';

interface MemoryInspectorProps {
  simulationData: SimulationResponse | null;
  onRunSimulation: (stdin: string) => void;
  isSimulating: boolean;
  activeLanguage: 'c' | 'cpp';
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  simulationData,
  onRunSimulation,
  isSimulating,
  activeLanguage,
}) => {
  const [stdinInput, setStdinInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'console' | 'stack' | 'heap' | 'pointers' | 'steps'>('console');

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onRunSimulation(stdinInput);
  };

  const memoryMap = simulationData?.memoryMap;

  return (
    <div className="flex flex-col h-full bg-[#0b101c]">
      {/* Top Bar with Sub-tabs and Run Button */}
      <div className="bg-[#080c16] px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activeSubTab === 'console'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terminal E/S</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stack')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activeSubTab === 'stack'
                ? 'bg-slate-800 text-blue-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Pila (Stack Frames)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('heap')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activeSubTab === 'heap'
                ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Montículo (Heap & Malloc)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pointers')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activeSubTab === 'pointers'
                ? 'bg-slate-800 text-purple-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-purple-400" />
            <span>Red de Punteros (*ptr)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {simulationData && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 hidden sm:flex">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {simulationData.executionTimeMs} ms
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Exit code: {simulationData.exitCode}
              </span>
            </div>
          )}

          <button
            onClick={() => handleExecute()}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${isSimulating ? 'animate-pulse' : 'fill-white'}`} />
            <span>{isSimulating ? 'Ejecutando...' : 'Re-ejecutar'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {/* CONSOLE VIEW */}
        {activeSubTab === 'console' && (
          <div className="flex flex-col h-full space-y-3">
            {/* Terminal Screen */}
            <div className="flex-1 bg-[#050811] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 overflow-auto shadow-inner flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-slate-400 text-[11px] select-none flex items-center gap-2 pb-1 border-b border-slate-900">
                  <span className="text-emerald-400 font-bold">$ ./{activeLanguage === 'c' ? 'main_c' : 'main_cpp'}</span>
                  <span>(Simulador de entorno POSIX / Clang runtime)</span>
                </div>

                {simulationData ? (
                  <>
                    <pre className="text-emerald-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {simulationData.stdout || '(Programa ejecutado sin salida en stdout)'}
                    </pre>
                    {simulationData.stderr && (
                      <pre className="text-rose-400 font-mono text-xs whitespace-pre-wrap leading-relaxed mt-2">
                        {simulationData.stderr}
                      </pre>
                    )}
                    <div className="pt-2 text-[11px] text-slate-400">
                      [Proceso finalizado con código de salida {simulationData.exitCode} en {simulationData.executionTimeMs} ms]
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 italic py-6 text-center">
                    Haz clic en "Simular / Ejecutar" para compilar e iniciar la ejecución virtual en tiempo real.
                  </div>
                )}
              </div>
            </div>

            {/* Stdin Interactive Input Field */}
            <form onSubmit={handleExecute} className="flex items-center gap-2">
              <input
                type="text"
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                placeholder="Entrada estándar interactiva (stdin) si el programa usa LEER o scanf()..."
                className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSimulating}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enviar stdin</span>
              </button>
            </form>
          </div>
        )}

        {/* STACK FRAMES VIEW */}
        {activeSubTab === 'stack' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                Estructura de la Pila (Stack Memory & Variables Locales)
              </span>
              <span className="text-[11px] text-slate-400">Crecimiento: de direcciones altas a bajas</span>
            </div>

            {memoryMap?.stackFrames?.length ? (
              <div className="space-y-3">
                {memoryMap.stackFrames.map((frame, idx) => (
                  <div key={idx} className="bg-slate-900/90 border border-blue-900/40 rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-blue-950/60 px-3 py-1.5 border-b border-blue-900/40 font-bold text-blue-300 text-xs flex items-center justify-between">
                      <span>Marco de Función: {frame.functionName}()</span>
                      <span className="text-[10px] text-slate-400 font-mono">Frame Pointer: %rbp</span>
                    </div>

                    <div className="p-3 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                            <th className="pb-1.5 font-semibold">Dirección Memoria</th>
                            <th className="pb-1.5 font-semibold">Variable</th>
                            <th className="pb-1.5 font-semibold">Tipo</th>
                            <th className="pb-1.5 font-semibold">Valor Actual</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {frame.variables.map((v, vIdx) => (
                            <tr key={vIdx} className="hover:bg-slate-800/40">
                              <td className="py-2 text-cyan-400">{v.address}</td>
                              <td className="py-2 text-slate-200 font-bold">{v.name}</td>
                              <td className="py-2 text-purple-300">{v.type}</td>
                              <td className="py-2 text-emerald-300 font-bold">{v.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
                Ejecuta el código para inspeccionar las variables alojadas en la pila (Stack).
              </div>
            )}
          </div>
        )}

        {/* HEAP ALLOCATIONS VIEW */}
        {activeSubTab === 'heap' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                Montículo Dinámico (Heap Allocations: malloc / new)
              </span>
              <span className="text-[11px] text-slate-400">Gestión dinámica manual vs RAII</span>
            </div>

            {memoryMap?.heapAllocations?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memoryMap.heapAllocations.map((heap, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border space-y-2 ${
                      heap.status === 'allocated'
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold">{heap.address}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          heap.status === 'allocated'
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {heap.status === 'allocated' ? 'Activo (Allocated)' : 'Liberado (Freed)'}
                      </span>
                    </div>

                    <div className="text-slate-300 text-xs flex justify-between">
                      <span>Tipo: <strong className="text-purple-300">{heap.type}</strong></span>
                      <span>Tamaño: <strong className="text-emerald-400">{heap.sizeBytes} bytes</strong></span>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-slate-800 font-mono text-[11px] text-slate-300">
                      <span className="text-slate-500 block text-[10px] uppercase">Contenido del bloque:</span>
                      <span className="text-emerald-300">{heap.preview}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
                No se registraron asignaciones dinámicas en el Heap para este proceso.
              </div>
            )}
          </div>
        )}

        {/* POINTERS GRAPH VIEW */}
        {activeSubTab === 'pointers' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Link className="w-4 h-4 text-purple-400" />
                Mapeo & Desreferenciación de Punteros (*ptr)
              </span>
              <span className="text-[11px] text-slate-400">Direccionamiento indirecto y seguridad</span>
            </div>

            {memoryMap?.pointers?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memoryMap.pointers.map((ptr, idx) => (
                  <div key={idx} className="bg-slate-900/90 border border-purple-900/40 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-slate-200">
                      <div className="font-bold text-sm text-purple-300">
                        puntero <span className="text-cyan-300">*{ptr.name}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                        8 bytes (x86_64)
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-black/50 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Apunta a la dirección:</span>
                        <span className="text-cyan-400 font-bold">{ptr.pointsToAddress}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Valor desreferenciado (*{ptr.name}):</span>
                        <span className="text-emerald-300 font-bold">{ptr.dereferencedValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
                No se detectaron punteros activos o desreferenciaciones en este flujo.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

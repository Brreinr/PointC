import React, { useState } from 'react';
import { BookOpen, X, Check, Dot, Split, Search, Sparkles } from 'lucide-react';
import { POINTC_KEYWORDS } from '../utils/pointcParser';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredKeywords = POINTC_KEYWORDS.filter((k) =>
    k.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0d121f] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#090d16]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Manual y Filosofía de pointC</h3>
              <p className="text-xs text-slate-400">
                La forma intuitiva, minimalista y precisa de programar en C y C++ en lenguaje natural.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300">
          {/* Core Philosophy Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                1. El Proceso (Párrafo + Punto '.')
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Cada función, proceso o rutina principal es un <strong>párrafo</strong> que termina obligatoriamente con un <strong>punto final ('.')</strong>.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2. Sub-Procesos (Frase + Coma ',')
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Dentro de cada proceso, cada sentencia o instrucción sucesiva es una <strong>frase separada por coma (',')</strong>.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                3. Keywords en MAYÚSCULAS
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Los tipos, estructuras de control, punteros y operaciones de memoria van en <strong>MAYÚSCULAS</strong> para eliminar ambigüedades.
              </p>
            </div>
          </div>

          {/* Canonical Example */}
          <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Ejemplo Canónico de Sintaxis pointC:</span>
              <span className="text-[10px] text-cyan-400 font-mono">pointc_spec_sample.pointc</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded-lg border border-slate-800 leading-relaxed overflow-x-auto">
{`PROGRAMA principal con retorno ENTERO.
Definir variable ENTERO n con valor 10,
reservar MEMORIA DINAMICA para un VECTOR de ENTEROS llamado datos con tamaño n,
SI datos es igual a NULL ENTONCES:
  IMPRIMIR error "Fallo de memoria en Heap",
  RETORNA 1,
PARA cada iterador ENTERO i DESDE 0 HASTA n:
  asignar a datos[i] el valor de i multiplicado por 2,
IMPRIMIR texto "Vector listo en memoria:",
PARA cada ENTERO i DESDE 0 HASTA n:
  IMPRIMIR datos[i] con espacio,
IMPRIMIR salto de linea,
LIBERAR datos de la MEMORIA,
RETORNA 0.`}
            </pre>
          </div>

          {/* Keywords Search & Dictionary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Diccionario de Palabras Clave (Keywords Oficiales)
              </h4>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredKeywords.map((kw, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between"
                >
                  <code className="font-mono font-bold text-cyan-300 text-xs">{kw}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#090d16] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

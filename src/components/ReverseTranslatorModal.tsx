import React, { useState } from 'react';
import { RotateCcw, Sparkles, X, FileCode, ArrowRight } from 'lucide-react';

interface ReverseTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReverseTranslate: (sourceCode: string, language: 'c' | 'cpp') => Promise<void>;
  isProcessing: boolean;
}

export const ReverseTranslatorModal: React.FC<ReverseTranslatorModalProps> = ({
  isOpen,
  onClose,
  onReverseTranslate,
  isProcessing,
}) => {
  const [sourceCode, setSourceCode] = useState('');
  const [language, setLanguage] = useState<'c' | 'cpp'>('c');

  if (!isOpen) return null;

  const sampleCCode = `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int*)malloc(n * sizeof(int));
    if (arr == NULL) return 1;
    
    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        printf("Valor: %d\\n", arr[i]);
    }
    
    free(arr);
    return 0;
}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) return;
    await onReverseTranslate(sourceCode, language);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Traductor Inverso: C/C++ ➔ pointC</h3>
              <p className="text-xs text-slate-400">
                Pega cualquier código C o C++ existente y conviértelo a la sintaxis estructurada de pointC.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Selecciona el lenguaje del código fuente:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage('c')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  language === 'c'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lenguaje C
              </button>
              <button
                type="button"
                onClick={() => setLanguage('cpp')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  language === 'cpp'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lenguaje C++
              </button>
              <button
                type="button"
                onClick={() => setSourceCode(sampleCCode)}
                className="text-[11px] text-cyan-400 hover:underline ml-2"
              >
                Cargar ejemplo
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder={`// Pega aquí tu código ${language.toUpperCase()}...`}
            className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !sourceCode.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-cyan-500/20"
            >
              <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Traduciendo a pointC...' : 'Convertir a pointC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

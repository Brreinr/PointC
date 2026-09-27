import React, { useState } from 'react';
import { Wand2, Sparkles, X, ArrowRight, Lightbulb } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt,
  isGenerating,
}) => {
  const [promptText, setPromptText] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Crea un algoritmo de búsqueda binaria en un vector ordenado con punteros.',
    'Implementa una Pila (Stack LIFO) dinámica con malloc, push, pop y verificación de desbordamiento.',
    'Crea un programa que lea un archivo de texto, cuente palabras y libere la memoria adecuadamente.',
    'Calcula la serie de Fibonacci usando recursividad y memoria dinámica.',
    'Crea una clase Vehículo en C++ con métodos virtuales y punteros inteligentes.'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    await onSubmitPrompt(promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Asistente IA ➔ pointC</h3>
              <p className="text-xs text-slate-400">
                Describe lo que quieres programar y la IA lo estructurará en sintaxis pointC.
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              ¿Qué proceso o algoritmo deseas construir?
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ej: Crea una función para calcular el producto escalar de dos vectores con reserva de memoria dinámica, verificación de puntero NULL y liberación al finalizar."
              className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Sugerencias rápidas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPromptText(qp)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

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
              disabled={isGenerating || !promptText.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-indigo-500/20"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generando pointC...' : 'Generar Código pointC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

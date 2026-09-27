import React, { useEffect } from 'react';
import { Command, X, Zap, ShieldCheck, Layers, Keyboard } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/i18n';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage].shortcuts;
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#0b101d] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#080c16] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.title}</h3>
              <p className="text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Translate Shortcut */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-200">{t.translateDesc}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold shadow-sm">
                {modifierKey}
              </span>
              <span className="text-slate-500">+</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold shadow-sm">
                Enter
              </span>
            </div>
          </div>

          {/* Run / Audit Shortcut */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-slate-200">{t.runDesc}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold shadow-sm">
                {modifierKey}
              </span>
              <span className="text-slate-500">+</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold shadow-sm">
                R
              </span>
            </div>
          </div>

          {/* Switch Tabs Shortcut */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30">
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-slate-200">{t.switchTabsDesc}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold shadow-sm">
                {modifierKey}
              </span>
              <span className="text-slate-500">+</span>
              <span className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold shadow-sm">
                1 - 4
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#080c16] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{t.hint}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition shadow-sm"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

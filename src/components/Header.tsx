import React from 'react';
import {
  Sparkles,
  Zap,
  Play,
  Download,
  FolderOpen,
  Plus,
  Wand2,
  FileCode2,
  Save,
  ChevronLeft,
  Coins,
  User as UserIcon,
  BookOpen,
  ShieldCheck,
  Sliders,
  Keyboard,
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Globe
} from 'lucide-react';
import { ExamplePreset, User as UserType, BuildConfig } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface HeaderProps {
  currentFileName: string;
  onRenameFile: (newName: string) => void;
  onBackToDashboard: () => void;
  onSavePointCFile: () => void;
  onOpenDiskFile?: (file: File) => void;
  onNewBlankFile?: () => void;
  onTranslate: () => void;
  onOptimize: () => void;
  onSimulate: () => void;
  onOpenAiPrompt: () => void;
  onOpenExport: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenTutorial?: () => void;
  onOpenBuildConfig?: () => void;
  onOpenShortcuts?: () => void;
  saveStatus?: 'saved' | 'saving' | 'error' | 'unsaved';
  lastSavedTime?: Date | null;
  saveDestination?: 'both' | 'local' | 'firestore' | null;
  buildConfig?: BuildConfig;
  isTranslating: boolean;
  isOptimizing: boolean;
  isSimulating: boolean;
  hasTranslations: boolean;
  user: UserType | null;
  currentLanguage: 'es' | 'en';
  onLanguageChange: (lang: 'es' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFileName,
  onRenameFile,
  onBackToDashboard,
  onSavePointCFile,
  onOpenDiskFile,
  onNewBlankFile,
  onTranslate,
  onOptimize,
  onSimulate,
  onOpenAiPrompt,
  onOpenExport,
  onOpenProfile,
  onOpenAuth,
  onOpenTutorial,
  onOpenBuildConfig,
  onOpenShortcuts,
  saveStatus = 'saved',
  lastSavedTime,
  saveDestination = 'both',
  buildConfig,
  isTranslating,
  isOptimizing,
  isSimulating,
  hasTranslations,
  user,
  currentLanguage,
  onLanguageChange,
}) => {
  const diskFileInputRef = React.useRef<HTMLInputElement>(null);
  const tAutosave = TRANSLATIONS[currentLanguage].autosave;
  const tNav = TRANSLATIONS[currentLanguage].nav;

  return (
    <header className="border-b border-slate-800/90 bg-[#080c16] sticky top-0 z-30 px-3.5 py-2 flex items-center justify-between gap-3 font-sans">
      {/* Brand & File Info - Ultra-clean without clutter */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800/80 transition font-medium"
          title={tNav.backToFiles}
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">{tNav.files}</span>
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
            <span className="font-mono font-black text-white text-xs">.C</span>
          </div>

          {/* Current File indicator, quick download, disk opener, and new blank file */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={currentFileName}
              onChange={(e) => onRenameFile(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-200 focus:outline-none focus:text-white w-28 sm:w-36 truncate"
              title="Haz clic para renombrar (ej. archivo.pointc o archivo.poinc)"
            />
            {/* Quick Save / Download in natural language */}
            <button
              onClick={onSavePointCFile}
              className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition"
              title="Guardar / Descargar archivo en lenguaje natural (.pointc / .poinc)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            {/* Open / Read .pointc or .poinc from disk */}
            {onOpenDiskFile && (
              <>
                <input
                  ref={diskFileInputRef}
                  type="file"
                  accept=".pointc,.poinc,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      onOpenDiskFile(f);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => diskFileInputRef.current?.click()}
                  className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition"
                  title="Abrir / Leer archivo desde tu equipo (.pointc o .poinc)"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {/* New blank file with ZERO preloaded code */}
            {onNewBlankFile && (
              <button
                onClick={onNewBlankFile}
                className="text-slate-400 hover:text-emerald-300 p-1 rounded hover:bg-slate-800 transition"
                title="Crear nuevo archivo en blanco (completamente vacío)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Real-time Auto-Save Status Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-200 border ${
              saveStatus === 'saving'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : saveStatus === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : saveStatus === 'unsaved'
                ? 'bg-slate-900 border-slate-700/60 text-slate-400'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
            }`}
            title={
              saveDestination === 'both'
                ? tAutosave.tooltipBoth
                : tAutosave.tooltipLocal
            }
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span>{tAutosave.saving}</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>{tAutosave.error}</span>
              </>
            ) : saveStatus === 'unsaved' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>{tAutosave.unsaved}</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tAutosave.saved}</span>
                {lastSavedTime && (
                  <span className="text-[10px] text-emerald-500/70 font-sans hidden lg:inline">
                    {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Compilation Standards & Optimizations Badge / Button */}
        {onOpenBuildConfig && buildConfig && (
          <button
            onClick={onOpenBuildConfig}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#060913] border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition group shadow-sm"
            title="Configurar estándares C/C++, nivel de optimización y flags del compilador"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition" />
            <span className="font-mono text-[11px] font-bold text-cyan-300">{buildConfig.cStandard}</span>
            <span className="text-slate-500 text-[10px]">/</span>
            <span className="font-mono text-[11px] font-bold text-purple-300">{buildConfig.cppStandard}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold ml-0.5">
              -{buildConfig.optimizationLevel}
            </span>
          </button>
        )}

        {/* Tutorial Interactivo */}
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/70 hover:text-white transition"
            title="Tutorial interactivo de sintaxis pointC"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Tutorial</span>
          </button>
        )}

        {/* AI Prompt Assistance */}
        <button
          onClick={onOpenAiPrompt}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/70 hover:text-white transition"
          title={currentLanguage === 'es' ? 'Generar código pointC desde lenguaje natural con IA' : 'Generate pointC code from natural language using AI'}
        >
          <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">{tNav.aiAssistant}</span>
        </button>

        {/* Translate Button (Ctrl + Enter) */}
        <button
          onClick={onTranslate}
          disabled={isTranslating}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
            isTranslating
              ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : 'fill-white'}`} />
          <span>{isTranslating ? tNav.translating : tNav.translate}</span>
          <kbd className="hidden lg:inline text-[9px] bg-black/30 px-1 py-0.5 rounded font-mono text-cyan-100">
            ⌘↵
          </kbd>
        </button>

        {/* Optimize Button */}
        <button
          onClick={onOptimize}
          disabled={isOptimizing || !hasTranslations}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            !hasTranslations
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
              : isOptimizing
              ? 'bg-purple-900/60 border border-purple-500/40 text-purple-200 cursor-wait'
              : 'bg-slate-900 border border-purple-500/40 text-purple-300 hover:bg-purple-950/70'
          }`}
          title={tNav.optimize}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-pulse' : 'text-purple-400'}`} />
          <span className="hidden sm:inline">{tNav.optimize}</span>
        </button>

        {/* Error Rectification & Diagnostics Button */}
        <button
          onClick={onSimulate}
          disabled={isSimulating || !hasTranslations}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            !hasTranslations
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
              : isSimulating
              ? 'bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 cursor-wait'
              : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/80 hover:text-white'
          }`}
          title={tNav.runDiagnostic}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : 'text-cyan-400'}`} />
          <span className="hidden sm:inline">{tNav.rectifyErrors}</span>
        </button>

        {/* Export Modal Button */}
        <button
          onClick={onOpenExport}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title={tNav.export}
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title={tNav.shortcuts}
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Bilingual Native Language Switcher (100% Free, Instant, No API Needed) */}
        <button
          onClick={() => onLanguageChange(currentLanguage === 'es' ? 'en' : 'es')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition shadow-sm flex items-center gap-1.5 group"
          title={currentLanguage === 'es' ? 'Cambiar idioma a Inglés (Gratis e Instantáneo)' : 'Switch language to Spanish (Free & Instant)'}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition shrink-0" />
          <span className="text-sm leading-none">{currentLanguage === 'es' ? '🇪🇸' : '🇺🇸'}</span>
          <span className="font-mono text-cyan-300 font-bold text-xs">
            {currentLanguage === 'es' ? 'ES' : 'EN'}
          </span>
        </button>

        {/* Credits & Profile button */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200 transition"
            title={tNav.profile}
          >
            <div className="flex items-center gap-1 text-amber-300 font-bold font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{user.credits}</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tNav.login}</span>
          </button>
        )}
      </div>
    </header>
  );
};

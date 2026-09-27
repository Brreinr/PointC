import React, { useState, useRef } from 'react';
import {
  FileCode2,
  Plus,
  Upload,
  FolderOpen,
  Clock,
  Sparkles,
  Trash2,
  ArrowRight,
  Code2,
  CheckCircle2,
  Zap,
  BookOpen,
  User,
  Coins,
  Cloud,
  FileCheck,
  Globe,
  Sliders
} from 'lucide-react';
import { ProjectFile, ExamplePreset, User as UserType, BuildConfig } from '../types';
import { POINTC_PRESETS } from '../utils/presets';
import { TRANSLATIONS } from '../utils/i18n';

interface FileDashboardProps {
  onOpenFile: (file: ProjectFile) => void;
  onCreateNewFile: (fileName: string, templateCode?: string) => void;
  recentFiles: ProjectFile[];
  onDeleteFile: (id: string) => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenTutorial?: () => void;
  onOpenBuildConfig?: () => void;
  buildConfig?: BuildConfig;
  user: UserType | null;
  currentLanguage?: 'es' | 'en';
  onLanguageChange?: (lang: 'es' | 'en') => void;
}

export const BLANK_STARTER_CODE_ES = `INCLUIR <stdio.h>,

PROGRAMA principal con retorno ENTERO,
  Definir variable ENTERO resultado con valor 0,
  IMPRIMIR texto "¡Hola mundo desde pointC!",
  IMPRIMIR salto de linea,
  RETORNA resultado.`;

export const CANONICAL_STARTER_CODE_ES = `INCLUIR <stdio.h>,

PROGRAMA principal con retorno ENTERO,
  Definir variable ENTERO x con valor 42,
  Definir variable TEXTO saludo con valor "¡Hola Mundo desde pointC!",
  IMPRIMIR texto saludo,
  IMPRIMIR salto de linea,
  IMPRIMIR texto "El valor inicial de x es: ",
  IMPRIMIR x,
  IMPRIMIR salto de linea,
  SI x es mayor que 0 ENTONCES:
    IMPRIMIR texto "Estado: Proceso ejecutado con exito",
    IMPRIMIR salto de linea,
  RETORNA 0.`;

export const BLANK_STARTER_CODE_EN = `INCLUDE <stdio.h>,

PROGRAM main with RETURN INTEGER,
  Define variable INTEGER result with value 0,
  PRINT text "Hello world from pointC!",
  PRINT newline,
  RETURN result.`;

export const CANONICAL_STARTER_CODE_EN = `INCLUDE <stdio.h>,

PROGRAM main with RETURN INTEGER,
  Define variable INTEGER x with value 42,
  Define variable STRING greeting with value "Hello World from pointC!",
  PRINT text greeting,
  PRINT newline,
  PRINT text "The initial value of x is: ",
  PRINT x,
  PRINT newline,
  IF x is greater than 0 THEN:
    PRINT text "Status: Process executed successfully",
    PRINT newline,
  RETURN 0.`;

export const CANONICAL_STARTER_CODE = CANONICAL_STARTER_CODE_ES;
export const BLANK_STARTER_CODE = BLANK_STARTER_CODE_ES;

export const FileDashboard: React.FC<FileDashboardProps> = ({
  onOpenFile,
  onCreateNewFile,
  recentFiles,
  onDeleteFile,
  onOpenAuth,
  onOpenProfile,
  onOpenTutorial,
  onOpenBuildConfig,
  buildConfig,
  user,
  currentLanguage,
  onLanguageChange,
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [codeLanguage, setCodeLanguage] = useState<'es' | 'en'>(currentLanguage || user?.language || 'es');

  React.useEffect(() => {
    if (currentLanguage) {
      setCodeLanguage(currentLanguage);
    } else if (user?.language) {
      setCodeLanguage(user.language);
    }
  }, [currentLanguage, user?.language]);

  const handleLangSelect = (lang: 'es' | 'en') => {
    setCodeLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };
  const [selectedTemplate, setSelectedTemplate] = useState<string>('starter');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLang = currentLanguage || 'es';
  const tDashboard = TRANSLATIONS[activeLang].dashboard;
  const tNav = TRANSLATIONS[activeLang].nav;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let name = newFileName.trim();
    if (!name) name = codeLanguage === 'en' ? 'my_program' : 'mi_programa';
    if (!name.endsWith('.pointc') && !name.endsWith('.poinc')) {
      name += '.pointc';
    }

    let codeToUse = codeLanguage === 'en' ? CANONICAL_STARTER_CODE_EN : CANONICAL_STARTER_CODE_ES;
    if (selectedTemplate === 'blank') {
      codeToUse = codeLanguage === 'en' ? BLANK_STARTER_CODE_EN : BLANK_STARTER_CODE_ES;
    } else if (selectedTemplate !== 'starter') {
      const found = POINTC_PRESETS.find((p) => p.id === selectedTemplate);
      if (found) codeToUse = found.pointcCode;
    }

    onCreateNewFile(name, codeToUse);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onCreateNewFile(file.name, content || CANONICAL_STARTER_CODE);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onCreateNewFile(file.name, content || CANONICAL_STARTER_CODE);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <span className="font-mono font-black text-white text-base">.C</span>
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              point<span className="text-cyan-400">C</span>
            </span>
            <span className="text-[10px] text-cyan-300 font-mono ml-2 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              {tDashboard.connectedCloud}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenBuildConfig && buildConfig && (
            <button
              onClick={onOpenBuildConfig}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#060913] border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition group shadow-sm"
              title={tDashboard.buildSettingsBtn}
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

          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/80 hover:text-white transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tDashboard.tutorialBtn}</span>
            </button>
          )}

          {/* Bilingual Native Language Switcher (100% Free, Instant, No API Needed) */}
          {onLanguageChange && (
            <button
              onClick={() => onLanguageChange(activeLang === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition shadow-sm flex items-center gap-1.5 group"
              title={activeLang === 'es' ? 'Cambiar idioma a Inglés (Gratis e Instantáneo)' : 'Switch language to Spanish (Free & Instant)'}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition shrink-0" />
              <span className="text-sm leading-none">{activeLang === 'es' ? '🇪🇸' : '🇺🇸'}</span>
              <span className="font-mono text-cyan-300 font-bold text-xs">
                {activeLang === 'es' ? 'ES' : 'EN'}
              </span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/40 text-xs text-slate-200 transition"
              >
                <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.credits}</span>
                  <span className="text-[10px] text-slate-400 font-sans font-normal">{tNav.credits}</span>
                </div>
                <div className="w-px h-3.5 bg-slate-800" />
                <span className="font-medium text-slate-300 max-w-[120px] truncate">{user.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sincronizado con Firebase" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>{tNav.login}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-7">
        {/* Interactive Tutorial Banner Card */}
        {onOpenTutorial && (
          <div
            onClick={onOpenTutorial}
            className="group cursor-pointer bg-gradient-to-r from-cyan-950/60 via-blue-950/50 to-slate-900 border border-cyan-500/40 hover:border-cyan-400/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-xl bg-cyan-900/50 border border-cyan-400/30 text-cyan-300 group-hover:scale-110 transition shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-400/30">
                    {tDashboard.tutorialBannerBadge}
                  </span>
                  <span className="text-xs text-slate-400">• {tDashboard.tutorialBannerChallenges}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-200 transition">
                  {tDashboard.tutorialBannerTitle}
                </h3>
                <p className="text-xs text-slate-300 font-normal">
                  {tDashboard.tutorialBannerDesc}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTutorial();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0 self-end sm:self-center"
            >
              <span>{tDashboard.tutorialBannerBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Minimal Hero */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tDashboard.heroBadge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {tDashboard.heroTitle} <span className="text-cyan-400 font-mono">.pointc</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto font-normal">
            {tDashboard.heroSubtitle}
          </p>
        </div>

        {/* Creation & Open Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Create New .pointc File */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-slate-700 transition shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{tDashboard.createCardTitle}</h3>
                  <p className="text-xs text-slate-400">{tDashboard.createCardDesc}</p>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                {/* Language Selector: Español vs English */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>{tDashboard.syntaxLangLabel}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{tDashboard.bilingualBadge}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#070a12] border border-slate-700/80 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleLangSelect('es')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        codeLanguage === 'es'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>🇪🇸 Español</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLangSelect('en')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        codeLanguage === 'en'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>🇺🇸 English</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>{tDashboard.fileNameLabel}</span>
                    <span className="text-[11px] text-cyan-400 font-mono">.pointc</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder={tDashboard.fileNamePlaceholder}
                      className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500 text-xs font-mono select-none">
                      .pointc
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {tDashboard.starterCodeLabel}
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="starter">
                      {tDashboard.starterTemplateDefault}
                    </option>
                    <option value="blank">
                      {tDashboard.starterTemplateBlank}
                    </option>
                    {POINTC_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{tDashboard.createBtn}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Open / Upload .pointc file */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 transition ${
              dragOver
                ? 'bg-cyan-950/30 border-cyan-400 shadow-xl'
                : 'bg-[#0b101c] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">{tDashboard.openCardTitle}</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                {tDashboard.openCardDesc}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pointc,.poinc,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>{tDashboard.browsePc}</span>
            </button>
          </div>
        </div>

        {/* Recent Files List */}
        {recentFiles.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {tDashboard.recentFilesTitle}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {recentFiles.length} {tDashboard.inTheCloud}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onOpenFile(file)}
                  className="bg-[#0b101c] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between gap-2 group cursor-pointer transition shadow-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileCode2 className="w-5 h-5 text-cyan-400 shrink-0 group-hover:scale-105 transition" />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-white block truncate group-hover:text-cyan-300">
                          {file.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 font-mono shrink-0">
                          Web
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {tDashboard.modified} {new Date(file.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title={tDashboard.deleteTooltip}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

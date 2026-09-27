import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Plus,
  Palette,
  BookOpen,
  X,
  Search,
  CheckCircle2,
  Dot,
  Code2,
  Layers,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { POINTC_KEYWORDS, analyzePointCCode, autoFormatPointC } from '../utils/pointcParser';
import { tokenizePointC, TOKEN_STYLE_MAP } from '../utils/pointcHighlighter';
import { TRANSLATIONS } from '../utils/i18n';

interface PointCEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  saveStatus?: 'saved' | 'saving' | 'error' | 'unsaved';
  currentLanguage?: 'es' | 'en';
}

export const PointCEditor: React.FC<PointCEditorProps> = ({
  code,
  onChange,
  onTranslate,
  isTranslating,
  saveStatus,
  currentLanguage = 'es',
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedKeywordGroup, setSelectedKeywordGroup] = useState<string>('tipos');
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [isSyntaxDrawerOpen, setIsSyntaxDrawerOpen] = useState(false);
  const [syntaxSearch, setSyntaxSearch] = useState('');

  const tEditor = TRANSLATIONS[currentLanguage].editor;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const analysis = analyzePointCCode(code);
  const tokens = tokenizePointC(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFormat = () => {
    const formatted = autoFormatPointC(code);
    onChange(formatted);
  };

  const handleInsertKeyword = (keyword: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal = currentVal.substring(0, start) + keyword + currentVal.substring(end);
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + keyword.length, start + keyword.length);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  };

  // Synchronize scroll between transparent textarea and syntax highlighted pre
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const KEYWORD_CATEGORIES: Record<string, { label: string; color: string; keywords: string[]; desc: string }> = {
    paquetes: {
      label: currentLanguage === 'es' ? 'Paquetes & Inclusión' : 'Packages & Inclusions',
      color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40',
      desc: currentLanguage === 'es' ? 'Descarga, inclusión y vinculación de librerías externas de C/C++' : 'Inclusion, linking, and external C/C++ library management',
      keywords: ['INCLUIR', 'INCLUDE', 'INCLUYE', 'INCLUDES', 'PAQUETE', 'PACKAGE', 'USAR', 'USE']
    },
    tipos: {
      label: currentLanguage === 'es' ? 'Tipos de Datos' : 'Data Types',
      color: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
      desc: currentLanguage === 'es' ? 'Mapean a tipos nativos C/C++ (int, double, char, string, void)' : 'Map to native C/C++ primitive types (int, double, char, string, void)',
      keywords: ['ENTERO', 'INTEGER', 'INT', 'ENTERO_CORTO', 'SHORT', 'ENTERO_LARGO', 'LONG', 'ENTERO_SIN_SIGNO', 'UNSIGNED', 'DECIMAL', 'FLOAT', 'DECIMAL_DOBLE', 'DOUBLE', 'CARACTER', 'CHAR', 'TEXTO', 'CADENA', 'STRING', 'BOOLEANO', 'BOOLEAN', 'VACIO', 'VOID', 'AUTO']
    },
    memoria: {
      label: currentLanguage === 'es' ? 'Memoria & Punteros' : 'Memory & Pointers',
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      desc: currentLanguage === 'es' ? 'Gestión dinámica en Heap, desreferenciación y liberación' : 'Heap allocation, pointer safety, referencing and deallocation',
      keywords: ['PUNTERO', 'POINTER', 'REFERENCIA', 'REFERENCE', 'DIRECCION', 'ADDRESS', 'MEMORIA', 'MEMORY', 'ASIGNAR_MEMORIA', 'ALLOCATE', 'REASIGNAR_MEMORIA', 'REALLOCATE', 'LIBERAR', 'FREE', 'TAMANIO_DE', 'SIZEOF', 'NULL', 'NULO']
    },
    control: {
      label: currentLanguage === 'es' ? 'Control de Flujo' : 'Flow Control',
      color: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
      desc: currentLanguage === 'es' ? 'Condicionales, bucles, iteradores y saltos de función' : 'Conditionals, loops, iterations and function returns',
      keywords: ['PROGRAMA', 'PROGRAM', 'FUNCION', 'FUNCTION', 'PARAMETRO', 'PARAMETER', 'RETORNA', 'RETURN', 'SI', 'IF', 'ENTONCES', 'THEN', 'SINO', 'ELSE', 'MIENTRAS', 'WHILE', 'PARA', 'FOR', 'CADA', 'EACH', 'DESDE', 'FROM', 'HASTA', 'TO', 'CON_PASO', 'STEP', 'HACER', 'DO', 'SEGUN', 'SWITCH', 'CASO', 'CASE', 'POR_DEFECTO', 'DEFAULT', 'ROMPER', 'BREAK', 'CONTINUAR', 'CONTINUE']
    },
    estructuras: {
      label: currentLanguage === 'es' ? 'Estructuras & Clases' : 'Structures & Classes',
      color: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
      desc: currentLanguage === 'es' ? 'Registros struct, clases, modificadores de acceso y colecciones STL' : 'Structs, OOP classes, access modifiers and STL data containers',
      keywords: ['ESTRUCTURA', 'STRUCT', 'UNION', 'ENUMERACION', 'ENUM', 'CLASE', 'CLASS', 'PUBLICO', 'PUBLIC', 'PRIVADO', 'PRIVATE', 'METODO', 'METHOD', 'HEREDA', 'INHERITS', 'VECTOR', 'ARREGLO', 'ARRAY', 'MATRIZ', 'MATRIX', 'LISTA', 'LIST', 'PILA', 'STACK', 'COLA', 'QUEUE', 'MAPA', 'MAP']
    },
    io: {
      label: currentLanguage === 'es' ? 'E/S & Concurrencia' : 'I/O & Concurrency',
      color: 'text-amber-300 border-amber-500/40 bg-amber-950/40',
      desc: currentLanguage === 'es' ? 'Flujo de entrada, visualización, consola y multihilo' : 'Input stream, console output, files and multi-threading',
      keywords: ['ENTRADA', 'INPUT', 'ENTRY', 'MOSTRAR', 'SHOW', 'DISPLAY', 'IMPRIMIR', 'PRINT', 'LEER', 'READ', 'LEER_LINEA', 'READ_LINE', 'ARCHIVO', 'FILE', 'HILO', 'THREAD', 'MUTEX', 'BLOQUEAR', 'LOCK', 'DESBLOQUEAR', 'UNLOCK', 'CONSTANTE', 'CONST', 'ESTATICO', 'STATIC']
    }
  };

  const lines = code.split('\n');

  return (
    <div className="flex flex-col h-full bg-[#0d121f] border-r border-slate-800 relative overflow-hidden">
      {/* Editor Top Bar - Clean & Minimal */}
      <div className="bg-[#090d16] px-3.5 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {tEditor.title}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            {analysis.processCount} {tEditor.processes} <span className="text-cyan-400 font-bold">.</span> {analysis.sentenceCount} {tEditor.sentences} <span className="text-amber-400 font-bold">,</span>
          </span>
          {saveStatus && (
            <>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                {saveStatus === 'saving' ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {tEditor.saving}
                  </span>
                ) : saveStatus === 'error' ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {tEditor.syncError}
                  </span>
                ) : saveStatus === 'unsaved' ? (
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    {tEditor.unsaved}
                  </span>
                ) : (
                  <span className="text-emerald-400/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {tEditor.synced}
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Collapsible Sintaxis Drawer Button */}
          <button
            onClick={() => setIsSyntaxDrawerOpen(!isSyntaxDrawerOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition border ${
              isSyntaxDrawerOpen
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
            }`}
            title={tEditor.syntaxTooltip}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tEditor.syntaxBtn}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 font-mono">
              {tEditor.syntaxBadge}
            </span>
          </button>

          <button
            onClick={() => setShowColorLegend(!showColorLegend)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition border ${
              showColorLegend
                ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            title={tEditor.colorLegendTooltip}
          >
            <Palette className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">{tEditor.colorLegendBtn}</span>
          </button>

          <button
            onClick={handleAutoFormat}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-[11px]"
            title={tEditor.autoformat}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{tEditor.formatBtn}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title={copied ? tEditor.copied : tEditor.copy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Color Legend (Collapsible) */}
      {showColorLegend && (
        <div className="bg-[#0b101c] px-3.5 py-2 border-b border-slate-800 flex flex-wrap items-center gap-3 text-[11px] animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-bold font-mono">{tEditor.typesLegend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-bold font-mono">{tEditor.memoryLegend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-purple-300 font-bold font-mono">{tEditor.controlLegend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-bold font-mono">{tEditor.ioLegend}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">.</span>
            <span className="text-slate-300">{tEditor.pointLegend}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 rounded bg-amber-500/20 text-amber-300 font-bold">,</span>
            <span className="text-slate-300">{tEditor.commaLegend}</span>
          </div>
        </div>
      )}

      {/* Minimal Keyword Quick Bar */}
      <div className="bg-[#0b101d] px-3 py-1 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-[11px] scrollbar-thin">
        <div className="flex items-center gap-1 shrink-0">
          {(['tipos', 'memoria', 'control', 'estructuras', 'io'] as const).map((group) => (
            <button
              key={group}
              onClick={() => setSelectedKeywordGroup(group)}
              className={`px-2 py-0.5 rounded capitalize transition font-medium text-[10px] ${
                selectedKeywordGroup === group
                  ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {group === 'tipos' ? tEditor.groups.types :
               group === 'memoria' ? tEditor.groups.memory :
               group === 'control' ? tEditor.groups.control :
               group === 'estructuras' ? tEditor.groups.structs :
               tEditor.groups.io}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {KEYWORD_CATEGORIES[selectedKeywordGroup]?.keywords.slice(0, 7).map((kw) => (
            <button
              key={kw}
              onClick={() => handleInsertKeyword(kw + ' ')}
              className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/50 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold tracking-tight transition shrink-0 flex items-center gap-0.5 active:scale-95"
            >
              <Plus className="w-2.5 h-2.5 opacity-60" />
              <span>{kw}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Area (Editor + Collapsible Sintaxis Drawer) */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs md:text-sm leading-relaxed">
        {/* Line Numbers Column */}
        <div className="w-10 bg-[#090d17] border-r border-slate-800/70 text-slate-600 select-none py-3 px-1 text-right text-xs font-mono shrink-0 overflow-hidden opacity-60">
          {lines.map((_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Dual-layer Synchronized Syntax Highlighting Canvas */}
        <div className="flex-1 relative h-full overflow-hidden bg-[#0b101d]">
          {/* Syntax Highlighted Backdrop Layer */}
          <div
            ref={backdropRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-auto font-mono text-xs md:text-sm leading-6 z-0"
            style={{
              tabSize: 2,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {tokens.map((token, index) => (
              <span key={index} className={TOKEN_STYLE_MAP[token.type] || 'text-slate-200'}>
                {token.value}
              </span>
            ))}
            <div className="h-10" />
          </div>

          {/* Editable Transparent Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder={tEditor.placeholder}
            spellCheck={false}
            className="absolute inset-0 w-full h-full p-3 bg-transparent text-transparent caret-cyan-400 placeholder:text-slate-600 focus:outline-none resize-none font-mono text-xs md:text-sm leading-6 z-10 selection:bg-cyan-500/30 selection:text-transparent"
            style={{
              tabSize: 2,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          />
        </div>

        {/* COLLAPSIBLE 'SINTAXIS' DRAWER */}
        {isSyntaxDrawerOpen && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-[#080d1a]/95 backdrop-blur-md border-l border-slate-700/80 z-20 flex flex-col shadow-2xl font-sans animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#060913]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{tEditor.syntaxDrawerTitle}</h4>
                  <p className="text-[10px] text-slate-400">{tEditor.syntaxDrawerSubtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setIsSyntaxDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keyword Search Field */}
            <div className="p-3 border-b border-slate-800/80 bg-[#0a0f1d]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={tEditor.searchKeywords}
                  value={syntaxSearch}
                  onChange={(e) => setSyntaxSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs text-slate-300">
              {/* 3 Core Grammar Rules Card */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  {tEditor.syntaxRulesTitle}
                </span>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 space-y-0.5">
                    <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {tEditor.rule1Title}
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-tight">
                      {tEditor.rule1Desc}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/30 space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {tEditor.rule2Title}
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-tight">
                      {tEditor.rule2Desc}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-purple-500/30 space-y-0.5">
                    <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {tEditor.rule3Title}
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-tight">
                      {tEditor.rule3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categorized Reserved Words with 1-click insert */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {tEditor.reservedWordsTitle}
                </span>

                {Object.entries(KEYWORD_CATEGORIES).map(([key, cat]) => {
                  const visibleKws = cat.keywords.filter((kw) =>
                    kw.toLowerCase().includes(syntaxSearch.toLowerCase())
                  );
                  if (visibleKws.length === 0) return null;

                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200">
                          {cat.label}
                        </span>
                        <span className="text-[9px] text-slate-500">{visibleKws.length} {tEditor.wordsCount}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{cat.desc}</p>

                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {visibleKws.map((kw) => (
                          <button
                            key={kw}
                            onClick={() => handleInsertKeyword(kw + ' ')}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 font-mono text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
                            title={tEditor.insertTooltip}
                          >
                            <Plus className="w-2.5 h-2.5 opacity-60" />
                            <span>{kw}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Template Example */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 space-y-1.5 font-mono text-[10px]">
                <span className="text-slate-400 font-bold uppercase block text-[9px]">
                  {tEditor.canonicalTitle}
                </span>
                <code className="text-cyan-300 block leading-relaxed whitespace-pre">
{currentLanguage === 'en' ? `PROGRAM main with return INTEGER.
Define variable INTEGER n with value 10,
allocate MEMORY for VECTOR called v with size n,
IF v is NULL THEN:
  RETURN 1,
FREE v from MEMORY,
RETURN 0.` : `PROGRAMA principal con retorno ENTERO.
Definir variable ENTERO n con valor 10,
reservar MEMORIA para VECTOR llamado v con tamaño n,
SI v es NULL ENTONCES:
  RETORNA 1,
LIBERAR v de la MEMORIA,
RETORNA 0.`}
                </code>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-2.5 border-t border-slate-800 bg-[#060913] flex items-center justify-between text-[10px] text-slate-400">
              <span>pointC Gramática Formal v2.5</span>
              <button
                onClick={() => setIsSyntaxDrawerOpen(false)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                {tEditor.closeDrawer}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation warning (only if errors exist) */}
      {analysis.warnings.length > 0 && (
        <div className="bg-amber-950/40 border-t border-amber-900/50 px-3 py-1.5 text-xs text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{analysis.warnings[0]}</span>
          </div>
          <button
            onClick={handleAutoFormat}
            className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-[10px] font-bold uppercase tracking-wider shrink-0 transition"
          >
            {tEditor.fixWarning}
          </button>
        </div>
      )}
    </div>
  );
};

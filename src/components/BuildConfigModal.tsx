import React from 'react';
import {
  Sliders,
  X,
  Cpu,
  Zap,
  ShieldAlert,
  Terminal,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Code2,
  FileCode,
  Gauge,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { BuildConfig } from '../types';

interface BuildConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BuildConfig;
  onChangeConfig: (newConfig: BuildConfig) => void;
  onApplyAndTranslate: () => void;
}

export const DEFAULT_BUILD_CONFIG: BuildConfig = {
  cStandard: 'C17',
  cppStandard: 'C++20',
  optimizationLevel: 'O2',
  enableWarnings: true,
  enableSanitizer: false,
  enableLTO: false,
  enableFastMath: false,
  targetArchitecture: 'native'
};

export const BuildConfigModal: React.FC<BuildConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onApplyAndTranslate,
}) => {
  if (!isOpen) return null;

  const handleUpdate = <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChangeConfig(DEFAULT_BUILD_CONFIG);
  };

  const handleApply = () => {
    onApplyAndTranslate();
    onClose();
  };

  // Generate real-time GCC command preview
  const generateGccFlags = () => {
    const flags: string[] = [];
    flags.push(`-std=${config.cStandard.toLowerCase()}`);
    flags.push(`-${config.optimizationLevel}`);

    if (config.enableWarnings) {
      flags.push('-Wall', '-Wextra', '-Wpedantic');
    }
    if (config.enableSanitizer) {
      flags.push('-fsanitize=address,undefined');
    }
    if (config.enableLTO) {
      flags.push('-flto');
    }
    if (config.enableFastMath) {
      flags.push('-ffast-math');
    }
    if (config.targetArchitecture === 'native') {
      flags.push('-march=native');
    }

    return flags.join(' ');
  };

  const generateGppFlags = () => {
    const cppStdMap: Record<string, string> = {
      'C++14': 'c++14',
      'C++17': 'c++17',
      'C++20': 'c++20',
      'C++23': 'c++23',
    };
    const flags: string[] = [];
    flags.push(`-std=${cppStdMap[config.cppStandard] || 'c++20'}`);
    flags.push(`-${config.optimizationLevel}`);

    if (config.enableWarnings) {
      flags.push('-Wall', '-Wextra', '-Wpedantic');
    }
    if (config.enableSanitizer) {
      flags.push('-fsanitize=address,undefined');
    }
    if (config.enableLTO) {
      flags.push('-flto');
    }
    if (config.enableFastMath) {
      flags.push('-ffast-math');
    }
    if (config.targetArchitecture === 'native') {
      flags.push('-march=native');
    }

    return flags.join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="bg-[#0b101c] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#080c16] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Configuración de Compilación</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  {config.cStandard} & {config.cppStandard} • -{config.optimizationLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ajusta los estándares de lenguaje C/C++, optimizaciones del compilador y flags nativos.
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-[#090d18]/70">
          {/* Section 1: Standards of C and C++ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* C Standard Selector */}
            <div className="bg-[#070a13] border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  Estándar de Lenguaje C
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ISO/IEC 9899</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['C99', 'C11', 'C17', 'C23'] as const).map((std) => (
                  <button
                    key={std}
                    onClick={() => handleUpdate('cStandard', std)}
                    className={`p-2.5 rounded-lg text-xs font-mono font-semibold transition text-left flex flex-col border ${
                      config.cStandard === std
                        ? 'bg-blue-950/80 border-blue-500/60 text-blue-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{std}</span>
                      {config.cStandard === std && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                      {std === 'C99' && 'Legacy & Inline'}
                      {std === 'C11' && 'Threads & Atomics'}
                      {std === 'C17' && 'Estándar Estable'}
                      {std === 'C23' && 'Constexpr & Nullptr'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* C++ Standard Selector */}
            <div className="bg-[#070a13] border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  Estándar de C++ Moderno
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ISO/IEC 14882</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['C++14', 'C++17', 'C++20', 'C++23'] as const).map((std) => (
                  <button
                    key={std}
                    onClick={() => handleUpdate('cppStandard', std)}
                    className={`p-2.5 rounded-lg text-xs font-mono font-semibold transition text-left flex flex-col border ${
                      config.cppStandard === std
                        ? 'bg-purple-950/80 border-purple-500/60 text-purple-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{std}</span>
                      {config.cppStandard === std && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                      {std === 'C++14' && 'Lambdas & Auto'}
                      {std === 'C++17' && 'Optional & Files'}
                      {std === 'C++20' && 'Concepts & Ranges'}
                      {std === 'C++23' && 'Print & Expected'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Optimization Level */}
          <div className="bg-[#070a13] border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-amber-400" />
                Nivel de Optimización del Compilador (-O)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">GCC / Clang Backend</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { level: 'O0', label: '-O0', desc: 'Debug rápido (Sin optimizar)' },
                { level: 'O1', label: '-O1', desc: 'Optimización ligera y rápida' },
                { level: 'O2', label: '-O2', desc: 'Producción estándar balanceado' },
                { level: 'O3', label: '-O3', desc: 'Máximo rendimiento & SIMD' },
                { level: 'Os', label: '-Os', desc: 'Mínimo tamaño de binario' },
                { level: 'Ofast', label: '-Ofast', desc: 'Velocidad extrema (Fast Math)' },
              ].map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => handleUpdate('optimizationLevel', opt.level as any)}
                  className={`p-2.5 rounded-lg text-xs transition text-center flex flex-col items-center justify-center border ${
                    config.optimizationLevel === opt.level
                      ? 'bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono font-bold text-xs">{opt.label}</span>
                  <span className="text-[9px] text-slate-400 font-sans mt-1 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Advanced Compiler Switches & Sanitizers */}
          <div className="bg-[#070a13] border border-slate-800 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400" />
              Flags de Seguridad y Rendimiento Avanzado
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Warnings Switch */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={config.enableWarnings}
                  onChange={(e) => handleUpdate('enableWarnings', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Advertencias Estrictas (-Wall -Wextra)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Emite alertas sobre conversiones con pérdida o variables no utilizadas.
                  </span>
                </div>
              </label>

              {/* Address Sanitizer */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={config.enableSanitizer}
                  onChange={(e) => handleUpdate('enableSanitizer', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">
                    AddressSanitizer (-fsanitize=address)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Intercepta accesos fuera de límites y punteros colgantes en runtime.
                  </span>
                </div>
              </label>

              {/* Link-Time Optimization (LTO) */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={config.enableLTO}
                  onChange={(e) => handleUpdate('enableLTO', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Optimización en Enlace (-flto)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Permite inlining entre múltiples archivos y elimina funciones muertas.
                  </span>
                </div>
              </label>

              {/* Fast Math */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={config.enableFastMath}
                  onChange={(e) => handleUpdate('enableFastMath', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Aceleración Matemática (-ffast-math)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Habilita optimizaciones agresivas en operaciones de punto flotante.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Live Compiler Command Preview */}
          <div className="bg-[#05070e] border border-slate-800 p-3.5 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Comando de Compilación Resultante
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="p-2 rounded bg-[#080c16] text-blue-300 border border-slate-800/80 overflow-x-auto">
                <span className="text-slate-500 select-none">$ gcc </span>
                <span>{generateGccFlags()} main.c -o app_c</span>
              </div>
              <div className="p-2 rounded bg-[#080c16] text-purple-300 border border-slate-800/80 overflow-x-auto">
                <span className="text-slate-500 select-none">$ g++ </span>
                <span>{generateGppFlags()} main.cpp -o app_cpp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#080c16] flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Valores por Defecto</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cerrar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardar y Aplicar a Compilación</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

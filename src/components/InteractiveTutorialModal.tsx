import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Code2,
  Check,
  AlertCircle,
  Lightbulb,
  Zap,
  Play,
  RotateCcw,
  Copy,
  Terminal,
  HelpCircle,
  FileCode2
} from 'lucide-react';

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCodeToEditor: (code: string) => void;
}

interface TutorialStep {
  id: number;
  title: string;
  badge: string;
  ruleTitle: string;
  explanation: string;
  keyConcepts: string[];
  initialCode: string;
  solutionCode: string;
  validationCheck: (code: string) => { isValid: boolean; message: string; hint?: string };
  cEquivalent: string;
  cppEquivalent: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: '1. La Regla del Proceso (Punto Final .)',
    badge: 'Regla Fundamental 1',
    ruleTitle: 'Cada proceso es un párrafo que termina estrictamente en un punto (.)',
    explanation:
      'En pointC, un proceso o función representa una unidad lógica completa (como una función main o una sub-rutina). Para indicar que el bloque termina y se cierra el ámbito (scope), debes colocar un punto final al término de la última instrucción.',
    keyConcepts: [
      'El punto (.) actúa como la llave de cierre "}" de la función en C/C++.',
      'Todo lo que esté antes del punto pertenece al mismo bloque de ejecución.',
      'Un archivo puede contener múltiples procesos (párrafos), cada uno finalizado en punto.'
    ],
    initialCode: `PROGRAMA principal con retorno ENTERO
Definir variable ENTERO total con valor 100,
IMPRIMIR texto "El total es: ",
IMPRIMIR total,
RETORNA 0`,
    solutionCode: `PROGRAMA principal con retorno ENTERO,
Definir variable ENTERO total con valor 100,
IMPRIMIR texto "El total es: ",
IMPRIMIR total,
RETORNA 0.`,
    validationCheck: (code: string) => {
      const trimmed = code.trim();
      if (!trimmed.endsWith('.')) {
        return {
          isValid: false,
          message: 'Falta el punto final (.) al terminar el proceso.',
          hint: 'Agrega un punto "." justo después de "RETORNA 0"'
        };
      }
      return {
        isValid: true,
        message: '¡Excelente! El compilador pointC ahora sabe exactamente dónde termina el proceso.'
      };
    },
    cEquivalent: `#include <stdio.h>

int main(void) {
    int total = 100;
    printf("El total es: ");
    printf("%d", total);
    return 0;
}`,
    cppEquivalent: `#include <iostream>

int main() {
    int total = 100;
    std::cout << "El total es: " << total;
    return 0;
}`
  },
  {
    id: 2,
    title: '2. La Regla del Sub-proceso (Comas ,)',
    badge: 'Regla Fundamental 2',
    ruleTitle: 'Cada paso o instrucción se separa por comas (,)',
    explanation:
      'Dentro de un proceso, cada operación (declaración, cálculo, llamada de función o salto) es una frase en lenguaje natural separada por una coma (,). La coma es el equivalente directo del punto y coma (;) en C/C++.',
    keyConcepts: [
      'La coma (,) encadena las instrucciones de manera fluida y secuencial.',
      'Puedes escribir varias frases en una misma línea o distribuirlas en líneas separadas.',
      'La última instrucción del párrafo NO lleva coma, sino el punto final (.).'
    ],
    initialCode: `PROGRAMA principal con retorno ENTERO
Definir variable DECIMAL radio con valor 5.5
Definir variable DECIMAL area con valor 3.1416 * radio * radio
IMPRIMIR texto "El area del circulo es: "
IMPRIMIR area
RETORNA 0.`,
    solutionCode: `PROGRAMA principal con retorno ENTERO,
Definir variable DECIMAL radio con valor 5.5,
Definir variable DECIMAL area con valor 3.1416 * radio * radio,
IMPRIMIR texto "El area del circulo es: ",
IMPRIMIR area,
RETORNA 0.`,
    validationCheck: (code: string) => {
      const commasCount = (code.match(/,/g) || []).length;
      if (commasCount < 4) {
        return {
          isValid: false,
          message: `Has colocado ${commasCount} comas. Se requieren comas al final de cada frase de instrucción.`,
          hint: 'Coloca una coma "," al final de cada instrucción antes de llegar al "RETORNA 0."'
        };
      }
      if (!code.trim().endsWith('.')) {
        return {
          isValid: false,
          message: 'No olvides mantener el punto final (.) al terminar el proceso.',
          hint: 'El final debe ser "RETORNA 0."'
        };
      }
      return {
        isValid: true,
        message: '¡Perfecto! Cada sub-proceso está correctamente delimitado por comas.'
      };
    },
    cEquivalent: `#include <stdio.h>

int main(void) {
    float radio = 5.5f;
    float area = 3.1416f * radio * radio;
    printf("El area del circulo es: ");
    printf("%f", area);
    return 0;
}`,
    cppEquivalent: `#include <iostream>

int main() {
    float radio = 5.5f;
    float area = 3.1416f * radio * radio;
    std::cout << "El area del circulo es: " << area;
    return 0;
}`
  },
  {
    id: 3,
    title: '3. Palabras Clave en MAYÚSCULAS',
    badge: 'Regla Fundamental 3',
    ruleTitle: 'Keywords y tipos van en MAYÚSCULAS para desambiguación exacta',
    explanation:
      'Para que puedas escribir prosa en español de forma natural sin confusiones, todas las entidades computacionales (tipos de datos, condicionales, bucles y gestión de memoria) se escriben en MAYÚSCULAS.',
    keyConcepts: [
      'BILINGÜE ES/EN: Puedes programar en Español (PROGRAMA, INCLUIR, ENTRADA, ENTERO) o en Inglés (PROGRAM, INCLUDE, INPUT, INTEGER).',
      'TIPOS: ENTERO / INTEGER, DECIMAL / FLOAT, TEXTO / STRING, CARACTER / CHAR, BOOLEANO / BOOL, VACIO / VOID.',
      'CONTROL: SI / IF, ENTONCES / THEN, SINO / ELSE, MIENTRAS / WHILE, PARA / FOR, RETORNA / RETURN.',
      'PAQUETES & E/S: INCLUIR / INCLUDE, ENTRADA / INPUT, IMPRIMIR / PRINT, LEER / READ.'
    ],
    initialCode: `programa principal con retorno entero,
definir variable entero edad con valor 18,
si edad es mayor o igual que 18 entonces:
  imprimir texto "Eres mayor de edad",
sino:
  imprimir texto "Eres menor de edad",
retorna 0.`,
    solutionCode: `PROGRAMA principal con retorno ENTERO,
Definir variable ENTERO edad con valor 18,
SI edad es mayor o igual que 18 ENTONCES:
  IMPRIMIR texto "Eres mayor de edad",
SINO:
  IMPRIMIR texto "Eres menor de edad",
RETORNA 0.`,
    validationCheck: (code: string) => {
      const hasProgram = code.includes('PROGRAMA') || code.includes('PROGRAM');
      const hasType = code.includes('ENTERO') || code.includes('INTEGER') || code.includes('INT');
      const hasIf = code.includes('SI') || code.includes('IF');
      const hasThen = code.includes('ENTONCES') || code.includes('THEN');
      const hasPrint = code.includes('IMPRIMIR') || code.includes('PRINT');
      const hasReturn = code.includes('RETORNA') || code.includes('RETURN');

      if (!hasProgram || !hasType || !hasIf || !hasThen || !hasPrint || !hasReturn) {
        return {
          isValid: false,
          message: 'Aún faltan keywords en MAYÚSCULAS (en español o en inglés: PROGRAMA/PROGRAM, ENTERO/INTEGER, SI/IF, ENTONCES/THEN, IMPRIMIR/PRINT, RETORNA/RETURN).',
          hint: 'Convierte las palabras clave a MAYÚSCULAS en español o inglés.'
        };
      }
      if (!code.trim().endsWith('.')) {
        return {
          isValid: false,
          message: 'Recuerda terminar con punto final (.).'
        };
      }
      return {
        isValid: true,
        message: '¡Excelente! Las palabras reservadas destacan con claridad absoluta en ambos idiomas.'
      };
    },
    cEquivalent: `#include <stdio.h>

int main(void) {
    int edad = 18;
    if (edad >= 18) {
        printf("Eres mayor de edad");
    } else {
        printf("Eres menor de edad");
    }
    return 0;
}`,
    cppEquivalent: `#include <iostream>

int main() {
    int edad = 18;
    if (edad >= 18) {
        std::cout << "Eres mayor de edad";
    } else {
        std::cout << "Eres menor de edad";
    }
    return 0;
}`
  },
  {
    id: 4,
    title: '4. Punteros y Memoria Dinámica Segura',
    badge: 'Nivel Avanzado',
    ruleTitle: 'Gestión explícita de Heap sin fugas de memoria',
    explanation:
      'pointC te permite trabajar con punteros crudos en C y smart pointers en C++ de manera descriptiva y segura, protegiendo contra punteros nulos y fugas de memoria (memory leaks).',
    keyConcepts: [
      'PUNTERO A ENTERO declara un puntero nativo (int*).',
      'ASIGNAR_MEMORIA solicita memoria dinámica en el Heap.',
      'LIBERAR limpia la memoria asignada (free / delete).',
      'SI puntero no es NULL permite verificar la validez antes de usarlo.'
    ],
    initialCode: `PROGRAMA gestion_memoria con retorno ENTERO,
Definir PUNTERO A ENTERO ptr_numero con valor ASIGNAR_MEMORIA para 1 ENTERO,
SI ptr_numero es diferente de NULL ENTONCES:
  Establecer valor apuntado por ptr_numero en 999,
  IMPRIMIR texto "Valor guardado en Heap: ",
  IMPRIMIR valor apuntado por ptr_numero,
  LIBERAR ptr_numero,
RETORNA 0.`,
    solutionCode: `PROGRAMA gestion_memoria con retorno ENTERO,
Definir PUNTERO A ENTERO ptr_numero con valor ASIGNAR_MEMORIA para 1 ENTERO,
SI ptr_numero es diferente de NULL ENTONCES:
  Establecer valor apuntado por ptr_numero en 999,
  IMPRIMIR texto "Valor guardado en Heap: ",
  IMPRIMIR valor apuntado por ptr_numero,
  LIBERAR ptr_numero,
RETORNA 0.`,
    validationCheck: (code: string) => {
      if (!code.includes('PUNTERO') || !code.includes('ASIGNAR_MEMORIA') || !code.includes('LIBERAR')) {
        return {
          isValid: false,
          message: 'Asegúrate de incluir PUNTERO, ASIGNAR_MEMORIA y LIBERAR.',
          hint: 'Usa la sintaxis completa de reserva y liberación de memoria.'
        };
      }
      return {
        isValid: true,
        message: '¡Magnífico! Has dominado la gestión de memoria en pointC.'
      };
    },
    cEquivalent: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *ptr_numero = (int *)malloc(sizeof(int));
    if (ptr_numero != NULL) {
        *ptr_numero = 999;
        printf("Valor guardado en Heap: ");
        printf("%d", *ptr_numero);
        free(ptr_numero);
    }
    return 0;
}`,
    cppEquivalent: `#include <iostream>
#include <memory>

int main() {
    auto ptr_numero = std::make_unique<int>(999);
    if (ptr_numero) {
        std::cout << "Valor guardado en Heap: " << *ptr_numero;
    }
    return 0;
}`
  }
];

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
  onLoadCodeToEditor,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    hint?: string;
  } | null>(null);
  const [showCodePreview, setShowCodePreview] = useState<'c' | 'cpp'>('c');
  const [copied, setCopied] = useState(false);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Initialize code when step changes
  useEffect(() => {
    if (step) {
      setUserCode(step.initialCode);
      setValidationResult(null);
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const handleValidate = () => {
    const result = step.validationCheck(userCode);
    setValidationResult(result);
  };

  const handleApplySolution = () => {
    setUserCode(step.solutionCode);
    setValidationResult({
      isValid: true,
      message: '¡Solución canónica aplicada! Observa cómo cumple la regla a la perfección.'
    });
  };

  const handleReset = () => {
    setUserCode(step.initialCode);
    setValidationResult(null);
  };

  const handleNextStep = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleLoadIntoStudio = () => {
    onLoadCodeToEditor(userCode);
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="bg-[#0b101c] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#080c16] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Tutorial Interactivo pointC</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  Paso {currentStepIndex + 1} de {TUTORIAL_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aprende la sintaxis de Procesos con punto, Frases con coma y Keywords en MAYÚSCULAS
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

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 bg-[#070a12] border-b border-slate-800/80 text-xs">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`py-2 px-3 text-left font-medium transition flex items-center gap-2 border-r border-slate-800/80 last:border-r-0 ${
                idx === currentStepIndex
                  ? 'bg-cyan-950/70 text-cyan-300 border-b-2 border-b-cyan-400 font-bold'
                  : idx < currentStepIndex
                  ? 'text-emerald-400 hover:bg-slate-900'
                  : 'text-slate-500 hover:bg-slate-900'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                  idx === currentStepIndex
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : idx < currentStepIndex
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {idx < currentStepIndex ? '✓' : idx + 1}
              </div>
              <span className="truncate hidden sm:inline">{s.title.split('. ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Modal Body: Split in 2 columns (Left: Theory & Rule, Right: Interactive Code Playground) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-y-auto">
          {/* Left Column: Explanation & Theory */}
          <div className="p-5 space-y-4 bg-[#090d17]/50 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {step.badge}
                </span>
                <h4 className="text-lg font-extrabold text-white mt-1.5 tracking-tight">
                  {step.ruleTitle}
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
                  {step.explanation}
                </p>
              </div>

              {/* Key concepts checklist */}
              <div className="space-y-2 bg-[#070a12] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reglas Clave a Recordar:
                </span>
                <ul className="text-xs text-slate-300 space-y-2">
                  {step.keyConcepts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Translation Equivalency Box */}
              <div className="space-y-2 bg-[#070a12] p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Equivalente en C / C++
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                    <button
                      onClick={() => setShowCodePreview('c')}
                      className={`px-2 py-0.5 rounded ${
                        showCodePreview === 'c' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      C Standard
                    </button>
                    <button
                      onClick={() => setShowCodePreview('cpp')}
                      className={`px-2 py-0.5 rounded ${
                        showCodePreview === 'cpp' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      C++20
                    </button>
                  </div>
                </div>

                <pre className="text-[11px] font-mono p-2.5 rounded-lg bg-[#05070d] text-slate-300 overflow-x-auto border border-slate-800/80 leading-snug">
                  {showCodePreview === 'c' ? step.cEquivalent : step.cppEquivalent}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Edita el código en el panel derecho y pulsa "Validar Código".</span>
            </div>
          </div>

          {/* Right Column: Interactive Playground & Validator */}
          <div className="p-5 flex flex-col justify-between bg-[#0b101c] space-y-4">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Editor de Práctica pointC
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleReset}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] flex items-center gap-1 transition"
                    title="Restablecer código de inicio"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reiniciar</span>
                  </button>
                  <button
                    onClick={handleApplySolution}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium transition"
                  >
                    Ver Solución
                  </button>
                </div>
              </div>

              {/* Code Textarea Playground */}
              <div className="relative flex-1 min-h-[220px]">
                <textarea
                  value={userCode}
                  onChange={(e) => {
                    setUserCode(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Escribe tu código pointC aquí..."
                  className="w-full h-full min-h-[220px] bg-[#060810] border border-slate-700/80 focus:border-cyan-400 rounded-xl p-3.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
                  spellCheck={false}
                />
              </div>

              {/* Validation Result Box */}
              {validationResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                    validationResult.isValid
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {validationResult.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{validationResult.message}</p>
                    {validationResult.hint && (
                      <p className="text-[11px] text-slate-300 opacity-90">
                        💡 Pista: {validationResult.hint}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Playground Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex gap-2">
                <button
                  onClick={handleValidate}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Validar Código</span>
                </button>

                <button
                  onClick={handleLoadIntoStudio}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                  title="Cargar este código directamente en tu editor principal"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Probar en IDE</span>
                </button>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStepIndex(i)}
                      className={`w-2 h-2 rounded-full transition ${
                        i === currentStepIndex ? 'bg-cyan-400 w-4' : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                {currentStepIndex < TUTORIAL_STEPS.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleLoadIntoStudio}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Comenzar a Programar!</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { POINTC_KEYWORDS } from './pointcParser';

export type TokenType =
  | 'package'
  | 'type'
  | 'memory'
  | 'control'
  | 'struct'
  | 'io'
  | 'keyword'
  | 'string'
  | 'number'
  | 'period'
  | 'comma'
  | 'operator'
  | 'comment'
  | 'text';

export interface Token {
  type: TokenType;
  value: string;
}

const PACKAGE_KEYWORDS = new Set([
  'INCLUIR', 'INCLUDE',
  'INCLUYE', 'INCLUDES',
  'PAQUETE', 'PACKAGE',
  'USAR', 'USE'
]);

const TYPE_KEYWORDS = new Set([
  'ENTERO', 'INTEGER', 'INT',
  'ENTERO_CORTO', 'SHORT',
  'ENTERO_LARGO', 'LONG',
  'ENTERO_SIN_SIGNO', 'UNSIGNED',
  'DECIMAL', 'FLOAT',
  'DECIMAL_DOBLE', 'DOUBLE',
  'CARACTER', 'CHAR',
  'TEXTO', 'CADENA', 'STRING', 'TEXT',
  'BOOLEANO', 'BOOLEAN', 'BOOL',
  'VACIO', 'VOID',
  'AUTO'
]);

const MEMORY_KEYWORDS = new Set([
  'PUNTERO', 'POINTER',
  'REFERENCIA', 'REFERENCE',
  'DIRECCION', 'ADDRESS',
  'MEMORIA', 'MEMORY',
  'MEMORIA_DINAMICA', 'DYNAMIC_MEMORY',
  'ASIGNAR_MEMORIA', 'ALLOCATE_MEMORY', 'ALLOCATE',
  'REASIGNAR_MEMORIA', 'REALLOCATE_MEMORY', 'REALLOCATE',
  'LIBERAR', 'FREE', 'RELEASE',
  'TAMANIO_DE', 'SIZEOF', 'SIZE_OF',
  'NULL', 'NULO', 'NIL'
]);

const CONTROL_KEYWORDS = new Set([
  'SI', 'IF',
  'ENTONCES', 'THEN',
  'SINO', 'ELSE',
  'SINO_SI', 'ELSE_IF',
  'MIENTRAS', 'WHILE',
  'PARA', 'FOR',
  'CADA', 'EACH',
  'DESDE', 'FROM',
  'HASTA', 'TO', 'UNTIL',
  'CON_PASO', 'STEP', 'WITH_STEP',
  'HACER', 'DO',
  'SEGUN', 'SWITCH',
  'CASO', 'CASE',
  'POR_DEFECTO', 'DEFAULT',
  'ROMPER', 'BREAK',
  'CONTINUAR', 'CONTINUE',
  'RETORNA', 'RETURN', 'RETURNS'
]);

const STRUCT_KEYWORDS = new Set([
  'PROGRAMA', 'PROGRAM',
  'FUNCION', 'FUNCTION',
  'PARAMETRO', 'PARAMETER',
  'PARAMETROS', 'PARAMETERS',
  'ESTRUCTURA', 'STRUCT', 'STRUCTURE',
  'UNION',
  'ENUMERACION', 'ENUM', 'ENUMERATION',
  'CLASE', 'CLASS',
  'PUBLICO', 'PUBLIC',
  'PRIVADO', 'PRIVATE',
  'PROTEGIDO', 'PROTECTED',
  'METODO', 'METHOD',
  'CONSTRUCTOR',
  'DESTRUCTOR',
  'HEREDA', 'INHERITS',
  'VIRTUAL',
  'PLANTILLA', 'TEMPLATE',
  'VECTOR',
  'ARREGLO', 'ARRAY',
  'MATRIZ', 'MATRIX',
  'LISTA', 'LIST',
  'PILA', 'STACK',
  'COLA', 'QUEUE',
  'MAPA', 'MAP',
  'SET'
]);

const IO_KEYWORDS = new Set([
  'ENTRADA', 'INPUT', 'ENTRY',
  'MOSTRAR', 'SHOW', 'DISPLAY',
  'IMPRIMIR', 'PRINT',
  'IMPRIMIR_FORMATO', 'PRINTF', 'PRINT_FORMAT',
  'LEER', 'READ', 'SCAN',
  'LEER_LINEA', 'READ_LINE',
  'ARCHIVO', 'FILE',
  'ABRIR_ARCHIVO', 'OPEN_FILE',
  'CERRAR_ARCHIVO', 'CLOSE_FILE',
  'HILO', 'THREAD',
  'MUTEX',
  'BLOQUEAR', 'LOCK',
  'DESBLOQUEAR', 'UNLOCK',
  'ASINCRONO', 'ASYNC',
  'ESPERAR', 'WAIT', 'AWAIT',
  'CONSTANTE', 'CONSTANT', 'CONST',
  'ESTATICO', 'STATIC',
  'VOLATIL', 'VOLATILE',
  'EN_LINEA', 'INLINE',
  'VERDADERO', 'TRUE',
  'FALSO', 'FALSE'
]);

export function tokenizePointC(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const char = code[i];

    // Check strings "..."
    if (char === '"') {
      let str = '"';
      i++;
      while (i < len && code[i] !== '"') {
        if (code[i] === '\\' && i + 1 < len) {
          str += code[i] + code[i + 1];
          i += 2;
        } else {
          str += code[i];
          i++;
        }
      }
      if (i < len) {
        str += '"';
        i++;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Check comments // or /*
    if (char === '/' && code[i + 1] === '/') {
      let comment = '';
      while (i < len && code[i] !== '\n') {
        comment += code[i];
        i++;
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    // Check period (End of process/paragraph in pointC)
    if (char === '.') {
      tokens.push({ type: 'period', value: '.' });
      i++;
      continue;
    }

    // Check comma (Sentence / sub-process separator)
    if (char === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
      continue;
    }

    // Check numbers
    if (/\d/.test(char) && (i === 0 || /[\s,.(+\-*/=]/.test(code[i - 1]))) {
      let num = '';
      while (i < len && /[0-9a-fA-FxX.]/.test(code[i])) {
        num += code[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // Check words / identifiers / keywords
    if (/[a-zA-Z_áéíóúÁÉÍÓÚñÑ]/.test(char)) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]/.test(code[i])) {
        word += code[i];
        i++;
      }

      if (PACKAGE_KEYWORDS.has(word)) {
        tokens.push({ type: 'package', value: word });
      } else if (TYPE_KEYWORDS.has(word)) {
        tokens.push({ type: 'type', value: word });
      } else if (MEMORY_KEYWORDS.has(word)) {
        tokens.push({ type: 'memory', value: word });
      } else if (CONTROL_KEYWORDS.has(word)) {
        tokens.push({ type: 'control', value: word });
      } else if (STRUCT_KEYWORDS.has(word)) {
        tokens.push({ type: 'struct', value: word });
      } else if (IO_KEYWORDS.has(word)) {
        tokens.push({ type: 'io', value: word });
      } else if (POINTC_KEYWORDS.includes(word as any)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      continue;
    }

    // Other characters (whitespace, operators, brackets)
    tokens.push({ type: 'text', value: char });
    i++;
  }

  return tokens;
}

export const TOKEN_STYLE_MAP: Record<TokenType, string> = {
  package: 'text-cyan-300 font-extrabold tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.45)] bg-cyan-950/40 px-0.5 rounded',
  type: 'text-sky-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]',
  memory: 'text-emerald-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]',
  control: 'text-purple-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(192,132,252,0.35)]',
  struct: 'text-rose-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(251,113,133,0.35)]',
  io: 'text-amber-300 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(252,211,77,0.35)]',
  keyword: 'text-indigo-300 font-bold',
  string: 'text-teal-200 bg-teal-950/40 px-0.5 rounded font-medium',
  number: 'text-amber-300 font-mono font-semibold',
  period: 'text-cyan-300 font-black bg-cyan-500/20 px-1 py-0.2 rounded ring-1 ring-cyan-400/40 inline-block',
  comma: 'text-amber-400 font-black bg-amber-500/20 px-0.5 rounded inline-block',
  operator: 'text-slate-400',
  comment: 'text-slate-500 italic',
  text: 'text-slate-200'
};

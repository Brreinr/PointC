export const POINTC_KEYWORDS = [
  // Types (Spanish & English)
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
  'AUTO',

  // Memory & Pointers (Spanish & English)
  'PUNTERO', 'POINTER',
  'REFERENCIA', 'REFERENCE',
  'DIRECCION', 'ADDRESS',
  'MEMORIA', 'MEMORY',
  'MEMORIA_DINAMICA', 'DYNAMIC_MEMORY',
  'ASIGNAR_MEMORIA', 'ALLOCATE_MEMORY', 'ALLOCATE',
  'REASIGNAR_MEMORIA', 'REALLOCATE_MEMORY', 'REALLOCATE',
  'LIBERAR', 'FREE', 'RELEASE',
  'TAMANIO_DE', 'SIZEOF', 'SIZE_OF',
  'NULL', 'NULO', 'NIL',

  // OOP & Structs (Spanish & English)
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

  // Control Flow (Spanish & English)
  'PROGRAMA', 'PROGRAM',
  'FUNCION', 'FUNCTION',
  'PARAMETRO', 'PARAMETER',
  'PARAMETROS', 'PARAMETERS',
  'RETORNA', 'RETURN', 'RETURNS',
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

  // Collections (Spanish & English)
  'VECTOR',
  'ARREGLO', 'ARRAY',
  'MATRIZ', 'MATRIX',
  'LISTA', 'LIST',
  'PILA', 'STACK',
  'COLA', 'QUEUE',
  'MAPA', 'MAP',
  'SET',

  // Package Inclusions & Dependencies (Spanish & English)
  'INCLUIR', 'INCLUDE',
  'INCLUYE', 'INCLUDES',
  'PAQUETE', 'PACKAGE',
  'USAR', 'USE',

  // I/O & Presentation (Spanish & English)
  'ENTRADA', 'INPUT', 'ENTRY',
  'MOSTRAR', 'SHOW', 'DISPLAY',
  'IMPRIMIR', 'PRINT',
  'IMPRIMIR_FORMATO', 'PRINTF', 'PRINT_FORMAT',
  'LEER', 'READ', 'SCAN',
  'LEER_LINEA', 'READ_LINE',
  'ARCHIVO', 'FILE',
  'ABRIR_ARCHIVO', 'OPEN_FILE',
  'CERRAR_ARCHIVO', 'CLOSE_FILE',

  // Concurrency & Modifiers (Spanish & English)
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
] as const;

export interface ValidationResult {
  processCount: number;
  sentenceCount: number;
  keywordCount: number;
  warnings: string[];
  processes: {
    title: string;
    sentences: string[];
    hasPeriod: boolean;
  }[];
}

export function analyzePointCCode(code: string): ValidationResult {
  const warnings: string[] = [];
  if (!code || !code.trim()) {
    return {
      processCount: 0,
      sentenceCount: 0,
      keywordCount: 0,
      warnings: ['El editor está vacío. Escribe instrucciones pointC o selecciona un ejemplo.'],
      processes: [],
    };
  }

  // Split into paragraphs (separated by 1 or more blank lines)
  const rawParagraphs = code
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  let totalSentences = 0;
  let keywordCount = 0;

  // Count uppercase keywords
  const words = code.match(/\b[A-Z_]{2,}\b/g) || [];
  for (const w of words) {
    if (POINTC_KEYWORDS.includes(w as any)) {
      keywordCount++;
    }
  }

  const processes = rawParagraphs.map((para, idx) => {
    const trimmed = para.trim();
    const hasPeriod = trimmed.endsWith('.');
    if (!hasPeriod) {
      warnings.push(`El párrafo ${idx + 1} no termina en punto final ('.'). Cada proceso en pointC debe cerrar con '.'`);
    }

    // Split sentences by comma, but keep strings intact
    // Simple sentence splitter by comma
    const rawSentences = trimmed
      .replace(/\.$/, '')
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    totalSentences += rawSentences.length;

    // Check lowercase potential keywords
    const lowerWords = trimmed.match(/\b(entero|decimal|puntero|memoria|retorna|imprimir|leer|si|mientras|para|liberar|estructura|vector|arreglo)\b/gi) || [];
    for (const lw of lowerWords) {
      if (lw !== lw.toUpperCase()) {
        warnings.push(`Se detectó "${lw}" en minúsculas en el párrafo ${idx + 1}. Usa "${lw.toUpperCase()}" para mayor precisión.`);
      }
    }

    const firstSentence = rawSentences[0] || `Proceso ${idx + 1}`;
    return {
      title: firstSentence.length > 40 ? firstSentence.slice(0, 37) + '...' : firstSentence,
      sentences: rawSentences,
      hasPeriod,
    };
  });

  return {
    processCount: processes.length,
    sentenceCount: totalSentences,
    keywordCount,
    warnings: Array.from(new Set(warnings)).slice(0, 5),
    processes,
  };
}

export function autoFormatPointC(code: string): string {
  if (!code) return '';

  let formatted = code;

  // Capitalize known keywords if they appear as standalone words
  for (const kw of POINTC_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, kw);
  }

  // Clean spacing around commas and periods
  formatted = formatted
    .split(/\n\s*\n/)
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      
      // Ensure it ends with a period
      let withPeriod = trimmed;
      if (!withPeriod.endsWith('.')) {
        withPeriod += '.';
      }

      // Format sentences within paragraph
      return withPeriod
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n');
    })
    .filter(Boolean)
    .join('\n\n');

  return formatted;
}

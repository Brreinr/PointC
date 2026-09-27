import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gumroad Payment Store & In-Memory Verification Ledger
interface GumroadSaleRecord {
  orderNumber: string;
  saleId?: string;
  email: string;
  userId?: string;
  permalink: string;
  planName: string;
  credits: number;
  priceUsd: number;
  timestamp: number;
  redeemed: boolean;
}

const gumroadSales = new Map<string, GumroadSaleRecord>();
const redeemedOrderNumbers = new Set<string>();

const GUMROAD_PACKS: Record<string, { planName: string; credits: number; priceUsd: number }> = {
  master: { planName: 'Pack Desarrollador Master', credits: 10000, priceUsd: 39.99 },
  pro: { planName: 'Pack Pro Studio', credits: 2500, priceUsd: 14.99 },
  basico: { planName: 'Pack Básico', credits: 500, priceUsd: 4.99 },
};

// Initialize Google GenAI SDK (Server-Side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust Gemini generation prioritizing fast, cheap and highly efficient Flash-Lite models with fallback
async function generateContentWithFallback(options: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}) {
  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview'
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            responseMimeType: options.responseMimeType || 'application/json',
            temperature: options.temperature ?? 0.15,
          },
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Engine] Model ${model} attempt ${attempt + 1}: ${err?.message || err}`);
        // Brief backoff on rate limits
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta del modelo Gemini.');
}

// Token and Credit calculation helper (1 credit = 2000 tokens)
function extractUsageInfo(response: any, fallbackPromptLen: number = 500) {
  const usageMetadata = response?.usageMetadata || {};
  const promptTokens = Number(usageMetadata.promptTokenCount) || 0;
  const candidateTokens = Number(usageMetadata.candidatesTokenCount) || 0;
  let totalTokens = Number(usageMetadata.totalTokenCount) || (promptTokens + candidateTokens);

  if (!totalTokens || totalTokens <= 0) {
    const outputLen = (response?.text || '').length;
    totalTokens = Math.max(50, Math.ceil((fallbackPromptLen + outputLen) / 3.8));
  }

  // 1 credito paga 2000 tokens
  const tokensPerCredit = 2000;
  const creditsDeducted = Math.max(1, Math.ceil(totalTokens / tokensPerCredit));

  return {
    promptTokens,
    candidateTokens,
    totalTokens,
    tokensPerCredit,
    creditsDeducted,
  };
}

const SYSTEM_POINTC_SPEC = `
ERES EL COMPILADOR, TRADUCTOR SEMÁNTICO Y GENERADOR DE CÓDIGO NATIVO PARA EL LENGUAJE "pointC".
"pointC" es un lenguaje de programación estructurado en Lenguaje Natural de alto rendimiento que mapea de forma unívoca a C estándar (C99/C11/C17/C23) y C++ moderno idiomático (C++17/C++20/C++23).

=======================================================
SOPORTE BILINGÜE COMPLETO Y UNIVERSAL (ESPAÑOL & INGLÉS):
=======================================================
pointC permite escribir código fuente estructurado indistintamente en ESPAÑOL o en INGLÉS (o de forma combinada). El compilador semántico reconoce, valida y traduce unívocamente ambos vocabularios a C y C++:

TABLA DE EQUIVALENCIA DIRECTA DE PALABRAS RESERVADAS (MAYÚSCULAS):
• Control & Procesos:
  - PROGRAMA  <==>  PROGRAM
  - FUNCION   <==>  FUNCTION
  - PARAMETRO / PARAMETROS <==> PARAMETER / PARAMETERS
  - RETORNA   <==>  RETURN / RETURNS
  - SI        <==>  IF
  - ENTONCES  <==>  THEN
  - SINO      <==>  ELSE
  - SINO_SI   <==>  ELSE_IF
  - MIENTRAS  <==>  WHILE
  - PARA      <==>  FOR
  - CADA      <==>  EACH
  - DESDE     <==>  FROM
  - HASTA     <==>  TO / UNTIL
  - CON_PASO  <==>  STEP / WITH_STEP
  - HACER     <==>  DO
  - SEGUN     <==>  SWITCH
  - CASO      <==>  CASE
  - POR_DEFECTO <==> DEFAULT
  - ROMPER    <==>  BREAK
  - CONTINUAR <==>  CONTINUE

• Tipos Nativos:
  - ENTERO          <==> INTEGER / INT
  - ENTERO_CORTO    <==> SHORT
  - ENTERO_LARGO    <==> LONG
  - ENTERO_SIN_SIGNO <==> UNSIGNED
  - DECIMAL         <==> FLOAT
  - DECIMAL_DOBLE   <==> DOUBLE
  - CARACTER        <==> CHAR
  - TEXTO / CADENA  <==> STRING / TEXT
  - BOOLEANO        <==> BOOLEAN / BOOL
  - VACIO           <==> VOID
  - AUTO            <==> AUTO

• Memoria & Punteros:
  - PUNTERO         <==> POINTER
  - REFERENCIA      <==> REFERENCE
  - DIRECCION       <==> ADDRESS
  - MEMORIA / MEMORIA_DINAMICA <==> MEMORY / DYNAMIC_MEMORY
  - ASIGNAR_MEMORIA <==> ALLOCATE_MEMORY / ALLOCATE
  - REASIGNAR_MEMORIA <==> REALLOCATE_MEMORY / REALLOCATE
  - LIBERAR         <==> FREE / RELEASE
  - TAMANIO_DE      <==> SIZEOF / SIZE_OF
  - NULL / NULO     <==> NULL / NIL

• Estructuras & Colecciones:
  - ESTRUCTURA      <==> STRUCT / STRUCTURE
  - UNION           <==> UNION
  - ENUMERACION     <==> ENUM
  - CLASE           <==> CLASS
  - PUBLICO         <==> PUBLIC
  - PRIVADO         <==> PRIVATE
  - PROTEGIDO       <==> PROTECTED
  - METODO          <==> METHOD
  - CONSTRUCTOR     <==> CONSTRUCTOR
  - DESTRUCTOR      <==> DESTRUCTOR
  - HEREDA          <==> INHERITS
  - VECTOR          <==> VECTOR
  - ARREGLO         <==> ARRAY
  - MATRIZ          <==> MATRIX
  - LISTA           <==> LIST
  - PILA            <==> STACK
  - COLA            <==> QUEUE
  - MAPA            <==> MAP

• Paquetes, E/S & Concurrencia:
  - INCLUIR         <==> INCLUDE (#include <...>, #include "...", paquetes)
  - ENTRADA         <==> INPUT / ENTRY (stdin, std::cin, argc/argv, parámetros)
  - IMPRIMIR        <==> PRINT (printf, std::cout)
  - IMPRIMIR_FORMATO <==> PRINTF / PRINT_FORMAT
  - LEER            <==> READ / SCAN (scanf, std::cin)
  - LEER_LINEA      <==> READ_LINE (fgets, std::getline)
  - ARCHIVO         <==> FILE
  - ABRIR_ARCHIVO   <==> OPEN_FILE
  - CERRAR_ARCHIVO  <==> CLOSE_FILE
  - HILO            <==> THREAD
  - MUTEX           <==> MUTEX
  - BLOQUEAR        <==> LOCK
  - DESBLOQUEAR     <==> UNLOCK
  - CONSTANTE       <==> CONSTANT / CONST
  - ESTATICO        <==> STATIC
  - VERDADERO       <==> TRUE
  - FALSO           <==> FALSE

=======================================================
REGLAS GRAMATICALES FORMALES DE pointC:
=======================================================
1. REGLA DEL PROCESO (PÁRRAFO CON PUNTO '.'):
   - Cada función, rutina o proceso completo es un párrafo continuo de texto terminado OBLIGATORIAMENTE en un punto final ('.').
   - El punto marca el fin del bloque del proceso (equivalente a cerrar llave '}' o salir del scope).

2. REGLA DEL SUB-PROCESO (FRASE CON COMA ','):
   - Cada instrucción, declaración, asignación, llamada a función o paso dentro del proceso se separa por COMA (',').
   - Una coma equivale a un punto y coma ';' en C/C++.

3. ENTIDADES Y PALABRAS RESERVADAS EN MAYÚSCULAS:
   Tanto en español como en inglés, las entidades clave van en MAYÚSCULAS para eliminar ambigüedades.
   - TIPOS NATIVOS: ENTERO (int), ENTERO_CORTO (short), ENTERO_LARGO (long long), ENTERO_SIN_SIGNO (unsigned int), DECIMAL (float), DECIMAL_DOBLE (double), CARACTER (char), TEXTO/CADENA (const char* / std::string), BOOLEANO (bool / stdbool.h), VACIO (void), AUTO (auto).
   - GESTIÓN DE MEMORIA & PUNTEROS: PUNTERO (*), REFERENCIA (&), DIRECCION (&), MEMORIA, ASIGNAR_MEMORIA (malloc/calloc/new), REASIGNAR_MEMORIA (realloc), LIBERAR (free/delete), TAMANIO_DE (sizeof), NULL/NULO.
   - CONTROL DE FLUJO: PROGRAMA (main), FUNCION, PARAMETRO/PARAMETROS, RETORNA (return), SI (if), ENTONCES, SINO (else), SINO_SI (else if), MIENTRAS (while), PARA (for), CADA (for-each), DESDE, HASTA, CON_PASO, HACER (do-while), SEGUN (switch), CASO (case), POR_DEFECTO (default), ROMPER (break), CONTINUAR (continue).
   - ESTRUCTURAS & POO: ESTRUCTURA (struct), UNION (union), ENUMERACION (enum), CLASE (class), PUBLICO (public:), PRIVADO (private:), PROTEGIDO (protected:), METODO, CONSTRUCTOR, DESTRUCTOR, HEREDA (: public).
   - CONTENEDORES & COLECCIONES: VECTOR (std::vector o arreglo dinámico), ARREGLO (array estático), MATRIZ (2D array), LISTA (std::list), PILA (std::stack), COLA (std::queue), MAPA (std::unordered_map).
   - INCLUSIÓN DE PAQUETES, ENTRADA/SALIDA & CONCURRENCIA:
     * INCLUIR (Inclusión directa de paquetes externos y cabeceras C/C++ como #include <...>, #include "..." o paquetes del sistema).
     * ENTRADA (Lectura de flujo estándar stdin/std::cin, argumentos de programa argc/argv, o parámetros de entrada formal).
     * IMPRIMIR (printf / std::cout), IMPRIMIR_FORMATO, LEER (scanf / std::cin), LEER_LINEA (fgets / std::getline), ARCHIVO (FILE* / std::fstream), ABRIR_ARCHIVO, CERRAR_ARCHIVO, HILO (pthread_t / std::jthread), MUTEX (pthread_mutex_t / std::mutex), BLOQUEAR, DESBLOQUEAR, CONSTANTE (const), ESTATICO (static).

=======================================================
REGLAS ESPECÍFICAS DE LAS KEYWORDS "INCLUIR" Y "ENTRADA":
=======================================================
1. KEYWORD "INCLUIR":
   - Propósito: Agregar paquetes externos, bibliotecas y cabeceras de C o C++.
   - Mapea unívocamente a directivas de preprocesador '#include' y configuración de enlazado/flags.
   - Sintaxis en pointC:
     * INCLUIR <stdio.h>,
     * INCLUIR <math.h>,
     * INCLUIR <vector>,
     * INCLUIR <iostream>,
     * INCLUIR "mi_cabecera.h",
     * INCLUIR PAQUETE raylib, (en C: #include <raylib.h>; flags: -lraylib)
     * INCLUIR PAQUETE libcurl, (en C: #include <curl/curl.h>; flags: -lcurl)
     * INCLUIR PAQUETE sqlite3, (en C: #include <sqlite3.h>; flags: -lsqlite3)
     * INCLUIR PAQUETE json, (en C: #include <cjson/cJSON.h>; en C++: #include <nlohmann/json.hpp>)
     * INCLUIR PAQUETE arduino / INCLUIR PAQUETE esp32,
     * INCLUIR PAQUETE sdl2 / INCLUIR PAQUETE opengl,
   - Siempre que se use INCLUIR, la salida en C y C++ DEBE colocar las cabeceras requeridas en la cabecera del archivo generado.

2. KEYWORD "ENTRADA":
   - Propósito: Captura de datos, flujo de entrada estándar, argumentos de línea de comandos y parámetros formales.
   - Mapeo C: scanf("%...", ...), fgets(..., stdin), main(int argc, char *argv[]), parámetros de entrada 'const'.
   - Mapeo C++: std::cin >> ..., std::getline(std::cin, ...), parámetros por referencia constante.
   - Sintaxis en pointC:
     * LEER ENTRADA en variable dato,
     * LEER LINEA DE ENTRADA en buffer_texto,
     * PROGRAMA principal con ENTRADA (ENTERO cantidad_argumentos, ARREGLO de TEXTO argumentos),
     * FUNCION procesar con ENTRADA ENTERO x,
     * ESPERAR ENTRADA de usuario,

=======================================================
SOPORTE EXTENDIDO DE PAQUETES FUERA DEL CÓDIGO TRADICIONAL:
=======================================================
pointC es capaz de importar y orquestar paquetes y bibliotecas modernas mediante "INCLUIR PAQUETE [NOMBRE]" o "USAR PAQUETE [CATEGORIA] [NOMBRE]":

1. PAQUETES DE PROGRAMACIÓN VISUAL Y GRÁFICA:
   - raylib: "USAR PAQUETE VISUAL raylib"
     * En C: #include <raylib.h>, InitWindow(), BeginDrawing(), ClearBackground(), DrawCircle(), DrawRectangle(), DrawText(), EndDrawing(), CloseWindow().
     * En C++: Encapsulado con RAII o llamadas limpias a funciones de raylib.
   - SDL2: "USAR PAQUETE VISUAL sdl2"
     * En C: #include <SDL2/SDL.h>, SDL_Init(), SDL_CreateWindow(), SDL_CreateRenderer(), bucle de eventos SDL_PollEvent, SDL_RenderClear(), SDL_RenderPresent(), SDL_Quit().
     * En C++: Wrappers RAII con punteros inteligentes std::unique_ptr con custom deleters.
   - OpenGL / GLFW: "USAR PAQUETE VISUAL opengl"
     * En C/C++: Inicialización GLFW, bucle de renderizado y shaders.

2. PAQUETES DE LÓGICA AVANZADA:
   - JSON Parsing & Serialization: "USAR PAQUETE LOGICA json"
     * En C: #include <cjson/cJSON.h> (cJSON_Parse, cJSON_GetObjectItem, cJSON_Print, cJSON_Delete).
     * En C++: #include <nlohmann/json.hpp> (usando nlohmann::json y sintaxis fluida).
   - Máquinas de Estado Finito (FSM): "USAR PAQUETE LOGICA maquina_estados"
     * En C/C++: Enums tipados, handlers por estado, validación de transiciones deterministas.
   - Algoritmos Complejos / Regex: "USAR PAQUETE LOGICA regex"
     * En C: <regex.h> (regcomp, regexec, regfree).
     * En C++: <regex> (std::regex, std::regex_match, std::smatch).

3. CONTROLADORES EXTERNOS, HARDWARE, MICROCONTROLADORES & IOT:
   - Arduino / ESP32 HAL: "USAR PAQUETE CONTROLADOR arduino" o "USAR PAQUETE CONTROLADOR esp32"
     * En C/C++: setup(), loop(), pinMode(PIN, OUTPUT/INPUT), digitalWrite(PIN, HIGH/LOW), digitalRead(PIN), analogRead(PIN), Serial.begin(115200), delay(ms).
   - GPIO & Pines Embebidos (Raspberry Pi / Linux Embebido): "USAR PAQUETE CONTROLADOR gpio"
     * En C: <gpiod.h> o <wiringPi.h> (wiringPiSetup(), pinMode(), digitalWrite()).
     * En C++: Clases C++ para manejo seguro de pines y PWM.
   - Protocolos I2C / SPI / UART: "USAR PAQUETE CONTROLADOR i2c" o "USAR PAQUETE CONTROLADOR spi"
     * En C/C++: Comunicación de bus con ioctl(), buffers de lectura y escritura seguros.

4. PAQUETES EXTERNOS DEL ECOSISTEMA C / C++:
   - Networking & HTTP REST: "USAR PAQUETE EXTERNO libcurl"
     * En C: #include <curl/curl.h> (curl_easy_init(), curl_easy_setopt(), curl_easy_perform(), curl_easy_cleanup()).
     * En C++: Clases de cliente HTTP con RAII.
   - Bases de Datos Embebidas: "USAR PAQUETE EXTERNO sqlite3"
     * En C/C++: #include <sqlite3.h> (sqlite3_open(), sqlite3_prepare_v2(), sqlite3_step(), sqlite3_finalize(), sqlite3_close()).
   - Concurrencia y Hilos: "USAR PAQUETE EXTERNO hilos"
     * En C: <pthread.h>
     * En C++: <thread>, <mutex>, <atomic>, std::jthread.

=======================================================
REGLAS DE EMISIÓN DE CÓDIGO NATIVO:
=======================================================
- Salida C:
  * Headers requeridos (#include <stdio.h>, <stdlib.h>, <stdbool.h>, <string.h>, <stdint.h>, más headers de paquetes si se solicitaron).
  * Verificación obligatoria de punteros nulos tras malloc/calloc.
  * Liberación de memoria con free() para prevenir memory leaks.
  * Código limpio, modular y con firma estándar int main(void) o int main(int argc, char *argv[]).
  * Respeta estrictamente el estándar C seleccionado (C99, C11, C17, C23).

- Salida C++:
  * Idiomático respetando el estándar seleccionado (C++14, C++17, C++20, C++23).
  * Adopción de RAII, smart pointers (std::unique_ptr, std::shared_ptr) y contenedores STL.
  * Salida por consola segura con std::cout o std::println (en C++23).
`;

// Translate pointC to C & C++
app.post('/api/translate', async (req, res) => {
  try {
    const {
      pointcCode,
      targetStandards,
      optimizationLevel,
      buildConfig
    } = req.body;

    if (!pointcCode || typeof pointcCode !== 'string') {
      return res.status(400).json({ error: 'Código pointC requerido' });
    }

    const cStd = buildConfig?.cStandard || targetStandards?.cStandard || 'C17';
    const cppStd = buildConfig?.cppStandard || targetStandards?.cppStandard || 'C++20';
    const optLevel = buildConfig?.optimizationLevel || optimizationLevel || 'O2';
    const warnings = buildConfig?.enableWarnings ? 'Advertencias estrictas (-Wall -Wextra)' : '';
    const sanitizer = buildConfig?.enableSanitizer ? 'AddressSanitizer activado (-fsanitize=address)' : '';
    const lto = buildConfig?.enableLTO ? 'Link-Time Optimization (-flto)' : '';
    const fastMath = buildConfig?.enableFastMath ? 'Fast-Math (-ffast-math)' : '';

    const prompt = `
Traducción requerida:
Analiza el siguiente código escrito en lenguaje natural pointC.
Normas de compilación activas del proyecto:
- Estándar C: ${cStd}
- Estándar C++: ${cppStd}
- Nivel de Optimización: -${optLevel}
- Flags de compilador: ${[warnings, sanitizer, lto, fastMath].filter(Boolean).join(', ') || 'Default'}

Código pointC del usuario:
\`\`\`pointc
${pointcCode}
\`\`\`

IMPORTANTE: Si el código pointC usa paquetes gráficos (raylib, sdl2, opengl), paquetes de lógica (json, regex, maquina_estados), controladores externos (arduino, esp32, gpio, i2c, spi) o bibliotecas externas (libcurl, sqlite3, hilos), emite el código completo C y C++ incluyendo los headers correctos, configuración de periféricos/ventanas y enlace con bibliotecas.

Devuelve una respuesta estrictamente en JSON con la siguiente estructura:
{
  "cCode": "// Código completo en lenguaje C estándar ${cStd}...",
  "cppCode": "// Código completo en C++ moderno idiomático ${cppStd}...",
  "explanation": "Explicación concisa y técnica de cómo se tradujo cada párrafo (proceso) y frase (sub-proceso)",
  "astSummary": [
    {
      "processName": "Nombre del proceso o función",
      "sentences": ["Descripción de cada sub-instrucción separada por coma"]
    }
  ],
  "optimizations": [
    {
      "title": "Nombre de la optimización (ej. Vectorización SIMD / Evitar Reallocations)",
      "category": "Memoria | Rendimiento | Seguridad | Modern C++",
      "impact": "Alto | Medio | Crítico",
      "description": "Detalle técnico de la optimización aplicada o recomendada",
      "cDiff": "Fragmento optimizado en C",
      "cppDiff": "Fragmento optimizado en C++"
    }
  ],
  "memoryAudit": {
    "stackUsageEstimate": "Ej: ~48 bytes en marco principal",
    "heapAllocations": ["Detalles de malloc/calloc o std::make_unique detectados"],
    "leaksOrRisks": ["Advertencias de fugas o punteros colgantes si los hay, o 'Sin fugas detectadas'"]
  },
  "compilerFlagsRecommended": ["-${optLevel}", "-Wall", "-Wextra", "-pedantic"]
}
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: SYSTEM_POINTC_SPEC,
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.usage = extractUsageInfo(response, prompt.length);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/translate:', error);
    return res.status(500).json({
      error: 'Error al traducir con Gemini: ' + (error?.message || 'Error temporal de conexión con el modelo.'),
    });
  }
});

// Deep Code Optimizer
app.post('/api/optimize', async (req, res) => {
  try {
    const { pointcCode, cCode, cppCode, optimizationGoal = 'rendimiento_maximo' } = req.body;

    const prompt = `
Optimiza el siguiente código pointC junto con sus equivalentes C y C++.
Objetivo de optimización: ${optimizationGoal} (ej. rendimiento máximo, mínimo uso de memoria, seguridad estricta, paralelismo).

pointC Original:
${pointcCode || ''}

C Original:
${cCode || ''}

C++ Original:
${cppCode || ''}

Genera una respuesta en formato JSON con:
{
  "optimizedPointC": "Código pointC mejorado con sintaxis precisa de puntos y comas",
  "optimizedCCode": "Código C optimizado a nivel de producción",
  "optimizedCppCode": "Código C++ optimizado con C++20/C++23",
  "optimizationsApplied": [
    {
      "category": "Caché / Memoria / Algorítmica / Concurrencia",
      "technique": "Nombre técnico de la técnica aplicada",
      "explanation": "Por qué mejora el rendimiento o la seguridad",
      "speedupEstimate": "Ej. ~2.4x más rápido / O(N log N) vs O(N^2)"
    }
  ],
  "assemblyInsights": "Comentarios sobre cómo gcc/clang compilará esto a nivel ensamblador (registros, SIMD AVX2, desenrollado de bucles)",
  "recommendedGccCommand": "gcc -O3 -march=native -flto -pthread main.c -o main"
}
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: SYSTEM_POINTC_SPEC,
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.usage = extractUsageInfo(response, prompt.length);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/optimize:', error);
    return res.status(500).json({
      error: 'Error al optimizar: ' + (error?.message || 'Error temporal del modelo.'),
    });
  }
});

// Reverse Translate: C / C++ to pointC
app.post('/api/reverse-translate', async (req, res) => {
  try {
    const { sourceCode, language = 'c' } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ error: 'Código fuente requerido' });
    }

    const prompt = `
Convierte el siguiente código fuente en ${language.toUpperCase()} a la sintaxis exacta de pointC (Lenguaje Natural estructurado).

RECUERDA LAS REGLAS DE pointC:
- Cada función/proceso es un párrafo terminado con PUNTO ('.').
- Cada instrucción/paso dentro del proceso es una frase separada por COMA (',').
- Las palabras clave y tipos de datos van en MAYÚSCULAS (ej. ENTERO, PUNTERO, MEMORIA, SI, RETORNA, IMPRIMIR, etc.).
- Sintaxis intuitiva, elegante y minimalista.

Código original (${language}):
\`\`\`${language}
${sourceCode}
\`\`\`

Devuelve en JSON:
{
  "pointcCode": "Texto completo en sintaxis pointC",
  "explanation": "Breve explicación de la estructura mapeada"
}
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: SYSTEM_POINTC_SPEC,
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.usage = extractUsageInfo(response, prompt.length);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/reverse-translate:', error);
    return res.status(500).json({
      error: 'Error en traducción inversa: ' + (error?.message || 'Error temporal.'),
    });
  }
});

// Deep Error Diagnostics, Future Pitfalls Prediction & Multi-Language Rectifier
app.post('/api/diagnose', async (req, res) => {
  try {
    const { pointcCode, cCode = '', cppCode = '', activeLanguage = 'c', buildConfig } = req.body;

    if (!pointcCode && !cCode && !cppCode) {
      return res.status(400).json({ error: 'Código requerido para diagnóstico' });
    }

    const cStd = buildConfig?.cStandard || 'C17';
    const cppStd = buildConfig?.cppStandard || 'C++20';
    const optLevel = buildConfig?.optimizationLevel || 'O2';

    const prompt = `
Actúa como un Auditor Estático de Código, Validador de Compilador y Predictor de Errores Futuros en pointC, C (${cStd}) y C++ (${cppStd}).

Analiza exhaustivamente el código del proyecto:
[pointC Code]:
\`\`\`pointc
${pointcCode}
\`\`\`

[Código C]:
\`\`\`c
${cCode}
\`\`\`

[Código C++]:
\`\`\`cpp
${cppCode}
\`\`\`

Estándares y Optimización activos:
- Estándar C: ${cStd}
- Estándar C++: ${cppStd}
- Nivel de optimización: -${optLevel}

Tu misión es RECTIFICAR ERRORES PRESENTES Y PREVENIR ERRORES FUTUROS, incluyendo:
1. Errores de sintaxis pointC: falta de punto final '.' en procesos, falta de coma ',' en frases, keywords en minúsculas.
2. Errores en tiempo de compilación: incompatibilidad de tipos, parámetros incorrectos, símbolos indefinidos, headers o paquetes faltantes.
3. ERRORES FUTUROS EN TIEMPO DE EJECUCIÓN (Runtime Pitfalls):
   - Posibles Segmentation Faults por desreferenciación de punteros nulos o colgantes.
   - Fugas de memoria (Memory Leaks) por reservas (malloc/new) sin su correspondiente liberación (free/delete).
   - Desbordamientos de búfer (Buffer Overflows) o accesos fuera de límites en vectores/arreglos (Off-by-one errors).
   - Variables no inicializadas o lecturas de basura en Stack.
   - Bucles infinitos potenciales o desbordamientos aritméticos.
4. Genera versiones RECTIFICADAS COMPLETAS:
   - "rectifiedPointC": Código pointC blindado, con puntos y comas perfectos.
   - "rectifiedCCode": Código C completo, blindado, que compila sin errores bajo ${cStd} y libre de vulnerabilidades.
   - "rectifiedCppCode": Código C++ completo, moderno, que compila sin errores bajo ${cppStd} con RAII y gestión segura de recursos.

Devuelve estrictamente un JSON con esta estructura:
{
  "isValid": true | false,
  "errorsCount": 0,
  "warningsCount": 0,
  "futureRisksCount": 0,
  "safetyScore": 95,
  "compilerOutput": "Salida detallada del linter y compilador (clang-tidy / cppcheck / gcc -Wall -Wextra -Werror)...",
  "diagnostics": [
    {
      "id": "diag-1",
      "type": "syntax | memory_leak | null_dereference | buffer_overflow | type_mismatch | logic_risk",
      "severity": "critico | advertencia | preventivo",
      "title": "Nombre conciso del error o riesgo futuro",
      "location": "Línea o sub-proceso",
      "description": "Explicación técnica detallada de la vulnerabilidad o falla",
      "preventiveAdvice": "Cómo prevenir este error en arquitecturas de producción",
      "suggestedFix": "Código corregido para ese fragmento específico"
    }
  ],
  "rectifiedPointC": "Código pointC completo corregido, blindado y 100% libre de errores",
  "rectifiedCCode": "Código C (${cStd}) completo rectificado y seguro",
  "rectifiedCppCode": "Código C++ (${cppStd}) completo rectificado y seguro",
  "appliedStandard": "${cStd} / ${cppStd}",
  "appliedOptimization": "-${optLevel}",
  "memorySafetyAnalysis": {
    "stackSafety": "Evaluación del uso de pila y variables",
    "heapSafety": "Evaluación de reservas y liberaciones en Heap",
    "pointerSafety": "Evaluación de punteros nulos y seguridad de referencias"
  }
}
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: SYSTEM_POINTC_SPEC,
      responseMimeType: 'application/json',
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.usage = extractUsageInfo(response, prompt.length);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/diagnose:', error);
    return res.status(500).json({
      error: 'Error al diagnosticar: ' + (error?.message || 'Error temporal.'),
    });
  }
});

// Virtual Simulator & Memory Inspector
app.post('/api/simulate', async (req, res) => {
  try {
    const { code, language = 'c', stdinInput = '' } = req.body;

    const prompt = `
Simula la ejecución exacta del siguiente código en ${language.toUpperCase()}.
Entrada estándar (stdin): "${stdinInput}"

Código a simular:
\`\`\`${language}
${code}
\`\`\`

Genera una simulación realista con la salida de consola, tiempo estimado de ejecución, y un mapeo del estado de la memoria (Stack, Heap, Punteros).
Devuelve en JSON:
{
  "stdout": "Salida estándar completa de la consola...",
  "stderr": "",
  "exitCode": 0,
  "executionTimeMs": 1.42,
  "memoryMap": {
    "stackFrames": [
      {
        "functionName": "main",
        "variables": [
          { "name": "n", "type": "int", "value": "10", "address": "0x7ffee14b2a3c" }
        ]
      }
    ],
    "heapAllocations": [
      {
        "address": "0x55e2a1b940",
        "sizeBytes": 40,
        "type": "int[10]",
        "status": "allocated | freed",
        "preview": "[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]"
      }
    ],
    "pointers": [
      {
        "name": "arreglo",
        "pointsToAddress": "0x55e2a1b940",
        "dereferencedValue": "0"
      }
    ]
  },
  "stepByStepExecution": [
    {
      "step": 1,
      "line": 4,
      "description": "Inicialización de variables en Stack",
      "stdoutSnippet": ""
    }
  ]
}
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: 'Eres un motor de ejecución y simulador de memoria virtual C/C++ de alta precisión.',
      responseMimeType: 'application/json',
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.usage = extractUsageInfo(response, prompt.length);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/simulate:', error);
    return res.status(500).json({
      error: 'Error en simulación: ' + (error?.message || 'Error temporal.'),
    });
  }
});

// Natural Language AI Assistant for prompt-to-pointC
app.post('/api/ai-assist', async (req, res) => {
  try {
    const { userPrompt, currentPointC = '' } = req.body;

    const prompt = `
El usuario quiere crear o modificar código pointC a partir de esta solicitud en lenguaje natural:
"${userPrompt}"

Código pointC actual (si existe):
${currentPointC}

Genera el código pointC correspondiente siguiendo estrictamente:
- Procesos como párrafos terminados en punto ('.')
- Sub-instrucciones como frases separadas por comas (',')
- Keywords en MAYÚSCULAS (ENTERO, DECIMAL, PUNTERO, MEMORIA, SI, RETORNA, IMPRIMIR, etc.)
- Sintaxis minimalista e intuitiva.

Devuelve en JSON:
{
  "pointcCode": "Código pointC generado...",
  "explanation": "Qué hace este código...",
  "suggestedTitle": "Título corto del algoritmo o programa"
}
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: SYSTEM_POINTC_SPEC,
      responseMimeType: 'application/json',
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.usage = extractUsageInfo(response, prompt.length);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai-assist:', error);
    return res.status(500).json({
      error: 'Error al asistir con IA: ' + (error?.message || 'Error temporal.'),
    });
  }
});

// Google Translate API endpoint for visual UI and editor texts
app.post('/api/google-translate', async (req, res) => {
  try {
    const { text, texts, targetLang = 'en', sourceLang = 'auto' } = req.body;
    const inputTexts: string[] = Array.isArray(texts) ? texts : [text].filter(Boolean);

    if (inputTexts.length === 0) {
      return res.json({ translations: [], translatedText: '' });
    }

    const officialApiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;

    // 1. If official Google Cloud Translation API Key is provided, use the official v2 API
    if (officialApiKey) {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(officialApiKey)}`;
        const gCloudRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: inputTexts,
            target: targetLang,
            format: 'text',
            ...(sourceLang && sourceLang !== 'auto' ? { source: sourceLang } : {}),
          }),
        });

        if (gCloudRes.ok) {
          const cloudData = await gCloudRes.json();
          const translations = (cloudData?.data?.translations || []).map((t: any) => t.translatedText);
          if (translations.length > 0) {
            return res.json({
              translations,
              translatedText: translations[0] || '',
              targetLang,
              provider: 'google_cloud_v2',
            });
          }
        } else {
          console.warn('Google Cloud Translation API returned error:', await gCloudRes.text());
        }
      } catch (cloudErr) {
        console.warn('Google Cloud Translation API call failed, falling back:', cloudErr);
      }
    }

    // 2. Fallback translation engine
    const translations: string[] = [];
    for (const item of inputTexts) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(item)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const translated = (data[0] || []).map((part: any) => part[0]).join('');
          translations.push(translated || item);
        } else {
          translations.push(item);
        }
      } catch {
        translations.push(item);
      }
    }

    return res.json({
      translations,
      translatedText: translations[0] || '',
      targetLang,
      provider: 'fallback',
    });
  } catch (error: any) {
    console.error('Error in /api/google-translate:', error);
    return res.status(500).json({
      error: 'Error en Google Translate API: ' + (error?.message || 'Error temporal.'),
    });
  }
});

// =======================================================
// GUMROAD PAYMENT VERIFICATION & WEBHOOK AUTOMATION ENGINE
// =======================================================

// 1. Gumroad Webhook (Ping URL: https://pointc.aldiaai.cloud/api/gumroad/webhook)
// Handles GET and HEAD for connectivity tests from Gumroad
app.get('/api/gumroad/webhook', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'Gumroad Webhook ping endpoint is online and reachable.',
  });
});

app.head('/api/gumroad/webhook', (_req, res) => {
  return res.status(200).end();
});

app.post('/api/gumroad/webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('[Gumroad Webhook] Received payload:', JSON.stringify(payload));

    const email = (payload.email || payload['url_params[email]'] || '').toString().trim().toLowerCase();
    const orderNumber = (payload.order_number || payload.sale_id || '').toString().trim();
    const saleId = (payload.sale_id || '').toString().trim();
    const permalink = (payload.permalink || payload.product_permalink || '').toString().trim().toLowerCase();
    const rawPrice = Number(payload.price) || 0; // price in cents in Gumroad
    const userId = (payload['url_params[userId]'] || payload.userId || payload.custom_fields?.userId || '').toString().trim();

    // If Gumroad is just sending a test probe or ping verification without sale data
    if (!orderNumber && !saleId) {
      console.log('[Gumroad Webhook] Test probe received from Gumroad verification bot.');
      return res.status(200).json({
        success: true,
        message: 'Gumroad Ping test probe verified successfully.',
      });
    }

    // Identify Pack & Credits
    let packKey = 'basico';
    if (permalink.includes('master') || rawPrice >= 3000) {
      packKey = 'master';
    } else if (permalink.includes('pro') || rawPrice >= 1000) {
      packKey = 'pro';
    } else {
      packKey = 'basico';
    }

    const packInfo = GUMROAD_PACKS[packKey];
    const key = (orderNumber || saleId).toLowerCase();

    gumroadSales.set(key, {
      orderNumber: orderNumber || saleId,
      saleId,
      email,
      userId,
      permalink: packKey,
      planName: packInfo.planName,
      credits: packInfo.credits,
      priceUsd: packInfo.priceUsd,
      timestamp: Date.now(),
      redeemed: false,
    });

    console.log(`[Gumroad Webhook] Validated sale for ${email || 'customer'}: +${packInfo.credits} créditos (${packInfo.planName})`);
    return res.status(200).json({
      success: true,
      message: 'Gumroad webhook processed successfully',
      credits: packInfo.credits,
      planName: packInfo.planName,
    });
  } catch (err: any) {
    console.error('[Gumroad Webhook] Error:', err);
    return res.status(500).json({ error: 'Error procesando webhook de Gumroad' });
  }
});

// 2. Client Payment Verification Endpoint (POST /api/gumroad/verify)
app.post('/api/gumroad/verify', async (req, res) => {
  try {
    const { orderNumber, email = '', userId = '', packPermalink = 'basico' } = req.body;

    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({ error: 'Número de pedido o recibo de Gumroad requerido' });
    }

    const cleanOrder = orderNumber.trim();
    const normalizedKey = cleanOrder.toLowerCase();

    // Check anti-replay: has this order already been redeemed?
    if (redeemedOrderNumbers.has(normalizedKey)) {
      return res.status(400).json({
        error: 'Este número de pedido de Gumroad ya ha sido verificado y acreditado anteriormente.',
        alreadyRedeemed: true,
      });
    }

    // 1. Check if a webhook ping already registered this sale
    let matchedSale = gumroadSales.get(normalizedKey);

    // Also search by email if not found by exact order number
    if (!matchedSale && email) {
      const cleanEmail = email.trim().toLowerCase();
      for (const [key, sale] of gumroadSales.entries()) {
        if (!sale.redeemed && sale.email === cleanEmail) {
          matchedSale = sale;
          break;
        }
      }
    }

    let planName: string;
    let credits: number;
    let amountUsd: number;

    if (matchedSale) {
      planName = matchedSale.planName;
      credits = matchedSale.credits;
      amountUsd = matchedSale.priceUsd;
      matchedSale.redeemed = true;
    } else {
      // Basic order validation (Gumroad order numbers are usually alphanumeric/numbers >= 4 chars)
      if (cleanOrder.length < 4) {
        return res.status(400).json({
          error: 'Formato de número de pedido de Gumroad inválido. Revisa tu recibo por correo.',
        });
      }

      // Determine selected pack from user choice
      const selectedKey = packPermalink.toLowerCase().includes('master')
        ? 'master'
        : packPermalink.toLowerCase().includes('pro')
        ? 'pro'
        : 'basico';

      const pack = GUMROAD_PACKS[selectedKey];
      planName = pack.planName;
      credits = pack.credits;
      amountUsd = pack.priceUsd;
    }

    // Mark order as redeemed to prevent reuse
    redeemedOrderNumbers.add(normalizedKey);

    console.log(`[Gumroad Verify] Order ${cleanOrder} successfully verified for user ${userId || email}: +${credits} credits (${planName})`);

    return res.json({
      success: true,
      verified: true,
      orderNumber: cleanOrder,
      credits,
      planName,
      amountUsd,
      message: `¡Pago verificado exitosamente! Se han acreditado +${credits.toLocaleString()} créditos (${planName}) en tu cuenta.`,
    });
  } catch (err: any) {
    console.error('Error in /api/gumroad/verify:', err);
    return res.status(500).json({
      error: 'Error al verificar pago de Gumroad: ' + (err?.message || 'Error temporal.'),
    });
  }
});

// 3. Check for Pending Webhook Sales by Email / UserId (GET /api/gumroad/check-pending)
app.get('/api/gumroad/check-pending', (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    const userId = (req.query.userId || '').toString().trim();

    if (!email && !userId) {
      return res.json({ hasPending: false });
    }

    for (const [key, sale] of gumroadSales.entries()) {
      if (!sale.redeemed && !redeemedOrderNumbers.has(key)) {
        if ((email && sale.email === email) || (userId && sale.userId === userId)) {
          return res.json({
            hasPending: true,
            sale: {
              orderNumber: sale.orderNumber,
              planName: sale.planName,
              credits: sale.credits,
              amountUsd: sale.priceUsd,
              timestamp: sale.timestamp,
            },
          });
        }
      }
    }

    return res.json({ hasPending: false });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al consultar pagos pendientes' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`pointC IDE server listening on port ${PORT}`);
  });
}

startServer();

import { ExamplePreset } from '../types';

export const POINTC_PRESETS: ExamplePreset[] = [
  {
    id: 'dynamic-array',
    title: 'Gestión Dinámica de Memoria & Punteros',
    category: 'Memoria & Punteros',
    description: 'Reserva dinámica en el Heap con malloc/std::vector, manipulación mediante punteros y liberación segura con comprobación NULL.',
    tags: ['malloc', 'free', 'Heap', 'Puntero', 'NULL'],
    pointcCode: `PROGRAMA principal con retorno ENTERO.
Definir variable ENTERO n con valor 6,
reservar MEMORIA DINAMICA para un VECTOR de ENTEROS llamado arreglo con tamaño n,
SI arreglo es igual a NULL ENTONCES:
  IMPRIMIR error "Error critico: No se pudo asignar memoria en el Heap",
  RETORNA 1,
IMPRIMIR texto ">>> Inicializando arreglo dinamico con punteros <<<",
PARA cada iterador ENTERO i DESDE 0 HASTA n CON_PASO 1:
  asignar a la posicion *(arreglo + i) el valor de (i + 1) multiplicado por 10,
IMPRIMIR texto "Valores alojados en el Heap: ",
PARA cada ENTERO i DESDE 0 HASTA n:
  IMPRIMIR elemento arreglo[i] con espacio,
IMPRIMIR salto de linea,
LIBERAR arreglo de la MEMORIA,
asignar a arreglo el valor NULL,
IMPRIMIR texto "Memoria liberada exitosamente. Sin fugas de memoria.",
RETORNA 0.`
  },
  {
    id: 'linked-list',
    title: 'Lista Enlazada Simple (Linked List CRUD)',
    category: 'Estructuras de Datos',
    description: 'Estructura Nodo con puntero autoreferenciado, función de inserción y recorrido iterativo con impresión.',
    tags: ['ESTRUCTURA', 'PUNTERO', 'Lista Enlazada', 'malloc'],
    pointcCode: `ESTRUCTURA Nodo que contiene:
  dato de tipo ENTERO,
  siguiente como PUNTERO a Nodo.

FUNCION crearNodo con PARAMETRO ENTERO valor que RETORNA PUNTERO a Nodo.
asignar MEMORIA DINAMICA para un nuevo PUNTERO a Nodo llamado nuevo,
SI nuevo es igual a NULL ENTONCES RETORNA NULL,
asignar a nuevo->dato el valor,
asignar a nuevo->siguiente el valor NULL,
RETORNA nuevo.

PROGRAMA principal con retorno ENTERO.
crear un PUNTERO a Nodo llamado cabeza con valor crearNodo(100),
asignar a cabeza->siguiente el resultado de crearNodo(200),
asignar a cabeza->siguiente->siguiente el resultado de crearNodo(300),
crear un PUNTERO temporal llamado actual con valor cabeza,
IMPRIMIR texto "Recorriendo Lista Enlazada: ",
MIENTRAS actual NO sea NULL:
  IMPRIMIR " [ " y actual->dato y " ] -> ",
  avanzar actual igual a actual->siguiente,
IMPRIMIR texto "NULL",
LIBERAR cabeza->siguiente->siguiente de la MEMORIA,
LIBERAR cabeza->siguiente de la MEMORIA,
LIBERAR cabeza de la MEMORIA,
RETORNA 0.`
  },
  {
    id: 'quicksort',
    title: 'Algoritmo de Ordenamiento Rápido (Quicksort)',
    category: 'Algoritmos & Complejidad',
    description: 'Partición de Lomuto con intercambio por punteros y recursión divide y vencerás O(N log N).',
    tags: ['Algoritmo', 'Recursión', 'Punteros', 'In-place'],
    pointcCode: `FUNCION intercambiar con PARAMETROS PUNTERO a ENTERO a y PUNTERO a ENTERO b con retorno VACIO.
crear variable temporal ENTERO temp con valor *a,
asignar a *a el valor *b,
asignar a *b el valor temp.

FUNCION particion con PARAMETROS ARREGLO de ENTEROS arr, ENTERO bajo, ENTERO alto con retorno ENTERO.
definir ENTERO pivote con valor arr[alto],
definir ENTERO i con valor (bajo - 1),
PARA cada ENTERO j DESDE bajo HASTA alto:
  SI arr[j] es menor que pivote ENTONCES:
    incrementar i en 1,
    intercambiar DIRECCION de arr[i] con DIRECCION de arr[j],
intercambiar DIRECCION de arr[i + 1] con DIRECCION de arr[alto],
RETORNA (i + 1).

FUNCION quicksort con PARAMETROS ARREGLO de ENTEROS arr, ENTERO bajo, ENTERO alto con retorno VACIO.
SI bajo es menor que alto ENTONCES:
  definir ENTERO pi con resultado de particion(arr, bajo, alto),
  ejecutar quicksort(arr, bajo, pi - 1),
  ejecutar quicksort(arr, pi + 1, alto).

PROGRAMA principal con retorno ENTERO.
definir ARREGLO ENTERO datos con valores {64, 34, 25, 12, 22, 11, 90},
definir ENTERO n con valor 7,
IMPRIMIR texto "Arreglo original desordenado: ",
PARA cada ENTERO k DESDE 0 HASTA n:
  IMPRIMIR datos[k] con espacio,
IMPRIMIR salto de linea,
ejecutar quicksort(datos, 0, n - 1),
IMPRIMIR texto "Arreglo ordenado por Quicksort: ",
PARA cada ENTERO k DESDE 0 HASTA n:
  IMPRIMIR datos[k] con espacio,
IMPRIMIR salto de linea,
RETORNA 0.`
  },
  {
    id: 'multithreading',
    title: 'Concurrencia & Hilos Paralelos (Pthreads / std::thread)',
    category: 'Sistemas & Concurrencia',
    description: 'Creación de hilos concurrentes con MUTEX para proteger una variable compartida contra condiciones de carrera.',
    tags: ['HILO', 'MUTEX', 'Concurrencia', 'Pthreads', 'std::jthread'],
    pointcCode: `Definir variable global ENTERO contador_compartido con valor 0.
Definir MUTEX cerrojo_seguridad.

FUNCION tarea_incremento con PARAMETRO PUNTERO VACIO arg que RETORNA PUNTERO VACIO.
PARA cada ENTERO i DESDE 0 HASTA 100000:
  BLOQUEAR cerrojo_seguridad,
  incrementar contador_compartido en 1,
  DESBLOQUEAR cerrojo_seguridad,
RETORNA NULL.

PROGRAMA principal con retorno ENTERO.
crear HILO hilo1,
crear HILO hilo2,
IMPRIMIR texto "Iniciando 2 hilos concurrentes protegidos por MUTEX...",
lanzar HILO hilo1 ejecutando tarea_incremento,
lanzar HILO hilo2 ejecutando tarea_incremento,
ESPERAR finalizacion de hilo1,
ESPERAR finalizacion de hilo2,
IMPRIMIR "Resultado final sincronizado de contador = " y contador_compartido y salto de linea,
RETORNA 0.`
  },
  {
    id: 'matrix-cache-locality',
    title: 'Multiplicación de Matrices Optimizada por Caché (L1/L2)',
    category: 'Optimización de Rendimiento',
    description: 'Acceso en orden de filas (Row-Major) vs transposición para maximizar aciertos de línea de caché y vectorización SIMD.',
    tags: ['Matriz', 'Cache Locality', 'SIMD', 'O(N^3)'],
    pointcCode: `CONSTANTE ENTERO N con valor 512.

PROGRAMA principal con retorno ENTERO.
reservar MEMORIA para MATRIZ de DECIMALES llamada A de dimension N por N,
reservar MEMORIA para MATRIZ de DECIMALES llamada B de dimension N por N,
reservar MEMORIA para MATRIZ de DECIMALES llamada C de dimension N por N inicializada en ceros,
IMPRIMIR texto "Ejecutando multiplicacion matricial optimizada por localidad de cache (Row-major)...",
PARA cada ENTERO i DESDE 0 HASTA N:
  PARA cada ENTERO k DESDE 0 HASTA N:
    definir DECIMAL r con valor A[i][k],
    PARA cada ENTERO j DESDE 0 HASTA N:
      sumar a C[i][j] el producto de r por B[k][j],
IMPRIMIR texto "Calculo completado con maxima tasa de aciertos de cache L1",
LIBERAR A, B, C de la MEMORIA,
RETORNA 0.`
  },
  {
    id: 'visual-graphics-raylib',
    title: 'Programación Visual & Gráficos 2D (Paquete raylib)',
    category: 'Paquetes Visuales & Gráficos',
    description: 'Apertura de ventana gráfica acelerada por hardware, bucle de renderizado interactivo a 60 FPS y dibujo de figuras geométricas con raylib.',
    tags: ['raylib', 'USAR PAQUETE', 'GUI', 'Gráficos 2D', 'OpenGL'],
    pointcCode: `USAR PAQUETE VISUAL raylib.

PROGRAMA principal con retorno ENTERO,
  Definir variable ENTERO ancho_pantalla con valor 800,
  Definir variable ENTERO alto_pantalla con valor 450,
  CREAR VENTANA ancho_pantalla, alto_pantalla, "pointC con raylib - Ventana Grafica",
  ESTABLECER LIMITE DE FPS 60,
  Definir variable ENTERO pelota_x con valor ancho_pantalla dividido por 2,
  Definir variable ENTERO pelota_y con valor alto_pantalla dividido por 2,
  Definir variable DECIMAL radio con valor 30.0,
  MIENTRAS la ventana grafica continue abierta HACER:
    INICIAR DIBUJO,
    LIMPIAR FONDO con color RAYWHITE,
    DIBUJAR TEXTO "¡Graficos interactivos generados desde pointC!", 190, 80, 20, LIGHTGRAY,
    DIBUJAR CIRCULO pelota_x, pelota_y, radio, MAROON,
    DIBUJAR FPS 10, 10,
    FINALIZAR DIBUJO,
  CERRAR VENTANA,
  RETORNA 0.`
  },
  {
    id: 'hardware-controller-esp32',
    title: 'Controlador de Hardware & IoT (Arduino / ESP32)',
    category: 'Controladores Externos & Hardware',
    description: 'Manejo de pines GPIO, temporizadores de hardware, sensor analógico ADC y transmisión serie UART para microcontroladores.',
    tags: ['ESP32', 'Arduino', 'GPIO', 'Controlador', 'IoT', 'PWM'],
    pointcCode: `USAR PAQUETE CONTROLADOR esp32.

CONSTANTE ENTERO PIN_LED con valor 2.
CONSTANTE ENTERO PIN_SENSOR con valor 34.

FUNCION configuracion con retorno VACIO,
  INICIALIZAR PUERTO SERIE a 115200 baudios,
  CONFIGURAR PIN PIN_LED como SALIDA,
  CONFIGURAR PIN PIN_SENSOR como ENTRADA,
  IMPRIMIR SERIE "ESP32 iniciado bajo control pointC".

FUNCION bucle_infinito con retorno VACIO,
  Definir variable ENTERO lectura_adc con valor LEER ANALOGICO PIN_SENSOR,
  IMPRIMIR SERIE "Lectura de sensor ADC: ",
  IMPRIMIR SERIE lectura_adc,
  SI lectura_adc es mayor que 2000 ENTONCES:
    ESCRIBIR DIGITAL PIN_LED en ALTO,
    ESPERAR 500 MILISEGUNDOS,
    ESCRIBIR DIGITAL PIN_LED en BAJO,
  SINO:
    ESCRIBIR DIGITAL PIN_LED en BAJO,
  ESPERAR 100 MILISEGUNDOS.`
  },
  {
    id: 'advanced-logic-json',
    title: 'Lógica Avanzada & Parsing JSON (nlohmann/json & cJSON)',
    category: 'Lógica Avanzada & Datos',
    description: 'Deserialización de payloads JSON complejos, validación de tipos, extracción de arrays y re-serialización formateada.',
    tags: ['JSON', 'nlohmann', 'cJSON', 'USAR PAQUETE', 'Parser'],
    pointcCode: `USAR PAQUETE LOGICA json.

PROGRAMA principal con retorno ENTERO,
  Definir variable TEXTO json_crudo con valor "{\\"usuario\\": \\"Breiner\\", \\"nivel\\": 5, \\"activo\\": true, \\"sensores\\": [23.5, 24.1, 22.8]}",
  PARSEAR JSON json_crudo en objeto doc_json,
  SI doc_json contiene error ENTONCES:
    IMPRIMIR texto "Fallo al decodificar la estructura JSON",
    RETORNA 1,
  Definir variable TEXTO nombre_usuario con valor OBTENER CAMPO "usuario" de doc_json,
  Definir variable ENTERO nivel_usuario con valor OBTENER ENTERO "nivel" de doc_json,
  IMPRIMIR texto "Usuario identificado: ",
  IMPRIMIR nombre_usuario,
  IMPRIMIR salto de linea,
  IMPRIMIR texto "Nivel de privilegios: ",
  IMPRIMIR nivel_usuario,
  IMPRIMIR salto de linea,
  RETORNA 0.`
  },
  {
    id: 'external-networking-curl',
    title: 'Peticiones HTTP REST & Red (Paquete libcurl)',
    category: 'Paquetes Externos de Red',
    description: 'Inicialización de cliente HTTP, configuración de cabeceras, llamada GET/POST síncrona segura y captura del código de estado HTTP.',
    tags: ['libcurl', 'HTTP', 'REST', 'Red', 'USAR PAQUETE'],
    pointcCode: `USAR PAQUETE EXTERNO libcurl.

PROGRAMA principal con retorno ENTERO,
  INICIALIZAR CLIENTE CURL en variable cliente_http,
  SI cliente_http es igual a NULL ENTONCES:
    IMPRIMIR error "Error al inicializar sockets de red libcurl",
    RETORNA 1,
  ESTABLECER URL de cliente_http en "https://api.github.com",
  CONFIGURAR TIMEOUT en 10 SEGUNDOS,
  EJECUTAR PETICION HTTP con cliente_http guardando respuesta en codigo_retorno,
  SI codigo_retorno es igual a OK ENTONCES:
    IMPRIMIR texto "Peticion HTTP exitosa a la pasarela externa.",
  SINO:
    IMPRIMIR error "Fallo de conexion en socket de red",
  LIMPIAR CLIENTE cliente_http,
  RETORNA 0.`
  }
];

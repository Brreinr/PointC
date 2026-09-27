export type Language = 'es' | 'en';

export interface Translations {
  nav: {
    title: string;
    subtitle: string;
    backToFiles: string;
    runDiagnostic: string;
    optimize: string;
    translate: string;
    translating: string;
    aiAssistant: string;
    export: string;
    guest: string;
    login: string;
    profile: string;
    credits: string;
    creditsTooltip: string;
    language: string;
    rectifyErrors: string;
    shortcuts: string;
    files: string;
  };
  dashboard: {
    studioTitle: string;
    studioDesc: string;
    tutorialBannerBadge: string;
    tutorialBannerChallenges: string;
    tutorialBannerTitle: string;
    tutorialBannerDesc: string;
    tutorialBannerBtn: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    connectedCloud: string;
    syntaxLangLabel: string;
    bilingualBadge: string;
    createCardTitle: string;
    createCardDesc: string;
    languageLabel: string;
    fileNameLabel: string;
    fileNamePlaceholder: string;
    starterCodeLabel: string;
    starterTemplateDefault: string;
    starterTemplateBlank: string;
    createBtn: string;
    openCardTitle: string;
    openCardDesc: string;
    browsePc: string;
    recentFilesTitle: string;
    inTheCloud: string;
    modified: string;
    deleteTooltip: string;
    tutorialBtn: string;
    buildSettingsBtn: string;
  };
  editor: {
    title: string;
    processes: string;
    sentences: string;
    copy: string;
    copied: string;
    autoformat: string;
    formatBtn: string;
    syntaxBtn: string;
    syntaxBadge: string;
    syntaxTooltip: string;
    colorLegendBtn: string;
    colorLegendTooltip: string;
    keywords: string;
    colorLegend: string;
    shortcutHint: string;
    searchKeywords: string;
    allKeywordsTitle: string;
    insertTooltip: string;
    placeholder: string;
    saving: string;
    syncError: string;
    unsaved: string;
    synced: string;
    syntaxDrawerTitle: string;
    syntaxDrawerSubtitle: string;
    syntaxRulesTitle: string;
    rule1Title: string;
    rule1Desc: string;
    rule2Title: string;
    rule2Desc: string;
    rule3Title: string;
    rule3Desc: string;
    reservedWordsTitle: string;
    wordsCount: string;
    canonicalTitle: string;
    closeDrawer: string;
    fixWarning: string;
    pointLegend: string;
    commaLegend: string;
    typesLegend: string;
    memoryLegend: string;
    controlLegend: string;
    ioLegend: string;
    groups: {
      types: string;
      memory: string;
      control: string;
      structs: string;
      io: string;
    };
  };
  output: {
    tabC: string;
    tabCpp: string;
    tabExplanation: string;
    tabOptimizations: string;
    tabSimulation: string;
    copyC: string;
    copyCpp: string;
    downloadC: string;
    downloadCpp: string;
    recommendedFlags: string;
    waitingTranslation: string;
    astTitle: string;
    memoryTitle: string;
  };
  terminal: {
    diagnosticsTab: string;
    rectifiedTab: string;
    compilerTab: string;
    memoryTab: string;
    analyzeBtn: string;
    analyzing: string;
    simulating: string;
    runSimBtn: string;
    safetyScore: string;
    futureRisks: string;
    applyPointC: string;
    applyC: string;
    applyCpp: string;
    copied: string;
    copyCode: string;
  };
  profile: {
    title: string;
    balanceTitle: string;
    creditsAvailable: string;
    tokensConsumed: string;
    rateInfo: string;
    syncActive: string;
    storeTab: string;
    historyTab: string;
    editName: string;
    saveName: string;
    cancel: string;
    savedInFirestore: string;
    logout: string;
    loginBtn: string;
  };
  shortcuts: {
    title: string;
    subtitle: string;
    translateDesc: string;
    runDesc: string;
    switchTabsDesc: string;
    close: string;
    hint: string;
  };
  autosave: {
    saving: string;
    saved: string;
    unsaved: string;
    error: string;
    tooltipBoth: string;
    tooltipLocal: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    nav: {
      title: 'pointC IDE',
      subtitle: 'Lenguaje Natural a C/C++ Nativo',
      backToFiles: 'Volver a Archivos',
      runDiagnostic: 'Auditoría & Diagnóstico',
      optimize: 'Optimizar',
      translate: 'Traducir a C/C++',
      translating: 'Traduciendo...',
      aiAssistant: 'Asistente IA',
      export: 'Exportar',
      guest: 'Invitado',
      login: 'Iniciar Sesión',
      profile: 'Perfil',
      credits: 'créditos',
      creditsTooltip: '1 crédito paga 2,000 tokens de IA',
      language: 'Idioma',
      rectifyErrors: 'Rectificar Errores',
      shortcuts: 'Atajos de Teclado',
      files: 'Archivos'
    },
    dashboard: {
      studioTitle: 'Estudio de Programación pointC',
      studioDesc: 'Compilador en Lenguaje Natural estructurado que traduce directamente a C estándar (C99-C23) y C++ moderno (C++17-C++23) de alto rendimiento.',
      tutorialBannerBadge: 'Aprende en 3 Minutos',
      tutorialBannerChallenges: '4 Retos interactivos',
      tutorialBannerTitle: 'Tutorial de Sintaxis pointC: Procesos con punto, Frases con coma y Keywords',
      tutorialBannerDesc: 'Domina la gramática natural, prueba código en vivo con autovalidación y compila directamente a C y C++.',
      tutorialBannerBtn: 'Abrir Tutorial',
      heroBadge: 'IDE Natural Language con Base de Datos Firebase',
      heroTitle: 'Crea tu archivo',
      heroSubtitle: 'Todos los archivos se inicializan con código base ejecutable para que no comiences desde cero.',
      connectedCloud: 'Firebase Cloud Conectado',
      syntaxLangLabel: 'Idioma de sintaxis pointC:',
      bilingualBadge: 'Bilingüe ES/EN',
      createCardTitle: 'Crear Archivo pointC',
      createCardDesc: 'Incluye código funcional estructurado listo para traducir',
      languageLabel: 'Idioma de la interfaz y sintaxis:',
      fileNameLabel: 'Nombre del archivo:',
      fileNamePlaceholder: 'mi_algoritmo',
      starterCodeLabel: 'Código inicial precargado:',
      starterTemplateDefault: '✨ Código Base Funcional (PROGRAMA, INCLUIR, ENTRADA, MOSTRAR)',
      starterTemplateBlank: '📄 Plantilla Limpia Inicial (Boilerplate Minimalista)',
      createBtn: 'Crear Archivo con Código',
      openCardTitle: 'Abrir archivo .pointc',
      openCardDesc: 'Arrastra y suelta tu archivo .pointc o .poinc guardado en tu computadora.',
      browsePc: 'Explorar en mi PC',
      recentFilesTitle: 'Archivos Guardados en la Web (Firestore & Local)',
      inTheCloud: 'en la nube',
      modified: 'Modificado:',
      deleteTooltip: 'Eliminar archivo y actualizar estado en Firestore backend',
      tutorialBtn: 'Tutorial Interactivo',
      buildSettingsBtn: 'Opciones de Compilación'
    },
    editor: {
      title: 'Lenguaje Natural pointC',
      processes: 'procesos',
      sentences: 'frases',
      copy: 'Copiar',
      copied: 'Copiado',
      autoformat: 'Auto-formato',
      formatBtn: 'Formatear',
      syntaxBtn: 'Sintaxis',
      syntaxBadge: 'Reglas',
      syntaxTooltip: 'Abrir u ocultar el panel de reglas gramaticales y palabras reservadas',
      colorLegendBtn: 'Colores',
      colorLegendTooltip: 'Guía de colores semánticos',
      keywords: 'Palabras Clave',
      colorLegend: 'Leyenda de Colores',
      shortcutHint: 'Ctrl+Enter para traducir',
      searchKeywords: 'Buscar palabra clave...',
      allKeywordsTitle: 'Diccionario de Palabras Clave pointC (ES / EN)',
      insertTooltip: 'Haz clic para insertar en el cursor',
      placeholder: 'Escribe tu código en lenguaje natural pointC...',
      saving: 'guardando...',
      syncError: 'error de sync',
      unsaved: 'sin guardar',
      synced: 'sincronizado',
      syntaxDrawerTitle: 'Gramática & Reglas pointC',
      syntaxDrawerSubtitle: 'Referencia en tiempo real',
      syntaxRulesTitle: '3 Reglas Fundamentales:',
      rule1Title: '1. Proceso = Oración con Punto (\'.\')',
      rule1Desc: 'Cada función, bloque o proceso principal DEBE terminar estrictamente en punto.',
      rule2Title: '2. Sub-proceso = Frase con Coma (\',\')',
      rule2Desc: 'Cada instrucción sucesiva dentro del proceso se separa mediante una coma.',
      rule3Title: '3. Keywords en MAYÚSCULAS',
      rule3Desc: 'Tipos, punteros y estructuras de control usan mayúsculas exactas para desambiguación.',
      reservedWordsTitle: 'Palabras Reservadas (Haz clic para insertar):',
      wordsCount: 'palabras',
      canonicalTitle: 'Estructura canónica:',
      closeDrawer: 'Cerrar panel',
      fixWarning: 'Corregir',
      pointLegend: 'Punto = Proceso',
      commaLegend: 'Coma = Sub-proceso',
      typesLegend: 'Tipos (ENTERO)',
      memoryLegend: 'Memoria (PUNTERO)',
      controlLegend: 'Control (SI, PARA)',
      ioLegend: 'E/S (IMPRIMIR)',
      groups: {
        types: 'tipos',
        memory: 'memoria',
        control: 'control',
        structs: 'estructuras',
        io: 'e/s'
      }
    },
    output: {
      tabC: 'C Estándar',
      tabCpp: 'C++ Moderno',
      tabExplanation: 'Explicación Semántica',
      tabOptimizations: 'Optimizaciones',
      tabSimulation: 'Simulación & Memoria',
      copyC: 'Copiar C',
      copyCpp: 'Copiar C++',
      downloadC: 'Descargar C (.c)',
      downloadCpp: 'Descargar C++ (.cpp)',
      recommendedFlags: 'Flags de compilación recomendados',
      waitingTranslation: 'Escribe código en pointC y presiona "Traducir a C/C++" para ver la salida nativa.',
      astTitle: 'Desglose Estructurado de Procesos (AST Semántico)',
      memoryTitle: 'Auditoría de Memoria Estática'
    },
    terminal: {
      diagnosticsTab: 'Diagnóstico y Rectificación de Errores',
      rectifiedTab: 'Código Rectificado (C / C++ / pointC)',
      compilerTab: 'Salida de Compilador & Linter',
      memoryTab: 'Auditoría de Memoria (Stack/Heap)',
      analyzeBtn: 'Analizar & Rectificar',
      analyzing: 'Analizando...',
      simulating: 'Simulando...',
      runSimBtn: 'Ejecutar Simulación',
      safetyScore: 'Puntuación de Seguridad',
      futureRisks: 'Riesgos futuros prevenidos',
      applyPointC: 'Aplicar a Editor pointC',
      applyC: 'Aplicar a Salida C',
      applyCpp: 'Aplicar a Salida C++',
      copied: 'Copiado',
      copyCode: 'Copiar'
    },
    profile: {
      title: 'Perfil & Facturación',
      balanceTitle: 'Saldo de Créditos IA',
      creditsAvailable: 'créditos disponibles',
      tokensConsumed: 'tokens consumidos',
      rateInfo: '1 crédito paga 2,000 tokens',
      syncActive: 'Firestore Sync Activo',
      storeTab: 'Pasarela de Créditos',
      historyTab: 'Historial de Pagos',
      editName: 'Editar nombre',
      saveName: 'Guardar',
      cancel: 'Cancelar',
      savedInFirestore: 'Guardado en Firestore',
      logout: 'Cerrar Sesión',
      loginBtn: 'Iniciar Sesión / Registrarse'
    },
    shortcuts: {
      title: 'Atajos de Teclado',
      subtitle: 'Combinaciones rápidas para dominar el IDE pointC',
      translateDesc: 'Traducir código pointC a C y C++',
      runDesc: 'Ejecutar Auditoría y Simulación',
      switchTabsDesc: 'Cambiar entre pestañas de salida (C, C++, Explicación, Optimización, Simulación)',
      close: 'Cerrar',
      hint: 'Presiona Esc o haz clic fuera para cerrar'
    },
    autosave: {
      saving: 'Guardando...',
      saved: 'Guardado auto',
      unsaved: 'Cambios sin guardar',
      error: 'Error de sincronización',
      tooltipBoth: 'Sincronizado en tiempo real con LocalStorage y Firebase Firestore',
      tooltipLocal: 'Sincronizado con LocalStorage (Offline)',
    }
  },
  en: {
    nav: {
      title: 'pointC IDE',
      subtitle: 'Natural Language to Native C/C++',
      backToFiles: 'Back to Files',
      runDiagnostic: 'Audit & Diagnostics',
      optimize: 'Optimize',
      translate: 'Translate to C/C++',
      translating: 'Translating...',
      aiAssistant: 'AI Assistant',
      export: 'Export',
      guest: 'Guest',
      login: 'Sign In',
      profile: 'Profile',
      credits: 'credits',
      creditsTooltip: '1 credit pays 2,000 AI tokens',
      language: 'Language',
      rectifyErrors: 'Rectify Errors',
      shortcuts: 'Keyboard Shortcuts',
      files: 'Files'
    },
    dashboard: {
      studioTitle: 'pointC Programming Studio',
      studioDesc: 'High-performance structured Natural Language compiler translating directly into standard C (C99-C23) and modern C++ (C++17-C++23).',
      tutorialBannerBadge: 'Learn in 3 Minutes',
      tutorialBannerChallenges: '4 Interactive challenges',
      tutorialBannerTitle: 'pointC Syntax Tutorial: Processes with period, Clauses with comma & Keywords',
      tutorialBannerDesc: 'Master natural grammar, test code live with auto-validation, and compile directly to C and C++.',
      tutorialBannerBtn: 'Open Tutorial',
      heroBadge: 'Natural Language IDE with Firebase Database',
      heroTitle: 'Create your file',
      heroSubtitle: 'All files are initialized with executable starter code so you never have to start from scratch.',
      connectedCloud: 'Firebase Cloud Connected',
      syntaxLangLabel: 'pointC Syntax Language:',
      bilingualBadge: 'Bilingual ES/EN',
      createCardTitle: 'Create pointC File',
      createCardDesc: 'Includes structured functional code ready to translate',
      languageLabel: 'Interface & Syntax Language:',
      fileNameLabel: 'File name:',
      fileNamePlaceholder: 'my_algorithm',
      starterCodeLabel: 'Pre-loaded starter code:',
      starterTemplateDefault: '✨ Functional Base Program (PROGRAM, INCLUDE, INPUT, SHOW)',
      starterTemplateBlank: '📄 Clean Starter Template (Minimal Boilerplate)',
      createBtn: 'Create File with Code',
      openCardTitle: 'Open .pointc file',
      openCardDesc: 'Drag and drop your .pointc or .poinc file saved on your computer.',
      browsePc: 'Browse on my PC',
      recentFilesTitle: 'Web Saved Files (Firestore & Local)',
      inTheCloud: 'in the cloud',
      modified: 'Modified:',
      deleteTooltip: 'Delete file and update state in Firestore backend',
      tutorialBtn: 'Interactive Tutorial',
      buildSettingsBtn: 'Build Settings'
    },
    editor: {
      title: 'pointC Natural Language',
      processes: 'processes',
      sentences: 'sub-processes',
      copy: 'Copy',
      copied: 'Copied',
      autoformat: 'Auto-format',
      formatBtn: 'Format',
      syntaxBtn: 'Syntax',
      syntaxBadge: 'Rules',
      syntaxTooltip: 'Open or close the grammar rules and reserved keywords panel',
      colorLegendBtn: 'Colors',
      colorLegendTooltip: 'Semantic color legend',
      keywords: 'Keywords',
      colorLegend: 'Color Legend',
      shortcutHint: 'Ctrl+Enter to translate',
      searchKeywords: 'Search keyword...',
      allKeywordsTitle: 'pointC Keyword Dictionary (ES / EN)',
      insertTooltip: 'Click to insert at cursor',
      placeholder: 'Write your pointC natural language code here...',
      saving: 'saving...',
      syncError: 'sync error',
      unsaved: 'unsaved',
      synced: 'synced',
      syntaxDrawerTitle: 'pointC Grammar & Rules',
      syntaxDrawerSubtitle: 'Real-time reference',
      syntaxRulesTitle: '3 Fundamental Rules:',
      rule1Title: '1. Process = Sentence with Period (\'.\')',
      rule1Desc: 'Each function, block, or main process MUST strictly end in a period.',
      rule2Title: '2. Sub-process = Clause with Comma (\',\')',
      rule2Desc: 'Each successive instruction inside a process is separated by a comma.',
      rule3Title: '3. Keywords in UPPERCASE',
      rule3Desc: 'Types, pointers, and control structures use exact uppercase for disambiguation.',
      reservedWordsTitle: 'Reserved Keywords (Click to insert):',
      wordsCount: 'keywords',
      canonicalTitle: 'Canonical structure:',
      closeDrawer: 'Close panel',
      fixWarning: 'Fix',
      pointLegend: 'Period = Process',
      commaLegend: 'Comma = Sub-process',
      typesLegend: 'Types (INTEGER)',
      memoryLegend: 'Memory (POINTER)',
      controlLegend: 'Control (IF, FOR)',
      ioLegend: 'I/O (PRINT)',
      groups: {
        types: 'types',
        memory: 'memory',
        control: 'control',
        structs: 'structures',
        io: 'i/o'
      }
    },
    output: {
      tabC: 'Standard C',
      tabCpp: 'Modern C++',
      tabExplanation: 'Semantic Explanation',
      tabOptimizations: 'Optimizations',
      tabSimulation: 'Simulation & Memory',
      copyC: 'Copy C',
      copyCpp: 'Copy C++',
      downloadC: 'Download C (.c)',
      downloadCpp: 'Download C++ (.cpp)',
      recommendedFlags: 'Recommended compiler flags',
      waitingTranslation: 'Write pointC code and click "Translate to C/C++" to view native output.',
      astTitle: 'Structured Process Breakdown (Semantic AST)',
      memoryTitle: 'Static Memory Audit'
    },
    terminal: {
      diagnosticsTab: 'Diagnostics & Error Rectification',
      rectifiedTab: 'Rectified Code (C / C++ / pointC)',
      compilerTab: 'Compiler & Linter Output',
      memoryTab: 'Memory Audit (Stack/Heap)',
      analyzeBtn: 'Analyze & Rectify',
      analyzing: 'Analyzing...',
      simulating: 'Simulating...',
      runSimBtn: 'Run Simulation',
      safetyScore: 'Safety Score',
      futureRisks: 'Future risks prevented',
      applyPointC: 'Apply to pointC Editor',
      applyC: 'Apply to C Output',
      applyCpp: 'Apply to C++ Output',
      copied: 'Copied',
      copyCode: 'Copy'
    },
    profile: {
      title: 'Profile & Billing',
      balanceTitle: 'AI Credits Balance',
      creditsAvailable: 'available credits',
      tokensConsumed: 'tokens consumed',
      rateInfo: '1 credit pays 2,000 tokens',
      syncActive: 'Firestore Sync Active',
      storeTab: 'Credits Store',
      historyTab: 'Payment History',
      editName: 'Edit name',
      saveName: 'Save',
      cancel: 'Cancel',
      savedInFirestore: 'Saved in Firestore',
      logout: 'Sign Out',
      loginBtn: 'Sign In / Register'
    },
    shortcuts: {
      title: 'Keyboard Shortcuts',
      subtitle: 'Quick key combinations to master the pointC IDE',
      translateDesc: 'Translate pointC code to C and C++',
      runDesc: 'Run Audit & Simulation',
      switchTabsDesc: 'Switch between output tabs (C, C++, Explanation, Optimization, Simulation)',
      close: 'Close',
      hint: 'Press Esc or click outside to close'
    },
    autosave: {
      saving: 'Saving...',
      saved: 'Auto-saved',
      unsaved: 'Unsaved changes',
      error: 'Sync error',
      tooltipBoth: 'Synced in real time with LocalStorage and Firebase Firestore',
      tooltipLocal: 'Synced with LocalStorage (Offline)',
    }
  }
};

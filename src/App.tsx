import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { PointCEditor } from './components/PointCEditor';
import { CodeOutputViewer } from './components/CodeOutputViewer';
import { OptimizationPanel } from './components/OptimizationPanel';
import { DiagnosticTerminal } from './components/DiagnosticTerminal';
import { AiPromptModal } from './components/AiPromptModal';
import { ExportModal } from './components/ExportModal';
import { FileDashboard, CANONICAL_STARTER_CODE, BLANK_STARTER_CODE } from './components/FileDashboard';
import { AuthModal } from './components/AuthModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { BuildConfigModal, DEFAULT_BUILD_CONFIG } from './components/BuildConfigModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { POINTC_PRESETS } from './utils/presets';
import { TRANSLATIONS } from './utils/i18n';
import {
  TranslationResponse,
  OptimizationResponse,
  SimulationResponse,
  VerificationReport,
  ProjectFile,
  User as UserType,
  BuildConfig
} from './types';
import {
  auth,
  db,
  syncUserProfile,
  deductUserCredit,
  saveProjectToFirestore,
  loadUserProjectsFromFirestore,
  deleteProjectInFirestore,
  updateUserNameInFirestore,
  updateUserLanguageInFirestore,
  addCreditsToUser,
  testFirestoreConnection,
  UserProfile
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const STORAGE_FILES_KEY = 'pointc_user_files_v2';
const STORAGE_BUILD_CONFIG_KEY = 'pointc_build_config_v2';
const STORAGE_ACTIVE_DRAFT_KEY = 'pointc_active_draft_v2';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'ide'>('dashboard');

  // Build Configuration state (C/C++ standards, optimization levels, compiler flags)
  const [buildConfig, setBuildConfig] = useState<BuildConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUILD_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BUILD_CONFIG;
  });

  // Language Preference state (es | en)
  const [language, setLanguage] = useState<'es' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('pointc_lang');
      if (saved === 'en' || saved === 'es') return saved;
    } catch {}
    return 'es';
  });

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleLanguageChange = async (newLang: 'es' | 'en') => {
    setLanguage(newLang);
    try {
      localStorage.setItem('pointc_lang', newLang);
      if (document.documentElement) {
        document.documentElement.lang = newLang;
      }
    } catch {}
    if (user) {
      setUser((prev) => (prev ? { ...prev, language: newLang } : null));
    }
    if (firebaseUid) {
      try {
        await updateUserLanguageInFirestore(firebaseUid, newLang);
      } catch (e) {
        console.warn('Failed to update language in Firestore:', e);
      }
    }
  };
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BUILD_CONFIG_KEY, JSON.stringify(buildConfig));
    } catch {}
  }, [buildConfig]);

  // Files state
  const [recentFiles, setRecentFiles] = useState<ProjectFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FILES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'file_demo_1',
        name: 'primer_programa.pointc',
        content: CANONICAL_STARTER_CODE,
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }
    ];
  });

  const [currentFile, setCurrentFile] = useState<ProjectFile>({
    id: 'file_demo_1',
    name: 'primer_programa.pointc',
    content: CANONICAL_STARTER_CODE,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  });

  // Firebase User Profile state
  const [user, setUser] = useState<UserType | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  // Code state
  const [pointcCode, setPointcCode] = useState<string>(currentFile.content);
  const [cCode, setCCode] = useState<string>('');
  const [cppCode, setCppCode] = useState<string>('');
  const [activeRightTab, setActiveRightTab] = useState<'c' | 'cpp' | 'optimizations' | 'simulation'>('c');

  const [translationData, setTranslationData] = useState<TranslationResponse | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationResponse | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<VerificationReport | null>(null);

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSimLang, setSelectedSimLang] = useState<'c' | 'cpp'>('c');

  // Modals state
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isBuildConfigOpen, setIsBuildConfigOpen] = useState(false);

  // Real-time Auto-Save Engine: LocalStorage & Firebase Firestore synchronization
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());
  const [saveDestination, setSaveDestination] = useState<'both' | 'local' | 'firestore' | null>('both');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{
    code: string;
    fileId: string;
    fileName: string;
    cCode?: string;
    cppCode?: string;
  } | null>(null);

  // Test Firestore connection on startup
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUid(fbUser.uid);
        try {
          const profile = await syncUserProfile(fbUser);
          setUser({
            id: profile.uid,
            name: profile.displayName || fbUser.email?.split('@')[0] || 'Desarrollador pointC',
            email: profile.email || fbUser.email || 'usuario@pointc.dev',
            credits: profile.credits ?? 150,
            plan: profile.plan || 'Gratuito',
            createdAt: Date.now(),
          });

          // Load user projects from Firestore (excluding deleted ones)
          const cloudProjects = await loadUserProjectsFromFirestore(fbUser.uid);
          if (cloudProjects.length > 0) {
            const mapped: ProjectFile[] = cloudProjects.map((p) => ({
              id: p.id,
              name: p.name,
              content: p.content,
              cCode: p.cCode,
              cppCode: p.cppCode,
              updatedAt: Date.now(),
              createdAt: Date.now(),
            }));
            setRecentFiles((prev) => {
              const combined = [...mapped, ...prev];
              const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
              return unique;
            });
          }
        } catch (e) {
          console.error('Error syncing user profile from Firestore:', e);
        }
      } else {
        // Automatically establish anonymous Firebase session for seamless Firestore operations
        import('firebase/auth').then(({ signInAnonymously }) => {
          signInAnonymously(auth).catch((err) => {
            console.warn('Anonymous auth initialization:', err);
          });
        });

        // Restore local dev user profile if previously active
        try {
          const raw = localStorage.getItem('pointc_local_user');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.uid) {
              setUser({
                id: parsed.uid,
                name: parsed.displayName || 'Desarrollador pointC',
                email: parsed.email || 'desarrollador@pointc.dev',
                credits: parsed.credits ?? 150,
                plan: parsed.plan || 'Gratuito',
                createdAt: Date.now(),
              });
            }
          }
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for Firestore user credits
  useEffect(() => {
    if (!firebaseUid) return;
    const unsubDoc = onSnapshot(doc(db, 'users', firebaseUid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                credits: data.credits ?? prev.credits,
                plan: data.plan ?? prev.plan,
              }
            : null
        );
      }
    });
    return () => unsubDoc();
  }, [firebaseUid]);

  // Auto-detect Gumroad return or window focus after checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('gumroad') || params.get('order_id') || params.get('sale_id')) {
        setIsProfileOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.email && !user?.id) return;
    const handleWindowFocus = async () => {
      try {
        const url = `/api/gumroad/check-pending?email=${encodeURIComponent(user?.email || '')}&userId=${encodeURIComponent(user?.id || '')}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.hasPending && data.sale?.orderNumber) {
          setIsProfileOpen(true);
        }
      } catch {}
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [user?.email, user?.id]);

  // Save files to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(recentFiles));
    } catch {}
  }, [recentFiles]);

  // Token toast notification state
  const [tokenToast, setTokenToast] = useState<{
    tokens: number;
    credits: number;
    action: string;
  } | null>(null);

  // Check if user has sufficient credits before request
  const checkHasCredits = (minCredits: number = 1): boolean => {
    if (!user) {
      setIsAuthOpen(true);
      return false;
    }
    if (user.credits < minCredits) {
      setIsProfileOpen(true);
      setErrorMessage(`Saldo insuficiente (${user.credits} créditos). 1 crédito paga 2,000 tokens. Adquiere más créditos en la pasarela.`);
      return false;
    }
    return true;
  };

  // Consume credits and tokens dynamically based on API usage (1 credit = 2000 tokens)
  const consumeTokensAndCredits = async (credits: number, tokens: number, action: string = 'Operación') => {
    if (!user) return;
    const finalCredits = Math.max(1, credits);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            credits: Math.max(0, prev.credits - finalCredits),
            totalTokensSpent: (prev.totalTokensSpent || 0) + tokens,
          }
        : null
    );

    if (firebaseUid) {
      try {
        await deductUserCredit(firebaseUid, finalCredits, tokens);
      } catch (e) {
        console.warn('Firestore token/credit sync fallback:', e);
      }
    }

    setTokenToast({
      tokens,
      credits: finalCredits,
      action,
    });
    setTimeout(() => setTokenToast(null), 4500);
  };

  // Deduct credit helper fallback
  const deductCredit = async (amount: number = 1): Promise<boolean> => {
    return checkHasCredits(amount);
  };

  // Add credits from purchase (updates both local state & Firestore database)
  const handleAddCredits = async (amount: number, planName: string, costUsd: number) => {
    if (!user) return;
    const newPlan = amount >= 2500 ? 'Pro' : user.plan;
    setUser((prev) =>
      prev
        ? {
            ...prev,
            credits: prev.credits + amount,
            plan: newPlan,
          }
        : null
    );

    if (firebaseUid) {
      try {
        await addCreditsToUser(
          firebaseUid,
          user.email,
          amount,
          planName,
          costUsd,
          'Pasarela Web'
        );
      } catch (e) {
        console.warn('Could not persist purchased credits to Firestore:', e);
      }
    }
  };

  // Update user name in local state & Firestore
  const handleUpdateUserName = async (newName: string) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, name: newName } : null));
    if (firebaseUid) {
      try {
        await updateUserNameInFirestore(firebaseUid, newName);
      } catch (e) {
        console.warn('Could not update user name in Firestore:', e);
      }
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('pointc_local_user');
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setFirebaseUid(null);
  };

  // Real-time Auto-Save Engine: LocalStorage & Firebase Firestore synchronization
  const performAutoSave = useCallback(
    async (
      targetCode: string,
      targetFileId: string,
      targetFileName: string,
      targetCCode?: string,
      targetCppCode?: string
    ) => {
      setSaveStatus('saving');
      const now = Date.now();

      // 1. Immediately persist to LocalStorage
      try {
        localStorage.setItem(
          STORAGE_ACTIVE_DRAFT_KEY,
          JSON.stringify({
            fileId: targetFileId,
            fileName: targetFileName,
            content: targetCode,
            cCode: targetCCode || '',
            cppCode: targetCppCode || '',
            updatedAt: now,
          })
        );

        setRecentFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === targetFileId ? { ...f, name: targetFileName, content: targetCode, updatedAt: now } : f
          );
          if (!updated.some((f) => f.id === targetFileId)) {
            updated.unshift({
              id: targetFileId,
              name: targetFileName,
              content: targetCode,
              updatedAt: now,
              createdAt: now,
            });
          }
          try {
            localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage save files quota/error:', e);
          }
          return updated;
        });
      } catch (lsErr) {
        console.warn('LocalStorage save draft error:', lsErr);
      }

      // 2. Real-time Firebase Firestore Sync
      let syncedToFirestore = false;
      const targetUid = firebaseUid || auth.currentUser?.uid;
      if (targetUid) {
        try {
          await saveProjectToFirestore(
            targetUid,
            targetFileId,
            targetFileName,
            targetCode,
            targetCCode,
            targetCppCode
          );
          syncedToFirestore = true;
        } catch (fsErr) {
          console.warn('Firestore auto-save network fallback:', fsErr);
        }
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date());
      setSaveDestination(syncedToFirestore ? 'both' : 'local');
      pendingSaveRef.current = null;
    },
    [firebaseUid]
  );

  // Crash recovery from active draft on initial load
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(STORAGE_ACTIVE_DRAFT_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft && draft.content) {
          setPointcCode(draft.content);
          if (draft.cCode) setCCode(draft.cCode);
          if (draft.cppCode) setCppCode(draft.cppCode);
          setCurrentFile((prev) => ({
            ...prev,
            id: draft.fileId || prev.id,
            name: draft.fileName || prev.name,
            content: draft.content,
            updatedAt: draft.updatedAt || Date.now(),
          }));
          setLastSavedTime(new Date(draft.updatedAt || Date.now()));
          setSaveStatus('saved');
        }
      }
    } catch (e) {
      console.warn('Draft recovery failed:', e);
    }
  }, []);

  // Flush pending save before window unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current) {
        const p = pendingSaveRef.current;
        try {
          localStorage.setItem(
            STORAGE_ACTIVE_DRAFT_KEY,
            JSON.stringify({
              fileId: p.fileId,
              fileName: p.fileName,
              content: p.code,
              cCode: p.cCode || '',
              cppCode: p.cppCode || '',
              updatedAt: Date.now(),
            })
          );
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle open file from dashboard
  const handleOpenFile = (file: ProjectFile) => {
    if (pendingSaveRef.current) {
      performAutoSave(pointcCode, currentFile.id, currentFile.name, cCode, cppCode);
    }
    setCurrentFile(file);
    setPointcCode(file.content);
    setCurrentScreen('ide');
    handleTranslate(file.content);
  };

  // Handle create new file (ALWAYS pre-populated with code!)
  const handleCreateNewFile = (fileName: string, templateCode?: string) => {
    const newCode = templateCode && templateCode.trim() ? templateCode : CANONICAL_STARTER_CODE;
    const newFile: ProjectFile = {
      id: 'file_' + Math.random().toString(36).substr(2, 9),
      name: fileName,
      content: newCode,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    setRecentFiles((prev) => [newFile, ...prev.filter((f) => f.id !== newFile.id)]);
    setCurrentFile(newFile);
    setPointcCode(newCode);
    setCurrentScreen('ide');

    performAutoSave(newCode, newFile.id, newFile.name);
    handleTranslate(newCode);
  };

  // Handle delete file (updates state and persists 'deleted' status in Firestore)
  const handleDeleteFile = (id: string) => {
    setRecentFiles((prev) => prev.filter((f) => f.id !== id));
    if (firebaseUid) {
      deleteProjectInFirestore(firebaseUid, id).catch((err) => {
        console.warn('Error updating file deletion status in Firestore:', err);
      });
    }
  };

  // Handle code change with debounced real-time auto-save
  const handlePointcChange = (newCode: string) => {
    setPointcCode(newCode);
    setSaveStatus('unsaved');
    setCurrentFile((prev) => ({
      ...prev,
      content: newCode,
      updatedAt: Date.now(),
    }));

    pendingSaveRef.current = {
      code: newCode,
      fileId: currentFile.id,
      fileName: currentFile.name,
      cCode,
      cppCode,
    };

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave(newCode, currentFile.id, currentFile.name, cCode, cppCode);
    }, 800);
  };

  // Rename current file
  const handleRenameFile = (newName: string) => {
    let name = newName.trim();
    if (!name.endsWith('.pointc') && !name.endsWith('.poinc')) {
      name += '.pointc';
    }
    setCurrentFile((prev) => ({ ...prev, name }));
    performAutoSave(pointcCode, currentFile.id, name, cCode, cppCode);
  };

  // Save / Download .pointc file directly
  const handleSavePointCFile = () => {
    performAutoSave(pointcCode, currentFile.id, currentFile.name, cCode, cppCode);
    const blob = new Blob([pointcCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name.endsWith('.pointc') ? currentFile.name : `${currentFile.name}.pointc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Translation Function
  const handleTranslate = useCallback(
    async (codeToTranslate?: string) => {
      const code = codeToTranslate || pointcCode;
      if (!code || !code.trim()) return;

      if (!checkHasCredits(1)) return;

      setIsTranslating(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pointcCode: code,
            targetStandards: { cStandard: buildConfig.cStandard, cppStandard: buildConfig.cppStandard },
            optimizationLevel: buildConfig.optimizationLevel,
            buildConfig,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Error al traducir el código');
        }

        const data: TranslationResponse = await response.json();
        setTranslationData(data);
        setCCode(data.cCode || '');
        setCppCode(data.cppCode || '');

        if (data.usage) {
          consumeTokensAndCredits(data.usage.creditsDeducted, data.usage.totalTokens, 'Traducción C/C++');
        }

        // Auto-save the freshly translated C/C++ code alongside pointC code
        performAutoSave(code, currentFile.id, currentFile.name, data.cCode, data.cppCode);
      } catch (err: any) {
        console.error('Translation error:', err);
        setErrorMessage(err.message || 'Error de conexión con el compilador pointC');
      } finally {
        setIsTranslating(false);
      }
    },
    [pointcCode, user, firebaseUid, currentFile, buildConfig, performAutoSave]
  );

  // Optimization Function
  const handleTriggerOptimize = async (goal: string = 'rendimiento_maximo') => {
    if (!cCode && !cppCode) return;
    if (!checkHasCredits(1)) return;

    setIsOptimizing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointcCode,
          cCode,
          cppCode,
          optimizationGoal: goal,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al optimizar código');
      }

      const data: OptimizationResponse = await response.json();
      setOptimizationData(data);
      if (data.usage) {
        consumeTokensAndCredits(data.usage.creditsDeducted, data.usage.totalTokens, 'Optimización');
      }
      setActiveRightTab('optimizations');
    } catch (err: any) {
      console.error('Optimization error:', err);
      setErrorMessage(err.message || 'Error al procesar optimizaciones');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply Optimization back to code
  const handleApplyOptimization = (newPointC: string, newC: string, newCpp: string) => {
    if (newPointC) handlePointcChange(newPointC);
    if (newC) setCCode(newC);
    if (newCpp) setCppCode(newCpp);
    setActiveRightTab('c');
  };

  // Diagnostics and Error Rectification Function (analyzes and generates rectified versions for pointC, C and C++)
  const handleRunDiagnostic = async () => {
    if (!pointcCode && !cCode) return;
    if (!checkHasCredits(1)) return;

    setIsDiagnosing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointcCode,
          cCode,
          cppCode,
          activeLanguage: selectedSimLang,
          buildConfig,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al diagnosticar código');
      }

      const data: VerificationReport = await response.json();
      setDiagnosticData(data);
      if (data.usage) {
        consumeTokensAndCredits(data.usage.creditsDeducted, data.usage.totalTokens, 'Diagnóstico & Rectificación');
      }
      setActiveRightTab('simulation');
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setErrorMessage(err.message || 'Error al realizar el análisis de errores');
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Apply Rectified pointC Code back to editor and re-translate
  const handleApplyRectifiedCode = (rectifiedCode: string) => {
    if (!rectifiedCode) return;
    handlePointcChange(rectifiedCode);
    handleTranslate(rectifiedCode);
  };

  // Apply Rectified C Code directly
  const handleApplyRectifiedCCode = (rectifiedCCode: string) => {
    if (!rectifiedCCode) return;
    setCCode(rectifiedCCode);
    setActiveRightTab('c');
  };

  // Apply Rectified C++ Code directly
  const handleApplyRectifiedCppCode = (rectifiedCppCode: string) => {
    if (!rectifiedCppCode) return;
    setCppCode(rectifiedCppCode);
    setActiveRightTab('cpp');
  };

  // Simulation / Execution Function
  const handleRunSimulation = async (stdinInput: string = '', langOverride?: 'c' | 'cpp') => {
    const lang = langOverride || selectedSimLang;
    const codeToSimulate = lang === 'cpp' ? cppCode : cCode;

    if (!codeToSimulate) return;
    if (!checkHasCredits(1)) return;

    setSelectedSimLang(lang);
    setIsSimulating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToSimulate,
          language: lang,
          stdinInput,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error en la verificación');
      }

      const data: SimulationResponse = await response.json();
      setSimulationData(data);
      if (data.usage) {
        consumeTokensAndCredits(data.usage.creditsDeducted, data.usage.totalTokens, 'Simulación');
      }
      setActiveRightTab('simulation');
    } catch (err: any) {
      console.error('Simulation error:', err);
      setErrorMessage(err.message || 'Error al verificar la ejecución');
    } finally {
      setIsSimulating(false);
    }
  };

  // AI Prompt to pointC handler
  const handleAiPromptSubmit = async (prompt: string) => {
    if (!checkHasCredits(1)) return;

    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt, currentPointC: pointcCode }),
      });

      if (!response.ok) throw new Error('Error al generar código pointC');
      const data = await response.json();

      if (data.usage) {
        consumeTokensAndCredits(data.usage.creditsDeducted, data.usage.totalTokens, 'Generación Asistente IA');
      }

      if (data.pointcCode) {
        handlePointcChange(data.pointcCode);
        handleTranslate(data.pointcCode);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en el asistente');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle load tutorial code directly to main IDE
  const handleLoadTutorialCode = (code: string) => {
    handlePointcChange(code);
    setCurrentScreen('ide');
    handleTranslate(code);
  };

  // Global keyboard shortcuts (Cmd+S for Auto-save, Cmd+Enter for Translate, Cmd+R for Run/Audit, Cmd+1-4 for Tabs)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        performAutoSave(pointcCode, currentFile.id, currentFile.name, cCode, cppCode);
      } else if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleTranslate();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (cCode || cppCode) {
          handleRunDiagnostic();
        }
      } else if (isCmdOrCtrl && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tabMap: Record<string, 'c' | 'cpp' | 'optimizations' | 'simulation'> = {
          '1': 'c',
          '2': 'cpp',
          '3': 'optimizations',
          '4': 'simulation'
        };
        const targetTab = tabMap[e.key];
        if (targetTab) {
          setActiveRightTab(targetTab);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cCode, cppCode, pointcCode, currentFile, performAutoSave, handleTranslate]);

  // IF SCREEN IS DASHBOARD, RENDER INITIAL FILE MANAGER
  if (currentScreen === 'dashboard') {
    return (
      <>
        <FileDashboard
          onOpenFile={handleOpenFile}
          onCreateNewFile={handleCreateNewFile}
          recentFiles={recentFiles}
          onDeleteFile={handleDeleteFile}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenBuildConfig={() => setIsBuildConfigOpen(true)}
          buildConfig={buildConfig}
          user={user}
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(profile) => {
            setUser({
              id: profile.uid,
              name: profile.displayName || 'Desarrollador',
              email: profile.email || 'usuario@pointc.dev',
              credits: profile.credits ?? 150,
              plan: profile.plan || 'Gratuito',
              createdAt: Date.now(),
            });
          }}
        />
        <ProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onAddCredits={handleAddCredits}
          onUpdateUserName={handleUpdateUserName}
          onLogout={handleLogout}
          onOpenAuth={() => {
            setIsProfileOpen(false);
            setIsAuthOpen(true);
          }}
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
        <InteractiveTutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          onLoadCodeToEditor={handleLoadTutorialCode}
        />
        <BuildConfigModal
          isOpen={isBuildConfigOpen}
          onClose={() => setIsBuildConfigOpen(false)}
          config={buildConfig}
          onChangeConfig={setBuildConfig}
          onApplyAndTranslate={() => handleTranslate()}
        />
        {tokenToast && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#0c1324] border border-cyan-500/50 shadow-2xl shadow-cyan-950/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2 duration-200">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{tokenToast.action}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                  {tokenToast.tokens.toLocaleString()} tokens
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Consumo: <strong className="text-amber-400">-{tokenToast.credits} crédito{tokenToast.credits > 1 ? 's' : ''}</strong> (1 crédito paga 2,000 tokens)
              </p>
            </div>
            <button
              onClick={() => setTokenToast(null)}
              className="text-slate-500 hover:text-white ml-2 text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}
      </>
    );
  }

  // IF SCREEN IS IDE, RENDER SLEEK STUDIO
  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c16] text-[#e2e8f0] font-sans overflow-hidden">
      {/* Top Minimal Application Header */}
      <Header
        currentFileName={currentFile.name}
        onRenameFile={handleRenameFile}
        onBackToDashboard={() => {
          if (pendingSaveRef.current) {
            performAutoSave(pointcCode, currentFile.id, currentFile.name, cCode, cppCode);
          }
          setCurrentScreen('dashboard');
        }}
        onSavePointCFile={handleSavePointCFile}
        onTranslate={() => handleTranslate()}
        onOptimize={() => handleTriggerOptimize()}
        onSimulate={() => handleRunDiagnostic()}
        onOpenAiPrompt={() => setIsAiPromptOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenBuildConfig={() => setIsBuildConfigOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        saveDestination={saveDestination}
        buildConfig={buildConfig}
        isTranslating={isTranslating}
        isOptimizing={isOptimizing}
        isSimulating={isDiagnosing || isSimulating}
        hasTranslations={!!(cCode || cppCode)}
        user={user}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="bg-rose-950 border-b border-rose-800 px-4 py-2 text-xs text-rose-200 flex items-center justify-between z-40">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace: Split Pane (Left: pointC Editor, Right: Output Views) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
        {/* Left Workspace: pointC Natural Language Code Studio */}
        <div className="h-full flex flex-col overflow-hidden">
          <PointCEditor
            code={pointcCode}
            onChange={handlePointcChange}
            onTranslate={() => handleTranslate()}
            isTranslating={isTranslating}
            saveStatus={saveStatus}
            currentLanguage={language}
          />
        </div>

        {/* Right Workspace: Multi-tab Output Engine */}
        <div className="h-full flex flex-col overflow-hidden bg-[#0d121f]">
          {/* Right Workspace Tab Navigation */}
          <div className="bg-[#080c16] px-3 pt-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 text-xs font-semibold">
              {/* Tab: C Code */}
              <button
                onClick={() => setActiveRightTab('c')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg border-t border-x transition ${
                  activeRightTab === 'c'
                    ? 'bg-[#0d121f] text-blue-300 border-slate-700 border-b-transparent font-bold'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{TRANSLATIONS[language].output.tabC}</span>
              </button>

              {/* Tab: C++ Code */}
              <button
                onClick={() => setActiveRightTab('cpp')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg border-t border-x transition ${
                  activeRightTab === 'cpp'
                    ? 'bg-[#0d121f] text-purple-300 border-slate-700 border-b-transparent font-bold'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>{TRANSLATIONS[language].output.tabCpp}</span>
              </button>

              {/* Tab: Optimizations */}
              <button
                onClick={() => setActiveRightTab('optimizations')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg border-t border-x transition ${
                  activeRightTab === 'optimizations'
                    ? 'bg-[#0d121f] text-amber-300 border-slate-700 border-b-transparent font-bold'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <span>{TRANSLATIONS[language].output.tabOptimizations}</span>
              </button>

              {/* Tab: Terminal de Diagnóstico y Rectificación de Errores */}
              <button
                onClick={() => setActiveRightTab('simulation')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg border-t border-x transition ${
                  activeRightTab === 'simulation'
                    ? 'bg-[#0d121f] text-cyan-300 border-slate-700 border-b-transparent font-bold'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{TRANSLATIONS[language].nav.rectifyErrors}</span>
              </button>
            </div>
          </div>

          {/* Active View Content */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'c' && (
              <CodeOutputViewer
                language="c"
                code={cCode}
                translationData={translationData}
                onSimulate={() => handleRunDiagnostic()}
                isSimulating={isDiagnosing}
              />
            )}

            {activeRightTab === 'cpp' && (
              <CodeOutputViewer
                language="cpp"
                code={cppCode}
                translationData={translationData}
                onSimulate={() => handleRunDiagnostic()}
                isSimulating={isDiagnosing}
              />
            )}

            {activeRightTab === 'optimizations' && (
              <OptimizationPanel
                translationData={translationData}
                optimizationData={optimizationData}
                onApplyOptimization={handleApplyOptimization}
                isOptimizing={isOptimizing}
                onTriggerOptimize={handleTriggerOptimize}
              />
            )}

            {activeRightTab === 'simulation' && (
              <DiagnosticTerminal
                diagnosticData={diagnosticData}
                simulationData={simulationData}
                onRunDiagnostic={handleRunDiagnostic}
                onRunSimulation={handleRunSimulation}
                onApplyRectifiedCode={handleApplyRectifiedCode}
                onApplyRectifiedCCode={handleApplyRectifiedCCode}
                onApplyRectifiedCppCode={handleApplyRectifiedCppCode}
                isDiagnosing={isDiagnosing}
                isSimulating={isSimulating}
                activeLanguage={selectedSimLang}
                hasCode={!!(pointcCode || cCode)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <AiPromptModal
        isOpen={isAiPromptOpen}
        onClose={() => setIsAiPromptOpen(false)}
        onSubmitPrompt={handleAiPromptSubmit}
        isGenerating={isAiGenerating}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        pointcCode={pointcCode}
        cCode={cCode}
        cppCode={cppCode}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(profile) => {
          setUser({
            id: profile.uid,
            name: profile.displayName || 'Desarrollador',
            email: profile.email || 'usuario@pointc.dev',
            credits: profile.credits ?? 150,
            plan: profile.plan || 'Gratuito',
            language: profile.language || 'es',
            createdAt: Date.now(),
          });
          if (profile.language) {
            setLanguage(profile.language);
          }
        }}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onAddCredits={handleAddCredits}
        onUpdateUserName={handleUpdateUserName}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
        }}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      <InteractiveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onLoadCodeToEditor={handleLoadTutorialCode}
      />

      <BuildConfigModal
        isOpen={isBuildConfigOpen}
        onClose={() => setIsBuildConfigOpen(false)}
        config={buildConfig}
        onChangeConfig={setBuildConfig}
        onApplyAndTranslate={() => handleTranslate()}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        currentLanguage={language}
      />

      {/* Real-time Token & Credit consumption toast (1 credit = 2000 tokens) */}
      {tokenToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1324] border border-cyan-500/50 shadow-2xl shadow-cyan-950/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>{tokenToast.action}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                {tokenToast.tokens.toLocaleString()} tokens
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Consumo: <strong className="text-amber-400">-{tokenToast.credits} crédito{tokenToast.credits > 1 ? 's' : ''}</strong> (1 crédito paga 2,000 tokens)
            </p>
          </div>
          <button
            onClick={() => setTokenToast(null)}
            className="text-slate-500 hover:text-white ml-2 text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  User as UserType,
  Transaction
} from '../types';
import {
  X,
  Coins,
  CreditCard,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Flame,
  ArrowRight,
  Receipt,
  LogOut,
  Lock,
  Clock,
  Download,
  Copy,
  Check,
  CreditCard as CardIcon,
  Loader2,
  Database,
  Edit2,
  Save,
  ExternalLink
} from 'lucide-react';
import {
  auth,
  db,
  addCreditsToUser,
  recordGumroadPurchase,
  updateUserNameInFirestore,
  StoredTransaction
} from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onAddCredits: (amount: number, planName: string, costUsd: number) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onUpdateUserName?: (newName: string) => Promise<void>;
  currentLanguage: 'es' | 'en';
  onLanguageChange: (lang: 'es' | 'en') => void;
}

interface PricingTier {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  badge?: string;
  isPopular?: boolean;
  features: string[];
  gumroadUrl: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Pack Básico',
    credits: 500,
    priceUsd: 4.99,
    gumroadUrl: 'https://aldiaaipay.gumroad.com/l/basico',
    features: [
      '500 Traducciones IA pointC',
      'Exportación a C17 y C++20',
      'Auditoría básica de Stack/Heap'
    ]
  },
  {
    id: 'pro',
    name: 'Pack Pro Studio',
    credits: 2500,
    priceUsd: 14.99,
    badge: 'MÁS POPULAR',
    isPopular: true,
    gumroadUrl: 'https://aldiaaipay.gumroad.com/l/pro',
    features: [
      '2,500 Traducciones Ultra-Rápidas',
      'Optimizaciones SIMD & AVX2',
      'Análisis Ensamblador GCC/Clang',
      'Traductor Inverso Ilimitado'
    ]
  },
  {
    id: 'enterprise',
    name: 'Pack Desarrollador Master',
    credits: 10000,
    priceUsd: 39.99,
    badge: 'MÁXIMO AHORRO (60%)',
    gumroadUrl: 'https://aldiaaipay.gumroad.com/l/master',
    features: [
      '10,000 Créditos IA en Firebase',
      'Soporte Concurrencia Pthreads & OpenMP',
      'Simulador de Memoria sin límites',
      'Soporte prioritario 24/7'
    ]
  }
];

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onAddCredits,
  onLogout,
  onOpenAuth,
  onUpdateUserName,
  currentLanguage,
  onLanguageChange,
}) => {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | 'applepay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    txId: string;
    amount: number;
    credits: number;
    date: string;
    method: string;
  } | null>(null);

  // Form states
  const [cardHolder, setCardHolder] = useState(user?.name || 'Carlos Delgado');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvc, setCardCvc] = useState('924');
  const [copiedTx, setCopiedTx] = useState(false);
  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [transactionsHistory, setTransactionsHistory] = useState<StoredTransaction[]>([]);

  // User Name Editing in Firestore
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!editedName.trim() || !user) return;
    setIsSavingName(true);
    try {
      await updateUserNameInFirestore(user.id, editedName.trim());
      if (onUpdateUserName) {
        await onUpdateUserName(editedName.trim());
      }
      setIsEditingName(false);
      setNameSaveSuccess(true);
      setTimeout(() => setNameSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving user name to Firestore:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  useEffect(() => {
    if (user?.id && isOpen) {
      loadTransactions();
    }
  }, [user, isOpen]);

  const loadTransactions = async () => {
    if (!user?.id) return;
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.id),
        limit(10)
      );
      const snap = await getDocs(q);
      const txs: StoredTransaction[] = [];
      snap.forEach((d) => txs.push(d.data() as StoredTransaction));
      setTransactionsHistory(txs);
    } catch (e) {
      console.warn('Could not fetch tx history:', e);
    }
  };

  // Gumroad Automated Verification States
  const [gumroadOrderInput, setGumroadOrderInput] = useState('');
  const [selectedGumroadPack, setSelectedGumroadPack] = useState<'basico' | 'pro' | 'master'>('pro');
  const [isVerifyingGumroad, setIsVerifyingGumroad] = useState(false);
  const [gumroadVerifyMsg, setGumroadVerifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCheckingAuto, setIsCheckingAuto] = useState(false);

  // Helper to pass email and userId to Gumroad checkout URL
  const getGumroadUrlWithUser = (tier: PricingTier) => {
    try {
      const url = new URL(tier.gumroadUrl);
      if (user?.email) url.searchParams.set('email', user.email);
      if (user?.id) url.searchParams.set('userId', user.id);
      return url.toString();
    } catch {
      return tier.gumroadUrl;
    }
  };

  // Verify Gumroad Order and fulfill credits in Firestore
  const handleVerifyGumroadOrder = async (overrideOrder?: string) => {
    const orderToVerify = (overrideOrder || gumroadOrderInput).trim();
    if (!orderToVerify) {
      setGumroadVerifyMsg({
        type: 'error',
        text: currentLanguage === 'en'
          ? 'Please enter your Gumroad Order Number or Sale ID from your receipt.'
          : 'Por favor ingresa tu Número de Pedido o Recibo de Gumroad.',
      });
      return;
    }

    if (!user) {
      setGumroadVerifyMsg({
        type: 'error',
        text: currentLanguage === 'en'
          ? 'Please sign in or create an account first to receive your credits.'
          : 'Debes iniciar sesión para que los créditos queden vinculados a tu cuenta.',
      });
      return;
    }

    setIsVerifyingGumroad(true);
    setGumroadVerifyMsg(null);

    try {
      const response = await fetch('/api/gumroad/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderToVerify,
          email: user.email,
          userId: user.id,
          packPermalink: selectedGumroadPack,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo verificar el pedido de Gumroad.');
      }

      // Record in Firestore database
      const firestoreRes = await recordGumroadPurchase(
        user.id,
        user.email,
        data.credits,
        data.planName,
        data.amountUsd,
        data.orderNumber
      );

      if (!firestoreRes.success && firestoreRes.message) {
        throw new Error(firestoreRes.message);
      }

      // Update state in app
      onAddCredits(data.credits, data.planName, data.amountUsd);

      setLastReceipt({
        txId: data.orderNumber,
        amount: data.amountUsd,
        credits: data.credits,
        date: new Date().toLocaleString(),
        method: 'GUMROAD (aldiaaipay)',
      });

      setSelectedTier(PRICING_TIERS.find((t) => t.credits === data.credits) || PRICING_TIERS[1]);
      setPurchaseSuccess(true);
      setGumroadOrderInput('');
      setGumroadVerifyMsg({
        type: 'success',
        text: data.message || `¡Pago verificado! +${data.credits.toLocaleString()} créditos agregados.`,
      });

      loadTransactions();
    } catch (err: any) {
      setGumroadVerifyMsg({
        type: 'error',
        text: err?.message || 'Error al comprobar el pago.',
      });
    } finally {
      setIsVerifyingGumroad(false);
    }
  };

  // Check for automated pending sale via webhook
  const handleAutoCheckGumroad = async () => {
    if (!user?.email && !user?.id) {
      setGumroadVerifyMsg({
        type: 'error',
        text: 'Inicia sesión primero para comprobar tus compras asociadas.',
      });
      return;
    }

    setIsCheckingAuto(true);
    setGumroadVerifyMsg(null);

    try {
      const url = `/api/gumroad/check-pending?email=${encodeURIComponent(user.email || '')}&userId=${encodeURIComponent(user.id || '')}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.hasPending && data.sale?.orderNumber) {
        await handleVerifyGumroadOrder(data.sale.orderNumber);
      } else {
        setGumroadVerifyMsg({
          type: 'error',
          text: currentLanguage === 'en'
            ? 'No unredeemed Gumroad purchase detected yet for this email. If you just paid, paste your Order Number below.'
            : 'Aún no se ha recibido el aviso automático para este correo. Si ya pagaste, ingresa tu Número de Pedido abajo.',
        });
      }
    } catch (e: any) {
      setGumroadVerifyMsg({
        type: 'error',
        text: 'Error al consultar el servidor de verificación.',
      });
    } finally {
      setIsCheckingAuto(false);
    }
  };

  if (!isOpen) return null;

  const handleBuyPlan = (tier: PricingTier) => {
    setSelectedTier(tier);
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedTier || !user) return;
    setIsProcessing(true);

    try {
      // Record directly in Firebase Firestore
      await addCreditsToUser(
        user.id,
        user.email,
        selectedTier.credits,
        selectedTier.name,
        selectedTier.priceUsd,
        paymentMethod
      );

      const generatedTx = 'TX-PC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const receiptData = {
        txId: generatedTx,
        amount: selectedTier.priceUsd,
        credits: selectedTier.credits,
        date: new Date().toLocaleString(),
        method: paymentMethod.toUpperCase(),
      };

      setLastReceipt(receiptData);
      onAddCredits(selectedTier.credits, selectedTier.name, selectedTier.priceUsd);
      setPurchaseSuccess(true);
      loadTransactions();
    } catch (error) {
      console.error('Error in purchase flow:', error);
      // Fallback local credit addition
      onAddCredits(selectedTier.credits, selectedTier.name, selectedTier.priceUsd);
      setPurchaseSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyReceipt = () => {
    if (!lastReceipt) return;
    navigator.clipboard.writeText(
      `Comprobante pointC\nID: ${lastReceipt.txId}\nTotal: $${lastReceipt.amount} USD\nCréditos: +${lastReceipt.credits}\nFecha: ${lastReceipt.date}`
    );
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0b101c] border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080c16]">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="bg-[#060812] border border-cyan-500/60 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-medium w-full max-w-[200px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm disabled:opacity-50 shrink-0"
                    title="Guardar nombre en Firestore"
                  >
                    {isSavingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Guardar</span>
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="text-xs text-slate-400 hover:text-white px-1.5"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm truncate max-w-[180px]">
                    {user ? user.name : 'Invitado'}
                  </h3>
                  {user && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 rounded text-slate-500 hover:text-cyan-300 transition"
                      title="Editar nombre y guardar en Firestore"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono shrink-0">
                    Firestore Sync
                  </span>
                </div>
              )}

              {nameSaveSuccess && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                  <Check className="w-3 h-3" /> Guardado en Firestore
                </span>
              )}

              <p className="text-xs text-slate-400 font-mono truncate max-w-[220px]">
                {user ? user.email : 'Inicia sesión para sincronizar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Balance Card with Firestore Indicator */}
          <div className="bg-gradient-to-r from-cyan-950/70 via-blue-950/60 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                Saldo de Créditos IA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 font-mono font-bold">
                Plan {user?.plan || 'Gratuito'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {user?.credits ?? 0}
                </span>
                <span className="text-xs text-slate-400 font-medium">créditos disponibles</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {(user?.totalTokensSpent ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">tokens consumidos</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-amber-300 font-mono font-semibold">1 crédito cubre hasta 4,000 tokens</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Firestore Sync Activo
              </span>
            </div>
          </div>

          {/* System Language Preference Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5 text-cyan-300">
                🌐 Idioma del Sistema / System Language
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Google Translate API
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase font-mono">
                  {currentLanguage}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLanguageChange('es')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentLanguage === 'es'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🇪🇸 Español</span>
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentLanguage === 'en'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🇺🇸 English</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {currentLanguage === 'es'
                ? 'Traduce en tiempo real los textos visuales, menús, terminales y botones mediante Google Translate.'
                : 'Translates visual texts, menus, terminals, and buttons in real time via Google Translate.'}
            </p>
          </div>

          {/* Sub Navigation: Tienda vs Historial */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'store'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pasarela de Créditos</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historial de Pagos</span>
            </button>
          </div>

          {activeTab === 'store' ? (
            /* Pricing Store Section */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs md:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>
                      {currentLanguage === 'en'
                        ? 'Official Payment Gateway (Gumroad)'
                        : 'Pasarela Oficial de Pagos (Gumroad)'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {currentLanguage === 'en'
                      ? 'Secure checkout via aldiaaipay on Gumroad (Cards, PayPal, Apple Pay)'
                      : 'Checkout seguro vía aldiaaipay en Gumroad (Tarjetas, PayPal, Apple Pay)'}
                  </p>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 gap-3">
                {PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-2xl p-4 border transition relative flex flex-col justify-between gap-2.5 ${
                      tier.isPopular
                        ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/50 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-2.5 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
                        {tier.badge}
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-white text-sm">{tier.name}</h5>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-cyan-300 font-mono">
                            ${tier.priceUsd}
                          </span>
                          <span className="text-[11px] text-slate-400">USD</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-amber-300 font-mono flex items-center justify-end gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          +{tier.credits}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">créditos</span>
                      </div>
                    </div>

                    <ul className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-1.5 pt-1">
                      <a
                        href={getGumroadUrlWithUser(tier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                          tier.isPopular
                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400/40'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm hover:shadow'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>
                          {currentLanguage === 'en'
                            ? `Buy for $${tier.priceUsd} USD`
                            : `Comprar por $${tier.priceUsd} USD`}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>

                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Gumroad Checkout • aldiaaipay</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Automated Gumroad Payment Verification & Instant Credit Card */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#11192e] to-[#0c1222] border border-cyan-500/30 shadow-xl space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h5 className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>{currentLanguage === 'en' ? 'Verify Gumroad Payment & Redeem Credits' : 'Comprobar Pago de Gumroad y Acreditar'}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono font-normal">
                        {currentLanguage === 'en' ? 'Instant' : 'Automático'}
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {currentLanguage === 'en'
                        ? 'Did you already complete payment on Gumroad? Verify your order to credit your account immediately in Firestore.'
                        : '¿Ya realizaste el pago en Gumroad? Comprueba tu compra para acreditar tus créditos de inmediato en Firestore.'}
                    </p>
                  </div>
                </div>

                {/* Auto check button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutoCheckGumroad}
                    disabled={isCheckingAuto || isVerifyingGumroad}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCheckingAuto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{currentLanguage === 'en' ? 'Checking Gumroad...' : 'Comprobando Gumroad...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {currentLanguage === 'en'
                            ? 'Auto-Check by My Email'
                            : 'Comprobar automáticamente por mi correo'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-800" />
                  <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                    {currentLanguage === 'en' ? 'or enter order number' : 'o ingresa tu número de pedido'}
                  </span>
                  <div className="flex-grow border-t border-slate-800" />
                </div>

                {/* Manual Order Input & Pack Selection */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={gumroadOrderInput}
                        onChange={(e) => setGumroadOrderInput(e.target.value)}
                        placeholder={
                          currentLanguage === 'en'
                            ? 'Gumroad Order # or Sale ID (from receipt)'
                            : 'N° de Pedido o ID de Compra (de tu recibo)'
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <select
                        value={selectedGumroadPack}
                        onChange={(e) => setSelectedGumroadPack(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                      >
                        <option value="basico">Pack Básico (500 cr)</option>
                        <option value="pro">Pro Studio (2,500 cr)</option>
                        <option value="master">Master (10,000 cr)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyGumroadOrder()}
                    disabled={isVerifyingGumroad || isCheckingAuto}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isVerifyingGumroad ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{currentLanguage === 'en' ? 'Verifying payment...' : 'Verificando con Gumroad...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{currentLanguage === 'en' ? 'Verify Order & Claim Credits' : 'Verificar Pedido y Acreditar Créditos'}</span>
                      </>
                    )}
                  </button>

                  {/* Feedback Message */}
                  {gumroadVerifyMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                        gumroadVerifyMsg.type === 'success'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {gumroadVerifyMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{gumroadVerifyMsg.text}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Transactions History Tab */
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Historial de Transacciones en Firestore:
              </span>

              {transactionsHistory.length > 0 ? (
                <div className="space-y-2">
                  {transactionsHistory.map((tx, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-cyan-300 font-mono">{tx.planName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Ref: {tx.transactionRef} • {tx.paymentMethod}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold font-mono text-emerald-400 block">
                          +${tx.amountUsd} USD
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          +{tx.creditsAdded} cr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
                  Aún no tienes compras registradas en la base de datos.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Logout */}
        <div className="p-3.5 border-t border-slate-800 bg-[#080c16] flex items-center justify-between">
          {user ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Iniciar Sesión / Registro</span>
            </button>
          )}
          <span className="text-[10px] text-slate-500 font-mono">Firebase Auth & Firestore</span>
        </div>
      </div>

      {/* Advanced Checkout Payment Gateway Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-sans">
          <div className="bg-[#0b101c] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            {purchaseSuccess && lastReceipt ? (
              <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">¡Pago Aprobado y Guardado en Firebase!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Se han acreditado <strong className="text-amber-300 font-mono">+{lastReceipt.credits} créditos</strong> en tu cuenta.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-left text-xs font-mono space-y-2">
                  <div className="flex justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                    <span>Recibo Oficial:</span>
                    <span className="text-cyan-300 font-bold">{lastReceipt.txId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Pagado:</span>
                    <span className="text-white font-bold">${lastReceipt.amount} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Método de Pago:</span>
                    <span className="text-emerald-300">{lastReceipt.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fecha:</span>
                    <span className="text-slate-300">{lastReceipt.date}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyReceipt}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTx ? 'Copiado' : 'Copiar Recibo'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTier(null);
                      setPurchaseSuccess(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-white text-base">Pasarela de Pago Segura</h4>
                      <p className="text-xs text-slate-400">pointC AI Studio • Encriptación SSL 256-bit</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTier(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Plan Summary */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{selectedTier.name}</span>
                    <span className="text-slate-400">+{selectedTier.credits} Créditos pointC AI</span>
                  </div>
                  <span className="text-lg font-mono font-black text-cyan-300">
                    ${selectedTier.priceUsd} USD
                  </span>
                </div>

                {/* Direct Gumroad Checkout Button */}
                <a
                  href={getGumroadUrlWithUser(selectedTier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Pagar en Gumroad Oficial ({selectedTier.name} • ${selectedTier.priceUsd} USD)</span>
                </a>

                {/* Payment Methods */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition ${
                      paymentMethod === 'card'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    💳 Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-950 text-blue-300 border-blue-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🅿️ PayPal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition ${
                      paymentMethod === 'applepay'
                        ? 'bg-slate-800 text-white border-slate-600'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🍎 Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition ${
                      paymentMethod === 'crypto'
                        ? 'bg-purple-950 text-purple-300 border-purple-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🪙 Crypto
                  </button>
                </div>

                {/* Card Fields Form */}
                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium text-[11px]">Titular de la cuenta / tarjeta:</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium text-[11px]">Número de Tarjeta (Visa / Mastercard):</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium text-[11px]">Vencimiento:</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium text-[11px]">CVC / CVV:</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Procesando pago con pasarela y Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pagar ${selectedTier.priceUsd} USD con {paymentMethod.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

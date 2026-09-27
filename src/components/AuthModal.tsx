import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import {
  auth,
  googleProvider,
  syncUserProfile,
  UserProfile
} from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectId = firebaseConfig.projectId || 'pointc-e9618';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleContinueAsLocalDev = () => {
    const localProfile: UserProfile = {
      uid: 'dev_local_' + Math.random().toString(36).substring(2, 9),
      displayName: name.trim() || 'Desarrollador pointC (Local)',
      email: email.trim() || 'desarrollador@pointc.dev',
      credits: 150,
      plan: 'Gratuito',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      localStorage.setItem('pointc_local_user', JSON.stringify(localProfile));
    } catch {}
    onLoginSuccess(localProfile);
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCred.user, { displayName: name.trim() });
        }
        const profile = await syncUserProfile(userCred.user);
        onLoginSuccess(profile);
        onClose();
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await syncUserProfile(userCred.user);
        onLoginSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      let message = 'Error al procesar la solicitud.';
      if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('unauthorized-domain'))) {
        console.warn('[Firebase Auth] Domain not yet authorized in Firebase Console:', currentHostname);
        setUnauthorizedDomain(currentHostname);
        message = `El dominio actual (${currentHostname}) no está en los "Dominios autorizados" de Firebase.`;
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Este correo electrónico ya está registrado. Inicia sesión.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Credenciales incorrectas o correo no registrado.';
      } else if (err.code === 'auth/weak-password') {
        message = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'El proveedor de correo/contraseña aún no está activado en tu consola de Firebase.';
      } else if (err.message) {
        message = err.message;
        console.error('Firebase Auth error:', err);
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(result.user);
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('unauthorized-domain'))) {
        console.warn('[Firebase Auth] Domain not yet authorized in Firebase Console:', currentHostname);
        setUnauthorizedDomain(currentHostname);
        setErrorMsg(`Dominio no autorizado en Firebase (${currentHostname}).`);
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // Closed voluntarily by user
      } else {
        console.error('Google Auth error:', err);
        setErrorMsg('Error al conectar con Google: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      const profile = await syncUserProfile(result.user);
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.warn('Anonymous Auth fallback to local session:', err);
      // Fallback seamlessly to local session so user is never blocked by unauthorized domain or disabled anonymous auth
      handleContinueAsLocalDev();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0b101c] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isRegister ? 'Crear Cuenta pointC' : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-slate-400">Proyecto Firebase: <span className="font-mono text-cyan-400">{firebaseProjectId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Unauthorized Domain Diagnostic Panel */}
        {unauthorizedDomain && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/60 text-amber-200 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Dominio no autorizado en Firebase:</span>
                <span className="text-[11px] text-amber-300/90 leading-relaxed block mt-0.5">
                  Google bloquea el inicio de sesión OAuth porque este entorno no está en la lista de dominios autorizados de tu nuevo proyecto <strong className="text-white">{firebaseProjectId}</strong>.
                </span>
              </div>
            </div>

            {/* Copyable Domain Box */}
            <div className="bg-[#060a12] p-2 rounded-lg border border-amber-500/30 flex items-center justify-between gap-2">
              <div className="font-mono text-[11px] text-cyan-300 truncate select-all">
                {unauthorizedDomain}
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(unauthorizedDomain)}
                className="shrink-0 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition"
              >
                {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDomain ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Abrir Ajustes en Firebase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleContinueAsLocalDev}
                className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-[11px] transition text-center"
              >
                Entrar en Modo Local
              </button>
            </div>
          </div>
        )}

        {/* Generic Error Notification */}
        {errorMsg && !unauthorizedDomain && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Quick Login */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] text-slate-500 uppercase font-semibold">o con tu correo</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Nombre completo:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Breiner Delgado"
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Correo electrónico:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Contraseña:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isRegister ? 'Registrarme & Recibir 150 Créditos' : 'Iniciar Sesión'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Guest & Switcher */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Continuar como Invitado (150 créditos gratis)</span>
          </button>

          <div className="text-center text-xs text-slate-400 pt-1">
            {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta aún?'}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-cyan-400 font-semibold hover:underline"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

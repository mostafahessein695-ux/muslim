import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle, loginWithApple } = useAuth();

  // Active view: 'login' | 'register' | 'forgot' | 'google' | 'apple'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'google' | 'apple'>('login');

  // Customer credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+20 ');
  const [password, setPassword] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(true);

  // Google OAuth custom account inputs
  const [googleCustomEmail, setGoogleCustomEmail] = useState('mostafahessein695@gmail.com');
  const [googleCustomName, setGoogleCustomName] = useState('Mostafa Hussein');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Apple OAuth custom account
  const [appleEmail, setAppleEmail] = useState('mostafahessein695@gmail.com');
  const [appleName, setAppleName] = useState('Mostafa Hussein');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState<{
    message: string;
    emailStatus?: string;
    waStatus?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Standard Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    }
  };

  // Customer Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await register({
      name,
      email,
      phone,
      password,
      whatsappConsent
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessNotice({
        message: 'تم إنشاء الحساب بنجاح! تم إرسال رسالة الترحيب إلى بريدك.',
        emailStatus: res.notifications?.email?.status || 'delivered_simulated',
        waStatus: res.notifications?.whatsapp?.status || 'pending_setup'
      });
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setErrorMessage(res.error || 'فشل إنشاء الحساب.');
    }
  };

  // Google Sign-In Execution with real email & name
  const executeGoogleLogin = async (selectedEmail: string, selectedName: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithGoogle(selectedEmail, selectedName);
      setIsLoading(false);
      if (res.success) {
        setSuccessNotice({
          message: `تم تسجيل الدخول بنجاح بحساب Google: ${selectedEmail}! مرحباً بك.`
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الدخول بحساب Google.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بخدمة Google.');
    }
  };

  // Apple Sign-In Execution
  const executeAppleLogin = async (selectedEmail: string, selectedName: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithApple(selectedEmail, selectedName);
      setIsLoading(false);
      if (res.success) {
        setSuccessNotice({
          message: `تم تسجيل الدخول بنجاح بواسطة Apple ID: ${selectedEmail}!`
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الدخول بواسطة Apple.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'حدث خطأ في الاتصال.');
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني لحسابك.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setIsLoading(false);
      setSuccessNotice({ message: data.message });
    } catch {
      setIsLoading(false);
      setErrorMessage('تعذر إرسال رمز إعادة التعيين.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#090b11] border border-[#1d2334] rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1a2030] flex items-center justify-between bg-[#0d101a]">
          <div>
            <span className="text-[11px] font-mono text-[#00f0ff] uppercase tracking-widest block">
              {mode === 'google'
                ? 'GOOGLE IDENTITY SERVICES'
                : mode === 'apple'
                ? 'SIGN IN WITH APPLE'
                : 'MEMBERSHIP PROTOCOL'}
            </span>
            <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-tight">
              {mode === 'google'
                ? 'تسجيل الدخول باستخدام Google'
                : mode === 'apple'
                ? 'تسجيل الدخول بواسطة Apple'
                : mode === 'login'
                ? 'تسجيل الدخول / Sign In'
                : mode === 'register'
                ? 'حساب جديد / Create Account'
                : 'إعادة تعيين كلمة المرور'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle for Standard Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-[#1a2030] bg-[#0c0e17]">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                mode === 'login'
                  ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#121624]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول (Sign In)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                mode === 'register'
                  ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#121624]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              حساب جديد (Register)
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-4 bg-[#0d1a15] border border-emerald-600/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successNotice.message}</span>
              </div>
              {successNotice.emailStatus && (
                <div className="text-[11px] font-mono text-slate-300 border-t border-emerald-900/40 pt-2 space-y-1">
                  <p>
                    📧 البريد الترحيبي:{' '}
                    <span className="text-emerald-400 font-bold">{successNotice.emailStatus}</span>
                  </p>
                  <p>
                    💬 إشعار الواتساب:{' '}
                    <span className="text-[#00f0ff] font-bold">{successNotice.waStatus}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* GOOGLE SIGN-IN DEDICATED PROMPT VIEW */}
          {/* -------------------------------------------------- */}
          {mode === 'google' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#111624] border border-[#212c42] rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold">اختر حساب Google للمتابعة</h3>
                  <p className="text-[11px] text-slate-400">
                    للدخول الآمن إلى متجر KAIRØ DISTRICT
                  </p>
                </div>
              </div>

              {/* Detected User Account Card */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  executeGoogleLogin('mostafahessein695@gmail.com', 'Mostafa Hussein')
                }
                className="w-full p-4 bg-[#141b2c] hover:bg-[#1a243a] border border-[#2b3752] hover:border-[#00f0ff] rounded-xl flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold flex items-center justify-center text-sm shadow">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs group-hover:text-[#00f0ff] transition-colors">
                        Mostafa Hussein
                      </span>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.2 rounded font-mono">
                        حسابك
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono block">
                      mostafahessein695@gmail.com
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Toggle Custom Account */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(!showCustomGoogleInput)}
                  className="text-xs text-[#00f0ff] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>
                    {showCustomGoogleInput
                      ? 'إخفاء الحساب المخصص'
                      : 'استخدام حساب Google آخر (Use another account)'}
                  </span>
                </button>
              </div>

              {/* Custom Google Account Form */}
              {showCustomGoogleInput && (
                <div className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-3 animate-fade-in text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      بريد Google الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={googleCustomEmail}
                      onChange={e => setGoogleCustomEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full bg-[#141824] border border-[#242c3f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      الاسم المعروض
                    </label>
                    <input
                      type="text"
                      value={googleCustomName}
                      onChange={e => setGoogleCustomName(e.target.value)}
                      placeholder="اسمك"
                      className="w-full bg-[#141824] border border-[#242c3f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeGoogleLogin(googleCustomEmail, googleCustomName)}
                    className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>تسجيل الدخول بهذا الحساب</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Back button */}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← العودة إلى تسجيل الدخول العادي
              </button>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* APPLE SIGN-IN VIEW */}
          {/* -------------------------------------------------- */}
          {mode === 'apple' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#111624] border border-[#212c42] rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black border border-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.74-7.93-12.14-14.56-6.42-9.74-11.45-20.73-15.09-32.96-3.64-12.24-5.46-23.77-5.46-34.6 0-14.28 3.51-26.15 10.53-35.62 7.02-9.46 15.93-14.25 26.74-14.37 5.12 0 10.66 1.34 16.63 4.02 5.97 2.68 9.87 4.07 11.71 4.17 1.48 0 5.45-1.4 11.91-4.21 6.46-2.81 12.13-4.11 17.01-3.89 12.57.65 22.84 5.37 30.82 14.15-11 6.66-16.36 15.84-16.07 27.53.31 9.24 3.84 17.04 10.58 23.41 6.74 6.37 14.79 10.15 24.15 11.34-2.12 6.39-4.82 12.98-8.12 19.78zM119.22 33.15c0-7.39 2.67-14.24 8.01-20.55 5.34-6.31 11.99-10.22 19.95-11.72.19 1.13.29 2.27.29 3.42 0 7.39-2.8 14.39-8.4 21.01-5.6 6.62-12.37 10.4-20.31 11.34-.38-1.13-.57-2.3-.57-3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold">تسجيل الدخول باستخدام Apple ID</h3>
                  <p className="text-[11px] text-slate-400">توثيق آمن مشفر</p>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => executeAppleLogin(appleEmail, appleName)}
                className="w-full p-4 bg-[#141824] hover:bg-[#1a2030] border border-[#263044] rounded-xl flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <span className="text-white font-bold text-xs block group-hover:text-[#00f0ff]">
                    {appleName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{appleEmail}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
              >
                ← العودة إلى تسجيل الدخول
              </button>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* STANDARD AUTH PROVIDER BUTTONS */}
          {/* -------------------------------------------------- */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => setMode('google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#121624] hover:bg-[#192033] border border-[#232b3e] hover:border-[#00f0ff] rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>متابعة باستخدام Google (Continue with Google)</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => setMode('apple')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#121624] hover:bg-[#192033] border border-[#232b3e] rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.74-7.93-12.14-14.56-6.42-9.74-11.45-20.73-15.09-32.96-3.64-12.24-5.46-23.77-5.46-34.6 0-14.28 3.51-26.15 10.53-35.62 7.02-9.46 15.93-14.25 26.74-14.37 5.12 0 10.66 1.34 16.63 4.02 5.97 2.68 9.87 4.07 11.71 4.17 1.48 0 5.45-1.4 11.91-4.21 6.46-2.81 12.13-4.11 17.01-3.89 12.57.65 22.84 5.37 30.82 14.15-11 6.66-16.36 15.84-16.07 27.53.31 9.24 3.84 17.04 10.58 23.41 6.74 6.37 14.79 10.15 24.15 11.34-2.12 6.39-4.82 12.98-8.12 19.78zM119.22 33.15c0-7.39 2.67-14.24 8.01-20.55 5.34-6.31 11.99-10.22 19.95-11.72.19 1.13.29 2.27.29 3.42 0 7.39-2.8 14.39-8.4 21.01-5.6 6.62-12.37 10.4-20.31 11.34-.38-1.13-.57-2.3-.57-3.5z" />
                </svg>
                <span>متابعة بواسطة Apple</span>
              </button>

              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1a2030]" />
                </div>
                <span className="relative bg-[#090b11] px-3 text-[10px] uppercase font-mono text-slate-500">
                  أو عبر البريد الإلكتروني (Or with Email)
                </span>
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* STANDARD EMAIL & PASSWORD LOGIN FORM */}
          {/* -------------------------------------------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  البريد الإلكتروني / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-slate-400">
                    كلمة المرور / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#00f0ff] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'جارٍ التحقق...' : 'تسجيل الدخول (Sign In)'}
              </button>
            </form>
          )}

          {/* -------------------------------------------------- */}
          {/* CUSTOMER REGISTRATION FORM */}
          {/* -------------------------------------------------- */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  الاسم بالكامل / Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Mostafa Hussein"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  البريد الإلكتروني / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  رقم الهاتف (مصر +20) / Mobile Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  كلمة المرور / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              {/* WhatsApp Welcome Consent Checkbox */}
              <div className="p-3 bg-[#0d121e] border border-[#1d263b] rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={whatsappConsent}
                    onChange={e => setWhatsappConsent(e.target.checked)}
                    className="mt-0.5 rounded cursor-pointer"
                  />
                  <span>
                    أوافق على استلام كود الخصم (WELCOME10) وإشعارات الشحن عبر الواتساب على{' '}
                    <strong className="text-[#00f0ff]">{phone}</strong>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب (Create Account)'}
              </button>
            </form>
          )}

          {/* -------------------------------------------------- */}
          {/* FORGOT PASSWORD FORM */}
          {/* -------------------------------------------------- */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                أدخل بريدك الإلكتروني وسيتم إرسال رمز تحقق مسجل فوراً لإعادة تعيين كلمة المرور.
              </p>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#121624] border border-[#232b3e] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                إرسال رمز التحقق
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← العودة إلى تسجيل الدخول
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

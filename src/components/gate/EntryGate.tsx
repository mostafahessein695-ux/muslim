import React, { useState } from 'react';
import {
  Globe,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ChevronRight
} from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface EntryGateProps {
  onEnterStore: () => void;
}

export const EntryGate: React.FC<EntryGateProps> = ({ onEnterStore }) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { login, register, loginWithGoogle } = useAuth();

  // Step 1: 'language' (Choose EN vs AR) -> Step 2: 'auth' (Sign in with Google / Email or Enter as Guest)
  const [step, setStep] = useState<'language' | 'auth'>('language');

  // Auth form states inside the gate
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+20 ');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Choose language and proceed to entrance gate step
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setStep('auth');
  };

  // Google Sign-In on Gate
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await loginWithGoogle('mostafahessein695@gmail.com', 'Mostafa Hussein');
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(
          language === 'ar'
            ? 'مرحباً بك يا Mostafa Hussein! جارٍ الدخول إلى المتجر...'
            : 'Welcome back, Mostafa Hussein! Entering the archive...'
        );
        setTimeout(() => {
          onEnterStore();
        }, 1200);
      } else {
        setAuthError(res.error || 'Google login failed.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Error occurred.');
    }
  };

  // Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(
        language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Signed in successfully!'
      );
      setTimeout(() => {
        onEnterStore();
      }, 1000);
    } else {
      setAuthError(res.error || 'Invalid credentials.');
    }
  };

  // Email Register
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    const res = await register({
      name,
      email,
      phone,
      password,
      whatsappConsent: true
    });
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(
        language === 'ar'
          ? 'تم إنشاء الحساب وإرسال بريد الترحيب! جاري الدخول...'
          : 'Account created & welcome email dispatched! Entering...'
      );
      setTimeout(() => {
        onEnterStore();
      }, 1200);
    } else {
      setAuthError(res.error || 'Registration failed.');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#07080d] overflow-y-auto flex flex-col justify-between selection:bg-[#00f0ff] selection:text-black ${
        isRtl ? 'font-sans text-right' : 'font-sans text-left'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Graphic Asset with Dark Streetwear Scrim */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img
          src="/src/assets/images/hero_streetwear_campaign_1791725306950.jpg"
          alt=""
          className="w-full h-full object-cover filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/80 to-[#07080d]" />
      </div>

      {/* Top Bar on Entrance Gate */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-white">
            KAIRØ // 20
          </span>
          <span className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest bg-[#111624] border border-[#00f0ff]/30 px-2 py-0.5 rounded">
            PORTAL
          </span>
        </div>

        {/* Quick Language Switcher Pill */}
        <div className="flex items-center gap-2 bg-[#101422] border border-[#20293d] rounded-full p-1 text-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full font-bold transition-colors ${
              language === 'en' ? 'bg-[#0066ff] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-3 py-1 rounded-full font-bold transition-colors ${
              language === 'ar' ? 'bg-[#0066ff] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            العربية
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* ======================================================= */}
          {/* STEP 1: LANGUAGE SELECTION SCREEN */}
          {/* ======================================================= */}
          {step === 'language' ? (
            <div className="bg-[#0b0e17]/95 border border-[#1b2234] rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8 animate-fade-in text-center">
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#0066ff]/20 border border-[#0066ff]/40 text-[#00f0ff] mx-auto flex items-center justify-center shadow-lg">
                  <Globe className="w-7 h-7" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Choose Language / اختر اللغة
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  Select your preferred browsing experience for KAIRØ DISTRICT Streetwear.
                </p>
              </div>

              {/* Language Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* English Card */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('en')}
                  className="p-5 bg-[#121624] hover:bg-[#182033] border border-[#232d42] hover:border-[#00f0ff] rounded-xl text-left transition-all group flex flex-col justify-between space-y-4 hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider">
                      EN
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                      English
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      International Streetwear Storefront
                    </p>
                  </div>
                </button>

                {/* Arabic Card */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('ar')}
                  className="p-5 bg-[#121624] hover:bg-[#182033] border border-[#232d42] hover:border-[#00f0ff] rounded-xl text-right transition-all group flex flex-col justify-between space-y-4 hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider">
                      AR
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-transform rotate-180" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                      العربية
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      التجربة الكاملة باللغة العربية
                    </p>
                  </div>
                </button>
              </div>

              {/* Direct Skip Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    onEnterStore();
                  }}
                  className="text-xs text-slate-400 hover:text-white underline font-mono transition-colors"
                >
                  Skip directly to store (تخطي والدخول للمتجر مباشرة)
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* STEP 2: PRE-ENTRY GATE / SIGN-IN SCREEN */
            /* ======================================================= */
            <div className="bg-[#0b0e17]/95 border border-[#1b2234] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 animate-fade-in">
              <div className="text-center space-y-1.5">
                <span className="text-[11px] font-mono text-[#00f0ff] uppercase tracking-widest block">
                  ACCESS VERIFICATION // SS26
                </span>
                <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">
                  {language === 'ar' ? 'بوابة الدخول إلى المتجر' : 'Enter The Underground Archive'}
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {language === 'ar'
                    ? 'سجل دخولك للحصول على خصم 10% وأولوية الوصول للإصدارات المحدودة.'
                    : 'Sign in to access VIP 10% discount and priority drop allocations.'}
                </p>
              </div>

              {/* Notifications */}
              {authError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
                  {authError}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Google Fast Sign-In Card */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  className="w-full p-3.5 bg-[#141b2c] hover:bg-[#1a243a] border border-[#2b3752] hover:border-[#00f0ff] rounded-xl flex items-center justify-between text-left transition-all group shadow-sm active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow">
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
                    </div>
                    <div>
                      <span className="text-white font-bold text-xs block group-hover:text-[#00f0ff] transition-colors">
                        {language === 'ar'
                          ? 'المتابعة بحساب Mostafa Hussein'
                          : 'Continue as Mostafa Hussein'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        mostafahessein695@gmail.com
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all" />
                </button>

                <div className="relative py-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1a2030]" />
                  </div>
                  <span className="relative bg-[#0b0e17] px-3 text-[10px] uppercase font-mono text-slate-500">
                    {language === 'ar' ? 'أو بالبريد الإلكتروني' : 'Or via email'}
                  </span>
                </div>
              </div>

              {/* Email Form Tabs */}
              <div className="flex border-b border-[#1a2030] bg-[#090b11] rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-1.5 rounded-md font-bold uppercase transition-colors ${
                    authMode === 'signin' ? 'bg-[#0066ff] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'دخول' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 rounded-md font-bold uppercase transition-colors ${
                    authMode === 'register' ? 'bg-[#0066ff] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'تسجيل جديد' : 'Register'}
                </button>
              </div>

              {/* Forms */}
              {authMode === 'signin' ? (
                <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg transition-colors uppercase tracking-wider"
                  >
                    {isLoading ? '...' : language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailRegister} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Mostafa Hussein"
                      className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      {language === 'ar' ? 'رقم الهاتف (+20)' : 'Phone (+20)'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+20 100 123 4567"
                      className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg transition-colors uppercase tracking-wider"
                  >
                    {isLoading ? '...' : language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                  </button>
                </form>
              )}

              {/* Enter as Guest / Skip Gate Button */}
              <div className="pt-2 border-t border-[#1a2030] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('language')}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  ← {language === 'ar' ? 'تغيير اللغة' : 'Change Language'}
                </button>

                <button
                  type="button"
                  onClick={onEnterStore}
                  className="px-4 py-2 bg-[#141b2c] hover:bg-[#1f2840] border border-[#26334f] text-[#00f0ff] font-bold text-xs uppercase rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>{language === 'ar' ? 'الدخول كزائر وتصفح المتجر' : 'Enter Store as Guest'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer on Gate */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-slate-400 font-mono">
        <span>© 2026 KAIRØ DISTRICT. Egyptian Heavyweight Streetwear. Zamalek, Cairo.</span>
      </footer>
    </div>
  );
};

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, ShoppingCart, Store } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types';

type Mode = 'login' | 'register' | 'forgot' | 'magic';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, signInWithMagicLink, resetPassword } = useAuthStore();

  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setSubmitted(true);
      } else if (mode === 'magic') {
        await signInWithMagicLink(email);
        setSubmitted(true);
      } else if (mode === 'login') {
        await signIn(email, password);
        navigate(redirectTo);
      } else {
        await signUp(email, password, name, role);
        setSubmitted(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Něco se pokazilo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Přihlášení přes Google selhalo';
      setError(msg);
    }
  };

  // Confirmation screens
  if (submitted && (mode === 'forgot' || mode === 'magic' || mode === 'register')) {
    const messages = {
      forgot: { title: 'Obnovení hesla', text: `Na adresu ${email} jsme zaslali odkaz pro obnovení hesla.` },
      magic: { title: 'Magic link odeslán', text: `Klikněte na odkaz v e-mailu na ${email} pro přihlášení.` },
      register: { title: 'Účet vytvořen', text: `Klikněte na potvrzovací odkaz v e-mailu na ${email}.` },
      login: { title: '', text: '' },
    };
    const msg = messages[mode];
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Mail className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-surface-100 mb-2">{msg.title}</h2>
        <p className="text-sm text-surface-400 mb-6">{msg.text}</p>
        <button
          onClick={() => { setMode('login'); setSubmitted(false); }}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          Zpět na přihlášení
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-surface-100">Autovizor.cz</span>
        </Link>
      </div>

      <div className="bg-surface-900 rounded-xl border border-surface-800 p-6">
        {/* Tabs */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex mb-6 bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-100'
              }`}
            >
              Přihlásit se
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'register' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-100'
              }`}
            >
              Registrace
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-surface-100 mb-1">Zapomenuté heslo</h2>
            <p className="text-sm text-surface-400">Zadejte e-mail a zašleme vám odkaz pro obnovení.</p>
          </div>
        )}

        {mode === 'magic' && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-surface-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              Přihlášení odkazem
            </h2>
            <p className="text-sm text-surface-400">Pošleme vám odkaz pro jednorázové přihlášení bez hesla.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Typ účtu</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`flex flex-col items-start p-3 rounded-lg text-left transition-colors ${
                      role === 'buyer'
                        ? 'bg-primary-500/15 border border-primary-500/40'
                        : 'bg-surface-800 border border-transparent hover:border-surface-700'
                    }`}
                  >
                    <ShoppingCart className={`w-5 h-5 mb-1.5 ${role === 'buyer' ? 'text-primary-400' : 'text-surface-400'}`} />
                    <span className="text-sm font-semibold text-surface-100">Hledám auto</span>
                    <span className="text-[10px] text-surface-500">Garáž, alerty, dotazy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('private_seller')}
                    className={`flex flex-col items-start p-3 rounded-lg text-left transition-colors ${
                      role === 'private_seller'
                        ? 'bg-primary-500/15 border border-primary-500/40'
                        : 'bg-surface-800 border border-transparent hover:border-surface-700'
                    }`}
                  >
                    <Store className={`w-5 h-5 mb-1.5 ${role === 'private_seller' ? 'text-primary-400' : 'text-surface-400'}`} />
                    <span className="text-sm font-semibold text-surface-100">Chci prodat</span>
                    <span className="text-[10px] text-surface-500">Inzerát zdarma</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Jméno</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jan Novák"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@email.cz"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {mode !== 'forgot' && mode !== 'magic' && (
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Zadejte heslo"
                  required
                  minLength={6}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => { setMode('magic'); setError(null); }}
                className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Přihlásit odkazem
              </button>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(null); }}
                className="text-primary-400 hover:text-primary-300"
              >
                Zapomenuté heslo?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-700 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Přihlásit se'
              : mode === 'register' ? 'Vytvořit účet'
              : mode === 'magic' ? 'Poslat magic link'
              : 'Odeslat odkaz'}
          </button>
        </form>

        {(mode === 'forgot' || mode === 'magic') && (
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className="w-full mt-3 text-sm text-surface-400 hover:text-surface-100 text-center"
          >
            Zpět na přihlášení
          </button>
        )}

        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface-900 text-xs text-surface-500">nebo</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 hover:bg-surface-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Pokračovat přes Google
            </button>
          </>
        )}
      </div>

      {(mode === 'login' || mode === 'register') && (
        <p className="text-xs text-surface-500 text-center mt-4">
          {mode === 'login' ? 'Nemáte účet? ' : 'Máte již účet? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-primary-400 hover:text-primary-300"
          >
            {mode === 'login' ? 'Zaregistrujte se' : 'Přihlaste se'}
          </button>
        </p>
      )}
    </div>
  );
}

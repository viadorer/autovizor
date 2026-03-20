import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setSubmitted(true);
      return;
    }
    // TODO: Supabase auth
    alert(mode === 'login' ? 'Přihlášení bude dostupné po připojení Supabase.' : 'Registrace bude dostupná po připojení Supabase.');
  };

  if (submitted && mode === 'forgot') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Mail className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-surface-100 mb-2">E-mail odeslán</h2>
        <p className="text-sm text-surface-400 mb-6">
          Na adresu <strong className="text-surface-100">{email}</strong> jsme zaslali odkaz pro obnovení hesla.
        </p>
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
        {mode !== 'forgot' && (
          <div className="flex mb-6 bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-100'
              }`}
            >
              Přihlásit se
            </button>
            <button
              onClick={() => setMode('register')}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
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
                className="w-full pl-10 pr-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Zapomenuté heslo?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-bold text-white transition-colors"
          >
            {mode === 'login' ? 'Přihlásit se' : mode === 'register' ? 'Vytvořit účet' : 'Odeslat odkaz'}
          </button>
        </form>

        {mode === 'forgot' && (
          <button
            onClick={() => setMode('login')}
            className="w-full mt-3 text-sm text-surface-400 hover:text-surface-100 text-center"
          >
            Zpět na přihlášení
          </button>
        )}

        {mode !== 'forgot' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface-900 text-xs text-surface-500">nebo</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 hover:bg-surface-700 transition-colors">
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

      {mode !== 'forgot' && (
        <p className="text-xs text-surface-500 text-center mt-4">
          {mode === 'login' ? 'Nemáte účet? ' : 'Máte již účet? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary-400 hover:text-primary-300"
          >
            {mode === 'login' ? 'Zaregistrujte se' : 'Přihlaste se'}
          </button>
        </p>
      )}
    </div>
  );
}

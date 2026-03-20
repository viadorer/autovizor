import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="text-9xl font-extrabold text-primary-500 select-none">404</p>
        <h1 className="mt-4 text-3xl font-bold text-surface-100">
          Stránka nenalezena
        </h1>
        <p className="mt-3 text-surface-400 text-lg">
          Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-surface-100 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Zpět na hlavní stránku
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Předchozí stránka
          </button>
        </div>
      </div>
    </div>
  );
}

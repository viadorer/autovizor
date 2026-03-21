import { Link } from 'react-router-dom';
import { AutovizorLogo } from './AutovizorLogo';

export default function Footer() {
  return (
    <footer className="bg-surface-950 border-t border-surface-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo a popis */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <AutovizorLogo size={24} />
              <span className="text-lg font-bold text-surface-100">
                Auto<span className="text-primary-600">vizor</span>.cz
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed">
              Největší výběr aut v České republice. Najděte své vysněné vozidlo mezi tisíci nabídkami.
            </p>
          </div>

          {/* Hledání */}
          <div>
            <h3 className="text-sm font-semibold text-surface-100 mb-4">Hledání</h3>
            <ul className="space-y-2">
              {['Osobní auta', 'Užitková vozidla', 'Motocykly', 'Nákladní vozy', 'Obytné vozy'].map((item) => (
                <li key={item}>
                  <Link to="/hledat" className="text-sm text-surface-400 hover:text-surface-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Služby */}
          <div>
            <h3 className="text-sm font-semibold text-surface-100 mb-4">Služby</h3>
            <ul className="space-y-2">
              {[
                { label: 'Prodat auto', to: '/prodat' },
                { label: 'Poradna', to: '/poradna' },
                { label: 'Porovnání vozidel', to: '/porovnani' },
                { label: 'Oblíbené', to: '/oblibene' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-surface-400 hover:text-surface-100 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* O nás */}
          <div>
            <h3 className="text-sm font-semibold text-surface-100 mb-4">O nás</h3>
            <ul className="space-y-2">
              {[
                { label: 'O Autovizor.cz', to: '#' },
                { label: 'Kontakt', to: '#' },
                { label: 'Podmínky užívání', to: '#' },
                { label: 'Ochrana soukromí', to: '#' },
                { label: 'Přihlášení', to: '/prihlaseni' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-surface-400 hover:text-surface-100 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            &copy; {new Date().getFullYear()} Autovizor.cz – Všechna práva vyhrazena.
          </p>
          <p className="text-xs text-surface-500">
            Vytvořeno s láskou v ČR
          </p>
        </div>
      </div>
    </footer>
  );
}

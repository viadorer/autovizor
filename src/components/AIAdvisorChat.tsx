import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { aiParseQuery } from '../lib/gemini-search';
import { useSearchStore } from '../stores/searchStore';
import { checkRateLimit, formatResetTime } from '../lib/rate-limit';
import type { SearchFilters } from '../types';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  filters?: SearchFilters;
}

const SUGGESTIONS = [
  'Rodinné SUV do 500 tisíc, automat',
  'BMW řady 3 do 100 tisíc km, benzín 2018+',
  'Elektromobil s dojezdem nad 400 km',
  'Levné auto pro studenta do 80 tisíc',
  'Kombi s tažným, do 800 tisíc, max 50 tis. km',
];

const RATE_LIMIT_PER_HOUR = 20;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Konverzační AI poradce. Doplněk k inline AI v hero search baru:
 *  - search bar = jeden-shot natural language → filtry → /hledat
 *  - poradna chat = vícekrokové upřesnění + edukace + tipy
 */
export default function AIAdvisorChat() {
  const navigate = useNavigate();
  const { setFilters, search, resetFilters } = useSearchStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState<{ resetAt: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const askAI = async (query: string) => {
    if (!query.trim() || loading) return;

    // Rate limit check (sdílí kvótu se search bar AI — 20/h)
    const rl = checkRateLimit('gemini-search', RATE_LIMIT_PER_HOUR, HOUR_MS);
    if (!rl.ok) {
      setRateLimited({ resetAt: rl.resetAt });
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: query };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const parsed = await aiParseQuery(query);

      if (parsed && Object.keys(parsed).length > 0) {
        const summary = summarizeFilters(parsed);
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: `Rozumím. Hledám: ${summary}. Klikněte níže pro zobrazení výsledků nebo upřesněte dotaz.`,
            filters: parsed,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: 'Z dotazu jsem nedokázal vyextrahovat konkrétní filtry. Zkuste přidat detaily — značku, palivo, cenovou hladinu, ročník.',
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'Něco se pokazilo. Zkuste to prosím znovu.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyAndSearch = (filters: SearchFilters) => {
    resetFilters();
    setFilters(filters);
    search();
    navigate('/hledat');
  };

  return (
    <div className="bg-surface-950 rounded-2xl shadow-sm overflow-hidden border border-surface-800">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-primary-600/10 to-accent-600/10 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-50">AI poradce</h3>
            <p className="text-xs text-surface-400">Popište, co hledáte. Najdu vám konkrétní vozy.</p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="p-5 max-h-96 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-surface-300 mb-3">Vyzkoušejte třeba:</p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => askAI(s)}
                  className="w-full text-left px-3 py-2 bg-surface-900 hover:bg-surface-850 rounded-lg text-sm text-surface-300 transition-colors flex items-center justify-between group"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-900 text-surface-200'
              }`}
            >
              <p>{msg.text}</p>
              {msg.filters && (
                <button
                  onClick={() => applyAndSearch(msg.filters!)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-400 rounded-lg text-xs font-semibold text-white transition-colors"
                >
                  Zobrazit výsledky
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl bg-surface-900 text-surface-400 flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Přemýšlím…
            </div>
          </div>
        )}

        {rateLimited && (
          <div className="flex justify-center">
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Vyčerpán hodinový limit AI dotazů. Zkuste to znovu {formatResetTime(rateLimited.resetAt)}.
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          askAI(input);
        }}
        className="p-3 border-t border-surface-800 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Popište, jaké auto hledáte…"
          disabled={loading || !!rateLimited}
          className="flex-1 bg-surface-900 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !!rateLimited}
          className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
          aria-label="Odeslat"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

function summarizeFilters(f: SearchFilters): string {
  const parts: string[] = [];
  if (f.manufacturer_id) parts.push(`značka ${f.manufacturer_id}`);
  if (f.model_id) parts.push(`model ${f.model_id}`);
  if (f.fuel_type_id) parts.push(`palivo`);
  if (f.gearbox_id) parts.push(`převodovka`);
  if (f.body_type_id) parts.push(`karoserie`);
  if (f.year_from || f.year_to) {
    parts.push(`rok ${f.year_from ?? '?'}-${f.year_to ?? '?'}`);
  }
  if (f.price_from || f.price_to) {
    const from = f.price_from ? `${(f.price_from / 1000).toFixed(0)}k` : '0';
    const to = f.price_to ? `${(f.price_to / 1000).toFixed(0)}k` : '∞';
    parts.push(`cena ${from}–${to} Kč`);
  }
  if (f.km_from || f.km_to) {
    parts.push(`najeté km`);
  }
  if (f.power_from || f.power_to) {
    parts.push(`výkon`);
  }
  return parts.length ? parts.join(', ') : 'obecná kritéria';
}

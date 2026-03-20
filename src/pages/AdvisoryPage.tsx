import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ShieldCheck, AlertTriangle, FileCheck, Calculator,
  Car, ChevronDown, ChevronUp, Search, HelpCircle, CheckCircle,
  XCircle, Clock, Banknote, Wrench, FileText, Scale,
} from 'lucide-react';

const GUIDES = [
  {
    id: 'pred-koupi',
    icon: ShieldCheck,
    title: 'Kontrola před koupí',
    color: 'text-emerald-500',
    items: [
      { title: 'Ověřte historii vozidla', text: 'Zkontrolujte VIN přes registr vozidel, historii havárií a servisní záznamy. Na portálu CEBIA můžete ověřit původ vozidla a reálný stav tachometru.' },
      { title: 'Prověřte prodejce', text: 'U autobazarů si přečtěte recenze. U soukromých prodejců ověřte, že jsou skutečným majitelem v technickém průkazu.' },
      { title: 'Technická prohlídka', text: 'Nechte si auto zkontrolovat nezávislým mechanikem. Zaměřte se na motor, podvozek, brzdový systém a elektroniku.' },
      { title: 'Zkušební jízda', text: 'Vyzkoušejte auto za různých podmínek — město, dálnice, kopce. Sledujte neobvyklé zvuky, vibrace a chování řízení.' },
      { title: 'Kontrola dokumentů', text: 'Velký i malý technický průkaz, platná STK, pojištění, servisní knížka, doklady o předchozích opravách.' },
    ],
  },
  {
    id: 'financovani',
    icon: Calculator,
    title: 'Financování a pojištění',
    color: 'text-cyan-500',
    items: [
      { title: 'Autoúvěr vs. leasing', text: 'Autoúvěr — auto je vaše od začátku. Leasing — auto vlastní leasingová společnost. Operativní leasing zahrnuje i servis a pojištění.' },
      { title: 'Povinné ručení', text: 'Ze zákona musí mít každé registrované vozidlo povinné ručení. Srovnejte nabídky minimálně od 3 pojišťoven.' },
      { title: 'Havarijní pojištění', text: 'Doporučujeme pro vozy do 5 let stáří a s hodnotou nad 200 000 Kč. Spoluúčast 5–10 % je standardní.' },
      { title: 'DPH odpočet', text: 'Plátci DPH si mohou odečíst DPH z kupní ceny. Vozidlo musí být zakoupeno na firmu a používáno k podnikání.' },
    ],
  },
  {
    id: 'administrativa',
    icon: FileCheck,
    title: 'Přepis a administrativa',
    color: 'text-amber-500',
    items: [
      { title: 'Kupní smlouva', text: 'Vždy uzavřete písemnou kupní smlouvu. Uveďte přesnou identifikaci vozidla (VIN), cenu, stav tachometru a známé vady.' },
      { title: 'Přepis na dopravním úřadě', text: 'Do 10 dnů od podpisu smlouvy musíte provést přepis. Potřebujete: TP, ORV, platnou STK, doklad totožnosti, zelenou kartu.' },
      { title: 'Poplatky', text: 'Registrační poplatek závisí na emisní třídě a stáří vozidla. Pro EURO 4+ a novější je poplatek minimální.' },
      { title: 'Import ze zahraničí', text: 'Vozidlo dovezené ze zahraničí potřebuje: COC list, překlad TP, evidenční kontrolu, schválení technické způsobilosti a ekologickou daň.' },
    ],
  },
  {
    id: 'technicke',
    icon: Wrench,
    title: 'Na co si dát pozor technicky',
    color: 'text-primary-500',
    items: [
      { title: 'Motor a převodovka', text: 'Zkontrolujte olej (barvu, hladinu, zápach), kouř z výfuku (bílý = hlava, modrý = olej, černý = směs), plynulost řazení.' },
      { title: 'Podvozek a brzdy', text: 'Nehomologované díly, opotřebené silentbloky, koroze rámu. Brzdy by měly reagovat okamžitě bez tahání do strany.' },
      { title: 'Karoserie a lak', text: 'Kontrola tloušťky laku měřičem odhalí předchozí opravy. Nesouměrné spáry mezi díly signalizují nehodu.' },
      { title: 'Elektronika', text: 'Zkontrolujte funkčnost všech oken, zrcátek, klimatizace, navigace, parkovacích senzorů. Přečtěte chybové kódy diagnostikou.' },
      { title: 'Tachometer', text: 'Stočení tachometru je v ČR trestný čin. Ověřte stav přes CEBIA nebo srovnáním se servisními záznamy a STK protokoly.' },
    ],
  },
];

const FAQ = [
  { q: 'Jak poznám stočený tachometer?', a: 'Ověřte historii přes CEBIA, srovnejte se servisní knížkou a STK protokoly. Nerovnoměrné opotřebení volantu a pedálů vůči uvedeným km je také varovný signál.' },
  { q: 'Je lepší kupovat od autobazaru nebo soukromníka?', a: 'Autobazary nabízejí záruku ze zákona (12 měsíců), soukromníci ne. Na druhou stranu soukromníci obvykle nabízejí nižší ceny. Vždy si ale dejte auto zkontrolovat mechanikem.' },
  { q: 'Kolik stojí přepis vozidla?', a: 'Registrační poplatek se pohybuje od 800 do 10 000 Kč podle emisní třídy. Pro moderní vozy (EURO 4+) je to obvykle kolem 800 Kč.' },
  { q: 'Můžu vrátit auto zakoupené v autobazaru?', a: 'Ano, pokud zjistíte skrytou vadu, kterou prodejce neoznámil. Máte právo na opravu, slevu z ceny nebo odstoupení od smlouvy dle občanského zákoníku.' },
  { q: 'Jak funguje garanční prohlídka?', a: 'Nezávislý mechanik zkontroluje motor, podvozek, karoserii, elektroniku a měří tloušťku laku. Cena se pohybuje od 1 500 do 3 500 Kč.' },
  { q: 'Na co si dát pozor u dovozu z Německa?', a: 'Ověřte, zda auto nebylo taxíkem nebo firemním vozem s vysokými km. Zkontrolujte servisní historii přes CarFax nebo AutoDNA. Počítejte s náklady na přepis, STK a ekologickou daň.' },
];

export default function AdvisoryPage() {
  const [openGuide, setOpenGuide] = useState<string | null>('pred-koupi');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-primary-500" />
        </div>
        <h1 className="text-3xl font-bold text-surface-100 mb-3">Poradna pro kupující</h1>
        <p className="text-surface-400 max-w-2xl mx-auto">
          Kompletní průvodce nákupem ojetého vozidla. Poradíme vám, na co si dát pozor,
          jak prověřit auto i prodejce a jak zvládnout administrativu.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {[
          { icon: CheckCircle, label: 'Ověřených prodejců', value: '2 450+', color: 'text-emerald-500' },
          { icon: Car, label: 'Nabídek denně', value: '15 000+', color: 'text-cyan-500' },
          { icon: ShieldCheck, label: 'Kontrolovaných VIN', value: '850K+', color: 'text-amber-500' },
          { icon: Scale, label: 'Férových cen', value: '92 %', color: 'text-primary-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-surface-900 rounded-xl border border-surface-800 text-center">
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
            <p className="text-lg font-bold text-surface-100">{stat.value}</p>
            <p className="text-xs text-surface-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Guides */}
      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-bold text-surface-100 mb-4">Průvodce nákupem</h2>
        {GUIDES.map((guide) => (
          <div key={guide.id} className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden">
            <button
              onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-800/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <guide.icon className={`w-5 h-5 ${guide.color}`} />
                <span className="text-base font-semibold text-surface-100">{guide.title}</span>
                <span className="text-xs text-surface-500">{guide.items.length} tipů</span>
              </span>
              {openGuide === guide.id ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
            </button>
            {openGuide === guide.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-surface-800 pt-4">
                {guide.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-surface-400">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-surface-100 mb-1">{item.title}</h4>
                      <p className="text-sm text-surface-400 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="bg-surface-900 rounded-xl border border-surface-800 p-6 mb-12">
        <h2 className="text-xl font-bold text-surface-100 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          Kontrolní seznam před nákupem
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Ověřit VIN (CEBIA, AutoDNA)',
            'Zkontrolovat servisní knížku',
            'Ověřit platnost STK a emise',
            'Prohlédnout technický průkaz',
            'Zkontrolovat zápisy v registru dlužníků',
            'Provést zkušební jízdu',
            'Nechat zkontrolovat mechanikem',
            'Změřit tloušťku laku',
            'Zkontrolovat elektroniku diagnostikou',
            'Ověřit počet předchozích majitelů',
            'Porovnat cenu s trhem (Autovizor hodnocení)',
            'Připravit kupní smlouvu',
          ].map((item) => (
            <label key={item} className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-lg cursor-pointer hover:bg-surface-800 transition-colors group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-surface-300 group-hover:text-surface-100 transition-colors">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-surface-100 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-500" />
          Často kladené dotazy
        </h2>
        <div className="space-y-2">
          {FAQ.map((faq, i) => (
            <div key={i} className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-800/50 transition-colors"
              >
                <span className="text-sm font-medium text-surface-100">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-surface-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-surface-400 shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 border-t border-surface-800 pt-3">
                  <p className="text-sm text-surface-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600/20 to-primary-700/10 rounded-xl border border-primary-600/30 p-8 text-center">
        <h3 className="text-xl font-bold text-surface-100 mb-2">Připraveni na nákup?</h3>
        <p className="text-surface-300 mb-6">Prozkoumejte aktuální nabídky a najděte své vysněné auto.</p>
        <Link
          to="/hledat"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-bold text-white transition-colors"
        >
          <Search className="w-4 h-4" />
          Začít hledat
        </Link>
      </div>
    </div>
  );
}

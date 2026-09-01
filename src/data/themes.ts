import { FormVisualThemeId } from '../types/schema';

export interface VisualThemeConfig {
  id: FormVisualThemeId;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  swatches: string[];
  features: string[];
  classes: {
    wrapperBg: string;
    card: string;
    header: string;
    title: string;
    description: string;
    sectionTitle: string;
    label: string;
    descriptionText: string;
    input: string;
    inputFocus: string;
    dropdown: string;
    textarea: string;
    radioCardActive: string;
    radioCardInactive: string;
    booleanActive: string;
    booleanInactive: string;
    buttonPrimary: string;
    buttonSecondary: string;
    progressBarFill: string;
    progressBarBg: string;
    mitIdBanner: string;
    mitIdBannerText: string;
    tagBadge: string;
    accentColorName: string;
  };
}

export const VISUAL_THEMES: Record<FormVisualThemeId, VisualThemeConfig> = {
  'danish-public': {
    id: 'danish-public',
    name: 'Offentlig Dansk Standard',
    subtitle: 'Digitaliseringsstyrelsen & Borger.dk Designguide',
    description: 'Klassisk, autoritativ og tryghedsskabende stil designet efter de officielle danske designprincipper for offentlige selvbetjeningsløsninger.',
    badge: 'Borger.dk / DigiSt',
    badgeColor: 'bg-[#002b45] text-sky-200 border-[#00487d]',
    swatches: ['#002b45', '#005a9c', '#f4f6f8'],
    features: [
      'Dyb marinblå (#002b45) autoritetsfarve',
      'Tydelig rød stjerne (*) ved obligatoriske felter',
      'Høj kontrast og officielle 14-16px typografiskalaer',
      'Tydelige MitID-verifikationsbokse og lovpligtige noter',
    ],
    classes: {
      wrapperBg: 'bg-[#f4f6f8]',
      card: 'bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6 sm:p-8',
      header: 'border-b-2 border-slate-200 pb-5 mb-6 space-y-2',
      title: 'text-2xl font-black text-[#002b45] tracking-tight',
      description: 'text-sm text-slate-700 leading-relaxed',
      sectionTitle: 'text-base font-bold text-[#002b45] border-b border-slate-200 pb-2',
      label: 'block text-sm font-bold text-[#002b45]',
      descriptionText: 'text-xs text-slate-600',
      input: 'w-full text-sm border-2 border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-900',
      inputFocus: 'focus:border-[#005a9c] focus:ring-3 focus:ring-[#005a9c]/20 focus:outline-hidden',
      dropdown: 'w-full text-sm border-2 border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-900 focus:border-[#005a9c] focus:ring-3 focus:ring-[#005a9c]/20 focus:outline-hidden',
      textarea: 'w-full text-sm border-2 border-slate-300 rounded-lg p-3.5 bg-white text-slate-900 focus:border-[#005a9c] focus:ring-3 focus:ring-[#005a9c]/20 focus:outline-hidden',
      radioCardActive: 'border-2 border-[#005a9c] bg-[#eef5fa] text-[#002b45] font-semibold ring-2 ring-[#005a9c]/20',
      radioCardInactive: 'border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-800',
      booleanActive: 'border-2 border-[#005a9c] bg-[#eef5fa] text-[#002b45]',
      booleanInactive: 'border-2 border-slate-200 bg-white text-slate-700',
      buttonPrimary: 'bg-[#005a9c] hover:bg-[#00487d] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98]',
      buttonSecondary: 'border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold px-5 py-2.5 rounded-xl transition-all',
      progressBarFill: 'bg-[#005a9c]',
      progressBarBg: 'bg-slate-200',
      mitIdBanner: 'bg-[#e8f2f8] border-2 border-[#005a9c]/30 rounded-xl p-4',
      mitIdBannerText: 'text-[#002b45]',
      tagBadge: 'bg-[#002b45] text-white font-bold text-xs px-3 py-1 rounded-md',
      accentColorName: 'Dansk Marineblå',
    },
  },

  'nordic-clean': {
    id: 'nordic-clean',
    name: 'Nordisk Minimalistisk',
    subtitle: 'Moderne, luftig og skandinavisk æstetik',
    description: 'Ren linjeføring med stor fokus på hvidt rum, bløde hjørner, rolige skifer- og himmelblå accenter og subtile skygger.',
    badge: 'Moderne & Populær',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    swatches: ['#0284c7', '#64748b', '#f8fafc'],
    features: [
      'Generøs negativ plads og 16-24px hjørneradier',
      'Himmelblå accenter og bløde mikroskygger',
      'Subtile skillelinjer og harmonisk typografi',
      'Optimeret til intuitive, brugervenlige brugerrejser',
    ],
    classes: {
      wrapperBg: 'bg-slate-50',
      card: 'bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-9',
      header: 'border-b border-slate-100 pb-5 mb-6 space-y-1.5',
      title: 'text-2xl font-extrabold text-slate-900 tracking-tight',
      description: 'text-sm text-slate-500 leading-relaxed',
      sectionTitle: 'text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100',
      label: 'block text-xs font-bold text-slate-800',
      descriptionText: 'text-xs text-slate-400',
      input: 'w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 transition-all',
      inputFocus: 'focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-hidden',
      dropdown: 'w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-hidden transition-all',
      textarea: 'w-full text-sm border border-slate-200 rounded-xl p-3.5 bg-white text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-hidden transition-all',
      radioCardActive: 'border-sky-500 bg-sky-50/60 text-sky-950 font-semibold ring-2 ring-sky-500/20 shadow-xs',
      radioCardInactive: 'border-slate-200 hover:border-slate-300 bg-white text-slate-700',
      booleanActive: 'border-sky-500 bg-sky-50/50 text-sky-950',
      booleanInactive: 'border-slate-200 bg-white text-slate-600',
      buttonPrimary: 'bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-2xl shadow-md shadow-sky-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]',
      buttonSecondary: 'border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-all',
      progressBarFill: 'bg-sky-500',
      progressBarBg: 'bg-slate-100',
      mitIdBanner: 'bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4',
      mitIdBannerText: 'text-emerald-950',
      tagBadge: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-xs px-3 py-1 rounded-full',
      accentColorName: 'Nordisk Himmelblå',
    },
  },

  'compact-enterprise': {
    id: 'compact-enterprise',
    name: 'Kommunal Fagbruger (High-Density)',
    subtitle: 'Kompakt layout til sagsbehandlere og virksomheder',
    description: 'Optimeret til hurtig tastaturindtastning med tæt linjeafstand, reduceret padding, tabellarisk overblik og monotype datafelter.',
    badge: 'Fagsystem & Erhverv',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    swatches: ['#4338ca', '#334155', '#e2e8f0'],
    features: [
      'Reduceret vertikal højde (36px inputs) til hurtigt tastaturflow',
      'Monospacede identifikatorer (CPR, CVR, KLE, matrikel)',
      'Subtil indigoblå forretningsaccent',
      'Højeste data-densitet for komplekse erhvervsansøgninger',
    ],
    classes: {
      wrapperBg: 'bg-slate-100',
      card: 'bg-white rounded-xl border border-slate-300 shadow-2xs p-4 sm:p-6',
      header: 'border-b border-slate-200 pb-3 mb-4 space-y-1',
      title: 'text-xl font-bold text-slate-900 tracking-tight',
      description: 'text-xs text-slate-600',
      sectionTitle: 'text-xs font-bold text-indigo-900 uppercase tracking-wider pb-1.5 border-b border-indigo-100',
      label: 'block text-xs font-bold text-slate-700 font-mono',
      descriptionText: 'text-[11px] text-slate-400',
      input: 'w-full text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-900 font-mono',
      inputFocus: 'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-hidden',
      dropdown: 'w-full text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-hidden',
      textarea: 'w-full text-xs border border-slate-300 rounded-md p-2.5 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-hidden font-mono',
      radioCardActive: 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold border-2',
      radioCardInactive: 'border border-slate-200 hover:border-slate-300 bg-white text-slate-700',
      booleanActive: 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold',
      booleanInactive: 'border border-slate-200 bg-white text-slate-600',
      buttonPrimary: 'bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm transition-all',
      buttonSecondary: 'border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition-all',
      progressBarFill: 'bg-indigo-600',
      progressBarBg: 'bg-slate-200',
      mitIdBanner: 'bg-indigo-50/60 border border-indigo-200 rounded-lg p-3',
      mitIdBannerText: 'text-indigo-950 font-mono text-xs',
      tagBadge: 'bg-indigo-100 text-indigo-800 font-bold text-[11px] px-2.5 py-0.5 rounded',
      accentColorName: 'Kommunal Indigo',
    },
  },

  'accessible-contrast': {
    id: 'accessible-contrast',
    name: 'Tilgængelig Høj-Kontrast (WCAG AAA)',
    subtitle: 'Maksimal læselighed for svagtseende og ældre borgere',
    description: 'Stor skrift (16-18px), ekstra tykke 3px kanter, højkontrast gulfarvede fokustilstande og 48px+ trykflader.',
    badge: 'WCAG AAA / Læsevenlig',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-400',
    swatches: ['#0f172a', '#d97706', '#ffffff'],
    features: [
      '18px grundtekst med forøget linjeafstand (1.7)',
      'Ekstra tykke 3px sorte/mørke kanter på alle felter',
      'Tydelig gul fokusring for skærmoplæsere og svagtseende',
      'Ekstra store trykknapper (min. 48px touch-target)',
    ],
    classes: {
      wrapperBg: 'bg-amber-50/40',
      card: 'bg-white rounded-2xl border-4 border-slate-900 shadow-xl p-6 sm:p-10 space-y-6',
      header: 'border-b-4 border-slate-900 pb-6 mb-6 space-y-2',
      title: 'text-3xl font-black text-slate-950 tracking-tight',
      description: 'text-base font-medium text-slate-900 leading-relaxed',
      sectionTitle: 'text-xl font-black text-slate-950 border-b-2 border-slate-900 pb-2',
      label: 'block text-base font-black text-slate-950',
      descriptionText: 'text-sm font-semibold text-slate-800',
      input: 'w-full text-base font-semibold border-3 border-slate-900 rounded-xl px-5 py-3.5 bg-white text-slate-950',
      inputFocus: 'focus:border-slate-950 focus:ring-4 focus:ring-amber-400 focus:outline-hidden focus:bg-amber-50/20',
      dropdown: 'w-full text-base font-semibold border-3 border-slate-900 rounded-xl px-5 py-3.5 bg-white text-slate-950 focus:border-slate-950 focus:ring-4 focus:ring-amber-400 focus:outline-hidden',
      textarea: 'w-full text-base font-semibold border-3 border-slate-900 rounded-xl p-4 bg-white text-slate-950 focus:border-slate-950 focus:ring-4 focus:ring-amber-400 focus:outline-hidden',
      radioCardActive: 'border-4 border-slate-950 bg-amber-200 text-slate-950 font-black ring-4 ring-amber-400/40',
      radioCardInactive: 'border-3 border-slate-900 bg-white hover:bg-slate-50 text-slate-950 font-bold',
      booleanActive: 'border-4 border-slate-950 bg-amber-200 text-slate-950 font-bold',
      booleanInactive: 'border-3 border-slate-900 bg-white text-slate-950',
      buttonPrimary: 'bg-slate-950 hover:bg-black text-white font-black text-base px-8 py-4 rounded-2xl shadow-lg border-2 border-amber-400 transition-all active:scale-[0.98]',
      buttonSecondary: 'border-3 border-slate-900 hover:bg-slate-200 text-slate-950 font-black text-base px-6 py-3.5 rounded-xl transition-all',
      progressBarFill: 'bg-slate-950',
      progressBarBg: 'bg-amber-200 border-2 border-slate-900',
      mitIdBanner: 'bg-amber-100 border-3 border-slate-900 rounded-2xl p-5',
      mitIdBannerText: 'text-slate-950 font-bold text-sm',
      tagBadge: 'bg-slate-950 text-amber-300 border-2 border-amber-400 font-black text-xs px-3.5 py-1 rounded-lg',
      accentColorName: 'Højkontrast Sort & Ravngul',
    },
  },

  'dark-slate': {
    id: 'dark-slate',
    name: 'Mørkt Tema (Dark Mode)',
    subtitle: 'Dæmpet mørkt design med smukke smaragd/cyan accenter',
    description: 'Behageligt for øjnene under aften- og nattearbejde med mørk koksgrå baggrund og klare, lysende kontrolknapper.',
    badge: 'Mørk / Natskifte',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    swatches: ['#0f172a', '#10b981', '#1e293b'],
    features: [
      'Dyb mørk skifer (Slate-900) baggrund minimerer blåt lys',
      'Smaragdgrønne & Cyan selvlysende elementer',
      'Bevarer høj læselighed med krystalklar hvid typografi',
      'Ideel til operationscentre og aften-selvbetjening',
    ],
    classes: {
      wrapperBg: 'bg-slate-950',
      card: 'bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-9 text-white',
      header: 'border-b border-slate-800 pb-5 mb-6 space-y-1.5',
      title: 'text-2xl font-black text-white tracking-tight',
      description: 'text-sm text-slate-300 leading-relaxed',
      sectionTitle: 'text-sm font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-800',
      label: 'block text-xs font-bold text-slate-200',
      descriptionText: 'text-xs text-slate-400',
      input: 'w-full text-sm border border-slate-700 rounded-xl px-4 py-2.5 bg-slate-800/90 text-white placeholder:text-slate-500 transition-all',
      inputFocus: 'focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden',
      dropdown: 'w-full text-sm border border-slate-700 rounded-xl px-4 py-2.5 bg-slate-800 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden',
      textarea: 'w-full text-sm border border-slate-700 rounded-xl p-3.5 bg-slate-800/90 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden',
      radioCardActive: 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold ring-2 ring-emerald-500/30',
      radioCardInactive: 'border-slate-800 hover:border-slate-700 bg-slate-800/60 text-slate-300',
      booleanActive: 'border-emerald-500 bg-emerald-950/60 text-emerald-200',
      booleanInactive: 'border-slate-800 bg-slate-800 text-slate-400',
      buttonPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]',
      buttonSecondary: 'border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold px-5 py-2.5 rounded-xl transition-all',
      progressBarFill: 'bg-emerald-500',
      progressBarBg: 'bg-slate-800',
      mitIdBanner: 'bg-emerald-950/80 border border-emerald-800 rounded-2xl p-4',
      mitIdBannerText: 'text-emerald-300',
      tagBadge: 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs px-3 py-1 rounded-full',
      accentColorName: 'Smaragd Dark',
    },
  },

  'warm-stone': {
    id: 'warm-stone',
    name: 'Varm Sand & Natur',
    subtitle: 'Organisk og behagelig varm neutral palette',
    description: 'Skaber en rolig og imødekommende stemning med varme sand- og jordfarver, teglrøde knapper og afrundede elementer.',
    badge: 'Natur & Trivsel',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    swatches: ['#b45309', '#78716c', '#f5f5f4'],
    features: [
      'Varm sten- og sandgrå baggrund uden blænding',
      'Teglrød / Amber varm primærfarve',
      'Indbydende blød typografi og organiske kanter',
      'Særligt velegnet til kultur-, natur- og sundhedsformularer',
    ],
    classes: {
      wrapperBg: 'bg-stone-100',
      card: 'bg-[#fafaf9] rounded-3xl border border-stone-300 shadow-sm p-6 sm:p-9',
      header: 'border-b border-stone-200 pb-5 mb-6 space-y-1.5',
      title: 'text-2xl font-black text-stone-900 tracking-tight',
      description: 'text-sm text-stone-600 leading-relaxed',
      sectionTitle: 'text-sm font-bold text-amber-900 uppercase tracking-wider pb-2 border-b border-stone-200',
      label: 'block text-xs font-bold text-stone-800',
      descriptionText: 'text-xs text-stone-500',
      input: 'w-full text-sm border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 transition-all',
      inputFocus: 'focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 focus:outline-hidden',
      dropdown: 'w-full text-sm border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 focus:outline-hidden',
      textarea: 'w-full text-sm border border-stone-300 rounded-xl p-3.5 bg-white text-stone-900 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 focus:outline-hidden',
      radioCardActive: 'border-amber-700 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-700/20',
      radioCardInactive: 'border-stone-300 hover:border-stone-400 bg-white text-stone-700',
      booleanActive: 'border-amber-700 bg-amber-50 text-amber-950',
      booleanInactive: 'border-stone-300 bg-white text-stone-600',
      buttonPrimary: 'bg-amber-800 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md shadow-amber-900/10 transition-all hover:scale-[1.01] active:scale-[0.99]',
      buttonSecondary: 'border border-stone-300 hover:bg-stone-200 text-stone-700 font-semibold px-5 py-2.5 rounded-xl transition-all',
      progressBarFill: 'bg-amber-800',
      progressBarBg: 'bg-stone-200',
      mitIdBanner: 'bg-amber-50 border border-amber-200 rounded-2xl p-4',
      mitIdBannerText: 'text-amber-950',
      tagBadge: 'bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-1 rounded-full',
      accentColorName: 'Varm Teglrød',
    },
  },
};

export const DEFAULT_THEME_ID: FormVisualThemeId = 'danish-public';

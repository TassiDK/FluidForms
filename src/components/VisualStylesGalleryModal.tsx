import React, { useState } from 'react';
import {
  X,
  Palette,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
  Sliders,
  Check,
  ArrowRight,
  Layers,
  Flame,
} from 'lucide-react';
import { FormVisualThemeId, FormTemplate } from '../types/schema';
import { VISUAL_THEMES, VisualThemeConfig } from '../data/themes';

interface VisualStylesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: FormVisualThemeId;
  onSelectTheme: (themeId: FormVisualThemeId) => void;
  activeTemplate?: FormTemplate;
}

export const VisualStylesGalleryModal: React.FC<VisualStylesGalleryModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  activeTemplate,
}) => {
  const [selectedPreviewThemeId, setSelectedPreviewThemeId] = useState<FormVisualThemeId>(currentThemeId);
  const [sampleRadioChoice, setSampleRadioChoice] = useState<'A' | 'B'>('A');
  const [sampleInputVal, setSampleInputVal] = useState('Mette Frederiksen');
  const [sampleBoolVal, setSampleBoolVal] = useState(true);

  if (!isOpen) return null;

  const previewTheme = VISUAL_THEMES[selectedPreviewThemeId];
  const allThemes = Object.values(VISUAL_THEMES);

  const handleApplyTheme = (themeId: FormVisualThemeId) => {
    onSelectTheme(themeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-white">
                  AutoForma Visuelle Stil- & Tema Galleri
                </h3>
                <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                  5 Forskellige Design Systemer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Skift visuelt udtryk for borger- og medarbejderformularer. Alle stilarter overholder WCAG tilgængelighed og MitID brandingkrav.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
          {/* Quick theme selector cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {allThemes.map((theme) => {
              const isCurrent = currentThemeId === theme.id;
              const isSelectedForPreview = selectedPreviewThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedPreviewThemeId(theme.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between space-y-3 relative group ${
                    isSelectedForPreview
                      ? 'border-sky-600 bg-white ring-4 ring-sky-500/15 shadow-md scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Swatches Bar */}
                    <div className="flex items-center space-x-1.5 pb-1">
                      {theme.swatches.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-auto font-mono">
                        {theme.classes.accentColorName}
                      </span>
                    </div>

                    <div className="font-extrabold text-xs text-slate-900 leading-snug">
                      {theme.name}
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold inline-block ${theme.badgeColor}`}>
                      {theme.badge}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {isCurrent ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aktiv stil</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 group-hover:text-sky-600 font-medium flex items-center gap-1">
                        <span>Inspicer</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTheme(theme.id);
                      }}
                      className="bg-slate-900 hover:bg-sky-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
                    >
                      Brug nu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Preview Showcase Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Realtids Forhåndsvisning af: {previewTheme.name}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {previewTheme.description}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleApplyTheme(previewTheme.id)}
                  className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Anvend "{previewTheme.name}" på formularen</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Form Component Container */}
            <div className={`p-8 rounded-3xl border border-slate-200 transition-colors ${previewTheme.classes.wrapperBg}`}>
              <div className={`max-w-2xl mx-auto ${previewTheme.classes.card}`}>
                {/* Header */}
                <div className={previewTheme.classes.header}>
                  <div className="flex items-center justify-between">
                    <span className={previewTheme.classes.tagBadge}>
                      Teknik & Miljø
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Eksempel Formular
                    </span>
                  </div>

                  <h2 className={previewTheme.classes.title}>
                    Ansøgning om Byggetilladelse
                  </h2>
                  <p className={previewTheme.classes.description}>
                    Denne formular demonstrerer den valgte visuelle stil, feltkomponenter og interaktive tilstande.
                  </p>
                </div>

                {/* MitID Banner in theme style */}
                <div className={`mb-6 flex items-center justify-between ${previewTheme.classes.mitIdBanner}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#005a9c] text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${previewTheme.classes.mitIdBannerText}`}>
                        Logget ind med MitID (Sikringsniveau: Substantial)
                      </div>
                      <div className="text-[11px] opacity-80 font-mono">
                        CPR: 120385-2144 &bull; Mette Frederiksen
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/70 text-slate-800 font-bold px-2 py-0.5 rounded border">
                    Verificeret
                  </span>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Text Input */}
                  <div className="space-y-1">
                    <label className={previewTheme.classes.label}>
                      Ansøgers Fulde Navn <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={sampleInputVal}
                      onChange={(e) => setSampleInputVal(e.target.value)}
                      className={`${previewTheme.classes.input} ${previewTheme.classes.inputFocus}`}
                    />
                    <p className={previewTheme.classes.descriptionText}>
                      Hentet direkte fra CPR-registret via MitID.
                    </p>
                  </div>

                  {/* Radiogroup choices */}
                  <div className="space-y-1.5">
                    <label className={previewTheme.classes.label}>
                      Projekt type <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { key: 'A' as const, label: 'Tilbygning (under 50 m²)' },
                        { key: 'B' as const, label: 'Nyt enfamiliehus' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSampleRadioChoice(item.key)}
                          className={`p-3 rounded-xl text-left transition-all flex items-center justify-between text-xs ${
                            sampleRadioChoice === item.key
                              ? previewTheme.classes.radioCardActive
                              : previewTheme.classes.radioCardInactive
                          }`}
                        >
                          <span>{item.label}</span>
                          {sampleRadioChoice === item.key && (
                            <CheckCircle2 className="w-4 h-4 shrink-0 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Boolean toggle */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sampleBoolVal}
                        onChange={(e) => setSampleBoolVal(e.target.checked)}
                        className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className={previewTheme.classes.label}>
                        Jeg bekræfter at projektet overholder bygningsreglementet BR18
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      className={previewTheme.classes.buttonSecondary}
                    >
                      Forrige trin
                    </button>

                    <button
                      type="button"
                      className={previewTheme.classes.buttonPrimary}
                    >
                      Indsend med MitID Signatur
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Design System Details & Principles Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Nøgleegenskaber i {previewTheme.name}
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {previewTheme.features.map((f, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Målgruppe & Anvendelse
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {previewTheme.id === 'danish-public' && 'Ideel til officielle kommunale borgerportaler, SKAT, sundhed.dk og Digital Post relaterede henvendelser.'}
                  {previewTheme.id === 'nordic-clean' && 'Perfekt til moderne selvbetjening, kulturhuse, biblioteker og brugervenlige borgerhenvendelser.'}
                  {previewTheme.id === 'compact-enterprise' && 'Anbefales til professionelle bygherrer, advokater, interne sagsbehandlere og store skemaer.'}
                  {previewTheme.id === 'accessible-contrast' && 'Optimeret til ældreråd, handicapområdet og borgere med syns- eller motoriske udfordringer.'}
                  {previewTheme.id === 'dark-slate' && 'Fremragende til vagtcentraler, aftenarbejde og brugere, der foretrækker dæmpet belysning.'}
                  {previewTheme.id === 'warm-stone' && 'Velegnet til natur, miljø, sociale tilbud og sundhedsfaglige trivselsformularer.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

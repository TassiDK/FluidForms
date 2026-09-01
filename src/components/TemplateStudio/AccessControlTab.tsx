import React from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { FormTemplate, MitIdAccessControl, MitIdAuthLevel, MitIdAuthType } from '../../types/schema';

interface AccessControlTabProps {
  template: FormTemplate;
  onUpdateTemplate: (updated: FormTemplate) => void;
}

export const AccessControlTab: React.FC<AccessControlTabProps> = ({
  template,
  onUpdateTemplate,
}) => {
  const accessControl: MitIdAccessControl = template.accessControl || {
    requireMitId: false,
    mitIdType: 'citizen',
    authLevel: 'Substantial',
    autoFillFields: true,
  };

  const handleUpdate = (updated: Partial<MitIdAccessControl>) => {
    onUpdateTemplate({
      ...template,
      accessControl: {
        ...accessControl,
        ...updated,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              accessControl.requireMitId
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                MitID & NemLog-in 3 Adgangskontrol
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kræv MitID-autentifikation forud for formularudfyldelse for at sikre borgerens CPR/CVR og muliggøre retsgyldig Digital Post (NgDP).
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={accessControl.requireMitId}
              onChange={(e) => handleUpdate({ requireMitId: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {accessControl.requireMitId ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>MitID Adgangskontrol er Aktiv:</strong> Borgere skal godkende med MitID (Substantial/High) før formularen åbnes. Deres CPR-nummer, fulde navn og folkeregisteradresse vil være verificeret.
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong>Åben Formular (Anonym / Ingen login):</strong> Enhver borger kan udfylde og indsende formularen uden forudgående MitID identitetskontrol.
            </div>
          </div>
        )}
      </div>

      {/* Extended Settings (Only visible if MitID is enabled) */}
      {accessControl.requireMitId && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            MitID Konfigurationsparametre
          </h3>

          {/* Persona Target */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Målgruppe / Identitetstype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'citizen' as MitIdAuthType, label: 'Privat Borger (CPR)', desc: 'CPR-opslag & personlig Digital Post' },
                { type: 'business' as MitIdAuthType, label: 'Erhverv / Virksomhed (CVR)', desc: 'CVR-nummer & NemLog-in medarbejdersignatur' },
                { type: 'both' as MitIdAuthType, label: 'Både Borger & Erhverv', desc: 'Accepterer både CPR og CVR login' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleUpdate({ mitIdType: item.type })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    accessControl.mitIdType === item.type
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{item.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Level of Assurance */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Sikringsniveau (Level of Assurance - eIDAS)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  level: 'Substantial' as MitIdAuthLevel,
                  title: 'Betydeligt (Substantial - Standard)',
                  desc: 'MitID App / Push godkendelse. Dækker 99% af alle kommunale og statslige selvbetjeningsløsninger.',
                },
                {
                  level: 'High' as MitIdAuthLevel,
                  title: 'Højt (High - Højsikkerhed)',
                  desc: 'Fysisk MitID Kodeoplæser eller Chip. Kræves for særligt følsomme sundheds- og finansielle transaktioner.',
                },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => handleUpdate({ authLevel: item.level })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    accessControl.authLevel === item.level
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-fill Verified Citizen Details */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">
                Automatisk forudfyldning af CPR, Fulde Navn & Adresse
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Når borgeren logger ind, udfyldes matchende felter (f.eks. `cpr`, `fullName`, `address`) automatisk i formularen.
              </div>
            </div>
            <input
              type="checkbox"
              checked={accessControl.autoFillFields}
              onChange={(e) => handleUpdate({ autoFillFields: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5"
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Lock,
  X,
  User,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { MitIdCitizenSession, MitIdAuthLevel } from '../types/schema';
import { MOCK_CITIZENS } from '../data/mockMitIdCitizens';

interface MitIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (session: MitIdCitizenSession) => void;
}

export const MitIdModal: React.FC<MitIdModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<MitIdCitizenSession>(MOCK_CITIZENS[0]);
  const [authStep, setAuthStep] = useState<'SELECT' | 'CONFIRMING' | 'SUCCESS'>('SELECT');
  const [customCpr, setCustomCpr] = useState('');
  const [customName, setCustomName] = useState('');
  const [authLevel, setAuthLevel] = useState<MitIdAuthLevel>('Substantial');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const handleStartAuth = () => {
    setAuthStep('CONFIRMING');

    setTimeout(() => {
      let finalSession: MitIdCitizenSession;

      if (useCustom && customCpr) {
        finalSession = {
          authenticated: true,
          cpr: customCpr,
          fullName: customName || 'Brugerdefineret Borger',
          address: 'Vester Voldgade 44',
          city: 'København V',
          postalCode: '1552',
          email: `${customName.toLowerCase().replace(/\s+/g, '.') || 'borger'}@eksempel.dk`,
          phone: '+45 20 00 00 00',
          authLevel,
          authMethod: 'MitID App',
          authTime: new Date().toISOString(),
          sessionToken: `mitid_sess_custom_${Math.random().toString(36).substring(2, 9)}`,
        };
      } else {
        finalSession = {
          ...selectedPersona,
          authLevel,
          authTime: new Date().toISOString(),
          sessionToken: `mitid_sess_${Math.random().toString(36).substring(2, 9)}`,
        };
      }

      setAuthStep('SUCCESS');
      setTimeout(() => {
        onAuthenticate(finalSession);
        setAuthStep('SELECT');
        onClose();
      }, 1000);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MitID Brand Header */}
        <div className="bg-[#002b45] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#005a9c] flex items-center justify-center font-bold text-lg text-white">
              M
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                MitID Simulator <span className="text-[11px] font-normal bg-sky-800 text-sky-200 px-2 py-0.5 rounded">NemLog-in 3</span>
              </h3>
              <p className="text-xs text-sky-200/80">Identitetssikring for Offentlig Selvbetjening</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {authStep === 'SELECT' && (
            <div className="space-y-5">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 leading-relaxed">
                  I dette XFlow prototype-miljø kan du simulere ægte MitID-login med prækonfigurerede testborgere eller oprette en virtuel borger med unikt CPR-nummer.
                </div>
              </div>

              {/* Persona Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Vælg Test-Identitet (Borger / Erhverv)
                </label>
                <div className="space-y-2">
                  {MOCK_CITIZENS.map((persona) => {
                    const isSelected = !useCustom && selectedPersona.cpr === persona.cpr;
                    return (
                      <button
                        key={persona.cpr}
                        type="button"
                        onClick={() => {
                          setSelectedPersona(persona);
                          setUseCustom(false);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                            isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {persona.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {persona.fullName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              CPR: {persona.cpr} &bull; {persona.address}, {persona.postalCode} {persona.city}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                      </button>
                    );
                  })}

                  {/* Custom CPR Option */}
                  <button
                    type="button"
                    onClick={() => setUseCustom(true)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      useCustom
                        ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                        useCustom ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        +
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Brugerdefineret Borger / CPR
                        </div>
                        <div className="text-xs text-slate-500">
                          Indtast eget CPR-nummer og navn
                        </div>
                      </div>
                    </div>
                    {useCustom && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                  </button>
                </div>
              </div>

              {/* Custom inputs if active */}
              {useCustom && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CPR-nummer
                    </label>
                    <input
                      type="text"
                      placeholder="123456-7890"
                      value={customCpr}
                      onChange={(e) => setCustomCpr(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fulde Navn
                    </label>
                    <input
                      type="text"
                      placeholder="F.eks. Anders And"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Security Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sikkerhedsniveau (Level of Assurance)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthLevel('Substantial')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      authLevel === 'Substantial'
                        ? 'bg-sky-900 text-white border-sky-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Betydeligt (Substantial - MitID App)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthLevel('High')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      authLevel === 'High'
                        ? 'bg-sky-900 text-white border-sky-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Højt (High - Kodeoplæser / Chip)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  Annuller
                </button>
                <button
                  id="btn-confirm-mitid-login"
                  type="button"
                  onClick={handleStartAuth}
                  className="flex items-center space-x-2 bg-[#005a9c] hover:bg-[#00487d] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Godkend med MitID</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {authStep === 'CONFIRMING' && (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 animate-pulse shadow-inner">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Åbn din MitID app...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Godkender handling for <strong className="text-slate-800">{useCustom ? customName || customCpr : selectedPersona.fullName}</strong>
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-mono text-slate-600">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kryptografisk signatur valideres...</span>
              </div>
            </div>
          )}

          {authStep === 'SUCCESS' && (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                MitID Login Godkendt!
              </h4>
              <p className="text-xs text-slate-500">
                CPR-identitet og session er nu verificeret i formularkonteksten.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

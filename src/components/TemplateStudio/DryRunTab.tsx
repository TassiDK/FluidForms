import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Send,
  Mail,
  Building,
  RotateCcw,
  FileCode,
} from 'lucide-react';
import { FormTemplate, MitIdCitizenSession, SurveyElement } from '../../types/schema';
import { executeWorkflowEngine } from '../../utils/workflowEngine';
import { MOCK_CITIZENS } from '../../data/mockMitIdCitizens';

interface DryRunTabProps {
  template: FormTemplate;
}

export const DryRunTab: React.FC<DryRunTabProps> = ({ template }) => {
  // Extract all questions (including nested in true/false branches) to generate test form inputs
  const allQuestions: SurveyElement[] = [];
  (template.surveyJson?.pages || []).forEach((p) => {
    const collectElements = (list: SurveyElement[] = []) => {
      list.forEach((el) => {
        if (el.type !== 'panel') {
          allQuestions.push(el);
        }
        if (el.elements && el.elements.length > 0) {
          collectElements(el.elements);
        }
        if (el.trueElements && el.trueElements.length > 0) {
          collectElements(el.trueElements);
        }
        if (el.falseElements && el.falseElements.length > 0) {
          collectElements(el.falseElements);
        }
      });
    };
    collectElements(p.elements || []);
  });

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const q of allQuestions) {
      if (q.name === 'byggeareal') initial[q.name] = '75';
      else if (q.name === 'hasAsbestos') initial[q.name] = 'Yes';
      else if (q.name === 'fullName') initial[q.name] = 'Mette Frederiksen';
      else if (q.name === 'cpr') initial[q.name] = '120385-2144';
      else if (q.name === 'applicantEmail') initial[q.name] = 'mette.frederiksen@borgermail.dk';
      else if (q.name === 'propertyAddress') initial[q.name] = 'Vester Voldgade 12, 1552 København V';
      else if (q.name === 'projectType') initial[q.name] = 'tilbygning';
      else initial[q.name] = q.defaultValue ?? '';
    }
    return initial;
  });

  const [selectedPersona, setSelectedPersona] = useState<MitIdCitizenSession>(MOCK_CITIZENS[0]);
  const [useMitId, setUseMitId] = useState(template.accessControl?.requireMitId ?? true);

  const [executionResult, setExecutionResult] = useState<ReturnType<typeof executeWorkflowEngine> | null>(null);

  const handleRunTest = () => {
    const res = executeWorkflowEngine(
      template,
      formData,
      useMitId ? selectedPersona : null
    );
    setExecutionResult(res);
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Workflow Dry-Run & Test-Sandbox</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test dine oprettede logikregler med variable testdata uden at sende faktiske beskeder.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunTest}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-center"
        >
          <Play className="w-4 h-4" />
          <span>Evaluer Regler Nu (Dry-Run)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Test Input Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Simuleret Test-Indtastning
            </h3>
            <button
              onClick={() => {
                const cleared: Record<string, any> = {};
                allQuestions.forEach((q) => (cleared[q.name] = ''));
                setFormData(cleared);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Nulstil felter</span>
            </button>
          </div>

          {/* MitID toggle & selector */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Simuler MitID Login:</span>
              <input
                type="checkbox"
                checked={useMitId}
                onChange={(e) => setUseMitId(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            {useMitId && (
              <select
                value={selectedPersona.cpr}
                onChange={(e) => {
                  const p = MOCK_CITIZENS.find((c) => c.cpr === e.target.value);
                  if (p) setSelectedPersona(p);
                }}
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
              >
                {MOCK_CITIZENS.map((c) => (
                  <option key={c.cpr} value={c.cpr}>
                    {c.fullName} (CPR: {c.cpr})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Form questions list */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {allQuestions.map((q) => (
              <div key={q.name} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>{q.title || q.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">{q.name}</span>
                </label>

                {q.choices ? (
                  <select
                    value={formData[q.name] ?? ''}
                    onChange={(e) => handleFieldChange(q.name, e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Vælg værdi --</option>
                    {q.choices.map((c, i) => {
                      const val = typeof c === 'object' ? c.value : c;
                      const txt = typeof c === 'object' ? c.text : c;
                      return (
                        <option key={i} value={val}>
                          {txt}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData[q.name] ?? ''}
                    onChange={(e) => handleFieldChange(q.name, e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Real-time Evaluation Results */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>2. Evalueringsresultat & Sandhedstabel</span>
            {executionResult && (
              <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                Udført på {executionResult.durationMs}ms &bull; {executionResult.totalActionsDispatched} handlinger udløst
              </span>
            )}
          </h3>

          {!executionResult ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
              <p className="text-xs text-slate-500">
                Klik på <strong className="text-indigo-600">"Evaluer Regler Nu (Dry-Run)"</strong> for at analysere logikken.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step evaluations */}
              {executionResult.stepsEvaluated.map((stepRes) => (
                <div
                  key={stepRes.stepId}
                  className={`rounded-xl border p-4 transition-all ${
                    stepRes.conditionPassed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {stepRes.conditionPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{stepRes.stepName}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Regel-tilstand: {stepRes.conditionPassed ? 'BETINGELSE OPFYLDT (SAND)' : 'IKKE OPFYLDT (FALSK)'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stepRes.conditionPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {stepRes.actionsExecuted.length} handlinger
                    </span>
                  </div>

                  {/* Conditions details table */}
                  {stepRes.conditionDetails.length > 0 && (
                    <div className="mt-3 bg-white rounded-lg p-2.5 border border-slate-200/80 text-[11px] space-y-1 font-mono">
                      {stepRes.conditionDetails.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-slate-700">
                            [{c.field}] {c.operator} "{String(c.expectedValue)}" &rarr; Faktisk: "{String(c.actualValue)}"
                          </span>
                          <span className={`font-bold ${c.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {c.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions summary if passed */}
                  {stepRes.conditionPassed && stepRes.actionsExecuted.length > 0 && (
                    <div className="mt-3 space-y-1.5 pt-2 border-t border-emerald-200/60">
                      {stepRes.actionsExecuted.map((act, i) => (
                        <div
                          key={i}
                          className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs flex items-start space-x-2 text-slate-800"
                        >
                          {act.actionType === 'DIGITAL_POST_NGDP' ? (
                            <Send className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          ) : act.actionType === 'EMAIL' ? (
                            <Mail className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          ) : (
                            <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-900">{act.actionName}: </span>
                            <span className="text-slate-600">{act.summary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

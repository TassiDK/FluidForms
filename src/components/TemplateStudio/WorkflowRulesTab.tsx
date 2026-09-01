import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GitBranch,
  Mail,
  Send,
  Building,
  Webhook,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code,
  Tag,
  Copy,
} from 'lucide-react';
import {
  FormTemplate,
  WorkflowStep,
  WorkflowCondition,
  WorkflowAction,
  ConditionOperator,
  RecipientType,
  ActionType,
  SurveyElement,
} from '../../types/schema';

interface WorkflowRulesTabProps {
  template: FormTemplate;
  onUpdateTemplate: (updated: FormTemplate) => void;
}

const OPERATORS: Array<{ value: ConditionOperator; label: string }> = [
  { value: 'equals', label: 'er lig med (==)' },
  { value: 'not_equals', label: 'er IKKE lig med (!=)' },
  { value: 'contains', label: 'indeholder (tekst / valg)' },
  { value: 'not_contains', label: 'indeholder IKKE' },
  { value: 'greater_than', label: 'er større end (>)' },
  { value: 'less_than', label: 'er mindre end (<)' },
  { value: 'greater_than_or_equal', label: 'er større end eller lig (>=)' },
  { value: 'less_than_or_equal', label: 'er mindre end eller lig (<=)' },
  { value: 'is_not_empty', label: 'er udfyldt (ikke tom)' },
  { value: 'is_empty', label: 'er tom (ikke udfyldt)' },
  { value: 'always', label: 'ALTID (Udfør altid ubetinget)' },
];

export const WorkflowRulesTab: React.FC<WorkflowRulesTabProps> = ({
  template,
  onUpdateTemplate,
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(
    template.workflowLogic?.steps?.[0]?.id || null
  );

  const steps = template.workflowLogic?.steps || [];

  // Extract all question names from SurveyJS (including nested inside true/false panel branches) to use in auto-complete
  const availableQuestions: Array<{ name: string; title: string; type: string }> = [];
  (template.surveyJson?.pages || []).forEach((p) => {
    const collectElements = (list: SurveyElement[] = []) => {
      list.forEach((e) => {
        availableQuestions.push({
          name: e.name,
          title: e.title || e.name,
          type: e.type,
        });
        if (e.elements && e.elements.length > 0) {
          collectElements(e.elements);
        }
        if (e.trueElements && e.trueElements.length > 0) {
          collectElements(e.trueElements);
        }
        if (e.falseElements && e.falseElements.length > 0) {
          collectElements(e.falseElements);
        }
      });
    };
    collectElements(p.elements || []);
  });

  // Common available tokens including MitID context and system variables
  const availableTokens = Array.from(
    new Set([
      ...availableQuestions.map((q) => q.name),
      'cpr',
      'fullName',
      'applicantEmail',
      'applicantPhone',
      'propertyAddress',
      'address',
      'city',
      'receiptNumber',
      'system.mitId.authLevel',
      'system.mitId.cpr',
      'system.mitId.fullName',
    ])
  );

  const handleAddStep = () => {
    const newStepId = `step_${Date.now()}`;
    const newStep: WorkflowStep = {
      id: newStepId,
      name: `Ny Arbejdsgang (${steps.length + 1})`,
      description: 'Definer betingelser og automatiske handlinger',
      enabled: true,
      conditionGroup: {
        logicalOperator: 'AND',
        conditions: [
          {
            id: `cond_${Date.now()}`,
            field: availableQuestions[0]?.name || 'applicantEmail',
            operator: 'is_not_empty',
            value: '',
          },
        ],
      },
      actions: [
        {
          id: `act_${Date.now()}`,
          name: 'Send Digital Post til Borger',
          type: 'DIGITAL_POST_NGDP',
          recipientType: 'CITIZEN_DIGITAL_POST',
          config: {
            ngdp: {
              senderCvr: '29189846',
              senderName: 'Københavns Kommune',
              recipientCprOrCvrField: '{{cpr}}',
              messageTitle: `Kvittering for henvendelse - {{receiptNumber}}`,
              messageType: 'DIGITAL_POST',
              mandatory: true,
              memoDocument: {
                mainDocumentTitle: 'Officiel Kvittering',
                bodyTemplate: 'Kære {{fullName}},\n\nVi bekræfter hermed modtagelsen af din formularindsendelse.',
              },
            },
          },
        },
      ],
    };

    const updatedSteps = [...steps, newStep];
    onUpdateTemplate({
      ...template,
      workflowLogic: {
        ...template.workflowLogic,
        steps: updatedSteps,
      },
    });
    setExpandedStepId(newStepId);
  };

  const handleUpdateStep = (stepId: string, updated: Partial<WorkflowStep>) => {
    const updatedSteps = steps.map((s) => (s.id === stepId ? { ...s, ...updated } : s));
    onUpdateTemplate({
      ...template,
      workflowLogic: {
        ...template.workflowLogic,
        steps: updatedSteps,
      },
    });
  };

  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = steps.filter((s) => s.id !== stepId);
    onUpdateTemplate({
      ...template,
      workflowLogic: {
        ...template.workflowLogic,
        steps: updatedSteps,
      },
    });
    if (expandedStepId === stepId) {
      setExpandedStepId(updatedSteps[0]?.id || null);
    }
  };

  const handleAddCondition = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const newCond: WorkflowCondition = {
      id: `cond_${Date.now()}`,
      field: availableQuestions[0]?.name || 'field',
      operator: 'equals',
      value: 'Ja',
    };

    const updatedConditions = [...(step.conditionGroup?.conditions || []), newCond];
    handleUpdateStep(stepId, {
      conditionGroup: {
        logicalOperator: step.conditionGroup?.logicalOperator || 'AND',
        conditions: updatedConditions,
      },
    });
  };

  const handleUpdateCondition = (
    stepId: string,
    condIndex: number,
    updated: Partial<WorkflowCondition>
  ) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const updatedConds = step.conditionGroup.conditions.map((c, i) =>
      i === condIndex ? { ...c, ...updated } : c
    );

    handleUpdateStep(stepId, {
      conditionGroup: {
        ...step.conditionGroup,
        conditions: updatedConds,
      },
    });
  };

  const handleDeleteCondition = (stepId: string, condIndex: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const updatedConds = step.conditionGroup.conditions.filter((_, i) => i !== condIndex);
    handleUpdateStep(stepId, {
      conditionGroup: {
        ...step.conditionGroup,
        conditions: updatedConds,
      },
    });
  };

  const handleAddAction = (stepId: string, type: ActionType) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    let newAction: WorkflowAction;
    const actionId = `act_${Date.now()}`;

    if (type === 'DIGITAL_POST_NGDP') {
      newAction = {
        id: actionId,
        name: 'Dansk Digital Post (NgDP MeMo)',
        type: 'DIGITAL_POST_NGDP',
        recipientType: 'CITIZEN_DIGITAL_POST',
        config: {
          ngdp: {
            senderCvr: '29189846',
            senderName: 'Københavns Kommune',
            recipientCprOrCvrField: '{{cpr}}',
            messageTitle: 'Offentlig Meddelelse',
            messageType: 'DIGITAL_POST',
            mandatory: true,
            memoDocument: {
              mainDocumentTitle: 'Dokument',
              bodyTemplate: 'Kære {{fullName}},\n\nTekst her...',
            },
          },
        },
      };
    } else if (type === 'EMAIL') {
      newAction = {
        id: actionId,
        name: 'Automatisk E-mail',
        type: 'EMAIL',
        recipientType: 'INTERNAL_EMAIL',
        config: {
          email: {
            to: 'sagsbehandling@kommune.dk',
            fromName: 'XFlow Notifikation',
            fromEmail: 'no-reply@kommune.dk',
            subject: 'Ny henvendelse modtaget',
            body: 'Der er indsendt oplysninger.',
          },
        },
      };
    } else if (type === 'MUNICIPAL_ESDH') {
      newAction = {
        id: actionId,
        name: 'ESDH Sagsoprettelse (KMD Nova / Fujitsu F2)',
        type: 'MUNICIPAL_ESDH',
        recipientType: 'DEPARTMENT_ESDH',
        config: {
          esdh: {
            systemName: 'Fujitsu F2',
            kleNumber: '01.00.00G01',
            caseTitle: 'Ny sag: {{propertyAddress}}',
            responsibleUnit: 'Sagsbehandlingsteamet',
          },
        },
      };
    } else {
      newAction = {
        id: actionId,
        name: 'REST API Webhook',
        type: 'WEBHOOK',
        recipientType: 'EXTERNAL_WEBHOOK',
        config: {
          webhook: {
            url: 'https://api.kommune.dk/webhook/submissions',
            method: 'POST',
          },
        },
      };
    }

    handleUpdateStep(stepId, {
      actions: [...step.actions, newAction],
    });
  };

  const handleUpdateAction = (
    stepId: string,
    actionIndex: number,
    updated: Partial<WorkflowAction>
  ) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const updatedActions = step.actions.map((a, i) => (i === actionIndex ? { ...a, ...updated } : a));
    handleUpdateStep(stepId, { actions: updatedActions });
  };

  const handleDeleteAction = (stepId: string, actionIndex: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const updatedActions = step.actions.filter((_, i) => i !== actionIndex);
    handleUpdateStep(stepId, { actions: updatedActions });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <span>Workflow Logic Rules Builder</span>
            <span className="text-xs font-normal text-slate-500 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {steps.length} aktive arbejdsgange
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Opbyg automatiske betingelser (IF / THEN) der dirigerer indsendte data til borgerens Digital Post (NgDP), interne sagsbehandler-e-mails eller ESDH-sagssystemer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tilføj Arbejdsgang (Step)</span>
        </button>
      </div>

      {/* Available Variable Tokens Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <span>Felt-Variable til E-mail & Digital Post skabeloner:</span>
        </span>
        {availableTokens.map((tok) => (
          <button
            key={tok}
            type="button"
            title={`Klik for at kopiere {{${tok}}}`}
            onClick={() => {
              navigator.clipboard?.writeText(`{{${tok}}}`);
            }}
            className="text-[11px] font-mono font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md transition-colors"
          >
            {`{{${tok}}}`}
          </button>
        ))}
      </div>

      {/* Workflow Steps Accordion List */}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Ingen logik-trin oprettet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Opret dit første workflow-trin for at sende automatisk Digital Post eller E-mails.
              </p>
            </div>
            <button
              onClick={handleAddStep}
              className="mt-2 text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-xl"
            >
              Opret Første Trin
            </button>
          </div>
        ) : (
          steps.map((step, stepIdx) => {
            const isExpanded = expandedStepId === step.id;
            const conditions = step.conditionGroup?.conditions || [];

            return (
              <div
                key={step.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Step Header */}
                <div
                  onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                  className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${
                    isExpanded ? 'bg-slate-50/80 border-b border-slate-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {stepIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900">{step.name}</h3>
                        {!step.enabled && (
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                            Deaktiveret
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {conditions.length} Betingelse(r) &bull; {step.actions.length} Handling(er)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={step.enabled}
                        onChange={(e) => handleUpdateStep(step.id, { enabled: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-xs font-semibold text-slate-600">Aktiv</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Slet arbejdsgang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Step Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Step Title Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Trinnets Navn
                        </label>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Beskrivelse / Formål
                        </label>
                        <input
                          type="text"
                          value={step.description || ''}
                          onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                          placeholder="F.eks. Hasteadvisering ved asbest..."
                          className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* SECTION 1: IF CONDITIONS */}
                    <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider">
                            HVIS (IF)
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Betingelser for udførelse
                          </span>
                        </div>

                        {conditions.length > 1 && (
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-slate-500 font-medium">Logisk regel:</span>
                            <select
                              value={step.conditionGroup?.logicalOperator || 'AND'}
                              onChange={(e) =>
                                handleUpdateStep(step.id, {
                                  conditionGroup: {
                                    ...step.conditionGroup,
                                    logicalOperator: e.target.value as 'AND' | 'OR',
                                  },
                                })
                              }
                              className="bg-white border border-slate-300 font-bold text-indigo-700 rounded-lg px-2 py-1 text-xs"
                            >
                              <option value="AND">OG (Alle skal opfyldes)</option>
                              <option value="OR">ELLER (Mindst én opfyldes)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Conditions list */}
                      <div className="space-y-2.5">
                        {conditions.map((cond, condIdx) => (
                          <div
                            key={cond.id || condIdx}
                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                          >
                            {/* Field selector */}
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                                Felt / Spørgsmål
                              </label>
                              <select
                                value={cond.field}
                                onChange={(e) =>
                                  handleUpdateCondition(step.id, condIdx, { field: e.target.value })
                                }
                                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
                              >
                                <optgroup label="Spørgsmål fra formularen">
                                  {availableQuestions.map((q) => (
                                    <option key={q.name} value={q.name}>
                                      {q.title} ({q.name})
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="MitID Borger Oplysninger">
                                  <option value="cpr">Borger CPR-nummer</option>
                                  <option value="fullName">Borger Fulde Navn</option>
                                  <option value="city">Borger Bynavn</option>
                                  <option value="authLevel">MitID Sikkerhedsniveau</option>
                                </optgroup>
                              </select>
                            </div>

                            {/* Operator selector */}
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                                Operator
                              </label>
                              <select
                                value={cond.operator}
                                onChange={(e) =>
                                  handleUpdateCondition(step.id, condIdx, {
                                    operator: e.target.value as ConditionOperator,
                                  })
                                }
                                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
                              >
                                {OPERATORS.map((op) => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Value input */}
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                                Forventet Værdi
                              </label>
                              {['is_empty', 'is_not_empty', 'always'].includes(cond.operator) ? (
                                <div className="text-xs text-slate-400 italic py-1.5">
                                  (Ingen sammenligningsværdi påkrævet)
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Værdi at sammenligne mod..."
                                  value={String(cond.value ?? '')}
                                  onChange={(e) =>
                                    handleUpdateCondition(step.id, condIdx, { value: e.target.value })
                                  }
                                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
                                />
                              )}
                            </div>

                            {/* Delete Condition */}
                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleDeleteCondition(step.id, condIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                                title="Fjern betingelse"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddCondition(step.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tilføj endnu en betingelse</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 2: THEN ACTIONS */}
                    <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider">
                            SÅ (THEN)
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Automatiske Handlinger & Modtagere
                          </span>
                        </div>

                        {/* Add Action Buttons */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddAction(step.id, 'DIGITAL_POST_NGDP')}
                            className="bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Send className="w-3 h-3 text-sky-600" />
                            <span>+ Digital Post (NgDP)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddAction(step.id, 'EMAIL')}
                            className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Mail className="w-3 h-3 text-purple-600" />
                            <span>+ E-mail</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddAction(step.id, 'MUNICIPAL_ESDH')}
                            className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Building className="w-3 h-3 text-amber-600" />
                            <span>+ ESDH</span>
                          </button>
                        </div>
                      </div>

                      {/* Actions List */}
                      <div className="space-y-4">
                        {step.actions.map((action, actionIdx) => (
                          <div
                            key={action.id || actionIdx}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  action.type === 'DIGITAL_POST_NGDP'
                                    ? 'bg-sky-100 text-sky-800'
                                    : action.type === 'EMAIL'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {action.type === 'DIGITAL_POST_NGDP'
                                    ? 'Dansk Digital Post (NgDP MeMo v1.2)'
                                    : action.type === 'EMAIL'
                                    ? 'E-mail Forsendelse'
                                    : 'ESDH Sagsoprettelse'}
                                </span>
                                <input
                                  type="text"
                                  value={action.name}
                                  onChange={(e) =>
                                    handleUpdateAction(step.id, actionIdx, { name: e.target.value })
                                  }
                                  className="text-xs font-bold text-slate-800 border-none bg-transparent focus:ring-0 p-0"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteAction(step.id, actionIdx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Fjern handling"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Dynamic configuration form per action type */}
                            {action.type === 'DIGITAL_POST_NGDP' && action.config.ngdp && (
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      Afsender CVR
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.ngdp.senderCvr}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          ngdp: { ...action.config.ngdp!, senderCvr: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      Afsender Navn / Forvaltning
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.ngdp.senderName}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          ngdp: { ...action.config.ngdp!, senderName: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      Modtager CPR-felt token
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.ngdp.recipientCprOrCvrField}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          ngdp: { ...action.config.ngdp!, recipientCprOrCvrField: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-sky-700 font-bold"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block font-semibold text-slate-700 mb-1">
                                    Meddelelsens Overskrift (Vises i e-Boks / Borger.dk / Mit.dk)
                                  </label>
                                  <input
                                    type="text"
                                    value={action.config.ngdp.messageTitle}
                                    onChange={(e) => {
                                      const newConfig = {
                                        ...action.config,
                                        ngdp: { ...action.config.ngdp!, messageTitle: e.target.value },
                                      };
                                      handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                    }}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="block font-semibold text-slate-700 mb-1">
                                    Digital Post MeMo Dokument Brødtekst (Understøtter {'{{variabler}}'})
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={action.config.ngdp.memoDocument.bodyTemplate}
                                    onChange={(e) => {
                                      const newConfig = {
                                        ...action.config,
                                        ngdp: {
                                          ...action.config.ngdp!,
                                          memoDocument: {
                                            ...action.config.ngdp!.memoDocument,
                                            bodyTemplate: e.target.value,
                                          },
                                        },
                                      };
                                      handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                    }}
                                    className="w-full border border-slate-200 rounded-lg p-3 font-mono text-xs leading-relaxed"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Email configuration */}
                            {action.type === 'EMAIL' && action.config.email && (
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      Modtager E-mail (F.eks. {'{{applicantEmail}}'} eller fast adresse)
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.email.to}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          email: { ...action.config.email!, to: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-purple-800 font-semibold"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      Afsender Navn
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.email.fromName}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          email: { ...action.config.email!, fromName: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block font-semibold text-slate-700 mb-1">
                                    Emne (Subject)
                                  </label>
                                  <input
                                    type="text"
                                    value={action.config.email.subject}
                                    onChange={(e) => {
                                      const newConfig = {
                                        ...action.config,
                                        email: { ...action.config.email!, subject: e.target.value },
                                      };
                                      handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                    }}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="block font-semibold text-slate-700 mb-1">
                                    E-mail Brødtekst
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={action.config.email.body}
                                    onChange={(e) => {
                                      const newConfig = {
                                        ...action.config,
                                        email: { ...action.config.email!, body: e.target.value },
                                      };
                                      handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                    }}
                                    className="w-full border border-slate-200 rounded-lg p-3 font-mono text-xs leading-relaxed"
                                  />
                                </div>
                              </div>
                            )}

                            {/* ESDH configuration */}
                            {action.type === 'MUNICIPAL_ESDH' && action.config.esdh && (
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      ESDH Sagssystem
                                    </label>
                                    <select
                                      value={action.config.esdh.systemName}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          esdh: { ...action.config.esdh!, systemName: e.target.value as any },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-amber-800"
                                    >
                                      <option value="Fujitsu F2">Fujitsu F2</option>
                                      <option value="KMD Nova">KMD Nova</option>
                                      <option value="SBSYS">SBSYS</option>
                                      <option value="Formpipe Acadre">Formpipe Acadre</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      KLE Journalnummer (Dansk standard)
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.esdh.kleNumber}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          esdh: { ...action.config.esdh!, kleNumber: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                      Ansvarlig Enhed
                                    </label>
                                    <input
                                      type="text"
                                      value={action.config.esdh.responsibleUnit}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...action.config,
                                          esdh: { ...action.config.esdh!, responsibleUnit: e.target.value },
                                        };
                                        handleUpdateAction(step.id, actionIdx, { config: newConfig });
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

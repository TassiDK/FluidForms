import React, { useState } from 'react';
import {
  X,
  Send,
  Mail,
  Building,
  Code2,
  Eye,
  FileCheck2,
  ShieldCheck,
  Download,
  Copy,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { FormSubmission, ExecutedActionLog } from '../types/schema';
import { NgDpMeMoPayload } from '../utils/ngdpFormatter';

interface NgDpMemoModalProps {
  submission: FormSubmission | null;
  onClose: () => void;
}

export const NgDpMemoModal: React.FC<NgDpMemoModalProps> = ({
  submission,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'memo-view' | 'memo-json' | 'emails' | 'esdh' | 'logs'>('memo-view');
  const [copied, setCopied] = useState(false);

  if (!submission) return null;

  // Find all executed actions
  const allExecutedActions: ExecutedActionLog[] = submission.workflowExecution.stepsEvaluated
    .filter((s) => s.conditionPassed)
    .flatMap((s) => s.actionsExecuted);

  const ngdpAction = allExecutedActions.find((a) => a.actionType === 'DIGITAL_POST_NGDP');
  const emailActions = allExecutedActions.filter((a) => a.actionType === 'EMAIL');
  const esdhActions = allExecutedActions.filter((a) => a.actionType === 'MUNICIPAL_ESDH');

  const memoPayload: NgDpMeMoPayload | null = ngdpAction?.payload || null;

  const handleCopyJson = (data: any) => {
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  Workflow Forsendelses- & MeMo Inspektør
                </h3>
                <span className="text-xs font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
                  {submission.receiptNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formular: {submission.templateTitle} &bull; Indsendt {new Date(submission.submittedAt).toLocaleString('da-DK')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 pt-3 flex items-center space-x-2 border-b border-slate-200 overflow-x-auto">
          {memoPayload && (
            <button
              onClick={() => setActiveTab('memo-view')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === 'memo-view'
                  ? 'bg-white text-slate-900 shadow-xs border-t-2 border-sky-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>Digital Post (Borger View)</span>
            </button>
          )}

          {memoPayload && (
            <button
              onClick={() => setActiveTab('memo-json')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === 'memo-json'
                  ? 'bg-white text-slate-900 shadow-xs border-t-2 border-sky-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>NgDP MeMo JSON Schema</span>
            </button>
          )}

          {emailActions.length > 0 && (
            <button
              onClick={() => setActiveTab('emails')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === 'emails'
                  ? 'bg-white text-slate-900 shadow-xs border-t-2 border-purple-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>E-mails Afsendt ({emailActions.length})</span>
            </button>
          )}

          {esdhActions.length > 0 && (
            <button
              onClick={() => setActiveTab('esdh')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === 'esdh'
                  ? 'bg-white text-slate-900 shadow-xs border-t-2 border-amber-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span>ESDH Sagssystem ({esdhActions.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-slate-900 shadow-xs border-t-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Workflow Regelevaluering & Logs</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* 1. Visual Simulated Citizen Digital Post Inbox (e-Boks / Borger.dk / Mit.dk) */}
          {activeTab === 'memo-view' && memoPayload && (
            <div className="space-y-4">
              {/* Inbox Mock Header */}
              <div className="bg-[#002b45] text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-sm">
                    DP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Offentlig Digital Post Indbakke</span>
                      <span className="text-[10px] bg-sky-800 text-sky-200 px-2 py-0.2 rounded">
                        e-Boks / Borger.dk / Mit.dk
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-200/80">
                      Modtager: {memoPayload.messageHeader.recipient.recipientName} ({memoPayload.messageHeader.recipient.recipientID})
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MitID Signeret</span>
                  </div>
                  <span className="text-[10px] text-slate-300">
                    Kanal: {memoPayload.technicalMetadata.dispatchChannel}
                  </span>
                </div>
              </div>

              {/* Rendered HTML document */}
              <div
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                dangerouslySetInnerHTML={{ __html: memoPayload.mainDocument.contentHtml }}
              />
            </div>
          )}

          {/* 2. NgDP MeMo Raw JSON Schema */}
          {activeTab === 'memo-json' && memoPayload && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  Dansk Digital Post MeddelelsesModel (MeMo v1.2) Payload Structure
                </div>
                <button
                  onClick={() => handleCopyJson(memoPayload)}
                  className="flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kopieret!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopier MeMo JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-sky-300 font-mono text-xs overflow-x-auto max-h-[500px]">
                <pre>{JSON.stringify(memoPayload, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* 3. Emails Viewer */}
          {activeTab === 'emails' && (
            <div className="space-y-4">
              {emailActions.map((emailAct, idx) => {
                const p = emailAct.payload;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="bg-slate-100 p-4 border-b border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-500 uppercase">Fra: </span>
                          <span className="font-semibold text-slate-900">{p.from}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{p.smtpServer}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 uppercase">Til: </span>
                        <span className="font-semibold text-purple-700 font-mono">{p.to}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 uppercase">Emne: </span>
                        <span className="font-bold text-slate-900">{p.subject}</span>
                      </div>
                    </div>

                    <div
                      className="p-6 text-sm text-slate-800"
                      dangerouslySetInnerHTML={{ __html: p.bodyHtml }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. ESDH Viewer */}
          {activeTab === 'esdh' && (
            <div className="space-y-4">
              {esdhActions.map((esdhAct, idx) => {
                const p = esdhAct.payload;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md">
                          {p.system}
                        </span>
                        <span className="text-xs font-mono text-slate-500">KLE: {p.kleClassification}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-800">Sagsnr: {p.caseNumber}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{p.caseTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Ansvarlig Enhed: {p.responsibleUnit}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                      <div className="font-bold text-slate-700 mb-1">Indekserede Formularfelter:</div>
                      <pre className="text-slate-600">{JSON.stringify(p.indexedFields, null, 2)}</pre>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Logs & Rules Truth Table */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Trin-for-Trin Betingelses-Evaluering
                </h4>

                <div className="space-y-2.5">
                  {submission.workflowExecution.stepsEvaluated.map((s) => (
                    <div
                      key={s.stepId}
                      className={`p-3 rounded-xl border text-xs ${
                        s.conditionPassed
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{s.stepName}</span>
                        <span className={s.conditionPassed ? 'text-emerald-700' : 'text-slate-500'}>
                          {s.conditionPassed ? 'PASSED (Eksekveret)' : 'SKIPPED (Betingelse ej opfyldt)'}
                        </span>
                      </div>

                      {s.conditionDetails.length > 0 && (
                        <div className="mt-2 bg-white rounded-lg p-2 border border-slate-200/80 font-mono text-[11px] space-y-0.5">
                          {s.conditionDetails.map((c, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span>
                                [{c.field}] {c.operator} "{String(c.expectedValue)}" &rarr; Faktisk: "{String(c.actualValue)}"
                              </span>
                              <span className={c.passed ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                {c.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Console Logs */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-sky-300 font-mono text-xs space-y-1">
                <div className="text-slate-400 font-bold pb-1 border-b border-slate-800">
                  System Workflow Execution Log:
                </div>
                {submission.workflowExecution.logs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

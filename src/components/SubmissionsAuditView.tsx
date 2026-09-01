import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Eye,
  Trash2,
  Send,
  Mail,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { FormSubmission } from '../types/schema';
import { NgDpMemoModal } from './NgDpMemoModal';

interface SubmissionsAuditViewProps {
  submissions: FormSubmission[];
  onClearHistory: () => void;
  onSelectSubmissionToInspect: (submission: FormSubmission) => void;
}

export const SubmissionsAuditView: React.FC<SubmissionsAuditViewProps> = ({
  submissions,
  onClearHistory,
  onSelectSubmissionToInspect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const filteredSubmissions = submissions.filter((sub) => {
    const query = searchQuery.toLowerCase();
    return (
      sub.receiptNumber.toLowerCase().includes(query) ||
      sub.templateTitle.toLowerCase().includes(query) ||
      (sub.mitIdAuthContext?.fullName || '').toLowerCase().includes(query) ||
      (sub.mitIdAuthContext?.cpr || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-sky-600" />
            <span>Formular Indsendelses- & Workflow Audit Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overvåg realtidsudførelse af logikregler, MitID-sikrede sessionsspor og genererede Dansk Digital Post (NgDP MeMo) meddelelser.
          </p>
        </div>

        {submissions.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ryd Loghistorik</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Søg på kvitteringsnummer, borgernavn, CPR eller formular..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Submissions Table / Cards */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <ScrollText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Ingen indsendelser fundet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prøv at udfylde og indsende en formular under fanen "Citizen / User View" for at se workflow-reglerne eksekveret i realtid.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const hasMitId = !!sub.mitIdAuthContext?.authenticated;
            const executedActions = sub.workflowExecution.stepsEvaluated
              .filter((s) => s.conditionPassed)
              .flatMap((s) => s.actionsExecuted);

            const hasNgDp = executedActions.some((a) => a.actionType === 'DIGITAL_POST_NGDP');
            const hasEmail = executedActions.some((a) => a.actionType === 'EMAIL');
            const hasEsdh = executedActions.some((a) => a.actionType === 'MUNICIPAL_ESDH');

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                      {sub.receiptNumber}
                    </span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {sub.templateTitle}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(sub.submittedAt).toLocaleTimeString('da-DK', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}{' '}
                      &bull; {new Date(sub.submittedAt).toLocaleDateString('da-DK')}
                    </span>

                    {hasMitId ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {sub.mitIdAuthContext?.fullName} ({sub.mitIdAuthContext?.cpr})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Anonym / Intet MitID</span>
                    )}

                    <span className="font-mono text-[11px] text-slate-400">
                      Udført på {sub.workflowExecution.durationMs}ms
                    </span>
                  </div>
                </div>

                {/* Badges of Dispatched Channels */}
                <div className="flex items-center space-x-2 shrink-0">
                  {hasNgDp && (
                    <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Send className="w-3 h-3 text-sky-600" />
                      <span>NgDP MeMo</span>
                    </span>
                  )}
                  {hasEmail && (
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-purple-600" />
                      <span>E-mail</span>
                    </span>
                  )}
                  {hasEsdh && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Building className="w-3 h-3 text-amber-600" />
                      <span>ESDH</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubmission(sub);
                    }}
                    className="ml-2 bg-slate-100 group-hover:bg-sky-600 group-hover:text-white text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Inspicer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspector Modal */}
      {selectedSubmission && (
        <NgDpMemoModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

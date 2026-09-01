import React, { useState } from 'react';
import {
  Plus,
  Layers,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Workflow,
  Send,
  Building2,
} from 'lucide-react';
import { FormTemplate } from '../types/schema';

interface AdminDashboardProps {
  templates: FormTemplate[];
  onSelectTemplate: (template: FormTemplate, initialTab?: 'builder' | 'workflow' | 'access' | 'schema') => void;
  onCreateNewTemplate: () => void;
  onDuplicateTemplate: (template: FormTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onTestAsCitizen: (template: FormTemplate) => void;
  totalSubmissions: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  templates,
  onSelectTemplate,
  onCreateNewTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onTestAsCitizen,
  totalSubmissions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalSteps = templates.reduce((acc, t) => acc + (t.workflowLogic?.steps?.length || 0), 0);
  const mitIdProtectedCount = templates.filter((t) => t.accessControl?.requireMitId).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Metrics Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-700/50">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>XFlow Form & Workflow Platform Prototype</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Formular- & Arbejdsgangs Administration
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Byg borgerrettede formularer med SurveyJS, definer automatiske modtagere (Digital Post / NgDP, E-mail, ESDH), og håndter MitID-adgangskontrol i en no-code brugerflade.
          </p>
        </div>

        <button
          id="btn-create-new-template-hero"
          onClick={onCreateNewTemplate}
          className="self-start md:self-center flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Opret Ny Formular</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{templates.length}</div>
            <div className="text-xs font-semibold text-slate-500">Aktive Skabeloner</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalSteps}</div>
            <div className="text-xs font-semibold text-slate-500">Konfigurerede Arbejdsgange</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{mitIdProtectedCount} / {templates.length}</div>
            <div className="text-xs font-semibold text-slate-500">MitID Sikrede Formularer</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalSubmissions}</div>
            <div className="text-xs font-semibold text-slate-500">Udførte Indsendelser & Logs</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Søg i formularer, kategorier eller felter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Alle Kategorier' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const questionCount = template.surveyJson?.pages?.reduce(
            (acc, p) => acc + (p.elements?.length || 0),
            0
          ) || 0;
          const workflowSteps = template.workflowLogic?.steps || [];
          const hasNgDp = workflowSteps.some((s) =>
            s.actions.some((a) => a.type === 'DIGITAL_POST_NGDP')
          );
          const hasEmail = workflowSteps.some((s) =>
            s.actions.some((a) => a.type === 'EMAIL')
          );
          const hasEsdh = workflowSteps.some((s) =>
            s.actions.some((a) => a.type === 'MUNICIPAL_ESDH')
          );

          return (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60">
                    {template.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {template.accessControl?.requireMitId && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200" title="Kræver MitID login">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>MitID</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">v{template.version}</span>
                  </div>
                </div>

                <div>
                  <h3
                    onClick={() => onSelectTemplate(template)}
                    className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {template.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Form & Workflow Specs Pill Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    {questionCount} Spørgsmål
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 border border-indigo-100">
                    <GitBranch className="w-3 h-3 text-indigo-500" />
                    {workflowSteps.length} Logik-trin
                  </span>
                </div>

                {/* Action Destinations */}
                <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Modtagere:</span>
                  {hasNgDp && (
                    <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                      NgDP Digital Post
                    </span>
                  )}
                  {hasEmail && (
                    <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                      E-mail
                    </span>
                  )}
                  {hasEsdh && (
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                      ESDH
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onDuplicateTemplate(template)}
                    title="Kopier skabelon"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    title="Slet skabelon"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onTestAsCitizen(template)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all flex items-center space-x-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Formular</span>
                  </button>

                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="text-xs font-bold text-white bg-slate-900 hover:bg-sky-600 px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center space-x-1"
                  >
                    <span>Rediger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

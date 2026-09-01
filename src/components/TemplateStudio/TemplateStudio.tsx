import React, { useState } from 'react';
import {
  Layers,
  GitBranch,
  ShieldCheck,
  Code2,
  Play,
  Save,
  FileCheck2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { FormTemplate } from '../../types/schema';
import { FormBuilderTab } from './FormBuilderTab';
import { WorkflowRulesTab } from './WorkflowRulesTab';
import { AccessControlTab } from './AccessControlTab';
import { SchemaInspectorTab } from './SchemaInspectorTab';
import { DryRunTab } from './DryRunTab';

export type StudioTab = 'builder' | 'workflow' | 'access' | 'schema' | 'dryrun';

interface TemplateStudioProps {
  template: FormTemplate;
  onSaveTemplate: (template: FormTemplate) => void;
  onBackToDashboard: () => void;
  onTestAsCitizen: (template: FormTemplate) => void;
  initialSubTab?: StudioTab;
}

export const TemplateStudio: React.FC<TemplateStudioProps> = ({
  template: initialTemplate,
  onSaveTemplate,
  onBackToDashboard,
  onTestAsCitizen,
  initialSubTab = 'builder',
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplate>(initialTemplate);
  const [activeSubTab, setActiveSubTab] = useState<StudioTab>(initialSubTab);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSave = () => {
    onSaveTemplate(currentTemplate);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleUpdate = (updated: FormTemplate) => {
    setCurrentTemplate(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tilbage til oversigten"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={currentTemplate.title}
                onChange={(e) =>
                  setCurrentTemplate({ ...currentTemplate, title: e.target.value })
                }
                className="text-lg font-black text-slate-900 border-none bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 rounded-lg px-2 py-0.5"
              />
              <span className="text-xs font-mono text-slate-400">v{currentTemplate.version}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5 px-2">
              <span>Kategori:</span>
              <input
                type="text"
                value={currentTemplate.category}
                onChange={(e) =>
                  setCurrentTemplate({ ...currentTemplate, category: e.target.value })
                }
                className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60"
              />
              <span>&bull;</span>
              <span>Forfatter: {currentTemplate.author}</span>
            </div>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onTestAsCitizen(currentTemplate)}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Test som Borger</span>
          </button>

          <button
            id="btn-save-template"
            onClick={handleSave}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
          >
            {isSavedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                <span>Gemt!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Gem Skabelon</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Studio Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('builder')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'builder'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Formular Bygger (SurveyJS)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workflow')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'workflow'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span>2. Workflow Logik & Handlinger</span>
          <span className="bg-indigo-900/40 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full">
            {currentTemplate.workflowLogic?.steps?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('access')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'access'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>3. Adgangskontrol & MitID</span>
          {currentTemplate.accessControl?.requireMitId && (
            <span className="bg-emerald-900/40 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full">
              MitID Aktiv
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'schema'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4 text-sky-400" />
          <span>4. Samlet JSON Schema</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dryrun')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'dryrun'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Play className="w-4 h-4 text-amber-400" />
          <span>5. Dry-Run Sandbox</span>
        </button>
      </div>

      {/* Sub-Tab Content Rendering */}
      <div>
        {activeSubTab === 'builder' && (
          <FormBuilderTab
            template={currentTemplate}
            onUpdateTemplate={handleUpdate}
          />
        )}

        {activeSubTab === 'workflow' && (
          <WorkflowRulesTab
            template={currentTemplate}
            onUpdateTemplate={handleUpdate}
          />
        )}

        {activeSubTab === 'access' && (
          <AccessControlTab
            template={currentTemplate}
            onUpdateTemplate={handleUpdate}
          />
        )}

        {activeSubTab === 'schema' && (
          <SchemaInspectorTab template={currentTemplate} />
        )}

        {activeSubTab === 'dryrun' && (
          <DryRunTab template={currentTemplate} />
        )}
      </div>
    </div>
  );
};

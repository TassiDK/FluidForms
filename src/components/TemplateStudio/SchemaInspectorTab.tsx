import React, { useState } from 'react';
import {
  Code2,
  Copy,
  CheckCircle2,
  Download,
  FileJson,
  BookOpen,
  Sparkles,
  Layers,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { FormTemplate } from '../../types/schema';

interface SchemaInspectorTabProps {
  template: FormTemplate;
}

export const SchemaInspectorTab: React.FC<SchemaInspectorTabProps> = ({ template }) => {
  const [copied, setCopied] = useState(false);

  const fullSchemaJson = JSON.stringify(template, null, 2);

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullSchemaJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullSchemaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id || 'autoforma_template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Explanation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AutoForma Samlet JSON Schema Arkitektur
              </h2>
              <p className="text-xs text-slate-500">
                Sådan sammenkædes Formular-definitionen (SurveyJS) med den automatiske Arbejdsgang (Workflow Logic).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Kopieret!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopier JSON</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Schema</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars Explanatory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-sky-700 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>1. surveyJson (SurveyJS)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Indeholder standard SurveyJS specifikation: Sider, paneler, spørgsmålstyper (text, dropdown, radiogroup), validering og <code className="text-sky-800 font-mono">name</code> identifikatorer.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
              <GitBranch className="w-4 h-4" />
              <span>2. workflowLogic.steps</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Knytter sig til spørgsmålene via <code className="text-indigo-800 font-mono">field</code> referencer. Evaluerer logiske prædikater (<code className="text-xs">==, !=, &gt;, contains</code>) og eksekverer handlinger.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>3. accessControl & NgDP</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforcer MitID-krav (Substantial/High) og formaterer automatiske forsendelser som lovpligtig Dansk Digital Post (NgDP MeMo v1.2) med afsender-CVR og modtager-CPR.
            </p>
          </div>
        </div>
      </div>

      {/* JSON Code Viewer */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono text-xs shadow-xl space-y-3">
        <div className="flex items-center justify-between text-slate-400 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileJson className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">template_definition.json</span>
          </div>
          <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
            {fullSchemaJson.length} bytes
          </span>
        </div>

        <pre className="overflow-x-auto max-h-[500px] text-sky-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          <code>{fullSchemaJson}</code>
        </pre>
      </div>
    </div>
  );
};

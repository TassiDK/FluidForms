import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Send,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Lock,
  Eye,
  Layers,
  Palette,
  Sliders,
  Mail,
  Building,
  Zap,
} from 'lucide-react';
import {
  FormTemplate,
  MitIdCitizenSession,
  FormSubmission,
  SurveyPage,
  SurveyElement,
  FormVisualThemeId,
} from '../types/schema';
import { VISUAL_THEMES, DEFAULT_THEME_ID } from '../data/themes';
import { VisualStylesGalleryModal } from './VisualStylesGalleryModal';

interface UserFormViewProps {
  template: FormTemplate;
  currentMitIdSession: MitIdCitizenSession | null;
  onOpenMitIdModal: () => void;
  onSubmissionSuccess: (submission: FormSubmission) => void;
  onInspectSubmission: (submission: FormSubmission) => void;
  onUpdateTemplateTheme?: (themeId: FormVisualThemeId) => void;
}

export const UserFormView: React.FC<UserFormViewProps> = ({
  template,
  currentMitIdSession,
  onOpenMitIdModal,
  onSubmissionSuccess,
  onInspectSubmission,
  onUpdateTemplateTheme,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSubmission, setLastSubmission] = useState<FormSubmission | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);

  // Active theme from template or fallback to default
  const [activeThemeId, setActiveThemeId] = useState<FormVisualThemeId>(
    template.surveyJson?.theme || DEFAULT_THEME_ID
  );

  useEffect(() => {
    if (template.surveyJson?.theme) {
      setActiveThemeId(template.surveyJson.theme);
    }
  }, [template.surveyJson?.theme]);

  const activeTheme = VISUAL_THEMES[activeThemeId] || VISUAL_THEMES[DEFAULT_THEME_ID];
  const allThemes = Object.values(VISUAL_THEMES);

  const handleThemeChange = (newThemeId: FormVisualThemeId) => {
    setActiveThemeId(newThemeId);
    if (onUpdateTemplateTheme) {
      onUpdateTemplateTheme(newThemeId);
    }
  };

  const pages: SurveyPage[] = template.surveyJson?.pages || [];
  const currentPage = pages[currentPageIndex] || { elements: [] };
  const elements = currentPage.elements || [];

  // Auto-populate verified citizen data if MitID is active
  useEffect(() => {
    if (template.accessControl?.requireMitId && currentMitIdSession?.authenticated) {
      setFormData((prev) => {
        const next = { ...prev };
        if (currentMitIdSession.fullName && !prev.fullName) next.fullName = currentMitIdSession.fullName;
        if (currentMitIdSession.cpr && !prev.cpr) next.cpr = currentMitIdSession.cpr;
        if (currentMitIdSession.email && !prev.applicantEmail) next.applicantEmail = currentMitIdSession.email;
        if (currentMitIdSession.phone && !prev.applicantPhone) next.applicantPhone = currentMitIdSession.phone;
        if (currentMitIdSession.address && !prev.propertyAddress) {
          next.propertyAddress = `${currentMitIdSession.address}, ${currentMitIdSession.postalCode} ${currentMitIdSession.city}`;
        }
        return next;
      });
    }
  }, [template, currentMitIdSession]);

  // Context value getter supporting both form fields and system variables
  const getContextValue = (key: string): any => {
    if (!key) return undefined;

    // System context
    if (key.startsWith('system.') || key.startsWith('mitId.')) {
      const cleanKey = key.replace(/^system\./, '');
      if (cleanKey === 'mitId.authenticated' || cleanKey === 'isMitIdLoggedIn') {
        return !!currentMitIdSession?.authenticated;
      }
      if (cleanKey === 'mitId.authLevel' || cleanKey === 'authLevel') {
        return currentMitIdSession?.authLevel || '';
      }
      if (cleanKey === 'mitId.cpr' || cleanKey === 'cpr') {
        return currentMitIdSession?.cpr || '';
      }
      if (cleanKey === 'mitId.fullName' || cleanKey === 'fullName') {
        return currentMitIdSession?.fullName || '';
      }
      if (cleanKey === 'mitId.city' || cleanKey === 'city') {
        return currentMitIdSession?.city || '';
      }
      if (cleanKey === 'currentYear') {
        return new Date().getFullYear();
      }
      if (cleanKey === 'municipality') {
        return 'Københavns Kommune';
      }
    }

    // Direct form data
    return formData[key];
  };

  // Interpolate dynamic tags e.g. {{mitId.fullName}}, {{projectType}}
  const interpolateTemplate = (tmpl?: string): string => {
    if (!tmpl) return '';
    return tmpl.replace(/\{\{([a-zA-Z0-9_\.]+)\}\}/g, (_, key) => {
      const val = getContextValue(key);
      return val !== undefined && val !== null ? String(val) : '';
    });
  };

  // Comprehensive condition evaluator supporting dynamicCondition and SurveyJS visibleIf
  const isElementVisible = (element: SurveyElement): boolean => {
    // 1. Check structured dynamicCondition if present
    if (element.dynamicCondition) {
      const cond = element.dynamicCondition;
      let actualVal: any;

      if (cond.sourceType === 'system_info') {
        actualVal = getContextValue(`system.${cond.systemVariable || 'mitId.authenticated'}`);
      } else {
        actualVal = getContextValue(cond.fieldName || '');
      }

      const op = cond.operator || 'equals';
      const exp = cond.expectedValue;

      if (op === 'is_truthy') return Boolean(actualVal) && actualVal !== '' && actualVal !== false;
      if (op === 'is_falsy') return !actualVal || actualVal === '' || actualVal === false;
      if (op === 'contains') return String(actualVal ?? '').toLowerCase().includes(String(exp ?? '').toLowerCase());
      if (op === 'greater_than') return Number(actualVal) > Number(exp);
      if (op === 'less_than') return Number(actualVal) < Number(exp);
      if (op === 'not_equals') return String(actualVal ?? '').toLowerCase() !== String(exp ?? '').toLowerCase();
      return String(actualVal ?? '').toLowerCase() === String(exp ?? '').toLowerCase();
    }

    // 2. Check SurveyJS visibleIf string
    if (!element.visibleIf) return true;

    const raw = element.visibleIf.trim();

    // Pattern: {var} = 'val' or {var} == 'val' or {var} = true/false
    const eqMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s*={1,2}\s*(['"]?)([^'"]+)\2/);
    if (eqMatch) {
      const [, varName, , expectedVal] = eqMatch;
      const actualVal = getContextValue(varName);
      if (expectedVal === 'true') return !!actualVal;
      if (expectedVal === 'false') return !actualVal;
      return String(actualVal ?? '').toLowerCase() === String(expectedVal).toLowerCase();
    }

    // Pattern: {var} != 'val' or {var} !== 'val'
    const neqMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s*!={1,2}\s*(['"]?)([^'"]+)\2/);
    if (neqMatch) {
      const [, varName, , expectedVal] = neqMatch;
      const actualVal = getContextValue(varName);
      return String(actualVal ?? '').toLowerCase() !== String(expectedVal).toLowerCase();
    }

    // Pattern: {var} contains 'val'
    const containsMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s+contains\s+['"]([^'"]+)['"]/i);
    if (containsMatch) {
      const [, varName, expectedVal] = containsMatch;
      const actualVal = getContextValue(varName);
      return String(actualVal ?? '').toLowerCase().includes(String(expectedVal).toLowerCase());
    }

    // Pattern: {var} > num
    const gtMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s*>\s*([0-9\.]+)/);
    if (gtMatch) {
      const [, varName, numStr] = gtMatch;
      return Number(getContextValue(varName)) > Number(numStr);
    }

    // Pattern: {var} < num
    const ltMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s*<\s*([0-9\.]+)/);
    if (ltMatch) {
      const [, varName, numStr] = ltMatch;
      return Number(getContextValue(varName)) < Number(numStr);
    }

    // Pattern: {var} notEmpty
    const notEmptyMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s+notEmpty/i);
    if (notEmptyMatch) {
      const val = getContextValue(notEmptyMatch[1]);
      return val !== undefined && val !== null && val !== '';
    }

    // Pattern: {var} empty
    const emptyMatch = raw.match(/\{([a-zA-Z0-9_\.]+)\}\s+empty/i);
    if (emptyMatch) {
      const val = getContextValue(emptyMatch[1]);
      return val === undefined || val === null || val === '';
    }

    return true;
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  const validatePage = (): boolean => {
    const errors: Record<string, string> = {};

    const validateElement = (el: SurveyElement) => {
      if (!isElementVisible(el)) return;

      if (el.type === 'panel') {
        const conditionPassed = isElementVisible(el);
        const targetChildren = conditionPassed
          ? (el.trueElements || el.elements || [])
          : (el.falseElements || []);
        targetChildren.forEach(validateElement);
        return;
      }

      if (el.isRequired) {
        const val = formData[el.name];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors[el.name] = 'Dette felt skal udfyldes.';
        }
      }
    };

    elements.forEach(validateElement);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (template.accessControl?.requireMitId && !currentMitIdSession?.authenticated) {
      onOpenMitIdModal();
      return;
    }

    if (!validatePage()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          formData,
          mitIdAuthContext: currentMitIdSession,
          customTemplate: template,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Indsendelsesfejl: ${err.error || 'Ukendt fejl'}`);
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setLastSubmission(data.submission);
      onSubmissionSuccess(data.submission);
    } catch (err: any) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColSpanClass = (colSpan?: number, startWithNewLine?: boolean) => {
    const span = colSpan && colSpan >= 1 && colSpan <= 12 ? colSpan : 12;
    const spanClasses: Record<number, string> = {
      1: 'col-span-12 sm:col-span-1',
      2: 'col-span-12 sm:col-span-2',
      3: 'col-span-12 sm:col-span-3',
      4: 'col-span-12 sm:col-span-4',
      5: 'col-span-12 sm:col-span-5',
      6: 'col-span-12 sm:col-span-6',
      7: 'col-span-12 sm:col-span-7',
      8: 'col-span-12 sm:col-span-8',
      9: 'col-span-12 sm:col-span-9',
      10: 'col-span-12 sm:col-span-10',
      11: 'col-span-12 sm:col-span-11',
      12: 'col-span-12 sm:col-span-12',
    };
    const baseSpan = spanClasses[span] || 'col-span-12';
    const startClass = startWithNewLine ? 'sm:col-start-1' : '';
    return `${baseSpan} ${startClass}`.trim();
  };

  // Render a single form field or recursive panel
  const renderElement = (element: SurveyElement, isInsidePanel = false) => {
    if (!isElementVisible(element)) return null;

    const errorMsg = validationErrors[element.name];

    // DYNAMIC CONDITIONAL PANEL (Smart Container)
    // Only renders the sub-elements configured for the active condition branch (TRUE or FALSE), without rendering the container itself.
    if (element.type === 'panel') {
      const conditionPassed = isElementVisible(element);
      const targetChildren = conditionPassed
        ? (element.trueElements || element.elements || [])
        : (element.falseElements || []);

      if (!targetChildren || targetChildren.length === 0) return null;

      return (
        <React.Fragment key={element.name}>
          {targetChildren.map((child) => renderElement(child, isInsidePanel))}
        </React.Fragment>
      );
    }

    // Standard Field Rendering with 12-column grid placement
    return (
      <div key={element.name} className={`${getColSpanClass(element.colSpan, element.startWithNewLine)} space-y-1.5`}>
        <label className={activeTheme.classes.label}>
          {element.title}
          {element.isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>

        {element.description && (
          <p className={activeTheme.classes.descriptionText}>{element.description}</p>
        )}

        {/* Text / Number / Email / CPR / Date / Tel */}
        {element.type === 'text' && (
          <input
            type={
              element.inputType === 'number'
                ? 'number'
                : element.inputType === 'email'
                ? 'email'
                : element.inputType === 'date'
                ? 'date'
                : 'text'
            }
            placeholder={element.placeholder || ''}
            value={formData[element.name] ?? ''}
            onChange={(e) => handleInputChange(element.name, e.target.value)}
            className={`${activeTheme.classes.input} ${activeTheme.classes.inputFocus} ${
              errorMsg ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-500/20' : ''
            }`}
          />
        )}

        {/* Long comment / textarea */}
        {element.type === 'comment' && (
          <textarea
            rows={3}
            placeholder={element.placeholder || ''}
            value={formData[element.name] ?? ''}
            onChange={(e) => handleInputChange(element.name, e.target.value)}
            className={`${activeTheme.classes.textarea} ${
              errorMsg ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-500/20' : ''
            }`}
          />
        )}

        {/* Dropdown */}
        {element.type === 'dropdown' && (
          <select
            value={formData[element.name] ?? ''}
            onChange={(e) => handleInputChange(element.name, e.target.value)}
            className={`${activeTheme.classes.dropdown} ${
              errorMsg ? 'border-rose-400 bg-rose-50/40' : ''
            }`}
          >
            <option value="">-- Vælg en svarmulighed --</option>
            {(element.choices || []).map((c, idx) => {
              const val = typeof c === 'object' ? c.value : c;
              const txt = typeof c === 'object' ? c.text : c;
              return (
                <option key={idx} value={val}>
                  {txt}
                </option>
              );
            })}
          </select>
        )}

        {/* Radio Group */}
        {element.type === 'radiogroup' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {(element.choices || []).map((c, idx) => {
              const val = typeof c === 'object' ? c.value : c;
              const txt = typeof c === 'object' ? c.text : c;
              const isChecked = formData[element.name] === val;

              return (
                <label
                  key={idx}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? activeTheme.classes.radioCardActive
                      : activeTheme.classes.radioCardInactive
                  }`}
                >
                  <input
                    type="radio"
                    name={element.name}
                    value={val}
                    checked={isChecked}
                    onChange={() => handleInputChange(element.name, val)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-semibold">{txt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Boolean Switch */}
        {element.type === 'boolean' && (
          <div className="pt-1">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData[element.name]}
                onChange={(e) => handleInputChange(element.name, e.target.checked)}
                className="rounded w-5 h-5"
              />
              <span className="text-xs font-medium">
                {formData[element.name] ? 'Ja, bekræftet' : 'Nej'}
              </span>
            </label>
          </div>
        )}

        {/* Checkbox (Multi-select) */}
        {element.type === 'checkbox' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {(element.choices || []).map((c, idx) => {
              const val = typeof c === 'object' ? c.value : c;
              const txt = typeof c === 'object' ? c.text : c;
              const currentArr: string[] = Array.isArray(formData[element.name])
                ? formData[element.name]
                : [];
              const isChecked = currentArr.includes(val);

              return (
                <label
                  key={idx}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? activeTheme.classes.radioCardActive
                      : activeTheme.classes.radioCardInactive
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...currentArr, val]
                        : currentArr.filter((item) => item !== val);
                      handleInputChange(element.name, next);
                    }}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span className="text-xs font-semibold">{txt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* File Upload */}
        {element.type === 'file' && (
          <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-2xl p-6 text-center bg-slate-50/50 space-y-2 cursor-pointer transition-colors">
            <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-700">
              Klik for at vælge filer eller træk & slip her (PDF, PNG, JPEG)
            </div>
            <p className="text-[11px] text-slate-400">Maks. 25 MB</p>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors ${activeTheme.classes.wrapperBg}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Visual Styles Quick-Switcher Toolbar */}
        <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Visuel Stil:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {allThemes.map((t) => {
                const isActive = activeThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThemeChange(t.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.swatches[0] }}
                    />
                    <span>{t.name.split(' ')[0]}</span>
                    {isActive && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGalleryModalOpen(true)}
            className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Tema Galleri & Info</span>
          </button>
        </div>

        {/* MitID Required Banner if not logged in */}
        {template.accessControl?.requireMitId && !currentMitIdSession?.authenticated && (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  MitID Autentifikation Påkrævet
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Denne formular kræver verificeret dansk borger-identitet ({template.accessControl.authLevel || 'Substantial'}). Log ind for at låse formularen op og auto-udfylde dine data.
                </p>
              </div>
            </div>
            <button
              id="btn-login-mitid-user-view"
              type="button"
              onClick={onOpenMitIdModal}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Log ind med MitID</span>
            </button>
          </div>
        )}

        {/* Post-Submission Success View */}
        {lastSubmission ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Formular Modtaget & Gennemført
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Din ansøgning er registreret i den kommunale workflow engine med kvitteringsnummer:
              </p>
              <div className="inline-block font-mono font-bold text-sm bg-slate-100 text-slate-800 px-4 py-1.5 rounded-xl border border-slate-200">
                {lastSubmission.receiptNumber}
              </div>
            </div>

            {/* Workflow Execution Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Udførte automatiske handlinger</span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {lastSubmission.workflowExecution.totalActionsDispatched} afsendt
                </span>
              </h3>

              <div className="space-y-2">
                {lastSubmission.workflowExecution.stepsEvaluated
                  .filter((s) => s.conditionPassed)
                  .flatMap((s) => s.actionsExecuted)
                  .map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex items-start space-x-3 shadow-2xs"
                    >
                      {action.actionType === 'DIGITAL_POST_NGDP' ? (
                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                          <Send className="w-4 h-4" />
                        </div>
                      ) : action.actionType === 'EMAIL' ? (
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{action.actionName}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                            {action.recipient}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{action.summary}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => {
                  setLastSubmission(null);
                  setFormData({});
                }}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Udfyld ny formular</span>
              </button>

              <button
                onClick={() => onInspectSubmission(lastSubmission)}
                className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Se NgDP MeMo & E-mail Forsendelser</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Actual Form View Rendered in Active Theme */
          (!template.accessControl?.requireMitId || currentMitIdSession?.authenticated) && (
            <form onSubmit={handleSubmit} className={`${activeTheme.classes.card} space-y-6 transition-all`}>
              {/* Form Header */}
              <div className={activeTheme.classes.header}>
                <div className="flex items-center justify-between">
                  <span className={activeTheme.classes.tagBadge}>
                    {template.category}
                  </span>
                  {pages.length > 1 && (
                    <span className="text-xs font-semibold opacity-70">
                      Side {currentPageIndex + 1} af {pages.length}
                    </span>
                  )}
                </div>
                <h1 className={activeTheme.classes.title}>
                  {template.surveyJson?.title || template.title}
                </h1>
                {template.surveyJson?.description && (
                  <p className={activeTheme.classes.description}>
                    {template.surveyJson.description}
                  </p>
                )}
              </div>

              {/* MitID Citizen Identity Verification Banner */}
              {currentMitIdSession?.authenticated && (
                <div className={`${activeTheme.classes.mitIdBanner} flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${activeTheme.classes.mitIdBannerText} flex items-center gap-1.5`}>
                        <span>Logget ind med MitID: {currentMitIdSession.fullName}</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">
                          {currentMitIdSession.authLevel}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-80 font-mono">
                        CPR: {currentMitIdSession.cpr} &bull; {currentMitIdSession.address}, {currentMitIdSession.postalCode} {currentMitIdSession.city}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/70 text-slate-800 font-bold px-2 py-0.5 rounded border">
                    Valideret
                  </span>
                </div>
              )}

              {/* Questions Elements Rendering (supports recursive dynamic panels & 12-col grid) */}
              <div className="grid grid-cols-12 gap-x-4 gap-y-5">
                {elements.map((element) => renderElement(element))}
              </div>

              {/* Pagination & Submit Controls */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                {currentPageIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => prev - 1)}
                    className={activeTheme.classes.buttonSecondary}
                  >
                    Forrige trin
                  </button>
                ) : <div />}

                {currentPageIndex < pages.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (validatePage()) {
                        setCurrentPageIndex((prev) => prev + 1);
                      }
                    }}
                    className={activeTheme.classes.buttonPrimary}
                  >
                    <span>Næste Side</span>
                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                  </button>
                ) : (
                  <button
                    id="btn-submit-form"
                    type="submit"
                    disabled={isSubmitting}
                    className={activeTheme.classes.buttonPrimary}
                  >
                    <Send className="w-4 h-4 mr-1.5 inline" />
                    <span>{isSubmitting ? 'Behandler i Workflow Engine...' : 'Indsend Formular'}</span>
                  </button>
                )}
              </div>
            </form>
          )
        )}

        {/* Modal for all styles */}
        <VisualStylesGalleryModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          currentThemeId={activeThemeId}
          onSelectTheme={handleThemeChange}
          activeTemplate={template}
        />
      </div>
    </div>
  );
};

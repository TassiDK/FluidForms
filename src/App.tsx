/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FormTemplate, FormSubmission, MitIdCitizenSession } from './types/schema';
import { INITIAL_TEMPLATES } from './data/initialTemplates';
import { MOCK_CITIZENS } from './data/mockMitIdCitizens';
import { Header, ActiveTab } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { TemplateStudio } from './components/TemplateStudio/TemplateStudio';
import { UserFormView } from './components/UserFormView';
import { SubmissionsAuditView } from './components/SubmissionsAuditView';
import { MitIdModal } from './components/MitIdModal';
import { NgDpMemoModal } from './components/NgDpMemoModal';
import { VisualStylesGalleryModal } from './components/VisualStylesGalleryModal';
import { FormVisualThemeId } from './types/schema';
import { DEFAULT_THEME_ID } from './data/themes';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [templates, setTemplates] = useState<FormTemplate[]>(INITIAL_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(INITIAL_TEMPLATES[0]?.id || '');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [currentMitIdSession, setCurrentMitIdSession] = useState<MitIdCitizenSession | null>(MOCK_CITIZENS[0]);
  const [isMitIdModalOpen, setIsMitIdModalOpen] = useState<boolean>(false);
  const [isVisualGalleryOpen, setIsVisualGalleryOpen] = useState<boolean>(false);
  const [inspectedSubmission, setInspectedSubmission] = useState<FormSubmission | null>(null);
  const [studioInitialSubTab, setStudioInitialSubTab] = useState<'builder' | 'workflow' | 'access' | 'schema'>('builder');

  // Load templates & submissions from Express backend
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setTemplates(data);
          if (!activeTemplateId) setActiveTemplateId(data[0].id);
        }
      })
      .catch((err) => console.log('Backend fetch templates note:', err));

    fetch('/api/submissions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          setSubmissions(data);
        }
      })
      .catch((err) => console.log('Backend fetch submissions note:', err));
  }, []);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0] || INITIAL_TEMPLATES[0];

  // Save / update template
  const handleSaveTemplate = async (updated: FormTemplate) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        const saved = data.template || updated;
        setTemplates((prev) => {
          const idx = prev.findIndex((t) => t.id === saved.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
      } else {
        // Fallback local update
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
    } catch (err) {
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Create new template
  const handleCreateNewTemplate = () => {
    const newId = `tpl_custom_${Date.now()}`;
    const newTemplate: FormTemplate = {
      id: newId,
      title: 'Ny Borgerformular',
      category: 'Borgerservice',
      description: 'Ny formular konfigureret med SurveyJS spørgsmål og automatisk workflow logik.',
      version: 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Administrator',
      accessControl: {
        requireMitId: true,
        mitIdType: 'citizen',
        authLevel: 'Substantial',
        autoFillFields: true,
      },
      surveyJson: {
        title: 'Ny Borgerformular',
        description: 'Udfyld venligst oplysningerne nedenfor.',
        pages: [
          {
            name: 'page1',
            title: 'Kontaktoplysninger',
            elements: [
              {
                name: 'fullName',
                type: 'text',
                title: 'Fulde Navn',
                isRequired: true,
                placeholder: 'F.eks. Anders Jensen',
              },
              {
                name: 'cpr',
                type: 'text',
                title: 'CPR-nummer',
                isRequired: true,
                placeholder: 'DDMMYY-XXXX',
              },
              {
                name: 'applicantEmail',
                type: 'text',
                title: 'E-mailadresse',
                isRequired: true,
                inputType: 'email',
              },
              {
                name: 'inquiryReason',
                type: 'comment',
                title: 'Hvad drejer henvendelsen sig om?',
                isRequired: true,
              },
            ],
          },
        ],
      },
      workflowLogic: {
        steps: [
          {
            id: `step_${Date.now()}`,
            name: 'Kvittering via Dansk Digital Post (NgDP)',
            description: 'Udsendes automatisk til borgerens e-Boks / Borger.dk / Mit.dk',
            enabled: true,
            conditionGroup: {
              logicalOperator: 'AND',
              conditions: [
                {
                  id: `cond_${Date.now()}`,
                  field: 'cpr',
                  operator: 'is_not_empty',
                  value: '',
                },
              ],
            },
            actions: [
              {
                id: `act_${Date.now()}`,
                name: 'Digital Post MeMo Kvittering',
                type: 'DIGITAL_POST_NGDP',
                recipientType: 'CITIZEN_DIGITAL_POST',
                config: {
                  ngdp: {
                    senderCvr: '29189846',
                    senderName: 'Københavns Kommune - Borgerservice',
                    recipientCprOrCvrField: '{{cpr}}',
                    messageTitle: 'Kvittering for modtaget henvendelse',
                    messageType: 'DIGITAL_POST',
                    mandatory: true,
                    memoDocument: {
                      mainDocumentTitle: 'Officiel Kvittering',
                      bodyTemplate: `Kære {{fullName}},\n\nVi har modtaget din henvendelse i Borgerservice.\n\nSagsnr: {{receiptNumber}}`,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setActiveTemplateId(newId);
    setStudioInitialSubTab('builder');
    setActiveTab('studio');
    handleSaveTemplate(newTemplate);
  };

  // Duplicate template
  const handleDuplicateTemplate = (templateToDup: FormTemplate) => {
    const dupId = `tpl_dup_${Date.now()}`;
    const duplicated: FormTemplate = {
      ...templateToDup,
      id: dupId,
      title: `${templateToDup.title} (Kopi)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [duplicated, ...prev]);
    handleSaveTemplate(duplicated);
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (templates.length <= 1) {
      alert('Der skal være mindst én aktiv formularskabelon i systemet.');
      return;
    }

    try {
      await fetch(`/api/templates/${templateId}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Delete note:', e);
    }

    const filtered = templates.filter((t) => t.id !== templateId);
    setTemplates(filtered);
    if (activeTemplateId === templateId) {
      setActiveTemplateId(filtered[0].id);
    }
  };

  // Select template to open in studio
  const handleSelectTemplate = (template: FormTemplate, initialTab: 'builder' | 'workflow' | 'access' | 'schema' = 'builder') => {
    setActiveTemplateId(template.id);
    setStudioInitialSubTab(initialTab);
    setActiveTab('studio');
  };

  // Test template as citizen
  const handleTestAsCitizen = (template: FormTemplate) => {
    setActiveTemplateId(template.id);
    setActiveTab('user-view');
  };

  // Submission created
  const handleSubmissionSuccess = (newSub: FormSubmission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  // Clear all submissions
  const handleClearSubmissions = async () => {
    try {
      await fetch('/api/submissions', { method: 'DELETE' });
    } catch (e) {
      console.log('Clear note:', e);
    }
    setSubmissions([]);
  };

  // Update template visual theme
  const handleUpdateTemplateTheme = (newThemeId: FormVisualThemeId) => {
    const updated: FormTemplate = {
      ...activeTemplate,
      surveyJson: {
        ...activeTemplate.surveyJson,
        theme: newThemeId,
      },
    };
    handleSaveTemplate(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMitIdSession={currentMitIdSession}
        onOpenMitIdModal={() => setIsMitIdModalOpen(true)}
        onLogoutMitId={() => setCurrentMitIdSession(null)}
        templateCount={templates.length}
        submissionCount={submissions.length}
        onOpenVisualGalleryModal={() => setIsVisualGalleryOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onCreateNewTemplate={handleCreateNewTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onTestAsCitizen={handleTestAsCitizen}
            totalSubmissions={submissions.length}
          />
        )}

        {activeTab === 'studio' && (
          <TemplateStudio
            key={activeTemplate.id}
            template={activeTemplate}
            onSaveTemplate={handleSaveTemplate}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onTestAsCitizen={handleTestAsCitizen}
            initialSubTab={studioInitialSubTab}
          />
        )}

        {activeTab === 'user-view' && (
          <UserFormView
            template={activeTemplate}
            templatesList={templates}
            onSelectAnotherTemplate={(id) => setActiveTemplateId(id)}
            currentMitIdSession={currentMitIdSession}
            onOpenMitIdModal={() => setIsMitIdModalOpen(true)}
            onSubmissionSuccess={handleSubmissionSuccess}
            onInspectSubmission={(sub) => setInspectedSubmission(sub)}
            onUpdateTemplateTheme={handleUpdateTemplateTheme}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsAuditView
            submissions={submissions}
            onClearHistory={handleClearSubmissions}
            onSelectSubmissionToInspect={(sub) => setInspectedSubmission(sub)}
          />
        )}
      </main>

      {/* MitID Modal */}
      <MitIdModal
        isOpen={isMitIdModalOpen}
        onClose={() => setIsMitIdModalOpen(false)}
        onAuthenticate={(session) => setCurrentMitIdSession(session)}
      />

      {/* Visual Styles Gallery Modal */}
      <VisualStylesGalleryModal
        isOpen={isVisualGalleryOpen}
        onClose={() => setIsVisualGalleryOpen(false)}
        currentThemeId={activeTemplate.surveyJson?.theme || DEFAULT_THEME_ID}
        onSelectTheme={handleUpdateTemplateTheme}
        activeTemplate={activeTemplate}
      />

      {/* NgDP MeMo & Dispatch Inspector Modal */}
      {inspectedSubmission && (
        <NgDpMemoModal
          submission={inspectedSubmission}
          onClose={() => setInspectedSubmission(null)}
        />
      )}
    </div>
  );
}

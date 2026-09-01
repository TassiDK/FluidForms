import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_TEMPLATES } from './src/data/initialTemplates';
import { FormTemplate, FormSubmission, MitIdCitizenSession } from './src/types/schema';
import { executeWorkflowEngine } from './src/utils/workflowEngine';
import { generateNgDpMeMoPayload } from './src/utils/ngdpFormatter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory persistent state for templates and submission audit logs
  let templates: FormTemplate[] = [...INITIAL_TEMPLATES];
  let submissions: FormSubmission[] = [];

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'AutoForma No-Code Form & Workflow Engine',
      engineVersion: '2.4.0',
      activeTemplates: templates.length,
      totalSubmissions: submissions.length,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Templates endpoints
  app.get('/api/templates', (req: Request, res: Response) => {
    res.json(templates);
  });

  app.get('/api/templates/:id', (req: Request, res: Response) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ error: `Template with ID '${req.params.id}' not found.` });
    }
    res.json(template);
  });

  app.post('/api/templates', (req: Request, res: Response) => {
    const incoming: FormTemplate = req.body;
    if (!incoming || !incoming.title) {
      return res.status(400).json({ error: 'Invalid template payload. Title is required.' });
    }

    const existingIdx = templates.findIndex((t) => t.id === incoming.id);
    const updatedTemplate: FormTemplate = {
      ...incoming,
      id: incoming.id || `tpl_${Date.now()}`,
      updatedAt: new Date().toISOString(),
      version: existingIdx >= 0 ? (templates[existingIdx].version || 1) + 1 : (incoming.version || 1),
    };

    if (existingIdx >= 0) {
      templates[existingIdx] = updatedTemplate;
    } else {
      updatedTemplate.createdAt = new Date().toISOString();
      templates.unshift(updatedTemplate);
    }

    res.json({
      message: 'Template saved successfully',
      template: updatedTemplate,
    });
  });

  app.delete('/api/templates/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = templates.length;
    templates = templates.filter((t) => t.id !== id);

    if (templates.length === initialLen) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: `Template ${id} deleted successfully.` });
  });

  // 3. Workflow Dry-Run / Test evaluation endpoint
  app.post('/api/workflow/dry-run', (req: Request, res: Response) => {
    const { template, formData, userContext } = req.body;
    if (!template) {
      return res.status(400).json({ error: 'Template specification is required for dry-run.' });
    }

    const result = executeWorkflowEngine(template, formData || {}, userContext || null);
    res.json(result);
  });

  // 4. Form Submission & Logic Runner
  app.post('/api/forms/submit', (req: Request, res: Response) => {
    const { templateId, formData, mitIdAuthContext, customTemplate } = req.body;

    let targetTemplate = customTemplate || templates.find((t) => t.id === templateId);
    if (!targetTemplate) {
      return res.status(404).json({ error: `Form template '${templateId}' not found.` });
    }

    // Access control check
    if (targetTemplate.accessControl?.requireMitId) {
      if (!mitIdAuthContext || !mitIdAuthContext.authenticated) {
        return res.status(401).json({
          error: 'Access Denied: MitID authentication is required for this form.',
          requiredLevel: targetTemplate.accessControl.authLevel || 'Substantial',
        });
      }
    }

    // Execute logic runner
    const execution = executeWorkflowEngine(
      targetTemplate,
      formData || {},
      mitIdAuthContext || null
    );

    const receiptNumber = `KVIT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSubmission: FormSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      templateId: targetTemplate.id,
      templateTitle: targetTemplate.title,
      templateVersion: targetTemplate.version,
      submittedAt: new Date().toISOString(),
      receiptNumber,
      mitIdAuthContext: mitIdAuthContext || null,
      formData: formData || {},
      workflowExecution: {
        status: execution.status,
        durationMs: execution.durationMs,
        stepsEvaluated: execution.stepsEvaluated,
        totalActionsDispatched: execution.totalActionsDispatched,
        logs: execution.logs,
      },
    };

    submissions.unshift(newSubmission);

    console.log(`[SUBMISSION] Form '${targetTemplate.title}' submitted. Receipt: ${receiptNumber}, Dispatched: ${execution.totalActionsDispatched} actions.`);

    res.json({
      success: true,
      receiptNumber,
      submission: newSubmission,
      message: `Formular indsendt og behandlet. ${execution.totalActionsDispatched} automatiske handlinger (NgDP Digital Post / E-mail) udført.`,
    });
  });

  // 5. Submissions Audit & History endpoints
  app.get('/api/submissions', (req: Request, res: Response) => {
    res.json(submissions);
  });

  app.get('/api/submissions/:id', (req: Request, res: Response) => {
    const sub = submissions.find((s) => s.id === req.params.id);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(sub);
  });

  app.delete('/api/submissions', (req: Request, res: Response) => {
    submissions = [];
    res.json({ message: 'Submission history cleared.' });
  });

  // 6. Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[XFLOW SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();

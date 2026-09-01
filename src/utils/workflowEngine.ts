/**
 * Workflow Logic Engine
 * Evaluates condition groups (AND/OR, operators: equals, contains, gt, lt, empty, regex, etc.)
 * and prepares action dispatches (NgDP, Email, ESDH, Webhook).
 */

import {
  WorkflowStep,
  WorkflowCondition,
  ConditionEvaluationDetail,
  StepEvaluationResult,
  ExecutedActionLog,
  FormTemplate,
  MitIdCitizenSession,
} from '../types/schema';
import { generateNgDpMeMoPayload, interpolateTokens } from './ngdpFormatter';

/**
 * Evaluate a single condition against the form data.
 */
export function evaluateCondition(
  condition: WorkflowCondition,
  formData: Record<string, any>,
  userContext?: MitIdCitizenSession | null
): ConditionEvaluationDetail {
  const { field, operator, value: expectedValue } = condition;

  if (operator === 'always') {
    return {
      field: '(Always)',
      operator: 'always',
      expectedValue: 'TRUE',
      actualValue: 'ALWAYS_EXECUTE',
      passed: true,
      note: 'Step is configured to always execute unconditionally',
    };
  }

  // Resolve actual value from form data or user context
  let actualValue: any = undefined;
  if (field in formData) {
    actualValue = formData[field];
  } else if (userContext && field in userContext) {
    actualValue = (userContext as any)[field];
  } else if (field === 'cpr' && userContext) {
    actualValue = userContext.cpr;
  }

  let passed = false;
  let note = '';

  switch (operator) {
    case 'equals': {
      if (actualValue === undefined || actualValue === null) {
        passed = expectedValue === '' || expectedValue === null;
      } else if (typeof actualValue === 'boolean') {
        const expBool = expectedValue === true || expectedValue === 'true' || expectedValue === 'Yes' || expectedValue === 'Ja';
        passed = actualValue === expBool;
      } else if (typeof actualValue === 'number') {
        passed = Number(actualValue) === Number(expectedValue);
      } else {
        passed = String(actualValue).trim().toLowerCase() === String(expectedValue).trim().toLowerCase();
      }
      break;
    }

    case 'not_equals': {
      if (actualValue === undefined || actualValue === null) {
        passed = expectedValue !== '' && expectedValue !== null;
      } else if (typeof actualValue === 'boolean') {
        const expBool = expectedValue === true || expectedValue === 'true' || expectedValue === 'Yes' || expectedValue === 'Ja';
        passed = actualValue !== expBool;
      } else if (typeof actualValue === 'number') {
        passed = Number(actualValue) !== Number(expectedValue);
      } else {
        passed = String(actualValue).trim().toLowerCase() !== String(expectedValue).trim().toLowerCase();
      }
      break;
    }

    case 'contains': {
      if (Array.isArray(actualValue)) {
        passed = actualValue.some(
          (item) => String(item).toLowerCase().includes(String(expectedValue).toLowerCase())
        );
      } else if (actualValue !== undefined && actualValue !== null) {
        passed = String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      } else {
        passed = false;
      }
      break;
    }

    case 'not_contains': {
      if (Array.isArray(actualValue)) {
        passed = !actualValue.some(
          (item) => String(item).toLowerCase().includes(String(expectedValue).toLowerCase())
        );
      } else if (actualValue !== undefined && actualValue !== null) {
        passed = !String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      } else {
        passed = true;
      }
      break;
    }

    case 'greater_than': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedValue);
      passed = !isNaN(actNum) && !isNaN(expNum) && actNum > expNum;
      note = isNaN(actNum) ? 'Actual value is not a valid number' : '';
      break;
    }

    case 'less_than': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedValue);
      passed = !isNaN(actNum) && !isNaN(expNum) && actNum < expNum;
      note = isNaN(actNum) ? 'Actual value is not a valid number' : '';
      break;
    }

    case 'greater_than_or_equal': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedValue);
      passed = !isNaN(actNum) && !isNaN(expNum) && actNum >= expNum;
      break;
    }

    case 'less_than_or_equal': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedValue);
      passed = !isNaN(actNum) && !isNaN(expNum) && actNum <= expNum;
      break;
    }

    case 'is_empty': {
      passed =
        actualValue === undefined ||
        actualValue === null ||
        actualValue === '' ||
        (Array.isArray(actualValue) && actualValue.length === 0);
      break;
    }

    case 'is_not_empty': {
      passed =
        actualValue !== undefined &&
        actualValue !== null &&
        actualValue !== '' &&
        (!Array.isArray(actualValue) || actualValue.length > 0);
      break;
    }

    default:
      passed = false;
      note = `Unknown operator: ${operator}`;
  }

  return {
    field,
    operator,
    expectedValue,
    actualValue: actualValue ?? '(empty / not set)',
    passed,
    note,
  };
}

/**
 * Execute an individual workflow step.
 */
export function executeStep(
  step: WorkflowStep,
  formData: Record<string, any>,
  userContext?: MitIdCitizenSession | null,
  receiptNumber: string = `KVIT-${Date.now().toString().slice(-6)}`
): StepEvaluationResult {
  const { logicalOperator = 'AND', conditions = [] } = step.conditionGroup || {};

  const conditionDetails: ConditionEvaluationDetail[] = [];

  let conditionPassed = true;

  if (conditions.length === 0) {
    // If no conditions, treat as true
    conditionPassed = true;
  } else {
    for (const cond of conditions) {
      const result = evaluateCondition(cond, formData, userContext);
      conditionDetails.push(result);
    }

    if (logicalOperator === 'AND') {
      conditionPassed = conditionDetails.every((c) => c.passed);
    } else {
      conditionPassed = conditionDetails.some((c) => c.passed);
    }
  }

  const actionsExecuted: ExecutedActionLog[] = [];

  if (step.enabled && conditionPassed) {
    for (const action of step.actions) {
      const actionLog: ExecutedActionLog = {
        actionId: action.id,
        actionName: action.name,
        actionType: action.type,
        recipientType: action.recipientType,
        recipient: '',
        status: 'DISPATCHED',
        timestamp: new Date().toISOString(),
        summary: '',
        payload: null,
      };

      if (action.type === 'DIGITAL_POST_NGDP' && action.config.ngdp) {
        const memoPayload = generateNgDpMeMoPayload(
          action.config.ngdp,
          formData,
          userContext,
          receiptNumber
        );
        actionLog.recipient = `${memoPayload.messageHeader.recipient.recipientName} (${memoPayload.messageHeader.recipient.recipientID})`;
        actionLog.summary = `Digital Post (NgDP MeMo) generated for ${actionLog.recipient} with title "${memoPayload.messageHeader.label}". Format: Lovpligtig Digital Post v1.2.`;
        actionLog.payload = memoPayload;
      } else if (action.type === 'EMAIL' && action.config.email) {
        const toEmail = interpolateTokens(action.config.email.to, formData, userContext);
        const subject = interpolateTokens(action.config.email.subject, formData, userContext, { receiptNumber });
        const bodyText = interpolateTokens(action.config.email.body, formData, userContext, { receiptNumber });

        const emailPayload = {
          from: `"${action.config.email.fromName}" <${action.config.email.fromEmail || 'no-reply@kommune.dk'}>`,
          to: toEmail,
          cc: action.config.email.cc ? interpolateTokens(action.config.email.cc, formData, userContext) : undefined,
          subject: subject,
          bodyHtml: `
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #1e293b;">
              <h3 style="color: #0284c7; margin-top: 0;">${subject}</h3>
              <p style="white-space: pre-line;">${bodyText}</p>
              <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
              <div style="font-size: 12px; color: #64748b;">
                Denne e-mail er automatisk genereret af XFlow Kommunal Workflow Engine. Sagsnr: ${receiptNumber}
              </div>
            </div>
          `,
          text: bodyText,
          sentAt: new Date().toISOString(),
          smtpServer: 'smtp.kommune.internal:587 (TLS)',
        };

        actionLog.recipient = toEmail;
        actionLog.summary = `Internal/Citizen Email queued & dispatched to "${toEmail}" with subject "${subject}".`;
        actionLog.payload = emailPayload;
      } else if (action.type === 'MUNICIPAL_ESDH' && action.config.esdh) {
        const esdh = action.config.esdh;
        const caseTitle = interpolateTokens(esdh.caseTitle, formData, userContext, { receiptNumber });

        const esdhPayload = {
          system: esdh.systemName,
          kleClassification: esdh.kleNumber,
          caseTitle: caseTitle,
          responsibleUnit: esdh.responsibleUnit,
          caseNumber: `ESDH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          journalizedAt: new Date().toISOString(),
          indexedFields: formData,
        };

        actionLog.recipient = `${esdh.systemName} (${esdh.responsibleUnit})`;
        actionLog.summary = `Journalized in municipal ESDH system (${esdh.systemName}) under KLE: ${esdh.kleNumber}. Sagsnr tildelt.`;
        actionLog.payload = esdhPayload;
      } else if (action.type === 'WEBHOOK' && action.config.webhook) {
        const hook = action.config.webhook;
        const webhookPayload = {
          targetUrl: hook.url,
          method: hook.method,
          headers: hook.headers || { 'Content-Type': 'application/json' },
          dispatchedData: {
            receiptNumber,
            timestamp: new Date().toISOString(),
            formData,
            userContext,
          },
        };
        actionLog.recipient = hook.url;
        actionLog.summary = `Triggered HTTP ${hook.method} Webhook to ${hook.url}. Response: 200 OK.`;
        actionLog.payload = webhookPayload;
      }

      actionsExecuted.push(actionLog);
    }
  }

  return {
    stepId: step.id,
    stepName: step.name,
    conditionPassed,
    logicalOperator,
    conditionDetails,
    actionsExecuted,
  };
}

/**
 * Execute all workflow steps for a form template.
 */
export function executeWorkflowEngine(
  template: FormTemplate,
  formData: Record<string, any>,
  userContext?: MitIdCitizenSession | null
): {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  durationMs: number;
  stepsEvaluated: StepEvaluationResult[];
  totalActionsDispatched: number;
  logs: string[];
} {
  const startTime = Date.now();
  const logs: string[] = [];
  const receiptNumber = `KVIT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  logs.push(`[${new Date().toLocaleTimeString()}] Starting Workflow Engine for template "${template.title}" (v${template.version})`);
  logs.push(`[${new Date().toLocaleTimeString()}] Receipt Generated: ${receiptNumber}`);

  if (template.accessControl.requireMitId) {
    if (userContext?.authenticated) {
      logs.push(`[${new Date().toLocaleTimeString()}] Access Control verified: Citizen ${userContext.fullName} (${userContext.cpr}) authenticated via MitID [${userContext.authLevel}]`);
    } else {
      logs.push(`[${new Date().toLocaleTimeString()}] WARNING: Template requires MitID but session was not authenticated`);
    }
  }

  const steps = template.workflowLogic?.steps || [];
  const stepsEvaluated: StepEvaluationResult[] = [];
  let totalActions = 0;

  for (const step of steps) {
    if (!step.enabled) {
      logs.push(`[${new Date().toLocaleTimeString()}] Step "${step.name}" is disabled. Skipping.`);
      continue;
    }

    logs.push(`[${new Date().toLocaleTimeString()}] Evaluating Step "${step.name}" (${step.conditionGroup?.conditions?.length || 0} conditions, operator: ${step.conditionGroup?.logicalOperator || 'AND'})...`);

    const result = executeStep(step, formData, userContext, receiptNumber);
    stepsEvaluated.push(result);

    if (result.conditionPassed) {
      logs.push(`[${new Date().toLocaleTimeString()}] Step "${step.name}" PASSED conditions -> executing ${result.actionsExecuted.length} action(s).`);
      for (const act of result.actionsExecuted) {
        logs.push(`[${new Date().toLocaleTimeString()}] -> [${act.actionType}] ${act.summary}`);
        totalActions++;
      }
    } else {
      logs.push(`[${new Date().toLocaleTimeString()}] Step "${step.name}" DID NOT pass conditions -> 0 actions executed.`);
    }
  }

  const durationMs = Date.now() - startTime;
  logs.push(`[${new Date().toLocaleTimeString()}] Workflow execution completed in ${durationMs}ms. Total actions executed: ${totalActions}`);

  return {
    status: 'SUCCESS',
    durationMs,
    stepsEvaluated,
    totalActionsDispatched: totalActions,
    logs,
  };
}

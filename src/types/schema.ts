/**
 * Core JSON Schema and Types for No-Code Form & Workflow Engine (XFlow Prototype)
 */

export type MitIdAuthType = 'citizen' | 'business' | 'both';
export type MitIdAuthLevel = 'Substantial' | 'High';

export interface MitIdAccessControl {
  requireMitId: boolean;
  mitIdType: MitIdAuthType;
  authLevel: MitIdAuthLevel;
  autoFillFields: boolean;
  allowedCprList?: string[]; // Optional whitelist
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'always';

export interface WorkflowCondition {
  id: string;
  field: string; // Question name from surveyJson (e.g. "byggeareal", "hasAsbestos")
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface ConditionGroup {
  logicalOperator: 'AND' | 'OR';
  conditions: WorkflowCondition[];
}

export type ActionType =
  | 'DIGITAL_POST_NGDP'
  | 'EMAIL'
  | 'MUNICIPAL_ESDH'
  | 'WEBHOOK'
  | 'SMS_NOTIFICATION';

export type RecipientType =
  | 'CITIZEN_DIGITAL_POST'
  | 'INTERNAL_EMAIL'
  | 'CITIZEN_EMAIL'
  | 'DEPARTMENT_ESDH'
  | 'EXTERNAL_WEBHOOK'
  | 'CITIZEN_SMS';

export interface NgDpMemoConfig {
  senderCvr: string; // e.g. "29189846"
  senderName: string; // e.g. "Københavns Kommune - Teknik & Miljø"
  recipientCprOrCvrField: string; // e.g. "{{cpr}}" or question name "cpr_number"
  messageTitle: string;
  messageType: 'DIGITAL_POST' | 'NEM_SMS' | 'PHYSICAL_MAIL_FALLBACK';
  mandatory: boolean; // Danish public sector mandatory digital post flag
  memoDocument: {
    mainDocumentTitle: string;
    bodyTemplate: string; // Markdown or HTML with {{variables}}
    legalNotice?: string;
    attachments?: string[];
  };
}

export interface EmailActionConfig {
  to: string; // e.g. "{{applicantEmail}}" or "sagsbehandling@kommune.dk"
  cc?: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string; // With {{field}} template tokens
}

export interface EsdhActionConfig {
  systemName: 'KMD Nova' | 'Fujitsu F2' | 'SBSYS' | 'Formpipe Acadre';
  kleNumber: string; // e.g. "01.00.00G01" (Danish municipal classification code)
  caseTitle: string;
  responsibleUnit: string;
}

export interface WebhookActionConfig {
  url: string;
  method: 'POST' | 'PUT';
  headers?: Record<string, string>;
  payloadTemplate?: string;
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: ActionType;
  recipientType: RecipientType;
  config: {
    ngdp?: NgDpMemoConfig;
    email?: EmailActionConfig;
    esdh?: EsdhActionConfig;
    webhook?: WebhookActionConfig;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditionGroup: ConditionGroup;
  actions: WorkflowAction[];
}

export interface WorkflowLogic {
  steps: WorkflowStep[];
  globalVariables?: Record<string, string>;
}

export interface FormQuestionChoice {
  value: string;
  text: string;
}

export type DynamicConditionSource = 'form_field' | 'system_info';

export type SystemVariableKey =
  | 'mitId.authenticated'
  | 'mitId.authLevel'
  | 'mitId.cpr'
  | 'mitId.city'
  | 'mitId.fullName'
  | 'system.isMitIdLoggedIn'
  | 'system.currentYear'
  | 'system.municipality';

export interface DynamicConditionConfig {
  sourceType: DynamicConditionSource;
  fieldName?: string;
  systemVariable?: SystemVariableKey;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_truthy' | 'is_falsy';
  expectedValue: any;
}

export interface SurveyElement {
  name: string;
  type:
    | 'text'
    | 'comment'
    | 'radiogroup'
    | 'checkbox'
    | 'dropdown'
    | 'boolean'
    | 'rating'
    | 'file'
    | 'html'
    | 'panel';
  title: string;
  description?: string;
  isRequired?: boolean;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'cpr' | 'cvr';
  choices?: (string | FormQuestionChoice)[];
  defaultValue?: any;
  visibleIf?: string;
  enableIf?: string;
  // Layout & Grid width properties (12-column grid)
  colSpan?: number; // 1 to 12 (default 12)
  startWithNewLine?: boolean; // If true, forces a new line
  width?: string;
  // Dynamic Compound Panel / Smart Conditional Container properties:
  elements?: SurveyElement[];
  trueElements?: SurveyElement[];
  falseElements?: SurveyElement[];
  dynamicCondition?: DynamicConditionConfig;
  computedTemplate?: string;
  badgeText?: string;
  panelVariant?: 'card' | 'callout' | 'accent' | 'subtle' | 'transparent';
}

export interface SurveyPage {
  name: string;
  title?: string;
  description?: string;
  elements: SurveyElement[];
}

export type FormVisualThemeId =
  | 'danish-public'
  | 'nordic-clean'
  | 'compact-enterprise'
  | 'accessible-contrast'
  | 'dark-slate'
  | 'warm-stone';

export interface SurveyDefinition {
  title: string;
  description?: string;
  theme?: FormVisualThemeId;
  logoPosition?: 'left' | 'right' | 'top';
  showProgressBar?: 'top' | 'bottom' | 'off';
  pages: SurveyPage[];
  completedHtml?: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: string;
  accessControl: MitIdAccessControl;
  surveyJson: SurveyDefinition;
  workflowLogic: WorkflowLogic;
}

export interface MitIdCitizenSession {
  authenticated: boolean;
  cpr: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  phone: string;
  authLevel: MitIdAuthLevel;
  authMethod: 'MitID App' | 'MitID Code reader' | 'MitID Chip';
  authTime: string;
  sessionToken: string;
}

export interface ConditionEvaluationDetail {
  field: string;
  operator: ConditionOperator;
  expectedValue: any;
  actualValue: any;
  passed: boolean;
  note?: string;
}

export interface ExecutedActionLog {
  actionId: string;
  actionName: string;
  actionType: ActionType;
  recipientType: RecipientType;
  recipient: string;
  status: 'DISPATCHED' | 'SIMULATED' | 'SKIPPED' | 'FAILED';
  timestamp: string;
  summary: string;
  payload: any; // Full Danish NgDP MeMo or SMTP Email payload
}

export interface StepEvaluationResult {
  stepId: string;
  stepName: string;
  conditionPassed: boolean;
  logicalOperator: 'AND' | 'OR';
  conditionDetails: ConditionEvaluationDetail[];
  actionsExecuted: ExecutedActionLog[];
}

export interface FormSubmission {
  id: string;
  templateId: string;
  templateTitle: string;
  templateVersion: number;
  submittedAt: string;
  receiptNumber: string;
  mitIdAuthContext?: MitIdCitizenSession | null;
  formData: Record<string, any>;
  workflowExecution: {
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    durationMs: number;
    stepsEvaluated: StepEvaluationResult[];
    totalActionsDispatched: number;
    logs: string[];
  };
}

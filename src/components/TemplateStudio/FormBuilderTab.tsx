import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  Eye,
  Code2,
  Type,
  ListOrdered,
  CheckSquare,
  Hash,
  Calendar,
  ToggleLeft,
  MessageSquare,
  FileUp,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Palette,
  Layers,
  Zap,
  Sliders,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Sparkles,
  Columns,
  LayoutGrid,
  FoldVertical,
  UnfoldVertical,
} from 'lucide-react';
import {
  FormTemplate,
  SurveyElement,
  SurveyPage,
  FormVisualThemeId,
  DynamicConditionConfig,
  SystemVariableKey,
} from '../../types/schema';
import { VISUAL_THEMES, DEFAULT_THEME_ID } from '../../data/themes';

interface FormBuilderTabProps {
  template: FormTemplate;
  onUpdateTemplate: (updated: FormTemplate) => void;
}

export interface DragPayload {
  type: 'reorder' | 'palette' | 'panel_child';
  index?: number;
  paletteIndex?: number;
  panelIndex?: number;
  branch?: 'true' | 'false';
  childIndex?: number;
}

export type SelectedTarget =
  | { type: 'main'; index: number }
  | { type: 'panel_child'; panelIndex: number; branch: 'true' | 'false'; childIndex: number }
  | null;

export type DropTargetState =
  | { type: 'slot'; slotIndex: number }
  | { type: 'panel_branch'; panelIndex: number; branch: 'true' | 'false' }
  | null;

const QUESTION_PALETTE: Array<{
  type: SurveyElement['type'];
  inputType?: SurveyElement['inputType'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultChoices?: string[];
  isPanel?: boolean;
  defaultColSpan?: number;
}> = [
  {
    type: 'panel',
    label: 'Betinget Dynamisk Sektion (True/False)',
    icon: Layers,
    defaultTitle: 'Dynamisk Sektion (Forgrening)',
    isPanel: true,
    defaultColSpan: 12,
  },
  { type: 'text', inputType: 'text', label: 'Kort Tekst / Fornavn', icon: Type, defaultTitle: 'Indtast fornavn', defaultColSpan: 6 },
  { type: 'text', inputType: 'text', label: 'Kort Tekst / Efternavn', icon: Type, defaultTitle: 'Indtast efternavn', defaultColSpan: 6 },
  { type: 'text', inputType: 'cpr', label: 'CPR-nummer Felt', icon: ShieldCheck, defaultTitle: 'CPR-nummer (DDMMYY-XXXX)', defaultColSpan: 6 },
  { type: 'text', inputType: 'email', label: 'E-mailadresse', icon: MessageSquare, defaultTitle: 'E-mailadresse', defaultColSpan: 6 },
  { type: 'text', inputType: 'number', label: 'Tal / Areal / Beløb', icon: Hash, defaultTitle: 'Angiv antal / m² / beløb', defaultColSpan: 4 },
  { type: 'text', inputType: 'date', label: 'Dato Vælger', icon: Calendar, defaultTitle: 'Vælg dato', defaultColSpan: 4 },
  {
    type: 'dropdown',
    label: 'Rullemenu (Dropdown)',
    icon: ListOrdered,
    defaultTitle: 'Vælg en mulighed',
    defaultChoices: ['Valgmulighed A', 'Valgmulighed B', 'Valgmulighed C'],
    defaultColSpan: 6,
  },
  {
    type: 'radiogroup',
    label: 'Enkeltvalg (Radio)',
    icon: CheckSquare,
    defaultTitle: 'Vælg én svarmulighed',
    defaultChoices: ['Ja', 'Nej', 'Ved ikke'],
    defaultColSpan: 12,
  },
  {
    type: 'checkbox',
    label: 'Flervalg (Afkrydsning)',
    icon: CheckSquare,
    defaultTitle: 'Vælg en eller flere muligheder',
    defaultChoices: ['Mulighed 1', 'Mulighed 2', 'Mulighed 3'],
    defaultColSpan: 12,
  },
  { type: 'boolean', label: 'Ja/Nej Kontakt (Boolean)', icon: ToggleLeft, defaultTitle: 'Bekræft venligst dette punkt', defaultColSpan: 6 },
  { type: 'comment', label: 'Lang Tekst / Beskrivelse', icon: MessageSquare, defaultTitle: 'Beskriv venligst sagen nærmere', defaultColSpan: 12 },
  { type: 'file', label: 'Filupload / Bilag', icon: FileUp, defaultTitle: 'Upload dokumentation (PDF / Billeder)', defaultColSpan: 12 },
];

export const FormBuilderTab: React.FC<FormBuilderTabProps> = ({
  template,
  onUpdateTemplate,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'visual' | 'json'>('visual');
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget>({ type: 'main', index: 0 });
  const [jsonText, setJsonText] = useState(JSON.stringify(template.surveyJson, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Collapsed state tracking (Default is true/collapsed for dynamic sections)
  // Record<panelName, isExplicitlyExpanded>
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState>(null);

  // Ensure template has at least one page
  const pages: SurveyPage[] = template.surveyJson?.pages?.length > 0
    ? template.surveyJson.pages
    : [{ name: 'page1', title: 'Hovedside', elements: [] }];

  const currentPage = pages[0];
  const elements = currentPage.elements || [];

  const createNewElementFromPalette = (paletteItem: typeof QUESTION_PALETTE[0]): SurveyElement => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const fieldName = `${paletteItem.type}_${randomSuffix}`;

    if (paletteItem.isPanel) {
      return {
        name: `dynamic_panel_${randomSuffix}`,
        type: 'panel',
        title: paletteItem.defaultTitle,
        description: 'Denne sektion styrer automatisk forgrening: Viser sand-felter når betingelsen er opfyldt, og falsk-felter når den ikke er.',
        isRequired: false,
        colSpan: 12,
        startWithNewLine: true,
        dynamicCondition: {
          sourceType: 'form_field',
          fieldName: elements.length > 0 ? elements[0].name : '',
          operator: 'equals',
          expectedValue: 'Ja',
        },
        visibleIf: elements.length > 0 ? `{${elements[0].name}} = 'Ja'` : '',
        badgeText: 'Betinget Forgrening',
        trueElements: [
          {
            name: `true_text_${randomSuffix}`,
            type: 'text',
            title: 'Ekstra oplysning (vises ved SAND)',
            isRequired: false,
            colSpan: 6,
            placeholder: 'Angiv detaljer her...',
          },
        ],
        falseElements: [
          {
            name: `false_info_${randomSuffix}`,
            type: 'text',
            title: 'Alternativ oplysning (vises ved FALSK)',
            isRequired: false,
            colSpan: 6,
            placeholder: 'Angiv alternativ her...',
          },
        ],
      };
    }

    return {
      name: fieldName,
      type: paletteItem.type,
      inputType: paletteItem.inputType,
      title: paletteItem.defaultTitle,
      isRequired: false,
      colSpan: paletteItem.defaultColSpan || 12,
      startWithNewLine: false,
      placeholder: paletteItem.type === 'text' || paletteItem.type === 'comment' ? 'Udfyld her...' : undefined,
      choices: paletteItem.defaultChoices,
    };
  };

  const handleUpdateTemplateElements = (newElements: SurveyElement[]) => {
    const updatedPages = pages.map((page, idx) =>
      idx === 0 ? { ...page, elements: newElements } : page
    );

    const updatedTemplate: FormTemplate = {
      ...template,
      surveyJson: {
        ...template.surveyJson,
        pages: updatedPages,
      },
    };

    onUpdateTemplate(updatedTemplate);
    setJsonText(JSON.stringify(updatedTemplate.surveyJson, null, 2));
  };

  const handleAddQuestion = (paletteItem: typeof QUESTION_PALETTE[0], insertIndex?: number) => {
    const newElement = createNewElementFromPalette(paletteItem);
    const targetIdx = typeof insertIndex === 'number' ? insertIndex : elements.length;
    const newElements = [...elements];
    newElements.splice(targetIdx, 0, newElement);

    handleUpdateTemplateElements(newElements);
    setSelectedTarget({ type: 'main', index: targetIdx });
  };

  const handleDeleteElement = (index: number) => {
    const newElements = elements.filter((_, i) => i !== index);
    handleUpdateTemplateElements(newElements);
    if (selectedTarget?.type === 'main' && selectedTarget.index === index) {
      setSelectedTarget(newElements.length > 0 ? { type: 'main', index: Math.max(0, index - 1) } : null);
    }
  };

  const handleMoveElement = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= elements.length) return;

    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[targetIdx];
    newElements[targetIdx] = temp;

    handleUpdateTemplateElements(newElements);
    setSelectedTarget({ type: 'main', index: targetIdx });
  };

  const handleUpdateElement = (index: number, updates: Partial<SurveyElement>) => {
    const newElements = elements.map((el, i) => (i === index ? { ...el, ...updates } : el));
    handleUpdateTemplateElements(newElements);
  };

  // Branch child elements operations (True / False zones inside dynamic panels)
  const handleAddChildToBranch = (
    panelIndex: number,
    branch: 'true' | 'false',
    paletteItem?: typeof QUESTION_PALETTE[0]
  ) => {
    const panel = elements[panelIndex];
    if (!panel || panel.type !== 'panel') return;

    const newItem: SurveyElement = paletteItem
      ? createNewElementFromPalette(paletteItem)
      : {
          name: `${branch}_field_${Math.floor(100 + Math.random() * 900)}`,
          type: 'text',
          title: branch === 'true' ? 'Nyt felt (vises ved SAND)' : 'Nyt felt (vises ved FALSK)',
          isRequired: false,
          colSpan: 6,
          placeholder: 'Udfyld information...',
        };

    const currentBranchList = branch === 'true'
      ? (panel.trueElements || panel.elements || [])
      : (panel.falseElements || []);

    const updatedBranchList = [...currentBranchList, newItem];

    const updatedPanel: SurveyElement = {
      ...panel,
      ...(branch === 'true'
        ? { trueElements: updatedBranchList, elements: updatedBranchList }
        : { falseElements: updatedBranchList }),
    };

    handleUpdateElement(panelIndex, updatedPanel);
    // Automatically expand panel when modifying it
    setExpandedPanels((prev) => ({ ...prev, [panel.name]: true }));
    setSelectedTarget({
      type: 'panel_child',
      panelIndex,
      branch,
      childIndex: updatedBranchList.length - 1,
    });
  };

  const handleDeleteBranchChild = (
    panelIndex: number,
    branch: 'true' | 'false',
    childIndex: number
  ) => {
    const panel = elements[panelIndex];
    if (!panel || panel.type !== 'panel') return;

    const currentList = branch === 'true'
      ? (panel.trueElements || panel.elements || [])
      : (panel.falseElements || []);

    const updatedList = currentList.filter((_, i) => i !== childIndex);

    if (branch === 'true') {
      handleUpdateElement(panelIndex, {
        trueElements: updatedList,
        elements: updatedList,
      });
    } else {
      handleUpdateElement(panelIndex, {
        falseElements: updatedList,
      });
    }

    if (
      selectedTarget?.type === 'panel_child' &&
      selectedTarget.panelIndex === panelIndex &&
      selectedTarget.branch === branch &&
      selectedTarget.childIndex === childIndex
    ) {
      setSelectedTarget({ type: 'main', index: panelIndex });
    }
  };

  const handleUpdateBranchChild = (
    panelIndex: number,
    branch: 'true' | 'false',
    childIndex: number,
    updates: Partial<SurveyElement>
  ) => {
    const panel = elements[panelIndex];
    if (!panel || panel.type !== 'panel') return;

    const currentList = branch === 'true'
      ? (panel.trueElements || panel.elements || [])
      : (panel.falseElements || []);

    const updatedList = currentList.map((item, idx) => (idx === childIndex ? { ...item, ...updates } : item));

    if (branch === 'true') {
      handleUpdateElement(panelIndex, {
        trueElements: updatedList,
        elements: updatedList,
      });
    } else {
      handleUpdateElement(panelIndex, {
        falseElements: updatedList,
      });
    }
  };

  const handleMoveBranchChild = (
    panelIndex: number,
    branch: 'true' | 'false',
    childIndex: number,
    direction: 'up' | 'down'
  ) => {
    const panel = elements[panelIndex];
    if (!panel || panel.type !== 'panel') return;

    const currentList = [
      ...(branch === 'true'
        ? (panel.trueElements || panel.elements || [])
        : (panel.falseElements || [])),
    ];

    const targetIdx = direction === 'up' ? childIndex - 1 : childIndex + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const temp = currentList[childIndex];
    currentList[childIndex] = currentList[targetIdx];
    currentList[targetIdx] = temp;

    if (branch === 'true') {
      handleUpdateElement(panelIndex, {
        trueElements: currentList,
        elements: currentList,
      });
    } else {
      handleUpdateElement(panelIndex, {
        falseElements: currentList,
      });
    }

    setSelectedTarget({
      type: 'panel_child',
      panelIndex,
      branch,
      childIndex: targetIdx,
    });
  };

  const handleSwitchBranchChild = (
    panelIndex: number,
    fromBranch: 'true' | 'false',
    childIndex: number
  ) => {
    const panel = elements[panelIndex];
    if (!panel || panel.type !== 'panel') return;

    const toBranch = fromBranch === 'true' ? 'false' : 'true';
    const sourceList = fromBranch === 'true'
      ? (panel.trueElements || panel.elements || [])
      : (panel.falseElements || []);
    const destList = toBranch === 'true'
      ? (panel.trueElements || panel.elements || [])
      : (panel.falseElements || []);

    const itemToMove = sourceList[childIndex];
    if (!itemToMove) return;

    const updatedSource = sourceList.filter((_, i) => i !== childIndex);
    const updatedDest = [...destList, itemToMove];

    if (fromBranch === 'true') {
      handleUpdateElement(panelIndex, {
        trueElements: updatedSource,
        elements: updatedSource,
        falseElements: updatedDest,
      });
    } else {
      handleUpdateElement(panelIndex, {
        falseElements: updatedSource,
        trueElements: updatedDest,
        elements: updatedDest,
      });
    }

    setSelectedTarget({
      type: 'panel_child',
      panelIndex,
      branch: toBranch,
      childIndex: updatedDest.length - 1,
    });
  };

  // Drag and drop event handlers
  const handleDragStartCard = (e: React.DragEvent, index: number) => {
    const payload: DragPayload = { type: 'reorder', index };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(payload);
  };

  const handleDragStartPalette = (e: React.DragEvent, paletteIndex: number) => {
    const payload: DragPayload = { type: 'palette', paletteIndex };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedItem(payload);
  };

  const handleDragStartPanelChild = (
    e: React.DragEvent,
    panelIndex: number,
    branch: 'true' | 'false',
    childIndex: number
  ) => {
    e.stopPropagation();
    const payload: DragPayload = {
      type: 'panel_child',
      panelIndex,
      branch,
      childIndex,
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(payload);
  };

  // Precise Slot-Based Drag Over and Drop calculation
  const handleDragOverCard = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    const targetSlot = isTopHalf ? index : index + 1;

    setDropTarget({ type: 'slot', slotIndex: targetSlot });
    e.dataTransfer.dropEffect = draggedItem?.type === 'palette' ? 'copy' : 'move';
  };

  const handleDragOverSlot = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ type: 'slot', slotIndex });
    e.dataTransfer.dropEffect = draggedItem?.type === 'palette' ? 'copy' : 'move';
  };

  const handleDragOverBranchZone = (e: React.DragEvent, panelIndex: number, branch: 'true' | 'false') => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ type: 'panel_branch', panelIndex, branch });
    e.dataTransfer.dropEffect = draggedItem?.type === 'palette' ? 'copy' : 'move';
  };

  const executeDropAtSlot = (targetSlot: number) => {
    if (!draggedItem) return;

    if (draggedItem.type === 'palette' && typeof draggedItem.paletteIndex === 'number') {
      const paletteItem = QUESTION_PALETTE[draggedItem.paletteIndex];
      if (paletteItem) {
        handleAddQuestion(paletteItem, targetSlot);
      }
    } else if (draggedItem.type === 'reorder' && typeof draggedItem.index === 'number') {
      const sourceIndex = draggedItem.index;
      // If dropped at current position: slot === sourceIndex (before it) or slot === sourceIndex + 1 (after it)
      if (targetSlot === sourceIndex || targetSlot === sourceIndex + 1) {
        setDraggedItem(null);
        setDropTarget(null);
        return;
      }

      const newElements = [...elements];
      const [moved] = newElements.splice(sourceIndex, 1);
      const destinationIndex = sourceIndex < targetSlot ? targetSlot - 1 : targetSlot;
      newElements.splice(destinationIndex, 0, moved);

      handleUpdateTemplateElements(newElements);
      setSelectedTarget({ type: 'main', index: destinationIndex });
    } else if (
      draggedItem.type === 'panel_child' &&
      typeof draggedItem.panelIndex === 'number' &&
      draggedItem.branch &&
      typeof draggedItem.childIndex === 'number'
    ) {
      // Move element out of panel back to main canvas slot
      const sourcePanel = elements[draggedItem.panelIndex];
      if (sourcePanel && sourcePanel.type === 'panel') {
        const sourceList = draggedItem.branch === 'true'
          ? (sourcePanel.trueElements || sourcePanel.elements || [])
          : (sourcePanel.falseElements || []);
        const childToExtract = sourceList[draggedItem.childIndex];
        if (childToExtract) {
          const updatedSourceList = sourceList.filter((_, i) => i !== draggedItem.childIndex);
          const newElements = [...elements];

          // Update panel in elements
          newElements[draggedItem.panelIndex] = {
            ...sourcePanel,
            ...(draggedItem.branch === 'true'
              ? { trueElements: updatedSourceList, elements: updatedSourceList }
              : { falseElements: updatedSourceList }),
          };

          // Insert extracted child into main elements list
          const finalSlot = targetSlot > draggedItem.panelIndex ? targetSlot : targetSlot;
          newElements.splice(finalSlot, 0, childToExtract);
          handleUpdateTemplateElements(newElements);
          setSelectedTarget({ type: 'main', index: finalSlot });
        }
      }
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDropOnCard = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    const targetSlot = isTopHalf ? targetIndex : targetIndex + 1;

    executeDropAtSlot(targetSlot);
  };

  const handleDropOnSlot = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    executeDropAtSlot(slotIndex);
  };

  const handleDropOnBranchZone = (e: React.DragEvent, panelIndex: number, branch: 'true' | 'false') => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;
    const panel = elements[panelIndex];
    if (!panel || panel.type !== 'panel') return;

    if (draggedItem.type === 'palette' && typeof draggedItem.paletteIndex === 'number') {
      const paletteItem = QUESTION_PALETTE[draggedItem.paletteIndex];
      if (paletteItem) {
        handleAddChildToBranch(panelIndex, branch, paletteItem);
      }
    } else if (draggedItem.type === 'reorder' && typeof draggedItem.index === 'number') {
      // Move an existing main canvas question into this panel's branch
      const sourceIdx = draggedItem.index;
      if (sourceIdx === panelIndex) return; // Cannot drop panel into itself

      const itemToMove = elements[sourceIdx];
      if (!itemToMove) return;

      const newElements = elements.filter((_, i) => i !== sourceIdx);
      const adjustedPanelIdx = sourceIdx < panelIndex ? panelIndex - 1 : panelIndex;
      const targetPanel = newElements[adjustedPanelIdx];

      if (targetPanel && targetPanel.type === 'panel') {
        const currentBranch = branch === 'true'
          ? (targetPanel.trueElements || targetPanel.elements || [])
          : (targetPanel.falseElements || []);
        const updatedBranch = [...currentBranch, itemToMove];

        newElements[adjustedPanelIdx] = {
          ...targetPanel,
          ...(branch === 'true'
            ? { trueElements: updatedBranch, elements: updatedBranch }
            : { falseElements: updatedBranch }),
        };

        handleUpdateTemplateElements(newElements);
        setExpandedPanels((prev) => ({ ...prev, [targetPanel.name]: true }));
        setSelectedTarget({
          type: 'panel_child',
          panelIndex: adjustedPanelIdx,
          branch,
          childIndex: updatedBranch.length - 1,
        });
      }
    } else if (
      draggedItem.type === 'panel_child' &&
      typeof draggedItem.panelIndex === 'number' &&
      draggedItem.branch &&
      typeof draggedItem.childIndex === 'number'
    ) {
      const sourcePanelIdx = draggedItem.panelIndex;
      const sourceBranch = draggedItem.branch;
      const sourceChildIdx = draggedItem.childIndex;

      if (sourcePanelIdx === panelIndex && sourceBranch === branch) {
        // Already in this branch
        setDraggedItem(null);
        setDropTarget(null);
        return;
      }

      const sourcePanel = elements[sourcePanelIdx];
      if (!sourcePanel || sourcePanel.type !== 'panel') return;

      const sourceList = sourceBranch === 'true'
        ? (sourcePanel.trueElements || sourcePanel.elements || [])
        : (sourcePanel.falseElements || []);
      const itemToMove = sourceList[sourceChildIdx];
      if (!itemToMove) return;

      const updatedSourceList = sourceList.filter((_, i) => i !== sourceChildIdx);
      const newElements = [...elements];

      if (sourcePanelIdx === panelIndex) {
        // Move between true and false branches within same panel
        const destList = branch === 'true'
          ? (sourcePanel.trueElements || sourcePanel.elements || [])
          : (sourcePanel.falseElements || []);
        const updatedDestList = [...destList, itemToMove];

        newElements[panelIndex] = {
          ...sourcePanel,
          ...(sourceBranch === 'true'
            ? { trueElements: updatedSourceList, elements: updatedSourceList, falseElements: updatedDestList }
            : { falseElements: updatedSourceList, trueElements: updatedDestList, elements: updatedDestList }),
        };
      } else {
        // Move across different panels
        newElements[sourcePanelIdx] = {
          ...sourcePanel,
          ...(sourceBranch === 'true'
            ? { trueElements: updatedSourceList, elements: updatedSourceList }
            : { falseElements: updatedSourceList }),
        };

        const destPanel = newElements[panelIndex];
        if (destPanel && destPanel.type === 'panel') {
          const destList = branch === 'true'
            ? (destPanel.trueElements || destPanel.elements || [])
            : (destPanel.falseElements || []);
          const updatedDestList = [...destList, itemToMove];

          newElements[panelIndex] = {
            ...destPanel,
            ...(branch === 'true'
              ? { trueElements: updatedDestList, elements: updatedDestList }
              : { falseElements: updatedDestList }),
          };
        }
      }

      handleUpdateTemplateElements(newElements);
      setExpandedPanels((prev) => ({ ...prev, [panel.name]: true }));
      setSelectedTarget({
        type: 'panel_child',
        panelIndex,
        branch,
        childIndex: (branch === 'true' ? (elements[panelIndex]?.trueElements || []) : (elements[panelIndex]?.falseElements || [])).length,
      });
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setJsonError(null);
      onUpdateTemplate({
        ...template,
        surveyJson: parsed,
      });
    } catch (err: any) {
      setJsonError(err.message || 'Ugyldigt JSON format');
    }
  };

  // Helper to sync structured dynamic condition with SurveyJS visibleIf
  const updateDynamicCondition = (
    index: number,
    condUpdate: Partial<DynamicConditionConfig>
  ) => {
    const el = elements[index];
    const currentCond: DynamicConditionConfig = el.dynamicCondition || {
      sourceType: 'form_field',
      fieldName: elements[0]?.name || '',
      operator: 'equals',
      expectedValue: '',
    };

    const nextCond = { ...currentCond, ...condUpdate };

    // Generate SurveyJS visibleIf string
    let generatedVisibleIf = '';
    if (nextCond.sourceType === 'system_info') {
      const sysKey = nextCond.systemVariable || 'mitId.authenticated';
      if (nextCond.operator === 'is_truthy') {
        generatedVisibleIf = `{system.${sysKey}} = true`;
      } else if (nextCond.operator === 'is_falsy') {
        generatedVisibleIf = `{system.${sysKey}} = false`;
      } else if (nextCond.operator === 'not_equals') {
        generatedVisibleIf = `{system.${sysKey}} != '${nextCond.expectedValue || ''}'`;
      } else {
        generatedVisibleIf = `{system.${sysKey}} = '${nextCond.expectedValue || ''}'`;
      }
    } else {
      const field = nextCond.fieldName || 'field';
      if (nextCond.operator === 'is_truthy') {
        generatedVisibleIf = `{${field}} notEmpty`;
      } else if (nextCond.operator === 'is_falsy') {
        generatedVisibleIf = `{${field}} empty`;
      } else if (nextCond.operator === 'not_equals') {
        generatedVisibleIf = `{${field}} != '${nextCond.expectedValue || ''}'`;
      } else if (nextCond.operator === 'greater_than') {
        generatedVisibleIf = `{${field}} > ${nextCond.expectedValue || 0}`;
      } else if (nextCond.operator === 'less_than') {
        generatedVisibleIf = `{${field}} < ${nextCond.expectedValue || 0}`;
      } else if (nextCond.operator === 'contains') {
        generatedVisibleIf = `{${field}} contains '${nextCond.expectedValue || ''}'`;
      } else {
        generatedVisibleIf = `{${field}} = '${nextCond.expectedValue || ''}'`;
      }
    }

    handleUpdateElement(index, {
      dynamicCondition: nextCond,
      visibleIf: generatedVisibleIf,
    });
  };

  // Helper to check if a panel should be displayed expanded
  // Default is collapsed UNLESS explicitly toggled or actively selected
  const isPanelExpanded = (panelName: string, isSelected: boolean) => {
    if (isSelected) return true;
    return !!expandedPanels[panelName];
  };

  const togglePanelExpansion = (panelName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedPanels((prev) => ({
      ...prev,
      [panelName]: !prev[panelName],
    }));
  };

  const expandAllPanels = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    elements.forEach((el) => {
      if (el.type === 'panel') {
        newState[el.name] = expand;
      }
    });
    setExpandedPanels(newState);
  };

  // Determine currently selected element in the inspector
  let activeSelectedElement: SurveyElement | null = null;
  let isChildSelected = false;

  if (selectedTarget?.type === 'main' && elements[selectedTarget.index]) {
    activeSelectedElement = elements[selectedTarget.index];
  } else if (selectedTarget?.type === 'panel_child') {
    const parentPanel = elements[selectedTarget.panelIndex];
    if (parentPanel && parentPanel.type === 'panel') {
      const branchList = selectedTarget.branch === 'true'
        ? (parentPanel.trueElements || parentPanel.elements || [])
        : (parentPanel.falseElements || []);
      activeSelectedElement = branchList[selectedTarget.childIndex] || null;
      isChildSelected = true;
    }
  }

  const hasAnyPanels = elements.some((el) => el.type === 'panel');

  return (
    <div className="space-y-6">
      {/* Top Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>AutoForma Drag & Drop Form Builder</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {elements.length} felter & sektioner
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Træk og slip felter direkte på lærredet, vælg 12-kolonners bredde (4/12, 6/12, 8/12, 12/12) og konfigurer True/False forgreninger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hasAnyPanels && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => expandAllPanels(true)}
                className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1"
                title="Fold alle dynamiske sektioner ud"
              >
                <UnfoldVertical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fold alle ud</span>
              </button>
              <button
                type="button"
                onClick={() => expandAllPanels(false)}
                className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1"
                title="Fold alle dynamiske sektioner sammen"
              >
                <FoldVertical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fold sammen</span>
              </button>
            </div>
          )}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveViewMode('visual')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'visual'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visuel Builder</span>
            </button>
            <button
              onClick={() => setActiveViewMode('json')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'json'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON Schema</span>
            </button>
          </div>
        </div>
      </div>

      {activeViewMode === 'json' ? (
        /* Raw JSON Schema Editor */
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-600" />
                <span>SurveyJS JSON Form Definition</span>
              </h3>
              <p className="text-xs text-slate-500">
                Rediger JSON definitionen direkte. Ændringer synkroniseres automatisk med den visuelle editor.
              </p>
            </div>
            {jsonError && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {jsonError}
              </span>
            )}
          </div>

          <textarea
            value={jsonText}
            onChange={handleJsonChange}
            rows={22}
            className="w-full font-mono text-xs p-4 rounded-xl border border-slate-300 bg-slate-900 text-sky-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            spellCheck={false}
          />
        </div>
      ) : (
        /* Visual Drag & Drop Builder Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Component Palette */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 sticky top-24 max-h-[85vh] overflow-y-auto">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Felt-Værktøjskasse</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Træk et element til lærredet eller ind i en sektions True/False zone.
              </p>
            </div>

            <div className="space-y-1.5">
              {QUESTION_PALETTE.map((item, pIdx) => {
                const IconComponent = item.icon;
                const isPanel = item.isPanel;

                return (
                  <div
                    key={item.label}
                    draggable={true}
                    onDragStart={(e) => handleDragStartPalette(e, pIdx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleAddQuestion(item)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left text-xs font-semibold cursor-grab active:cursor-grabbing ${
                      isPanel
                        ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 hover:border-indigo-400 text-indigo-950 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-sky-300 hover:shadow-2xs text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          isPanel ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-sky-600 shadow-2xs'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-800">{item.label}</span>
                        {isPanel ? (
                          <span className="block text-[9px] text-indigo-700 font-bold uppercase tracking-wider">
                            True / False forgrening
                          </span>
                        ) : item.defaultColSpan && item.defaultColSpan < 12 ? (
                          <span className="block text-[9px] text-sky-600 font-mono">
                            {item.defaultColSpan}/12 bredde
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Interactive Canvas */}
          <div className="lg:col-span-5 space-y-3">
            {elements.length === 0 ? (
              <div
                onDragOver={(e) => handleDragOverSlot(e, 0)}
                onDrop={(e) => handleDropOnSlot(e, 0)}
                className="bg-white p-10 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/30 text-center space-y-3 cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Lærredet er tomt</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Træk et felt herover eller klik på et værktøj i venstre side for at tilføje.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Initial Drop Slot Before First Card */}
                {draggedItem && (
                  <div
                    onDragOver={(e) => handleDragOverSlot(e, 0)}
                    onDrop={(e) => handleDropOnSlot(e, 0)}
                    className={`transition-all duration-150 rounded-lg ${
                      dropTarget?.type === 'slot' && dropTarget.slotIndex === 0
                        ? 'h-6 bg-sky-500/20 border-2 border-dashed border-sky-500 flex items-center justify-center text-[10px] font-bold text-sky-700'
                        : 'h-2 hover:h-4 bg-transparent hover:bg-sky-100'
                    }`}
                  >
                    {dropTarget?.type === 'slot' && dropTarget.slotIndex === 0 && 'Placer øverst'}
                  </div>
                )}

                {elements.map((element, idx) => {
                  const isSelected = selectedTarget?.type === 'main' && selectedTarget.index === idx;
                  const isPanel = element.type === 'panel';
                  const isBeingDragged = draggedItem?.type === 'reorder' && draggedItem.index === idx;

                  const trueList = element.trueElements || element.elements || [];
                  const falseList = element.falseElements || [];
                  const totalSubCount = trueList.length + falseList.length;

                  // Check if dynamic section is expanded (default is collapsed)
                  const isExpanded = isPanelExpanded(element.name, isSelected);

                  const colSpan = element.colSpan || 12;
                  const colLabel = `${colSpan}/12`;

                  return (
                    <React.Fragment key={element.name || idx}>
                      <div
                        id={`builder-element-${element.name}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStartCard(e, idx)}
                        onDragOver={(e) => handleDragOverCard(e, idx)}
                        onDrop={(e) => handleDropOnCard(e, idx)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTarget({ type: 'main', index: idx })}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white relative ${
                          isBeingDragged ? 'opacity-30 scale-[0.98] border-dashed border-sky-400' : ''
                        } ${
                          isPanel
                            ? isSelected
                              ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-md'
                              : 'border-indigo-200 hover:border-indigo-300 bg-indigo-50/15 shadow-xs'
                            : isSelected
                            ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {/* Grip Handle */}
                            <div
                              className="mt-1 text-slate-400 hover:text-slate-800 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 shrink-0"
                              title="Træk for at flytte position på lærredet"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Badges & Meta row */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                                  isPanel
                                    ? 'text-indigo-800 bg-indigo-100 border-indigo-200'
                                    : 'text-sky-700 bg-sky-50 border-sky-200'
                                }`}>
                                  {element.name}
                                </span>

                                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                  {element.type} {element.inputType ? `(${element.inputType})` : ''}
                                </span>

                                {/* Grid Width Badge */}
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                                    colSpan === 12
                                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                                      : 'bg-sky-100 text-sky-800 border-sky-200'
                                  }`}
                                  title={`Dette felt optager ${colLabel} af sidens bredde`}
                                >
                                  <Columns className="w-2.5 h-2.5" />
                                  <span>{colLabel}</span>
                                  {element.startWithNewLine && (
                                    <span className="text-[9px] bg-sky-200 text-sky-900 px-1 rounded font-bold" title="Tvinger linjeskift">
                                      Ny linje
                                    </span>
                                  )}
                                </span>

                                {element.isRequired && (
                                  <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                                    Påkrævet
                                  </span>
                                )}

                                {isPanel && (
                                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                                    <Zap className="w-2.5 h-2.5" />
                                    <span>Betinget Sektion</span>
                                  </span>
                                )}
                              </div>

                              {/* Title & Description */}
                              <div className="flex items-center justify-between mt-1.5">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {element.title || '(Uden titel)'}
                                </h4>

                                {/* Collapse/Expand toggle button for panel */}
                                {isPanel && (
                                  <button
                                    type="button"
                                    onClick={(e) => togglePanelExpansion(element.name, e)}
                                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
                                  >
                                    <span>{isExpanded ? 'Fold sammen' : `Fold ud (${totalSubCount})`}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {element.description && (
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{element.description}</p>
                              )}

                              {/* DYNAMIC CONDITIONAL SECTION: COLLAPSED PREVIEW STATE */}
                              {isPanel && !isExpanded && (
                                <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <Sliders className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span className="font-mono text-[11px] text-indigo-900 font-semibold truncate">
                                      {element.visibleIf || '{' + (element.dynamicCondition?.fieldName || 'felt') + "} = 'Ja'"}
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                                      ✓ Sand: {trueList.length}
                                    </span>
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                                      ✗ Falsk: {falseList.length}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* DYNAMIC CONDITIONAL SECTION: FULL EXPANDED VIEW */}
                              {isPanel && isExpanded && (
                                <div className="mt-3.5 space-y-3">
                                  {/* Condition banner info */}
                                  <div className="p-2 rounded-lg bg-white border border-indigo-100 text-[11px] text-slate-600 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                                      <span className="font-semibold text-slate-700">Betingelse:</span>
                                      <span className="font-mono text-indigo-700 font-bold">
                                        {element.visibleIf || '{' + (element.dynamicCondition?.fieldName || 'felt') + "} = 'Ja'"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 italic">
                                      (Kun de aktive felter vises for borgeren)
                                    </span>
                                  </div>

                                  {/* TRUE DROP ZONE (Grøn nuance) */}
                                  <div
                                    onDragOver={(e) => handleDragOverBranchZone(e, idx, 'true')}
                                    onDrop={(e) => handleDropOnBranchZone(e, idx, 'true')}
                                    className={`p-3 rounded-xl border-2 transition-all ${
                                      dropTarget?.type === 'panel_branch' && dropTarget.panelIndex === idx && dropTarget.branch === 'true'
                                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                                        : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                                      <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>HVIS SAND (TRUE) — Vis disse felter ({trueList.length}):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddChildToBranch(idx, 'true');
                                        }}
                                        className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded shadow-2xs flex items-center gap-1"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        <span>+ Tilføj felt</span>
                                      </button>
                                    </div>

                                    {trueList.length > 0 ? (
                                      <div className="space-y-1.5 mt-2">
                                        {trueList.map((child, cIdx) => {
                                          const isChildActive = selectedTarget?.type === 'panel_child' &&
                                            selectedTarget.panelIndex === idx &&
                                            selectedTarget.branch === 'true' &&
                                            selectedTarget.childIndex === cIdx;

                                          const childColSpan = child.colSpan || 12;

                                          return (
                                            <div
                                              key={cIdx}
                                              draggable={true}
                                              onDragStart={(e) => handleDragStartPanelChild(e, idx, 'true', cIdx)}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTarget({
                                                  type: 'panel_child',
                                                  panelIndex: idx,
                                                  branch: 'true',
                                                  childIndex: cIdx,
                                                });
                                              }}
                                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                                isChildActive
                                                  ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                                                  : 'bg-white/90 border-emerald-100 hover:border-emerald-300'
                                              }`}
                                            >
                                              <div className="flex items-center space-x-2 min-w-0">
                                                <GripVertical className="w-3 h-3 text-emerald-400 cursor-grab shrink-0" />
                                                <span className="font-semibold text-slate-800 truncate">{child.title}</span>
                                                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                                                  {child.name}
                                                </span>
                                                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 rounded shrink-0">
                                                  {childColSpan}/12
                                                </span>
                                                {child.isRequired && (
                                                  <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1 rounded">
                                                    *
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                  type="button"
                                                  onClick={() => handleMoveBranchChild(idx, 'true', cIdx, 'up')}
                                                  disabled={cIdx === 0}
                                                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                                  title="Flyt op"
                                                >
                                                  <ArrowUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleMoveBranchChild(idx, 'true', cIdx, 'down')}
                                                  disabled={cIdx === trueList.length - 1}
                                                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                                  title="Flyt ned"
                                                >
                                                  <ArrowDown className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleSwitchBranchChild(idx, 'true', cIdx)}
                                                  className="p-0.5 text-amber-600 hover:text-amber-800"
                                                  title="Flyt til FALSK gren"
                                                >
                                                  <ArrowRightLeft className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteBranchChild(idx, 'true', cIdx)}
                                                  className="p-0.5 text-slate-400 hover:text-rose-600"
                                                  title="Slet underfelt"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="mt-2 py-3 px-2 rounded-lg border border-dashed border-emerald-300 text-center bg-white/50 text-[11px] text-emerald-800/70">
                                        Træk et felt hertil eller klik "+ Tilføj felt" for SAND-tilstand.
                                      </div>
                                    )}
                                  </div>

                                  {/* FALSE DROP ZONE (Orange/Rav nuance) */}
                                  <div
                                    onDragOver={(e) => handleDragOverBranchZone(e, idx, 'false')}
                                    onDrop={(e) => handleDropOnBranchZone(e, idx, 'false')}
                                    className={`p-3 rounded-xl border-2 transition-all ${
                                      dropTarget?.type === 'panel_branch' && dropTarget.panelIndex === idx && dropTarget.branch === 'false'
                                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                                        : 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                        <span>HVIS FALSK (FALSE) — Vis disse felter ({falseList.length}):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddChildToBranch(idx, 'false');
                                        }}
                                        className="text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded shadow-2xs flex items-center gap-1"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        <span>+ Tilføj felt</span>
                                      </button>
                                    </div>

                                    {falseList.length > 0 ? (
                                      <div className="space-y-1.5 mt-2">
                                        {falseList.map((child, cIdx) => {
                                          const isChildActive = selectedTarget?.type === 'panel_child' &&
                                            selectedTarget.panelIndex === idx &&
                                            selectedTarget.branch === 'false' &&
                                            selectedTarget.childIndex === cIdx;

                                          const childColSpan = child.colSpan || 12;

                                          return (
                                            <div
                                              key={cIdx}
                                              draggable={true}
                                              onDragStart={(e) => handleDragStartPanelChild(e, idx, 'false', cIdx)}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTarget({
                                                  type: 'panel_child',
                                                  panelIndex: idx,
                                                  branch: 'false',
                                                  childIndex: cIdx,
                                                });
                                              }}
                                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                                isChildActive
                                                  ? 'bg-white border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                                                  : 'bg-white/90 border-amber-100 hover:border-amber-300'
                                              }`}
                                            >
                                              <div className="flex items-center space-x-2 min-w-0">
                                                <GripVertical className="w-3 h-3 text-amber-400 cursor-grab shrink-0" />
                                                <span className="font-semibold text-slate-800 truncate">{child.title}</span>
                                                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                                                  {child.name}
                                                </span>
                                                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 rounded shrink-0">
                                                  {childColSpan}/12
                                                </span>
                                                {child.isRequired && (
                                                  <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1 rounded">
                                                    *
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                  type="button"
                                                  onClick={() => handleMoveBranchChild(idx, 'false', cIdx, 'up')}
                                                  disabled={cIdx === 0}
                                                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                                  title="Flyt op"
                                                >
                                                  <ArrowUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleMoveBranchChild(idx, 'false', cIdx, 'down')}
                                                  disabled={cIdx === falseList.length - 1}
                                                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                                  title="Flyt ned"
                                                >
                                                  <ArrowDown className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleSwitchBranchChild(idx, 'false', cIdx)}
                                                  className="p-0.5 text-emerald-600 hover:text-emerald-800"
                                                  title="Flyt til SAND gren"
                                                >
                                                  <ArrowRightLeft className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteBranchChild(idx, 'false', cIdx)}
                                                  className="p-0.5 text-slate-400 hover:text-rose-600"
                                                  title="Slet underfelt"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="mt-2 py-3 px-2 rounded-lg border border-dashed border-amber-300 text-center bg-white/50 text-[11px] text-amber-800/70">
                                        Træk et felt hertil eller klik "+ Tilføj felt" for FALSK-tilstand.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Choices preview if choice question */}
                              {element.choices && !isPanel && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {element.choices.map((c, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md"
                                    >
                                      {typeof c === 'object' ? c.text : c}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order & Delete Controls for main items */}
                          <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleMoveElement(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded"
                              title="Flyt op"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveElement(idx, 'down')}
                              disabled={idx === elements.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded"
                              title="Flyt ned"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteElement(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Slet element"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Drop Slot After Each Card */}
                      {draggedItem && (
                        <div
                          onDragOver={(e) => handleDragOverSlot(e, idx + 1)}
                          onDrop={(e) => handleDropOnSlot(e, idx + 1)}
                          className={`transition-all duration-150 rounded-lg ${
                            dropTarget?.type === 'slot' && dropTarget.slotIndex === idx + 1
                              ? 'h-6 bg-sky-500/20 border-2 border-dashed border-sky-500 flex items-center justify-center text-[10px] font-bold text-sky-700'
                              : 'h-2 hover:h-4 bg-transparent hover:bg-sky-100'
                          }`}
                        >
                          {dropTarget?.type === 'slot' && dropTarget.slotIndex === idx + 1 && `Placer her (position ${idx + 2})`}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Properties & Dynamic Logic Inspector */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 sticky top-24 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-sky-600" />
                <span>Egenskaber & Logik</span>
              </h3>
              {activeSelectedElement && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isChildSelected
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : 'text-sky-700 bg-sky-50 border border-sky-200'
                }`}>
                  {activeSelectedElement.name}
                </span>
              )}
            </div>

            {activeSelectedElement ? (
              <div className="space-y-4">
                {isChildSelected && selectedTarget?.type === 'panel_child' && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Underfelt i:
                      </span>
                      <span className="font-bold text-slate-800">
                        {selectedTarget.branch === 'true' ? '✓ Sand-gren (True)' : '✕ Falsk-gren (False)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTarget({ type: 'main', index: selectedTarget.panelIndex })}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline"
                    >
                      Gå til sektion
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {activeSelectedElement.type === 'panel' ? 'Sektionens Titel' : 'Spørgsmålets Tekst / Titel'}
                  </label>
                  <input
                    type="text"
                    value={activeSelectedElement.title || ''}
                    onChange={(e) => {
                      if (selectedTarget?.type === 'main') {
                        handleUpdateElement(selectedTarget.index, { title: e.target.value });
                      } else if (selectedTarget?.type === 'panel_child') {
                        handleUpdateBranchChild(
                          selectedTarget.panelIndex,
                          selectedTarget.branch,
                          selectedTarget.childIndex,
                          { title: e.target.value }
                        );
                      }
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Felt-identifikator (Question Name)</span>
                    <span className="text-[10px] text-slate-400">Teknisk ID</span>
                  </label>
                  <input
                    type="text"
                    value={activeSelectedElement.name || ''}
                    onChange={(e) => {
                      const cleanName = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                      if (selectedTarget?.type === 'main') {
                        handleUpdateElement(selectedTarget.index, { name: cleanName });
                      } else if (selectedTarget?.type === 'panel_child') {
                        handleUpdateBranchChild(
                          selectedTarget.panelIndex,
                          selectedTarget.branch,
                          selectedTarget.childIndex,
                          { name: cleanName }
                        );
                      }
                    }}
                    className="w-full text-xs font-mono font-bold text-sky-800 bg-sky-50/50 border border-sky-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Referer til dette felt i workflow og skabeloner via <code className="text-sky-700 font-mono">{'{{' + (activeSelectedElement.name || 'field') + '}}'}</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hjælpetekst / Beskrivelse
                  </label>
                  <input
                    type="text"
                    placeholder="Valgfri uddybende vejledning..."
                    value={activeSelectedElement.description || ''}
                    onChange={(e) => {
                      if (selectedTarget?.type === 'main') {
                        handleUpdateElement(selectedTarget.index, { description: e.target.value });
                      } else if (selectedTarget?.type === 'panel_child') {
                        handleUpdateBranchChild(
                          selectedTarget.panelIndex,
                          selectedTarget.branch,
                          selectedTarget.childIndex,
                          { description: e.target.value }
                        );
                      }
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                {/* 12-COLUMN GRID WIDTH & LAYOUT SETTINGS */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Columns className="w-3.5 h-3.5 text-sky-600" />
                      <span>Feltbredde (12-kolonners Grid)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                      {(activeSelectedElement.colSpan || 12)}/12 bredde
                    </span>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {[
                      { span: 4, label: '4/12 (33%)' },
                      { span: 6, label: '6/12 (50%)' },
                      { span: 8, label: '8/12 (66%)' },
                      { span: 12, label: '12/12 (Fuld)' },
                    ].map(({ span, label }) => {
                      const isCurrent = (activeSelectedElement.colSpan || 12) === span;
                      return (
                        <button
                          key={span}
                          type="button"
                          onClick={() => {
                            if (selectedTarget?.type === 'main') {
                              handleUpdateElement(selectedTarget.index, { colSpan: span });
                            } else if (selectedTarget?.type === 'panel_child') {
                              handleUpdateBranchChild(
                                selectedTarget.panelIndex,
                                selectedTarget.branch,
                                selectedTarget.childIndex,
                                { colSpan: span }
                              );
                            }
                          }}
                          className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] border transition-all ${
                            isCurrent
                              ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive 12-Column Bar */}
                  <div className="space-y-1">
                    <div className="flex gap-0.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                      {Array.from({ length: 12 }).map((_, colIdx) => {
                        const activeSpan = activeSelectedElement.colSpan || 12;
                        const isFilled = colIdx < activeSpan;
                        return (
                          <div
                            key={colIdx}
                            onClick={() => {
                              const newSpan = colIdx + 1;
                              if (selectedTarget?.type === 'main') {
                                handleUpdateElement(selectedTarget.index, { colSpan: newSpan });
                              } else if (selectedTarget?.type === 'panel_child') {
                                handleUpdateBranchChild(
                                  selectedTarget.panelIndex,
                                  selectedTarget.branch,
                                  selectedTarget.childIndex,
                                  { colSpan: newSpan }
                                );
                              }
                            }}
                            className={`h-4 flex-1 rounded-xs cursor-pointer transition-all ${
                              isFilled ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-200 hover:bg-slate-300'
                            }`}
                            title={`Sæt bredde til ${colIdx + 1}/12`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Klik på kolonnesegmenterne for præcis breddejustering (1 til 12).
                    </p>
                  </div>

                  {/* Checkbox: Force New Line */}
                  <div className="flex items-start space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="chk-new-line"
                      checked={!!activeSelectedElement.startWithNewLine}
                      onChange={(e) => {
                        if (selectedTarget?.type === 'main') {
                          handleUpdateElement(selectedTarget.index, { startWithNewLine: e.target.checked });
                        } else if (selectedTarget?.type === 'panel_child') {
                          handleUpdateBranchChild(
                            selectedTarget.panelIndex,
                            selectedTarget.branch,
                            selectedTarget.childIndex,
                            { startWithNewLine: e.target.checked }
                          );
                        }
                      }}
                      className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <div>
                      <label htmlFor="chk-new-line" className="text-xs font-bold text-slate-800 cursor-pointer block">
                        Start på ny linje (Tving linjeskift)
                      </label>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Hvis fravalgt, placeres felter automatisk ved siden af hinanden hvis der er plads i 12-kolonners griddet (f.eks. to 6/12 felter eller tre 4/12 felter).
                      </p>
                    </div>
                  </div>
                </div>

                {activeSelectedElement.type !== 'panel' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pladsholder (Placeholder)
                    </label>
                    <input
                      type="text"
                      placeholder="F.eks. Skriv her..."
                      value={activeSelectedElement.placeholder || ''}
                      onChange={(e) => {
                        if (selectedTarget?.type === 'main') {
                          handleUpdateElement(selectedTarget.index, { placeholder: e.target.value });
                        } else if (selectedTarget?.type === 'panel_child') {
                          handleUpdateBranchChild(
                            selectedTarget.panelIndex,
                            selectedTarget.branch,
                            selectedTarget.childIndex,
                            { placeholder: e.target.value }
                          );
                        }
                      }}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                )}

                {activeSelectedElement.type !== 'panel' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="chk-required"
                      checked={!!activeSelectedElement.isRequired}
                      onChange={(e) => {
                        if (selectedTarget?.type === 'main') {
                          handleUpdateElement(selectedTarget.index, { isRequired: e.target.checked });
                        } else if (selectedTarget?.type === 'panel_child') {
                          handleUpdateBranchChild(
                            selectedTarget.panelIndex,
                            selectedTarget.branch,
                            selectedTarget.childIndex,
                            { isRequired: e.target.checked }
                          );
                        }
                      }}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <label htmlFor="chk-required" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Obligatorisk felt (Is Required)
                    </label>
                  </div>
                )}

                {/* Choices editor if dropdown/radio/checkbox */}
                {(activeSelectedElement.type === 'dropdown' ||
                  activeSelectedElement.type === 'radiogroup' ||
                  activeSelectedElement.type === 'checkbox') && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Svarmuligheder (Choices):</label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentChoices = activeSelectedElement?.choices || [];
                          const newChoice = `Mulighed ${currentChoices.length + 1}`;
                          const updated = [...currentChoices, newChoice];
                          if (selectedTarget?.type === 'main') {
                            handleUpdateElement(selectedTarget.index, { choices: updated });
                          } else if (selectedTarget?.type === 'panel_child') {
                            handleUpdateBranchChild(
                              selectedTarget.panelIndex,
                              selectedTarget.branch,
                              selectedTarget.childIndex,
                              { choices: updated }
                            );
                          }
                        }}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-800"
                      >
                        + Tilføj valg
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {(activeSelectedElement.choices || []).map((choice, cIdx) => {
                        const choiceText = typeof choice === 'object' ? choice.text : choice;
                        return (
                          <div key={cIdx} className="flex items-center space-x-1.5">
                            <input
                              type="text"
                              value={choiceText}
                              onChange={(e) => {
                                const currentChoices = [...(activeSelectedElement?.choices || [])];
                                currentChoices[cIdx] = e.target.value;
                                if (selectedTarget?.type === 'main') {
                                  handleUpdateElement(selectedTarget.index, { choices: currentChoices });
                                } else if (selectedTarget?.type === 'panel_child') {
                                  handleUpdateBranchChild(
                                    selectedTarget.panelIndex,
                                    selectedTarget.branch,
                                    selectedTarget.childIndex,
                                    { choices: currentChoices }
                                  );
                                }
                              }}
                              className="flex-1 text-xs border border-slate-200 rounded px-2 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentChoices = (activeSelectedElement?.choices || []).filter((_, i) => i !== cIdx);
                                if (selectedTarget?.type === 'main') {
                                  handleUpdateElement(selectedTarget.index, { choices: currentChoices });
                                } else if (selectedTarget?.type === 'panel_child') {
                                  handleUpdateBranchChild(
                                    selectedTarget.panelIndex,
                                    selectedTarget.branch,
                                    selectedTarget.childIndex,
                                    { choices: currentChoices }
                                  );
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CONDITIONAL LOGIC BUILDER (Available on Panel or Main elements) */}
                {selectedTarget?.type === 'main' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Betingelse for Forgrening</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Live forgrening</span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Når denne betingelse er sand, vises felterne i <strong className="text-emerald-700">SAND-området</strong>. Når den er falsk, vises felterne i <strong className="text-amber-700">FALSK-området</strong>.
                    </p>

                    {/* Condition Source Selector */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() =>
                          updateDynamicCondition(selectedTarget.index, {
                            sourceType: 'form_field',
                            fieldName: elements.find((e, i) => i !== selectedTarget.index)?.name || '',
                          })
                        }
                        className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                          (activeSelectedElement.dynamicCondition?.sourceType || 'form_field') === 'form_field'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Formularfelt
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateDynamicCondition(selectedTarget.index, {
                            sourceType: 'system_info',
                            systemVariable: 'mitId.authLevel',
                          })
                        }
                        className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                          activeSelectedElement.dynamicCondition?.sourceType === 'system_info'
                            ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        System / MitID
                      </button>
                    </div>

                    {/* Form Field Source Details */}
                    {(activeSelectedElement.dynamicCondition?.sourceType || 'form_field') === 'form_field' ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Vælg felt at evaluere:
                          </label>
                          <select
                            value={activeSelectedElement.dynamicCondition?.fieldName || ''}
                            onChange={(e) =>
                              updateDynamicCondition(selectedTarget.index, { fieldName: e.target.value })
                            }
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-medium"
                          >
                            <option value="">-- Vælg formularfelt --</option>
                            {elements
                              .filter((_, i) => i !== selectedTarget.index)
                              .map((el) => (
                                <option key={el.name} value={el.name}>
                                  {el.title} ({el.name})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      /* System Variable Source Details */
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Vælg System- / MitID-parameter:
                          </label>
                          <select
                            value={activeSelectedElement.dynamicCondition?.systemVariable || 'mitId.authenticated'}
                            onChange={(e) =>
                              updateDynamicCondition(selectedTarget.index, {
                                systemVariable: e.target.value as SystemVariableKey,
                              })
                            }
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-medium"
                          >
                            <option value="mitId.authenticated">MitID: Logget Ind (Sandt / Falsk)</option>
                            <option value="mitId.authLevel">MitID: Sikringsniveau (Substantial / High)</option>
                            <option value="mitId.cpr">MitID: Verificeret CPR-nummer</option>
                            <option value="mitId.city">MitID: Bopælskommune / By</option>
                            <option value="system.currentYear">System: Nuværende Årstal</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Operator & Expected Value */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Operator:
                        </label>
                        <select
                          value={activeSelectedElement.dynamicCondition?.operator || 'equals'}
                          onChange={(e) =>
                            updateDynamicCondition(selectedTarget.index, {
                              operator: e.target.value as any,
                            })
                          }
                          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        >
                          <option value="equals">Lig med (=)</option>
                          <option value="not_equals">Ikke lig med (!=)</option>
                          <option value="contains">Indeholder</option>
                          <option value="greater_than">Større end (&gt;)</option>
                          <option value="less_than">Mindre end (&lt;)</option>
                          <option value="is_truthy">Er sat / Sandt</option>
                          <option value="is_falsy">Er tom / Falsk</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Forventet Værdi:
                        </label>
                        <input
                          type="text"
                          placeholder="F.eks. Ja, Substantial..."
                          value={activeSelectedElement.dynamicCondition?.expectedValue ?? ''}
                          onChange={(e) =>
                            updateDynamicCondition(selectedTarget.index, { expectedValue: e.target.value })
                          }
                          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    </div>

                    {/* VisibleIf raw expression preview */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-0.5">
                        SurveyJS VisibleIf udtryk:
                      </label>
                      <input
                        type="text"
                        value={activeSelectedElement.visibleIf || ''}
                        onChange={(e) =>
                          handleUpdateElement(selectedTarget.index, { visibleIf: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Vælg et element på lærredet for at redigere dets egenskaber.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

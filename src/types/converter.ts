import { SUPPORTED_FLOW, SUPPORTED_PROCESS } from '../lib/converter/helper/constants';
import { ProcessMetadataValue } from './metadata/processMetadataValue';
import { Variable, Decision, ActionCall } from './metadata/flow';
import { RecordUpdate, RecordCreate, RecordLookup } from './metadata/flowRecordAction';

export interface IteratableFlow {
    processType: string;
    label: string;
    description: string;
    startElementReference: string;
    variables: Array<Variable>;
    processMetadataValues: Array<ProcessMetadataValue>;
    formulas: any;
    decisions: Array<Decision>;
    actionCalls?: Array<ActionCall>;
    recordUpdates?: Array<RecordUpdate>;
    recordCreates?: Array<RecordCreate>;
    recordLookups?: Array<RecordLookup>;
    waits: any;
    start?: any;
}

export interface ReadableProcess {
    processType: string;
    name: string;
    label: string;
    description?: string;
    triggerType?: string; // only in trigger-based process
    objectType: string;
    eventType?: string; // only in platform event process
    eventMatchingConditions?: Array<ReadableCondition>; // only in platform event process
    actionGroups: Array<ReadableActionGroup>;
}

export interface ReadableFlow {
    processType: string;
    name: string;
    label: string;
    description?: string;
    start: ReadableStart;
    elements?: Array<ReadableFlowElement>;
}

export interface ReadableFlowElement {
    name: string;
    label: string;
    description?: string;
    type: string;
    element: any;
}

export interface ReadableStart {
    triggerType: string;
    recordTriggerType?: string;
    object?: string;
    schedule?: {
        startDate: string;
        startTime: string;
        frequency: string;
    };
}

export interface ReadableAssignment {
    assignments: Array<ReadableAssignmentItem>;
}

export interface ReadableAssignmentItem {
    reference: string;
    operator: string;
    value: string;
}

export interface ReadableActionGroup {
    decision: ReadableDecision;
    actions?: Array<ReadableActionItem>;
    scheduledActionSections?: Array<ReadableScheduledActionSection>;
    evaluatesNext?: boolean;
}

export interface ReadableDecision {
    label: string;
    criteria: string;
    conditionLogic: string;
    conditions: Array<ReadableCondition>;
    formulaExpression?: string;
}

export interface ReadableCondition {
    field: string;
    operator: string;
    type: string;
    value: string;
}

export interface ReadableActionItem {
    label: string;
    type: string;
    details?: Array<any>;
    conditions?: Array<ReadableActionItemParameter>;
    params?: Array<ReadableActionItemParameter>;
}

export interface ReadableActionItemParameter {
    field: string;
    type: string;
    value: string;
}

export interface ReadableScheduledActionSection {
    summary: ReadableWaitEventSummary;
    actions?: Array<ReadableActionItem>;
}

export interface ReadableWaitEventSummary {
    offset: number;
    unit: string;
    isAfter: boolean;
    field?: string;
}

export function implementsReadableFlow(arg: any): arg is ReadableFlow {
    return SUPPORTED_FLOW.includes(arg.processType);
}

export function implementsReadableProcess(arg: any): arg is ReadableProcess {
    return SUPPORTED_PROCESS.includes(arg.processType);
}

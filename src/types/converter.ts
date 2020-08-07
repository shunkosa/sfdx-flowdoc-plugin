import { SUPPORTED_FLOW, SUPPORTED_PROCESS } from '../lib/converter/helper/constants';
import { ProcessMetadataValue } from './metadata/processMetadataValue';
import { Variable, Decision, ActionCall } from './metadata/flow';
import { RecordUpdate, RecordCreate, RecordLookup } from './metadata/flowRecordAction';

export interface IteratableFlow {
    processType: string;
    label: string;
    description: string;
    startElementReference?: string;
    variables: Array<Variable>;
    processMetadataValues: Array<ProcessMetadataValue>;
    formulas: any;
    decisions: Array<Decision>;
    assignments?: any;
    actionCalls?: Array<ActionCall>;
    recordUpdates?: Array<RecordUpdate>;
    recordCreates?: Array<RecordCreate>;
    recordLookups?: Array<RecordLookup>;
    recordDeletes?: any;
    loops?: any;
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
    elements?: Array<ReadableFlowBuilderItem>;
}

export interface ReadableStart {
    triggerType: string;
    recordTriggerType?: string; // update, create, both
    object?: string;
    schedule?: {
        startDate: string;
        startTime: string;
        frequency: string;
    };
    context?: 'BEFORE_SAVE' | 'AFTER_SAVE';
}

export interface ReadableFlowElement {
    type: string;
    name: string;
    label: string;
    description?: string;
}

export interface ReadableAssignment extends ReadableFlowElement {
    assignments: Array<ReadableAssignmentItem>;
}

export interface ReadableAssignmentItem {
    reference: string;
    operator: string;
    value: string;
}

export interface ReadableLoop extends ReadableFlowElement {
    elements: Array<ReadableFlowBuilderItem>;
}

export interface ReadableFlowDecision extends ReadableFlowElement {
    routes: Array<ReadableFlowDecisionRoute>;
}

export interface ReadableFlowDecisionRoute {
    name: string;
    label: string;
    rule?: Array<ReadableCondition>;
    elements: Array<ReadableFlowBuilderItem>;
}

export interface ReadableActionGroup {
    decision: ReadableDecision;
    actions?: Array<ReadableActionItem>;
    scheduledActionSections?: Array<ReadableScheduledActionSection>;
    evaluatesNext?: boolean;
}

// TODO: Rename to ReadableProcessDecision
export interface ReadableDecision extends ReadableFlowElement {
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

export interface ReadableRecordLookup extends ReadableFlowElement {
    object: string;
    filterCondition: 'NONE' | 'MEET_ALL_CONDITIONS';
    filters?: Array<ReadableFlowRecordLookupFilter>;
    sortBy: {
        order: 'NONE' | 'ASC' | 'DSC';
        field: string;
    };
    numberOfRecords: 'ONLY_FIRST' | 'ALL';
    output: {
        method: 'ALL_FIELDS' | 'CHOOSE_FIELDS' | 'CHOOSE_AND_ASSIGN_FIELDS';
        fields?: Array<any>;
        assignments?: Array<any>;
    };
}

export interface OutputAssignment {
    field: string;
    reference: string;
}

export interface ReadableFlowRecordLookupFilter {
    field: string;
    operator: string;
    value: string;
}

export function implementsReadableFlow(arg: any): arg is ReadableFlow {
    return SUPPORTED_FLOW.includes(arg.processType);
}

export function implementsReadableProcess(arg: any): arg is ReadableProcess {
    return SUPPORTED_PROCESS.includes(arg.processType);
}

export type ReadableFlowBuilderItem = ReadableAssignment | ReadableDecision | ReadableLoop | ReadableRecordLookup; // | ReadableRecordCreate | ReadableRecordUpdate | ReadableRecordDelete ;

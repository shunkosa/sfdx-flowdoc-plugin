import { SUPPORTED_FLOW } from '../../lib/converter/helper/constants';
// WIP: import { RecordUpdate, RecordCreate, RecordLookup } from '../metadata/flowRecordAction';

/**
 * Container for flow
 */
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

export interface ReadableCondition {
    field: string;
    operator: string;
    type: string;
    value: string;
}

export interface ReadableRecordLookup extends ReadableFlowElement {
    object: string;
    filterCondition: 'NONE' | 'MEET_ALL_CONDITIONS';
    filters?: Array<ReadableFlowRecordLookupFilter>;
    sortBy: {
        order: string;
        field?: string;
    };
    numberOfRecords: 'ONLY_FIRST' | 'ALL';
    output: {
        method: 'ALL_FIELDS' | 'CHOOSE_FIELDS' | 'CHOOSE_AND_ASSIGN_FIELDS';
        fields?: Array<any>;
        assignments?: Array<any>;
    };
}

export interface ReadableFlowRecordLookupFilter {
    field: string;
    operator: string;
    value: string;
}

export function implementsReadableFlow(arg: any): arg is ReadableFlow {
    return SUPPORTED_FLOW.includes(arg.processType);
}

export type ReadableFlowBuilderItem = ReadableAssignment | ReadableFlowDecision | ReadableLoop | ReadableRecordLookup; // | ReadableRecordCreate | ReadableRecordUpdate | ReadableRecordDelete ;

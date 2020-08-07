import { ProcessMetadataValue, ElementReferenceOrValue } from './processMetadataValue';
import { Node, RecordCreate, RecordUpdate, RecordLookup, RecordDelete } from './flowRecordAction';

export interface Flow {
    processType: string;
    label: string;
    description: string;
    startElementReference?: string;
    variables: Variable | Array<Variable>;
    processMetadataValues: Array<ProcessMetadataValue>;
    formulas: any;
    decisions: Decision | Array<Decision>;
    assignments: any;
    actionCalls?: ActionCall | Array<ActionCall>;
    recordUpdates?: RecordUpdate | Array<RecordUpdate>;
    recordCreates?: RecordCreate | Array<RecordCreate>;
    recordLookups?: RecordLookup | Array<RecordLookup>;
    recordDeletes?: any;
    loops?: any;
    waits: any;
    start?: any;
}

export interface Variable {
    name: string;
    objectType: string;
}

export interface ActionCall {
    actionType: string;
    name: string;
    label: string;
    connector: {
        targetReference: string;
    };
    processMetadataValues: any;
    inputParameters: any;
}

export function implementsActionCall(arg: any): arg is ActionCall {
    return !(arg.actionType === 'recordUpdate' || arg.actionType === 'recordCreate');
}

export interface Decision extends Node {
    processMetadataValues?: ProcessMetadataValue;
    rules: any;
    defaultConnector: any;
    defaultConnectorLabel: string;
}

export function implementsDecision(arg: any): arg is Decision {
    return arg !== undefined && arg.defaultConnector !== undefined;
}

export interface InputParamValue {
    stringValue?: string;
    elementReference?: string;
}

export interface Assignment extends Node {
    assignmentItems: AssignmentItem | Array<AssignmentItem>;
    connector: {
        targetReference: string;
    };
}

export function implementsAssignment(arg: any): arg is Assignment {
    return arg !== undefined && arg.assignmentItems !== undefined;
}
export interface AssignmentItem {
    assignToReference: string;
    operator:
        | 'Add'
        | 'AddAdStart'
        | 'AddItem'
        | 'Assign'
        | 'AssignCount'
        | 'RemoveAfterFirst'
        | 'RemoveAll'
        | 'RemoveBeforeFirst'
        | 'RemoveFirst'
        | 'RemovePosition'
        | 'RemoveUncommon'
        | 'Subtract';
    value: ElementReferenceOrValue;
}

export interface Loop extends Node {
    nextValueConnector: {
        targetReference: string;
    };
    noMoreValuesConnector: {
        targetReference: string;
    };
    collectionReference: string;
    assignNextValueToReference: string;
    iterationOrder: 'Asc' | 'Dsc';
}

export function implementsLoop(arg: any): arg is Loop {
    return arg !== undefined && arg.collectionReference !== undefined;
}

export type ProcessElement = Decision | ActionCall;

export type FlowBuilderItem =
    | Decision
    | Assignment
    | Loop
    | ActionCall
    | RecordLookup
    | RecordCreate
    | RecordUpdate
    | RecordDelete;

import { ProcessMetadataValue } from './processMetadataValue';
import { RecordCreate, RecordUpdate, RecordLookup } from './flowRecordAction';

export interface Flow {
    processType: string;
    label: string;
    description: string;
    startElementReference: string;
    variables: Variable | Array<Variable>;
    processMetadataValues: Array<ProcessMetadataValue>;
    formulas: any;
    decisions: Decision | Array<Decision>;
    actionCalls?: ActionCall | Array<ActionCall>;
    recordUpdates?: RecordUpdate | Array<RecordUpdate>;
    recordCreates?: RecordCreate | Array<RecordCreate>;
    recordLookups?: RecordLookup | Array<RecordLookup>;
    waits: any;
}

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
}

interface Variable {
    name: string;
    objectType: string;
}

export interface ActionCall {
    actionType: string;
    name: string;
    label: string;
    connector: any;
    processMetadataValues: any;
    inputParameters: any;
}

export function implementsActionCall(arg: any): arg is ActionCall {
    return !arg.actionType.includes('RECORD_');
}

export interface Decision {
    name: string;
    label: string;
    processMetadataValues?: ProcessMetadataValue;
    rules: any;
    defaultConnector: any;
}

export interface InputParamValue {
    stringValue?: string;
    elementReference?: string;
}

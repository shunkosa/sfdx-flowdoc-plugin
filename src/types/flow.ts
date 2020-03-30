import { ProcessMetadataValue } from './processMetadataValue';
import { RecordCreate, RecordUpdate } from './flowRecordAction';

export interface Flow {
    processType: string;
    label: string;
    description: string;
    startElementReference: string;
    variables: Variable | Variable[];
    processMetadataValues: ProcessMetadataValue[];
    formulas: any;
    decisions: Decision | Decision[];
    actionCalls: ActionCall | ActionCall[];
    recordUpdates: RecordUpdate | RecordUpdate[];
    recordCreates: RecordCreate | RecordCreate[];
    waits: any;
}

interface Variable {
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

export interface ScheduledActionSection {
    wait: WaitEventSummary;
    actions: any;
}

export interface WaitEventSummary {
    offset: number;
    unit: string;
    isAfter: boolean;
    field?: string;
}

export interface InputParamValue {
    stringValue?: string;
    elementReference?: string;
}

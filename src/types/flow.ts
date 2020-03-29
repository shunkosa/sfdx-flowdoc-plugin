import { ProcessMetadataValue } from './processMetadataValue';

export interface Flow {
    processType: string;
    label: string;
    description: string;
    startElementReference: string;
    variables: Variable | Variable[];
    processMetadataValues: ProcessMetadataValue[];
    formulas: any;
    decisions: Decision | Decision[];
    actionCalls: any;
    recordUpdates: any;
    recordCreates: any;
    waits: any;
}

interface Variable {
    objectType: string;
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

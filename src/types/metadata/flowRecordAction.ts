import { ProcessMetadataValue, ElementReferenceOrValue } from './processMetadataValue';

interface Node {
    name: string;
    label: string;
    locationX: string;
    locationY: string;
    description?: string;
}
export interface RecordCreate extends Node {
    processMetadataValues?: any;
    actionType?: string;
    assignRecordIdToReference?: string;
    connector: any;
    faultConnector?: any;
    inputAssignments: any;
    inputReference?: string;
    object: string;
    storeOutputAutomatically?: boolean;
}

export interface RecordUpdate extends Node {
    processMetadataValues?: any;
    actionType?: string;
    connector: any;
    faultConnector?: any;
    filters: RecordFilter | RecordFilter[];
    inputAssignments: any;
    object: string;
    inputReference?: string;
}

export interface RecordLookup extends Node {
    processMetadataValues?: any;
    filters?: RecordFilter | RecordFilter[];
}

export interface RecordFilter {
    processMetadataValues: ProcessMetadataValue | ProcessMetadataValue[];
    value: ElementReferenceOrValue;
}

export function implementsRecordCreate(arg: any): arg is RecordCreate {
    return arg.actionType === 'recordCreate';
}

export function implementsRecordUpdate(arg: any): arg is RecordUpdate {
    return arg.actionType === 'recordUpdate';
}

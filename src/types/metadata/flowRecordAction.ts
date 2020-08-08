import { ProcessMetadataValue, ElementReferenceOrValue } from './processMetadataValue';

export interface Node {
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
    faultConnector?: any;
    inputAssignments: any;
    inputReference?: string;
    object: string;
    storeOutputAutomatically?: boolean;
    connector: {
        targetReference: string;
    };
}

export interface RecordUpdate extends Node {
    processMetadataValues?: any;
    actionType?: string;
    faultConnector?: any;
    filters: RecordFilter | RecordFilter[];
    inputAssignments: any;
    object: string;
    inputReference?: string;
    connector: {
        targetReference: string;
    };
}

export interface RecordLookup extends Node {
    processMetadataValues?: any;
    object: string;
    getFirstRecordOnly?: boolean;
    storeOutputAutomatically?: boolean;
    sortOrder?: 'Asc' | 'Dsc';
    filters?: RecordFilter | RecordFilter[];
    connector: {
        targetReference: string;
    };
}

export interface RecordDelete extends Node {
    filters?: RecordFilter | RecordFilter[];
    object: string;
    inputReference?: string;
    connector: {
        targetReference: string;
    };
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

export function implementsRecordLookup(arg: any): arg is RecordLookup {
    return arg.storeOutputAutomatically || arg.outputReference || arg.assignNullValuesIfNoRecordFound;
}

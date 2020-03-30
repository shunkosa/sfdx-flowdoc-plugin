export interface RecordCreate {
    processMetadataValues?: any;
    name: string;
    label: string;
    actionType: string;
    assignRecordIdToReference: string;
    connector: any;
    faultConnector: any;
    inputAssignments: any;
    inputReference: string;
    object: string;
    storeOutputAutomatically: boolean;
}

export interface RecordUpdate {
    processMetadataValues?: any;
    name: string;
    label: string;
    actionType: string;
    connector: any;
    faultConnector: any;
    filters: any;
    inputAssignments: any;
    object: string;
    inputReference: string;
}

export function implementsRecordCreate(arg: any): arg is RecordCreate {
    return arg.actionType === 'RECORD_CREATE';
}

export function implementsRecordUpdate(arg: any): arg is RecordUpdate {
    return arg.actionType === 'RECORD_UPDATE';
}

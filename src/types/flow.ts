export interface Flow {
    processType: string,
    label: string,
    description: string,
    startElementReference:string
    variables: Variable[] | Variable
    processMetadataValues: ProcessMetadataValue[],
    formulas: any,
    decisions: any,
    actionCalls: any,
    recordUpdates: any,
    recordCreates: any
}

interface Variable {
    objectType: string
}

interface ProcessMetadataValue {
    name: string,
    value: {
        stringValue: string
    }
}
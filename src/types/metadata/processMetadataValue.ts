export interface ProcessMetadataValue {
    name: string;
    value?: ElementReferenceOrValue;
}

export type ElementReferenceOrValue = RequireOne<{
    stringValue?: string;
    numberValue?: string;
    booleanValue?: string;
    elementReference?: string;
}>;

export function implementsProcessMetadataValue(arg: any): arg is ProcessMetadataValue {
    return arg.name !== undefined && (arg.value === undefined || implementsElementReferenceOrValue(arg.value));
}

function implementsElementReferenceOrValue(arg: any): arg is ElementReferenceOrValue {
    return (
        arg.stringValue !== undefined ||
        arg.numberValue !== undefined ||
        arg.booleanValue !== undefined ||
        arg.elementReference !== undefined
    );
}

type RequireOne<T, K extends keyof T = keyof T> = K extends keyof T ? PartialRequire<T, K> : never;

type PartialRequire<O, K extends keyof O> = {
    [P in K]-?: O[P];
} &
    O;

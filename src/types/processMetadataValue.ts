export interface ProcessMetadataValue {
    name: string;
    value: ElementReferenceOrValue;
}

export type ElementReferenceOrValue = RequireOne<{
    stringValue?: string;
    numberValue?: string;
    booleanValue?: string;
    elementReference?: string;
}>;

type RequireOne<T, K extends keyof T = keyof T> = K extends keyof T ? PartialRequire<T, K> : never;

type PartialRequire<O, K extends keyof O> = {
    [P in K]-?: O[P];
} &
    O;

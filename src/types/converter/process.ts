import { SUPPORTED_PROCESS } from '../../lib/converter/helper/constants';

export interface ReadableProcess {
    processType: string;
    name: string;
    label: string;
    description?: string;
    triggerType?: string; // only in trigger-based process
    objectType: string;
    eventType?: string; // only in platform event process
    eventMatchingConditions?: Array<ReadableCondition>; // only in platform event process
    actionGroups: Array<ReadableActionGroup>;
}

export function implementsReadableProcess(arg: any): arg is ReadableProcess {
    return SUPPORTED_PROCESS.includes(arg.processType);
}

export interface ReadableActionGroup {
    decision: ReadableProcessDecision;
    actions?: Array<ReadableActionItem>;
    scheduledActionSections?: Array<ReadableScheduledActionSection>;
    evaluatesNext?: boolean;
}

export interface ReadableProcessDecision {
    label: string;
    criteria: string;
    conditionLogic: string;
    conditions: Array<ReadableCondition>;
    formulaExpression?: string;
}

export interface ReadableCondition {
    field: string;
    operator: string;
    type: string;
    value: string;
}

export interface ReadableActionItem {
    label: string;
    type: string;
    details?: Array<any>;
    conditions?: Array<ReadableActionItemParameter>;
    params?: Array<ReadableActionItemParameter>;
}

export interface ReadableActionItemParameter {
    field: string;
    type: string;
    value: string;
}

export interface ReadableScheduledActionSection {
    summary: ReadableWaitEventSummary;
    actions?: Array<ReadableActionItem>;
}

export interface ReadableWaitEventSummary {
    offset: number;
    unit: string;
    isAfter: boolean;
    field?: string;
}

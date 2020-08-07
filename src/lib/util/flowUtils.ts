import { Flow } from '../../types/metadata/flow';

export const SUPPORTED_PROCESS = ['Workflow', 'CustomEvent', 'InvocableProcess'];
export const SUPPORTED_FLOW = ['AutoLaunchedFlow'];

export function isSupported(flow: Flow) {
    return (
        isProcess(flow) ||
        (SUPPORTED_FLOW.includes(flow.processType) &&
            flow.start.recordTriggerType !== undefined &&
            flow.start.triggerType === 'RecordBeforeSave')
    );
}

export function isProcess(flow: Flow) {
    return SUPPORTED_PROCESS.includes(flow.processType);
}

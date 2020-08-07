import { Flow } from '../../types/metadata/flow';
import { SUPPORTED_PROCESS, SUPPORTED_FLOW } from '../converter/helper/constants';

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

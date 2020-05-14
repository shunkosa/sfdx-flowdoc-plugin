import ReadableMetadata from '../readableMetadata';
import { ReadableFlow, ReadableStart } from '../../../types/converter';

export default class ReadableFlowMetadata extends ReadableMetadata {
    createReadableFlow(): ReadableFlow {
        return {
            name: this.name,
            label: this.getLabel(),
            processType: this.getProcessType(),
            description: this.getDescription(),
            start: this.getReadableFlowStart(),
            elements: undefined, // this.getReadableFlowElements()
        };
    }

    private getFlowTriggerType() {
        if (this.flow.start.recordTriggerType) {
            return 'FLOW_TRIGGER_RECORD';
        }
        if (this.flow.start.schedule) {
            return 'FLOW_TRIGGER_SCHEDULED';
        }
        return 'FLOW_TRIGGER_USER_OR_APPS';
    }

    private getFlowRecordTriggerType() {
        switch (this.flow.start.recordTriggerType) {
            case 'Create':
                return 'FROW_TRIGGER_RECORD_CREATE_ONLY';
            case 'Update':
                return 'FROW_TRIGGER_RECORD_UPDATE_ONLY';
            case 'CreateAndUpdate':
                return 'FROW_TRIGGER_RECORD_CREATE_OR_UPDATE';
            default:
                return undefined;
        }
    }

    private getReadableFlowStart(): ReadableStart {
        const triggerType = this.getFlowTriggerType();
        return {
            triggerType,
            object: this.flow.start.object,
            recordTriggerType: this.getFlowRecordTriggerType(),
            schedule: triggerType === 'FLOW_TRIGGER_SCHEDULED' ? this.flow.start.schedule : undefined,
        };
    }
}

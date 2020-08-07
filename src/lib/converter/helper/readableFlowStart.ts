import { ReadableStart } from '../../../types/converter';

export default class ReadableFlowStartElement {
    flow;

    constructor(flow) {
        this.flow = flow;
    }

    getReadableElement(): ReadableStart {
        const triggerType = this.getFlowTriggerType();
        return {
            triggerType, // record, schedule, or auto-launch
            object: this.flow.start.object,
            recordTriggerType: this.getFlowRecordTriggerType(), // create, update, or both
            schedule: triggerType === 'FLOW_TRIGGER_SCHEDULED' ? this.flow.start.schedule : undefined,
            context: triggerType === 'FLOW_TRIGGER_RECORD' ? this.getRecordFlowContext() : undefined, // before or after
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

    private getRecordFlowContext() {
        return this.flow.start.triggerType === 'RecordBeforeSave' ? 'BEFORE_SAVE' : 'AFTER_SAVE';
    }
}

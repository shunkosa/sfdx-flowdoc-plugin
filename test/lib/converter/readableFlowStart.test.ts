import beforeSaveCreate from '../../data/flow/before_save_create.json';
import beforeSaveUpdate from '../../data/flow/before_save_update.json';
import beforeSaveCreateAndUpdate from '../../data/flow/before_save_create_and_update.json';
import afterSave from '../../data/flow/after_save.json';
import ReadableFlowStartElement from '../../../src/lib/converter/helper/readableFlowStart';

describe('lib/converter/readableFlowStart', () => {
    it('Before save flow (create)', () => {
        const start = new ReadableFlowStartElement(beforeSaveCreate).getReadableElement();
        expect(start.triggerType).toBe('FLOW_TRIGGER_RECORD');
        expect(start.recordTriggerType).toBe('FROW_TRIGGER_RECORD_CREATE_ONLY');
        expect(start.context).toBe('BEFORE_SAVE');
    });

    it('Before save flow (update)', () => {
        const start = new ReadableFlowStartElement(beforeSaveUpdate).getReadableElement();
        expect(start.triggerType).toBe('FLOW_TRIGGER_RECORD');
        expect(start.recordTriggerType).toBe('FROW_TRIGGER_RECORD_UPDATE_ONLY');
        expect(start.context).toBe('BEFORE_SAVE');
    });

    it('Before save flow (create and update)', () => {
        const start = new ReadableFlowStartElement(beforeSaveCreateAndUpdate).getReadableElement();
        expect(start.triggerType).toBe('FLOW_TRIGGER_RECORD');
        expect(start.recordTriggerType).toBe('FROW_TRIGGER_RECORD_CREATE_OR_UPDATE');
        expect(start.context).toBe('BEFORE_SAVE');
    });

    it('After save flow', () => {
        const start = new ReadableFlowStartElement(afterSave).getReadableElement();
        expect(start.triggerType).toBe('FLOW_TRIGGER_RECORD');
        expect(start.context).toBe('AFTER_SAVE');
    });
});

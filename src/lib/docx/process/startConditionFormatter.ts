import { Paragraph } from 'docx';
import { ReadableProcess } from '../../../types/parser';
import { createHorizontalHeaderTable, createProcessConditionTable } from './docxTableUtils';

export default class StartConditionFormatter {
    flow: ReadableProcess;

    i18n;

    constructor(flow, i18n) {
        this.flow = flow;
        this.i18n = i18n;
    }

    buildContents(): Array<any> {
        switch (this.flow.processType) {
            case 'Workflow':
                return this.createWorkflowStartCondition();
            case 'CustomEvent':
                return this.createCustomEventStartCondition();
            case 'InvocableProcess':
                return this.createInvocableStartCondition();
            default:
                return [];
        }
    }

    private createWorkflowStartCondition() {
        const text = new Paragraph({
            text: this.i18n.__('THE_PROCESS_STARTS_WHEN'),
        });

        const triggerType =
            this.flow.triggerType === 'onAllChanges'
                ? this.i18n.__('WHEN_A_RECORD_IS_CREATED_OR_EDITED')
                : this.i18n.__('ONLY_WHEN_A_RECORD_IS_CREATED');

        const triggerTable = createHorizontalHeaderTable([
            { name: this.i18n.__('OBJECT'), value: this.flow.objectType },
            { name: this.i18n.__('WHEN_THE_PROCESS_STARTS'), value: triggerType },
        ]);

        return [text, triggerTable];
    }

    private createCustomEventStartCondition() {
        const text = new Paragraph({
            text: this.i18n.__('THE_PROCESS_STARTS_PLATFORM_EVENT'),
        });

        const triggerTable = createHorizontalHeaderTable([
            { name: this.i18n.__('PLATFORM_EVENT'), value: this.flow.eventType },
            { name: this.i18n.__('WHEN_THE_PROCESS_STARTS'), value: this.flow.objectType },
        ]);

        const recordLookupFilters = this.flow.eventMatchingConditions;

        if (recordLookupFilters.length === 0) {
            return [text, triggerTable];
        }

        const matchText = new Paragraph({
            text: this.i18n.__('MATCHING_CONDITIONS'),
            spacing: { before: 200, after: 100 },
        });

        const matchTable = createProcessConditionTable(recordLookupFilters, this.i18n);

        return [text, triggerTable, matchText, matchTable];
    }

    private createInvocableStartCondition() {
        const text = new Paragraph({
            text: this.i18n.__('THE_PROCESS_STARTS_INVOCABLE'),
        });

        const objectTable = createHorizontalHeaderTable([
            { name: this.i18n.__('OBJECT'), value: this.flow.objectType },
        ]);

        return [text, objectTable];
    }
}

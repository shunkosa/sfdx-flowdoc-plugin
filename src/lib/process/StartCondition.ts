import { th } from '../../style/text';
import { getRecordLookupFilter } from '../actionParser';

export default class StartCondition {
    flowParser;

    i18n;

    constructor(flowParser, i18n) {
        this.flowParser = flowParser;
        this.i18n = i18n;
    }

    createContents(): Array<any> {
        const processType = this.flowParser.getProcessType();
        switch (processType) {
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
        const text = { text: this.i18n.__('THE_PROCESS_STARTS_WHEN'), margin: [0, 10, 0, 5] };

        const triggerType =
            this.flowParser.getTriggerType() === 'onAllChanges'
                ? this.i18n.__('WHEN_A_RECORD_IS_CREATED_OR_EDITED')
                : this.i18n.__('ONLY_WHEN_A_RECORD_IS_CREATED');
        const triggerTable = {
            layout: 'lightHorizontalLines',
            table: {
                widths: [200, 'auto'],
                body: [
                    [th(this.i18n.__('OBJECT')), this.flowParser.getObjectType()],
                    [th(this.i18n.__('WHEN_THE_PROCESS_STARTS')), triggerType],
                ],
            },
        };
        return [text, triggerTable];
    }

    private createCustomEventStartCondition() {
        const text = { text: this.i18n.__('THE_PROCESS_STARTS_PLATFORM_EVENT'), margin: [0, 10, 0, 5] };

        const triggerTable = {
            layout: 'lightHorizontalLines',
            table: {
                widths: [200, 'auto'],
                body: [
                    [th(this.i18n.__('PLATFORM_EVENT')), this.flowParser.getEventType()],
                    [th(this.i18n.__('OBJECT')), this.flowParser.getObjectType()],
                ],
            },
        };

        const matchTable = {
            layout: 'lightHorizontalLines',
            unbreakable: true,
            table: {
                headerRows: 1,
                width: ['auto', 'auto', 100, 'auto', 'auto'],
                body: [
                    ['', this.i18n.__('FIELD'), this.i18n.__('OPERATOR'), this.i18n.__('TYPE'), this.i18n.__('VALUE')],
                ],
            },
            margin: [15, 5, 0, 0],
        };

        const startElementName = this.flowParser.getStartElement();
        const recordLookup = this.flowParser.getRecordLookup(startElementName);
        const recordLookupFilters = getRecordLookupFilter(this.flowParser, recordLookup);

        if (recordLookupFilters.length === 0) {
            return [text, triggerTable];
        }

        const matchText = { text: this.i18n.__('MATCHING_CONDITIONS'), margin: [0, 10, 0, 5] };

        recordLookupFilters.forEach((f, index) => {
            matchTable.table.body.push([index + 1, ...f]);
        });

        return [text, triggerTable, matchText, matchTable];
    }

    private createInvocableStartCondition() {
        const text = { text: this.i18n.__('THE_PROCESS_STARTS_INVOCABLE'), margin: [0, 10, 0, 5] };

        const objectTable = {
            layout: 'lightHorizontalLines',
            table: {
                widths: [200, 'auto'],
                body: [[th(this.i18n.__('OBJECT')), this.flowParser.getObjectType()]],
            },
        };

        return [text, objectTable];
    }
}

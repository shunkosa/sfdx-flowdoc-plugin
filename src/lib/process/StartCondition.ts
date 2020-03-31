import { th } from '../../style/text';

export default class StartCondition {
    flowParser;

    i18n;

    constructor(flowParser, i18n) {
        this.flowParser = flowParser;
        this.i18n = i18n;
    }

    createContents(): Array<any> {
        const processType = this.flowParser.getProcessType();
        if (processType === 'Workflow') {
            return this.renderWorkflowStartCondition();
        }
        if (processType === 'CustomEvent') {
            return this.renderCustomEventStartCondition();
        }
        return [];
    }

    private renderWorkflowStartCondition() {
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
        return [triggerTable];
    }

    private renderCustomEventStartCondition() {
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
        return [triggerTable];
    }
}

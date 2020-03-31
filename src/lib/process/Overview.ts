import { th } from '../../style/text';

export default class Overview {
    flowParser;

    i18n;

    object;

    constructor(flowParser, i18n) {
        this.flowParser = flowParser;
        this.i18n = i18n;
        this.object = this.flowParser.getObjectType();
    }

    createOverview() {
        const processType = this.flowParser.getProcessType();
        if (processType === 'Workflow') {
            return this.renderWorklowOverview();
        }
        if (processType === 'CustomEvent') {
            return this.renderCustomEventOverview();
        }
        return [];
    }

    private renderWorklowOverview() {
        const triggerType =
            this.flowParser.getTriggerType() === 'onAllChanges'
                ? this.i18n.__('WHEN_A_RECORD_IS_CREATED_OR_EDITED')
                : this.i18n.__('ONLY_WHEN_A_RECORD_IS_CREATED');
        return {
            layout: 'lightHorizontalLines',
            table: {
                widths: [200, 'auto'],
                body: [
                    [th(this.i18n.__('OBJECT')), this.flowParser.getObjectType()],
                    [th(this.i18n.__('WHEN_THE_PROCESS_STARTS')), triggerType],
                ],
            },
        };
    }

    private renderCustomEventOverview() {
        return {
            layout: 'lightHorizontalLines',
            table: {
                widths: [200, 'auto'],
                body: [
                    [th(this.i18n.__('PLATFORM_EVENT')), this.flowParser.getEventType()],
                    [th(this.i18n.__('OBJECT')), this.flowParser.getObjectType()],
                ],
            },
        };
    }
}

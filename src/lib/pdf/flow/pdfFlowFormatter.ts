import i18n from '../../../config/i18n';
import { th } from '../../../style/text';
import { ReadableFlow } from '../../../types/converter';

export default class PdfProcessFormatter {
    flow: ReadableFlow;

    i18n;

    constructor(flow: ReadableFlow, locale) {
        this.flow = flow;
        this.i18n = i18n(locale);
    }

    buildHeader() {
        return [
            { text: this.flow.label, style: 'h1' },
            { text: this.flow.name },
            { text: this.flow.description, margin: [0, 5] },
        ];
    }

    buildStart = () => {
        const content: Array<any> = [
            {
                text: `${this.i18n.__('HEADER_FLOW_TRIGGER')}: ${this.i18n.__(this.flow.start.triggerType)}`,
                margin: [0, 10, 0, 5],
            },
        ];

        if (this.flow.start.triggerType === 'FLOW_TRIGGER_RECORD') {
            content.push({
                layout: 'lightHorizontalLines',
                table: {
                    widths: [200, 'auto'],
                    body: [
                        [th(this.i18n.__('OBJECT')), this.flow.start.object],
                        [
                            th(this.i18n.__('HEADER_FLOW_TRIGGER_RECORD')),
                            this.i18n.__(this.flow.start.recordTriggerType),
                        ],
                    ],
                },
            });
        }

        if (this.flow.start.triggerType === 'FLOW_TRIGGER_SCHEDULED') {
            content.push({
                layout: 'lightHorizontalLines',
                table: {
                    widths: [200, 'auto'],
                    body: [
                        [
                            th(this.i18n.__('FLOW_TRIGGER_SCHEDULED_DATETIME')),
                            `${this.flow.start.schedule.startDate}${this.flow.start.schedule.startTime} `,
                        ],
                        [th(this.i18n.__('FLOW_TRIGGER_SCHEDULED_FREQUENCY')), this.flow.start.schedule.frequency],
                    ],
                },
            });
        }

        return content;
    };

    buildElements = () => {
        return [];
    };
}

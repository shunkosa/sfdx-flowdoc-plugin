import i18n from '../config/i18n';
import Common from './process/Common';
import Overview from './process/Overview';

const styles = require('../style/style.json');

export default class Renderer {
    flowParser;

    i18n;

    name;

    constructor(flowParser, locale: string, name: string) {
        this.flowParser = flowParser;
        this.i18n = i18n(locale);
        this.name = name;
    }

    createDocDefinition() {
        return {
            content: this.createContent(),
            styles,
            defaultStyle: {
                font: 'NotoSans',
            },
        };
    }

    private createContent() {
        const content = [];

        content.push({ text: this.flowParser.getLabel(), style: 'h1' });
        content.push({ text: this.name });

        content.push({ text: this.i18n.__('THE_PROCESS_STARTS_WHEN'), margin: [0, 10, 0, 5] });

        const processOverview = new Overview(this.flowParser, this.i18n);
        content.push(processOverview.createOverview());

        const common = new Common(this.flowParser, this.i18n);
        content.push(common.createDecisionGroups());

        return content;
    }
}

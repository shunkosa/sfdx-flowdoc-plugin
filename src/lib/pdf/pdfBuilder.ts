import PdfProcessFormatter from './process/pdfProcessFormatter';
import PdfFlowFormatter from './flow/pdfFlowFormatter';
import {
    DocumentBuilder,
    ReadableFlowMetadataConverter,
    ReadableProcessMetadataConverter,
} from '../converter/metadataConverter';

const styles = require('../../style/style.json');

export default class PdfBuilder extends DocumentBuilder {
    buildFlowDocument(converter: ReadableFlowMetadataConverter) {
        const content = [];
        const formatter = new PdfFlowFormatter(converter.readableMetadata, this.locale);
        content.push(...formatter.buildHeader());
        content.push(...formatter.buildStart());
        content.push(...formatter.buildElements());
        return {
            content,
            styles,
            defaultStyle: {
                font: 'NotoSans',
            },
        };
    }

    buildProcessDocument(converter: ReadableProcessMetadataConverter) {
        const content = [];
        const formatter = new PdfProcessFormatter(converter.readableMetadata, this.locale);
        content.push(...formatter.buildHeader());
        content.push(...formatter.buildStartCondition());
        content.push(...formatter.buildActionGroups());
        return {
            content,
            styles,
            defaultStyle: {
                font: 'NotoSans',
            },
        };
    }
}

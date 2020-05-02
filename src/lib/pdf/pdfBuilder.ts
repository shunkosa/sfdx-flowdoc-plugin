import PdfProcessFormatter from './process/pdfProcessFormatter';
import { ReadableProcess } from '../../types/parser';

const styles = require('../../style/style.json');

export default function buildPdfContent(flow: ReadableProcess, locale: string) {
    const content = [];
    const ppf = new PdfProcessFormatter(flow, locale);
    content.push(...ppf.buildHeader());

    content.push(...ppf.buildStartCondition());
    content.push(...ppf.buildActionGroups());
    return {
        content,
        styles,
        defaultStyle: {
            font: 'NotoSans',
        },
    };
}

import * as docx from 'docx';
import { ReadableProcess } from '../../types/parser';
import DocxProcessFormatter from './process/docxProcessFormatter';

export default function buildDocxContent(flow: ReadableProcess, locale: string): docx.File {
    const content = [];
    const dpf = new DocxProcessFormatter(flow, locale);
    content.push(...dpf.prepareHeader());
    content.push(...dpf.prepareStartCondition());
    content.push(...dpf.prepareActionGroups());
    const doc = new docx.Document();
    doc.addSection({
        children: content,
    });
    return doc;
}

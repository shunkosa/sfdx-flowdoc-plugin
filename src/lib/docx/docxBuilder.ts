import * as docx from 'docx';
import * as path from 'path';
import * as fs from 'fs';
import { ReadableProcess } from '../../types/parser';
import DocxProcessFormatter from './process/docxProcessFormatter';

export default function buildDocxContent(flow: ReadableProcess, locale: string): docx.File {
    const jaStyles = fs.readFileSync(path.resolve(__dirname, '../../assets/fonts/styles.ja.xml'), 'utf-8');
    const enStyles = fs.readFileSync(path.resolve(__dirname, '../../assets/fonts/styles.en.xml'), 'utf-8');
    const content = [];
    const dpf = new DocxProcessFormatter(flow, locale);
    content.push(...dpf.prepareHeader());
    content.push(...dpf.prepareStartCondition());
    content.push(...dpf.prepareActionGroups());
    const doc = new docx.Document({
        externalStyles: locale === 'ja' ? jaStyles : enStyles,
    });
    doc.addSection({
        children: content,
    });
    return doc;
}

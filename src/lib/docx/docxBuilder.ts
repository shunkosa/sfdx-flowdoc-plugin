import * as docx from 'docx';
import * as path from 'path';
import * as fs from 'fs';
import DocxProcessFormatter from './process/docxProcessFormatter';
import {
    DocumentBuilder,
    ReadableProcessMetadataConverter,
    ReadableFlowMetadataConverter,
} from '../converter/metadataConverter';

const jaStyles = fs.readFileSync(path.resolve(__dirname, '../../assets/fonts/styles.ja.xml'), 'utf-8');
const enStyles = fs.readFileSync(path.resolve(__dirname, '../../assets/fonts/styles.en.xml'), 'utf-8');

export default class DocxBuilder extends DocumentBuilder {
    buildFlowDocument(converter: ReadableFlowMetadataConverter) {
        console.log(this.locale);
        console.log(converter.readableMetadata);
    }

    buildProcessDocument(converter: ReadableProcessMetadataConverter) {
        const content = [];
        const dpf = new DocxProcessFormatter(converter.readableMetadata, this.locale);
        content.push(...dpf.prepareHeader());
        content.push(...dpf.prepareStartCondition());
        content.push(...dpf.prepareActionGroups());
        const doc = new docx.Document({
            externalStyles: this.locale === 'ja' ? jaStyles : enStyles,
        });
        doc.addSection({
            children: content,
        });
        return doc;
    }
}

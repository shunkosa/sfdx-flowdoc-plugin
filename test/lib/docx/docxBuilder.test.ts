import { Document } from 'docx';
import { Flow } from '../../../src/types/metadata/flow';

import testFlow from '../../data/testFlow.json';
import DocxBuilder from '../../../src/lib/docx/docxBuilder';
import { ReadableProcessMetadataConverter } from '../../../src/lib/converter/metadataConverter';

describe('lib/pdf/pdfBuilder', () => {
    it('buildPdfContent()', () => {
        const docxBuilder = new DocxBuilder('en');
        const docxContent = new ReadableProcessMetadataConverter(testFlow as Flow, 'test_flow').accept(docxBuilder);
        expect(docxContent instanceof Document).toBeTruthy();
    });
});

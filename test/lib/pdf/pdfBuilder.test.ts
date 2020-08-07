import { Flow } from '../../../src/types/metadata/flow';

import testFlow from '../../data/testFlow.json';
import PdfBuilder from '../../../src/lib/pdf/pdfBuilder';
import { ReadableProcessMetadataConverter } from '../../../src/lib/converter/metadataConverter';

describe('lib/pdf/pdfBuilder', () => {
    it('buildPdfContent()', () => {
        const pdfBuilder = new PdfBuilder('en');
        const pdfContent = new ReadableProcessMetadataConverter(testFlow as Flow, 'test_flow').accept(pdfBuilder);
        expect(pdfContent.content).toHaveLength(48);
    });
});

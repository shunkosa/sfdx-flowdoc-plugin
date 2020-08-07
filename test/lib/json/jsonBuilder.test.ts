import { Flow } from '../../../src/types/metadata/flow';

import testFlow from '../../data/testFlow.json';
import JsonBuilder from '../../../src/lib/json/jsonBuilder';
import { ReadableProcessMetadataConverter } from '../../../src/lib/converter/metadataConverter';

describe('lib/pdf/pdfBuilder', () => {
    it('buildPdfContent()', () => {
        const jsonBuilder = new JsonBuilder('en');
        const jsonContent = new ReadableProcessMetadataConverter(testFlow as Flow, 'test_flow').accept(jsonBuilder);
        expect(jsonContent).toBeTruthy();
    });
});

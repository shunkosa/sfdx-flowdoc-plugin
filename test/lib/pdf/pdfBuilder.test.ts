import buildPdfContent from '../../../src/lib/pdf/pdfBuilder';
import FlowParser from '../../../src/lib/flowParser';
import { Flow } from '../../../src/types/flow';

import testFlow from '../testFlow.json';

describe('lib/pdf/pdfBuilder', () => {
    it('buildPdfContent()', () => {
        const fp = new FlowParser(testFlow as Flow, 'test_flow');
        const readableFlow = fp.createReadableProcess();
        const pdfContent = buildPdfContent(readableFlow, 'en');
        expect(pdfContent.content).toHaveLength(48);
    });
});

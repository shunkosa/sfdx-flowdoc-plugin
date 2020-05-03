import { Document } from 'docx';
import buildDocxContent from '../../../src/lib/docx/docxBuilder';
import FlowParser from '../../../src/lib/flowParser';
import { Flow } from '../../../src/types/flow';

import testFlow from '../testFlow.json';

describe('lib/pdf/pdfBuilder', () => {
    it('buildPdfContent()', () => {
        const fp = new FlowParser(testFlow as Flow, 'test_flow');
        const readableFlow = fp.createReadableProcess();
        const docxContent = buildDocxContent(readableFlow, 'en');
        expect(docxContent instanceof Document).toBeTruthy();
    });
});

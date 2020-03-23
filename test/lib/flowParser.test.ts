import testFlow from './testFlow.json';
import FlowParser from '../../src/lib/flowParser';
import { Flow } from '../../src/types/flow';

describe('lib/flowParser', () => {
    let flowParser;

    beforeAll(() => {
        flowParser = new FlowParser(testFlow as Flow);
    });

    it('supported flow', () => {
        expect(flowParser.isSupportedFlow()).toBeTruthy();
    });

    it('object type', () => {
        expect(flowParser.getObjectType()).toBe('Opportunity');
    });

}); 
  
import testFlow from './testFlow.json';
import FlowParser from '../../src/lib/FlowParser';
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

    it('standard decisions', () => {
        expect(flowParser.getStandardDecisions()).toHaveLength(4);
    });
});

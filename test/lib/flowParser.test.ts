import testFlow from './testFlow.json';
import FlowParser from '../../src/lib/flowParser';
import { Flow } from '../../src/types/flow';

describe('lib/flowParser', () => {
    let flowParser;

    beforeAll(() => {
        flowParser = new FlowParser(testFlow as Flow, 'test_flow');
    });

    it('supported flow', () => {
        expect(flowParser.isSupportedFlow()).toBeTruthy();
    });

    it('readable flow creation', () => {
        const readableProcess = flowParser.createReadableProcess();
        expect(readableProcess.eventMatchingConditions).toBeFalsy();
        expect(readableProcess.actionGroups).toHaveLength(4);
    });
});

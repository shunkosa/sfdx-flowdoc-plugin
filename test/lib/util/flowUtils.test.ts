import testFlow from '../../data/testFlow.json';
import { Flow } from '../../../src/types/metadata/flow';
import { isSupported, isProcess } from '../../../src/lib/util/flowUtils';

describe('lib/flowUtils', () => {
    it('isSupported', () => {
        expect(isSupported(testFlow as Flow)).toBeTruthy();
    });

    it('isProcess', () => {
        expect(isProcess(testFlow as Flow)).toBeTruthy();
    });
});

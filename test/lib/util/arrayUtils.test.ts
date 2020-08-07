import { toArray } from '../../../src/lib/util/arrayUtils';

describe('lib/arrayUtils', () => {
    it('toArray()', () => {
        const test1 = {
            foo: 'bar',
        };
        const test2 = ['foo', 'bar'];
        expect(toArray(test1)).toHaveLength(1);
        expect(toArray(test2)).toHaveLength(2);
    });
});

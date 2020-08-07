import { toUpperSnakeCase } from '../../../src/lib/util/stringUtils';

describe('lib/utils/stringUtils', () => {
    it('toUpperSnakeCase()', () => {
        const test1 = 'recordUpdate';
        const test2 = 'createDraftFromOnlineKnowledgeArticle';
        expect(toUpperSnakeCase(test1)).toEqual('RECORD_UPDATE');
        expect(toUpperSnakeCase(test2)).toEqual('CREATE_DRAFT_FROM_ONLINE_KNOWLEDGE_ARTICLE');
    });
});

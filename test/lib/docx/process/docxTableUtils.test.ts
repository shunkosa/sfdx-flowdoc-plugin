import { Table } from 'docx';
import {
    createHorizontalHeaderTable,
    createProcessConditionTable,
    createProcessParameterTable,
} from '../../../../src/lib/docx/process/docxTableUtils';
import i18n from '../../../../src/config/i18n';

describe('lib/docx/process/docxTableUtils', () => {
    it('createHorizontalHeaderTable()', () => {
        const testRows = [
            {
                name: 'test1',
                value: 'foo',
            },
            {
                name: 'test2',
                value: 'foo',
            },
        ];
        const testTable = createHorizontalHeaderTable(testRows);
        expect(testTable instanceof Table).toBeTruthy();
        expect(testTable.prepForXml()['w:tbl']).toHaveLength(4); // property + border + 2 rows
    });

    it('creatProcessConditionTable()', () => {
        const testRows = [
            {
                field: 'test',
                operator: 'equalTo',
                type: 'string',
                value: 'foo',
            },
        ];
        const locale = i18n('en');
        const testTable = createProcessConditionTable(testRows, locale);
        expect(testTable instanceof Table).toBeTruthy();
        expect(testTable.prepForXml()['w:tbl']).toHaveLength(4); // property + border + 2 rows
    });

    it('createProcessParameterTable()', () => {
        const testRows = [
            {
                field: 'test',
                type: 'string',
                value: 'foo',
            },
        ];
        const locale = i18n('en');
        const testTable = createProcessParameterTable(testRows, locale);
        expect(testTable instanceof Table).toBeTruthy();
        expect(testTable.prepForXml()['w:tbl']).toHaveLength(4); // property + border + 2 rows
    });
});

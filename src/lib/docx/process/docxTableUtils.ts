import { Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle } from 'docx';
import { ReadableCondition, ReadableActionItemParameter } from '../../../types/converter';

const CELL_DEFAULT_MARGIN = {
    top: 20,
    bottom: 20,
    left: 80,
    right: 80,
};

const TH_BORDER = {
    bottom: {
        style: BorderStyle.THIN_THICK_SMALL_GAP,
        size: 1,
        color: '000000',
    },
};

export function createHorizontalHeaderTable(rows: Array<{ name: string; value: string }>): Table {
    const tableRows = [];
    for (const row of rows) {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [bold(row.name)] })],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.value)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                ],
            })
        );
    }
    return new Table({ rows: tableRows });
}

export function createProcessConditionTable(rows: Array<ReadableCondition>, i18n) {
    const tableRows = [];
    // table header
    tableRows.push(
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph('')],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('FIELD'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('OPERATOR'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('TYPE'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('VALUE'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
            ],
        })
    );
    rows.forEach((row, index) => {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph(`${index + 1}`)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.field)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.operator)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.type)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.value)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                ],
            })
        );
    });
    return new Table({ rows: tableRows });
}

export function createProcessParameterTable(rows: Array<ReadableActionItemParameter>, i18n) {
    const tableRows = [];
    // table header
    tableRows.push(
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph('')],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('FIELD'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('TYPE'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
                new TableCell({
                    children: [new Paragraph({ children: [bold(i18n.__('VALUE'))] })],
                    margins: CELL_DEFAULT_MARGIN,
                    borders: TH_BORDER,
                }),
            ],
        })
    );
    rows.forEach((row, index) => {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph(`${index + 1}`)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.field)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.type)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.value)],
                        margins: CELL_DEFAULT_MARGIN,
                    }),
                ],
            })
        );
    });
    return new Table({ rows: tableRows });
}

function bold(text: string): TextRun {
    return new TextRun({
        text,
        bold: true,
    });
}

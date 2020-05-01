import { Table, TableRow, TableCell, Paragraph, TextRun } from 'docx';
import { ReadableCondition, ReadableActionItemParameter } from '../../../types/parser';

const CELL_MARGIN = {
    top: 20,
    bottom: 20,
    left: 50,
    right: 50,
};

export function createHorizontalHeaderTable(rows: Array<{ name: string; value: string }>): Table {
    const tableRows = [];
    for (const row of rows) {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [bold(row.name)] })],
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.value)],
                        margins: CELL_MARGIN,
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
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('FIELD'))],
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('OPERATOR'))],
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('TYPE'))],
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('VALUE'))],
                    margins: CELL_MARGIN,
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
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.field)],
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.operator)],
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.type)],
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.value)],
                        margins: CELL_MARGIN,
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
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('FIELD'))],
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('TYPE'))],
                    margins: CELL_MARGIN,
                }),
                new TableCell({
                    children: [new Paragraph(i18n.__('VALUE'))],
                    margins: CELL_MARGIN,
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
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.field)],
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.type)],
                        margins: CELL_MARGIN,
                    }),
                    new TableCell({
                        children: [new Paragraph(row.value)],
                        margins: CELL_MARGIN,
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

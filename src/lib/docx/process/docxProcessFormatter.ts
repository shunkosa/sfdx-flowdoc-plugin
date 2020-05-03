import { Paragraph, HeadingLevel, Table } from 'docx';
import {
    ReadableProcess,
    ReadableActionItem,
    ReadableActionItemParameter,
    ReadableWaitEventSummary,
} from '../../../types/parser';
import i18n from '../../../config/i18n';
import StartConditionFormatter from './startConditionFormatter';
import {
    createHorizontalHeaderTable,
    createProcessConditionTable,
    createProcessParameterTable,
} from './docxTableUtils';
import { toUpperSnakeCase } from '../../util/stringUtils';

export default class DocxProcessFormatter {
    flow: ReadableProcess;

    i18n;

    constructor(flow, locale: string) {
        this.flow = flow;
        this.i18n = i18n(locale);
    }

    prepareHeader = () => {
        const header = [
            new Paragraph({
                text: this.flow.label,
                heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
                text: this.flow.name,
                spacing: { after: this.flow.description ? 0 : 200 },
            }),
        ];
        if (this.flow.description) {
            header.push(
                new Paragraph({
                    text: this.flow.description,
                    spacing: { after: 200 },
                })
            );
        }
        return header;
    };

    prepareStartCondition = () => {
        return new StartConditionFormatter(this.flow, this.i18n).buildContents();
    };

    prepareActionGroups = () => {
        const content = [];
        const { actionGroups } = this.flow;
        for (let i = 0; i < actionGroups.length; i++) {
            content.push(
                new Paragraph({
                    text: `${this.i18n.__('ACTION_GROUP')} ${i + 1}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 60 },
                })
            );

            // decision
            const decisionRows = [
                { name: this.i18n.__('CONDITION_NAME'), value: actionGroups[i].decision.label },
                {
                    name: this.i18n.__('CRITERIA_FOR_EXECUTING_ACTIONS'),
                    value: this.i18n.__(actionGroups[i].decision.criteria),
                },
            ];
            if (actionGroups[i].decision.criteria === 'FORMULA_EVALUATES_TO_TRUE') {
                decisionRows.push({ name: this.i18n.__('FORMULA'), value: actionGroups[i].decision.formulaExpression });
            } else if (actionGroups[i].decision.criteria === 'CONDITIONS_ARE_MET') {
                decisionRows.push({
                    name: this.i18n.__('CONDITION_LOGIC'),
                    value: actionGroups[i].decision.conditionLogic,
                });
            }
            content.push(createHorizontalHeaderTable(decisionRows));
            content.push(new Paragraph({}));

            // decision condition
            if (actionGroups[i].decision.criteria === 'CONDITIONS_ARE_MET') {
                content.push(createProcessConditionTable(actionGroups[i].decision.conditions, this.i18n));
                content.push(new Paragraph({}));
            }

            // actions
            if (actionGroups[i].actions && actionGroups[i].actions.length > 0) {
                content.push(
                    new Paragraph({
                        text: this.i18n.__('HEADER_ACTIONS'),
                        heading: HeadingLevel.HEADING_3,
                        spacing: { after: 100 },
                    })
                );

                actionGroups[i].actions.forEach((action, index) => {
                    content.push(
                        new Paragraph({
                            text: `${this.i18n.__('HEADER_ACTION')} ${index + 1}: ${action.label}`,
                            heading: HeadingLevel.HEADING_4,
                            spacing: { after: 40 },
                        })
                    );
                    const actionContents = this.buildActionContents(action);
                    content.push(...actionContents);
                });
            }

            // scheduled actions
            if (actionGroups[i].scheduledActionSections && actionGroups[i].scheduledActionSections.length > 0) {
                content.push(
                    new Paragraph({
                        text: this.i18n.__('HEADER_SCHEDULED_ACTIONS'),
                        heading: HeadingLevel.HEADING_3,
                    })
                );
                for (const section of actionGroups[i].scheduledActionSections) {
                    content.push(this.createScheduledActionSummary(section.summary));
                    section.actions.forEach((action, index) => {
                        content.push(
                            new Paragraph({
                                text: `${this.i18n.__('HEADER_ACTION')} ${index + 1}: ${action.label}`,
                                heading: HeadingLevel.HEADING_4,
                                spacing: { after: 40 },
                            })
                        );
                        const actionContents = this.buildActionContents(action);
                        content.push(...actionContents);
                    });
                }
            }

            // evaluates next criteria?
            content.push(
                new Paragraph({
                    text: this.i18n.__('AFTER_THIS_CRITERIA'),
                    heading: HeadingLevel.HEADING_3,
                })
            );
            content.push(
                new Paragraph({
                    text: actionGroups[i].evaluatesNext
                        ? this.i18n.__('EVALUATE_THE_NEXT_CRITERIA')
                        : this.i18n.__('STOP_THE_PROCESS'),
                    spacing: { after: 200 },
                })
            );
        }
        return content;
    };

    private buildActionContents(action: ReadableActionItem) {
        const content = [];
        const actionTables = this.buildActionTables(action);
        content.push(actionTables.actionTable);
        content.push(new Paragraph({}));
        if (actionTables.paramTable) {
            if (action.type === 'recordUpdate') {
                const filterHeader = this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_FILTER_HEADER');
                const filterCondition = actionTables.filterTable
                    ? this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_HAS_CRITERIA')
                    : this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_NO_CRITERIA');
                content.push(
                    new Paragraph({
                        text: `${filterHeader} : ${filterCondition}`,
                    })
                );
            }
            if (actionTables.filterTable) {
                content.push(actionTables.filterTable);
                content.push(new Paragraph({}));
            }
            if (action.type.startsWith('record')) {
                content.push(
                    new Paragraph({
                        text: this.i18n.__(`ACTION_DETAIL_${toUpperSnakeCase(action.type)}_FIELD_HEADER`),
                    })
                );
            }
            content.push(actionTables.paramTable);
            content.push(new Paragraph({}));
        }
        return content;
    }

    private buildActionTables(
        action: ReadableActionItem
    ): { actionTable: Table; paramTable?: Table; filterTable?: Table } {
        const actionTableRows = [
            { name: this.i18n.__('ACTION_TYPE'), value: this.i18n.__(`ACTION_TYPE_${toUpperSnakeCase(action.type)}`) },
        ];

        if (action.details) {
            for (const d of action.details) {
                actionTableRows.push({
                    name: this.i18n.__(`ACTION_DETAIL_${toUpperSnakeCase(action.type)}_${toUpperSnakeCase(d.name)}`),
                    value: d.value,
                });
            }
        }
        const actionTable = createHorizontalHeaderTable(actionTableRows);
        if (!action.params || action.params.length === 0) {
            return { actionTable };
        }

        // If the action has parameters (e.g., record id to apex action)
        const paramTableRows: Array<ReadableActionItemParameter> = [];
        for (const p of action.params) {
            paramTableRows.push({ field: p.field, type: p.type, value: p.value });
        }
        const paramTable = createProcessParameterTable(paramTableRows, this.i18n);
        if (!action.conditions || action.conditions.length === 0) {
            return { actionTable, paramTable };
        }

        // If the action has filter conditions (e.g. target records to update)
        const filterTableRows: Array<ReadableActionItemParameter> = [];
        for (const c of action.conditions) {
            filterTableRows.push({ field: c.field, type: c.type, value: c.value });
        }
        const filterTable = createProcessParameterTable(filterTableRows, this.i18n);
        return { actionTable, paramTable, filterTable };
    }

    private createScheduledActionSummary(summary: ReadableWaitEventSummary) {
        const direction = this.i18n.__(summary.isAfter ? 'AFTER' : 'BEFORE');
        const compareTo = summary.field ? summary.field : this.i18n.__('NOW');
        const unit = this.i18n.__(summary.unit.toUpperCase());
        return new Paragraph({
            text: `${summary.offset} ${unit} ${direction} ${compareTo}`,
            spacing: { after: 100 },
        });
    }
}

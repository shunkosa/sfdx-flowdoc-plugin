import { th, h2, h3 } from '../../../style/text';
import i18n from '../../../config/i18n';
import {
    ReadableProcess,
    ReadableDecision,
    ReadableCondition,
    ReadableActionItem,
    ReadableWaitEventSummary,
} from '../../../types/parser';
import StartConditionFormatter from './startConditionFormatter';

export default class PdfProcessFormatter {
    flow: ReadableProcess;

    i18n;

    constructor(flow: ReadableProcess, locale) {
        this.flow = flow;
        this.i18n = i18n(locale);
    }

    buildHeader = () => {
        const content = [];
        content.push({ text: this.flow.label, style: 'h1' });
        content.push({ text: this.flow.name });
        content.push({ text: this.flow.description, margin: [0, 5] });
        return content;
    };

    buildStartCondition = () => {
        const scf = new StartConditionFormatter(this.flow, this.i18n);
        return scf.buildContents();
    };

    buildActionGroups = () => {
        const content = [];
        const { actionGroups } = this.flow;
        for (let i = 0; i < actionGroups.length; i++) {
            content.push(h2(`${this.i18n.__('ACTION_GROUP')} ${i + 1}`));
            content.push(this.buildDecision(actionGroups[i].decision));

            if (actionGroups[i].decision.criteria === 'CONDITIONS_ARE_MET') {
                content.push(this.buildDecisionConditions(actionGroups[i].decision.conditions));
            }

            if (actionGroups[i].actions && actionGroups[i].actions.length > 0) {
                content.push(h3(this.i18n.__('HEADER_ACTIONS')));

                actionGroups[i].actions.forEach((action, index) => {
                    content.push({ text: `${this.i18n.__('HEADER_ACTION')} ${index + 1}: ${action.label}` });
                    const actionContents = this.buildActionContents(action);
                    content.push(...actionContents);
                });
            }

            if (actionGroups[i].scheduledActionSections && actionGroups[i].scheduledActionSections.length > 0) {
                content.push(h3(this.i18n.__('HEADER_SCHEDULED_ACTIONS')));
                for (const section of actionGroups[i].scheduledActionSections) {
                    content.push(this.createScheduledActionSummary(section.summary));
                    section.actions.forEach((action, index) => {
                        content.push({ text: `${this.i18n.__('HEADER_ACTION')} ${index + 1}: ${action.label}` });
                        const actionContents = this.buildActionContents(action);
                        content.push(...actionContents);
                    });
                }
            }

            content.push(h3(this.i18n.__('AFTER_THIS_CRITERIA')));
            content.push(
                actionGroups[i].evaluatesNext
                    ? this.i18n.__('EVALUATE_THE_NEXT_CRITERIA')
                    : this.i18n.__('STOP_THE_PROCESS')
            );
        }
        return content;
    };

    private buildDecision(decision: ReadableDecision) {
        const table = {
            unbreakable: true,
            table: {
                widths: [200, 'auto'],
                body: [
                    [th(this.i18n.__('CONDITION_NAME')), decision.label],
                    [th(this.i18n.__('CRITERIA_FOR_EXECUTING_ACTIONS')), this.i18n.__(decision.criteria)],
                ],
            },
        };
        if (decision.criteria === 'FORMULA_EVALUATES_TO_TRUE') {
            table.table.body.push([th(this.i18n.__('FORMULA')), decision.formulaExpression]);
        } else if (decision.criteria === 'CONDITIONS_ARE_MET') {
            table.table.body.push([th(this.i18n.__('CONDITION_LOGIC')), decision.conditionLogic]);
        }
        return table;
    }

    private buildDecisionConditions(conditions: Array<ReadableCondition>) {
        const conditionTable = {
            layout: 'lightHorizontalLines',
            unbreakable: true,
            table: {
                headerRows: 1,
                width: ['auto', 'auto', 100, 'auto', 'auto'],
                body: [
                    ['', this.i18n.__('FIELD'), this.i18n.__('OPERATOR'), this.i18n.__('TYPE'), this.i18n.__('VALUE')],
                ],
            },
            margin: [15, 5, 0, 0],
        };
        conditions.forEach((c, index) => {
            conditionTable.table.body.push([index + 1, c.field, this.i18n.__(c.operator), c.type, c.value]);
        });
        return conditionTable;
    }

    private buildActionContents(action: ReadableActionItem) {
        const content = [];
        const actionTables = this.buildActionTables(action);
        content.push(actionTables.actionTable);
        if (actionTables.paramTable) {
            if (action.type === 'RECORD_UPDATE') {
                const filterHeader = this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_FILTER_HEADER');
                const filterCondition = actionTables.filterTable
                    ? this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_HAS_CRITERIA')
                    : this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_NO_CRITERIA');
                content.push({
                    text: `${filterHeader} : ${filterCondition}`,
                    margin: [15, 0, 0, 10],
                });
            }
            if (actionTables.filterTable) {
                content.push(actionTables.filterTable);
            }
            if (action.type.includes('RECORD_')) {
                content.push({
                    text: this.i18n.__(`ACTION_DETAIL_${action.type}_FIELD_HEADER`),
                    margin: [15, 0, 0, 10],
                });
            }
            content.push(actionTables.paramTable);
        }
        return content;
    }

    private buildActionTables(action: ReadableActionItem) {
        const actionTable = {
            unbreakable: true,
            table: {
                body: [[th(this.i18n.__('ACTION_TYPE')), this.i18n.__(`ACTION_TYPE_${action.type}`)]],
            },
            margin: [0, 0, 0, 10],
        };

        if (action.detail) {
            for (const d of action.detail) {
                actionTable.table.body.push([th(this.i18n.__(`ACTION_DETAIL_${action.type}_${d.name}`)), d.value]);
            }
        }
        if (!action.params || action.params.length === 0) {
            return { actionTable };
        }

        // If the action has parameters (e.g., record id to apex action)
        const paramTable = {
            unbreakable: true,
            layout: 'lightHorizontalLines',
            table: {
                body: [['', this.i18n.__('FIELD'), this.i18n.__('TYPE'), this.i18n.__('VALUE')]],
            },
            margin: [15, 0, 0, 15],
        };
        action.params.forEach((p, index) => {
            paramTable.table.body.push([index + 1, p.field, p.type, p.value]);
        });

        if (!action.conditions || action.conditions.length === 0) {
            return { actionTable, paramTable };
        }

        // If the action has filter conditions (e.g. target records to update)
        const filterTable = {
            unbreakable: true,
            layout: 'lightHorizontalLines',
            table: {
                body: [['', this.i18n.__('FIELD'), this.i18n.__('TYPE'), this.i18n.__('VALUE')]],
            },
            margin: [15, 0, 0, 15],
        };
        action.conditions.forEach((c, index) => {
            filterTable.table.body.push([index + 1, c.field, c.type, c.value]);
        });

        return { actionTable, paramTable, filterTable };
    }

    private createScheduledActionSummary = (summary: ReadableWaitEventSummary) => {
        const direction = this.i18n.__(summary.isAfter ? 'AFTER' : 'BEFORE');
        const compareTo = summary.field ? summary.field : this.i18n.__('NOW');
        const unit = this.i18n.__(summary.unit.toUpperCase());
        return {
            text: `${summary.offset} ${unit} ${direction} ${compareTo}`,
            margin: [0, 5],
        };
    };
}

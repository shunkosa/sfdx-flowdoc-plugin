import { th, h2, h3 } from '../../style/text';
import { WaitEventSummary } from '../../types/flow';

export default class Common {
    flowParser;

    i18n;

    constructor(flowParser, i18n) {
        this.flowParser = flowParser;
        this.i18n = i18n;
    }

    createDecisionGroups() {
        const content = [];
        const decisions = this.flowParser.getStandardDecisions();
        for (let i = 0; i < decisions.length; i++) {
            content.push(h2(`${this.i18n.__('ACTION_GROUP')} ${i + 1}`));
            const criteria = this.flowParser.getActionExecutionCriteria(decisions[i]);
            content.push(this.renderDecision(decisions[i], criteria));
            if (criteria === 'CONDITIONS_ARE_MET') {
                content.push(this.renderDecisionConditions(decisions[i].rules.conditions));
            }

            if (decisions[i].rules.connector) {
                const nextActionName = decisions[i].rules.connector.targetReference;
                const actions = this.flowParser.getActionSequence([], nextActionName);
                if (!actions || actions.length === 0) {
                    continue;
                }
                content.push(h3(this.i18n.__('HEADER_ACTIONS')));

                for (const action of actions) {
                    const actionTables = this.renderAction(action);
                    content.push(actionTables[0]);
                    if (actionTables.length > 1) {
                        if (action.actionType === 'RECORD_UPDATE') {
                            const filterHeader = this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_FILTER_HEADER');
                            const filterCondition =
                                actionTables.length === 3
                                    ? this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_HAS_CRITERIA')
                                    : this.i18n.__('ACTION_DETAIL_RECORD_UPDATE_NO_CRITERIA');
                            content.push({
                                text: `${filterHeader} : ${filterCondition}`,
                                margin: [15, 0, 0, 10],
                            });
                        }
                        if (actionTables.length === 3) {
                            content.push(actionTables[2]);
                        }
                        if (action.actionType.includes('RECORD_')) {
                            content.push({
                                text: this.i18n.__(`ACTION_DETAIL_${action.actionType}_FIELD_HEADER`),
                                margin: [15, 0, 0, 10],
                            });
                        }
                        content.push(actionTables[1]);
                    }
                }
                const lastAction = actions.slice(-1)[0];
                let evaluatesNext = false;
                if (lastAction.connector) {
                    const scheduledActionSections = this.flowParser.getScheduledActionSections(
                        lastAction.connector.targetReference
                    );
                    if (scheduledActionSections && scheduledActionSections.length > 0) {
                        content.push(h3(this.i18n.__('HEADER_SCHEDULED_ACTIONS')));
                        for (const section of scheduledActionSections) {
                            content.push(this.renderScheduledActionSummary(section.wait));
                            for (const action of section.actions) {
                                content.push(this.renderAction(action));
                            }
                        }
                    }
                    const nextDecision = this.flowParser.getDecision(lastAction.connector.targetReference);
                    if (nextDecision && nextDecision.processMetadataValues) {
                        evaluatesNext = true;
                    }
                }
                content.push(h3(this.i18n.__('AFTER_THIS_CRITERIA')));
                content.push(
                    evaluatesNext ? this.i18n.__('EVALUATE_THE_NEXT_CRITERIA') : this.i18n.__('STOP_THE_PROCESS')
                );
            }
        }
        return content;
    }

    renderDecision(decision, criteria) {
        const table = {
            unbreakable: true,
            table: {
                widths: [200, 'auto'],
                body: [
                    [th(this.i18n.__('CONDITION_NAME')), decision.rules.label],
                    [th(this.i18n.__('CRITERIA_FOR_EXECUTING_ACTIONS')), this.i18n.__(criteria)],
                ],
            },
        };
        if (criteria === 'FORMULA_EVALUATES_TO_TRUE') {
            const formulaName = decision.rules.conditions.leftValueReference;
            const formulaExpression = this.flowParser.getFormulaExpression(formulaName);
            table.table.body.push([th(this.i18n.__('FORMULA')), unescape(formulaExpression)]);
        } else if (criteria === 'CONDITIONS_ARE_MET') {
            table.table.body.push([th(this.i18n.__('CONDITION_LOGIC')), decision.rules.conditionLogic.toUpperCase()]);
        }
        return table;
    }

    renderDecisionConditions = rawConditions => {
        const conditions = Array.isArray(rawConditions) ? rawConditions : [rawConditions];
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
            const leftValue = this.flowParser.resolveValue(c.leftValueReference);
            conditionTable.table.body.push([
                index + 1,
                leftValue,
                c.operator,
                Object.keys(c.rightValue)[0],
                this.flowParser.resolveValue(c.rightValue),
            ]);
        });
        return conditionTable;
    };

    renderAction = action => {
        const actionTable = {
            unbreakable: true,
            table: {
                body: [
                    [th(this.i18n.__('ACTION_TYPE')), this.i18n.__(`ACTION_TYPE_${action.actionType}`)],
                    [th(this.i18n.__('ACTION_NAME')), action.label],
                ],
            },
            margin: [0, 0, 0, 10],
        };
        const actionDetail = this.flowParser.getActionDetail(action);
        for (const d of actionDetail.rows) {
            actionTable.table.body.push([th(this.i18n.__(`ACTION_DETAIL_${action.actionType}_${d.name}`)), d.value]);
        }

        if (!actionDetail.fields || actionDetail.fields.length === 0) {
            return [actionTable];
        }

        const paramTable = {
            unbreakable: true,
            layout: 'lightHorizontalLines',
            table: {
                body: [['', this.i18n.__('FIELD'), this.i18n.__('TYPE'), this.i18n.__('VALUE')]],
            },
            margin: [15, 0, 0, 15],
        };
        actionDetail.fields.forEach((f, index) => {
            paramTable.table.body.push([index + 1, ...f]);
        });

        if (!actionDetail.filters || actionDetail.filters.length === 0) {
            return [actionTable, paramTable];
        }

        const filterTable = {
            unbreakable: true,
            layout: 'lightHorizontalLines',
            table: {
                body: [['', this.i18n.__('FIELD'), this.i18n.__('TYPE'), this.i18n.__('VALUE')]],
            },
            margin: [15, 0, 0, 15],
        };
        actionDetail.filters.forEach((f, index) => {
            filterTable.table.body.push([index + 1, ...f]);
        });

        return [actionTable, paramTable, filterTable];
    };

    renderScheduledActionSummary = (summary: WaitEventSummary) => {
        const direction = this.i18n.__(summary.isAfter ? 'AFTER' : 'BEFORE');
        const compareTo = summary.field ? summary.field : this.i18n.__('NOW');
        const unit = this.i18n.__(summary.unit.toUpperCase());
        return {
            text: `${summary.offset} ${unit} ${direction} ${compareTo}`,
            margin: [0, 5],
        };
    };
}

import { Flow, Decision, ScheduledActionSection, WaitEventSummary } from '../types/flow';

const layout = require('./actionLayout.json');

export default class FlowParser {
    private readonly flow: Flow;

    private readonly processMetadataValues;

    private readonly decisions: Decision[];

    private readonly processActions;

    private readonly formulas;

    private readonly waits;

    constructor(flow: Flow) {
        this.flow = flow;

        this.processMetadataValues = this.toArray(this.flow.processMetadataValues);

        this.decisions = this.toArray(this.flow.decisions);

        const actions = this.toArray(this.flow.actionCalls);
        const rawRecordUpdates = this.toArray(this.flow.recordUpdates);
        const recordUpdates =
            rawRecordUpdates.length !== 0 ? rawRecordUpdates.map(a => ({ ...a, actionType: 'RECORD_UPDATE' })) : [];
        const rawRecordCreates = this.toArray(this.flow.recordCreates);
        const recordCreates =
            rawRecordCreates.length !== 0 ? rawRecordCreates.map(a => ({ ...a, actionType: 'RECORD_CREATE' })) : [];
        this.processActions = [...actions, ...recordUpdates, ...recordCreates];

        this.formulas = this.toArray(this.flow.formulas);

        this.waits = this.toArray(this.flow.waits);
    }

    isSupportedFlow() {
        return ['Workflow'].includes(this.flow.processType);
    }

    getLabel() {
        return this.flow.label;
    }

    getObjectType() {
        return this.processMetadataValues.find(p => p.name === 'ObjectType').value.stringValue;
    }

    getTriggerType() {
        return this.processMetadataValues.find(p => p.name === 'TriggerType').value.stringValue;
    }

    getStandardDecisions(): Decision[] {
        return this.decisions
            .filter(d => d.processMetadataValues !== undefined)
            .sort((d1, d2) => {
                return (
                    Number(d1.processMetadataValues.value.numberValue) -
                    Number(d2.processMetadataValues.value.numberValue)
                );
            });
    }

    getActionExecutionCriteria(decision) {
        if (!Array.isArray(decision.rules.conditions)) {
            const condition = decision.rules.conditions;
            if (
                condition.operator === 'EqualTo' &&
                condition.rightValue.booleanValue &&
                condition.rightValue.booleanValue === 'true'
            ) {
                if (this.hasAlwaysTrueFormula(condition.leftValueReference)) {
                    return 'NO_CRITERIA';
                }
                return 'FORMULA_EVALUATES_TO_TRUE';
            }
        }
        return 'CONDITIONS_ARE_MET';
    }

    getActionSequence(actions, nextActionName) {
        const nextAction = this.getAction(nextActionName);
        if (nextAction) {
            actions.push(nextAction);
            if (nextAction.connector) {
                this.getActionSequence(actions, nextAction.connector.targetReference);
            }
        } else if (actions.length === 0) {
            const pmDecision = this.getDecision(nextActionName);
            if (pmDecision) {
                const rules = this.toArray(pmDecision.rules);
                const connectedRule = rules.find(r => r.connector !== undefined);
                if (connectedRule) {
                    this.getActionSequence(actions, connectedRule.connector.targetReference);
                }
            }
        }
        return actions;
    }

    getDecision(name: string) {
        return this.decisions.find(d => d.name === name);
    }

    getAction(name: string) {
        return this.processActions.find(a => a.name === name);
    }

    getActionDetail(action) {
        const actionPmvs = this.toArray(action.processMetadataValues);
        const actionInputs = this.toArray(action.inputParameters);
        const actionLayout = layout[action.actionType];

        if (!actionLayout) {
            return { rows: [] };
        }

        let targetLayout;
        if (actionLayout.length === 1) {
            targetLayout = actionLayout[0];
        } else {
            for (const l of actionLayout) {
                const keys = l.key;
                let isMatched = false;
                for (const k of keys) {
                    const param = action[k.type].find(p => p.name === k.name);
                    isMatched = param && param.value ? param.value[k.valueType] === k.value : false;
                }
                if (isMatched) {
                    targetLayout = l;
                    break;
                }
            }
        }

        const rows = [];
        for (const m of this.toArray(targetLayout.structure.metadata)) {
            rows.push({
                name: m.name,
                value: actionPmvs.find(pmv => pmv.name === m.name).value[m.type],
            });
        }
        for (const param of this.toArray(targetLayout.structure.params)) {
            rows.push({
                name: param.name,
                value: actionInputs.find(i => i.name === param.name).value[param.type],
            });
        }

        if (targetLayout.structure.hasFields) {
            const params = this.toArray(action.inputParameters || action.inputAssignments);
            const fields = [];
            for (const i of params) {
                const field = i.processMetadataValues.find(ap => ap.name === 'leftHandSideLabel').value.stringValue;
                const type = i.processMetadataValues.find(ap => ap.name === 'dataType').value.stringValue;
                const value = i.value.stringValue;
                fields.push([field, type, value]);
            }
            return { rows, fields };
        }
        return { rows };
    }

    getScheduledActionSections(waitName) {
        const wait = this.waits.find(a => a.name === waitName);
        if (!wait) {
            return undefined;
        }
        const waitEvents = this.toArray(wait.waitEvents);
        const sections: ScheduledActionSection[] = [];
        for (const waitEvent of waitEvents) {
            const waitEventSummary = this.getWaitEventSummary(waitEvent);
            const section: ScheduledActionSection = {
                wait: waitEventSummary,
                actions: this.getWaitEventActions(
                    waitEvent,
                    Object.prototype.hasOwnProperty.call(waitEventSummary, 'field')
                ),
            };
            sections.push(section);
        }
        return sections;
    }

    getWaitEventSummary(waitEvent): WaitEventSummary {
        const inputParams = this.toArray(waitEvent.inputParameters);
        const rawTimeOffset = Number(inputParams.find(i => i.name === 'TimeOffset').value.numberValue);
        const referencedFieldParam = inputParams.find(i => i.name === 'TimeFieldColumnEnumOrId');
        const summary: WaitEventSummary = {
            offset: Math.abs(rawTimeOffset),
            isAfter: rawTimeOffset > 0,
            unit: inputParams.find(i => i.name === 'TimeOffsetUnit').value.stringValue,
        };
        if (referencedFieldParam) {
            summary.field = referencedFieldParam.value.stringValue;
        }
        return summary;
    }

    getWaitEventActions(waitEvent, comparedToField) {
        let nextReference = waitEvent.connector.targetReference;
        if (comparedToField) {
            const decision = this.getDecision(nextReference);
            if (!decision) {
                return [];
            }
            nextReference = decision.rules.connector.targetReference;
        }
        return this.getActionSequence([], nextReference);
    }

    hasAlwaysTrueFormula(name) {
        return this.formulas.some(f => f.name === name && f.dataType === 'Boolean' && f.expression === 'true');
    }

    getFormulaExpression(name) {
        const result = this.formulas.find(f => f.name === name);
        return result.processMetadataValues.value.stringValue;
    }

    toArray = elements => {
        if (elements) {
            return Array.isArray(elements) ? elements : [elements];
        }
        return [];
    };
}

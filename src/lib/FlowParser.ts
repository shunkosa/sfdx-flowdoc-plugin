import { Flow, Decision, ActionCall, implementsActionCall, InputParamValue, IteratableFlow } from '../types/flow';
import {
    RecordCreate,
    RecordUpdate,
    implementsRecordCreate,
    implementsRecordUpdate,
    RecordLookup,
} from '../types/flowRecordAction';
import {
    convertToReadableActionCall,
    convertToReadableRecordCreate,
    convertToReadableRecordUpdate,
    getRecordLookupFilter,
} from './actionParser';
import { toArray } from './util/arrayUtils';
import { implementsProcessMetadataValue, ProcessMetadataValue } from '../types/processMetadataValue';
import { unescapeHtml } from './util/stringUtils';
import {
    ReadableProcess,
    ReadableCondition,
    ReadableActionGroup,
    ReadableDecision,
    ReadableActionItem,
    ReadableScheduledActionSection,
    ReadableWaitEventSummary,
} from '../types/parser';

export default class FlowParser {
    private readonly flow: IteratableFlow;

    private readonly name: string;

    constructor(flow: Flow, name: string) {
        this.flow = flow as IteratableFlow;
        this.name = name;

        for (const arrayName of [
            'processMetadataValues',
            'decisions',
            'actionCalls',
            'recordLookups',
            'formulas',
            'waits',
        ]) {
            this.flow[arrayName] = toArray(flow[arrayName]);
        }

        const rawRecordUpdates = toArray(this.flow.recordUpdates);
        this.flow.recordUpdates =
            rawRecordUpdates.length !== 0 ? rawRecordUpdates.map(a => ({ ...a, actionType: 'RECORD_UPDATE' })) : [];

        const rawRecordCreates = toArray(this.flow.recordCreates);
        this.flow.recordCreates =
            rawRecordCreates.length !== 0 ? rawRecordCreates.map(a => ({ ...a, actionType: 'RECORD_CREATE' })) : [];
    }

    isSupportedFlow() {
        return ['Workflow', 'CustomEvent', 'InvocableProcess'].includes(this.flow.processType);
    }

    getStartElement() {
        return this.flow.startElementReference;
    }

    getDecision(name: string) {
        return this.flow.decisions.find(d => d.name === name);
    }

    getRecordLookup(name: string): RecordLookup {
        return this.flow.recordLookups.find(r => r.name === name);
    }

    getStandardDecisions(): Array<Decision> {
        return this.flow.decisions
            .filter(d => d.processMetadataValues !== undefined)
            .sort((d1, d2) => {
                return (
                    Number(d1.processMetadataValues.value.numberValue) -
                    Number(d2.processMetadataValues.value.numberValue)
                );
            });
    }

    getActionExecutionCriteria(decision: Decision) {
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
                if (this.hasIsChangedCondition(condition.leftValueReference)) {
                    return 'CONDITIONS_ARE_MET';
                }
                return 'FORMULA_EVALUATES_TO_TRUE';
            }
        }
        return 'CONDITIONS_ARE_MET';
    }

    hasAlwaysTrueFormula(name) {
        return this.flow.formulas.some(f => f.name === name && f.dataType === 'Boolean' && f.expression === 'true');
    }

    hasIsChangedCondition(name) {
        return this.flow.decisions.some(d => d.rules && !Array.isArray(d.rules) && d.rules.name === name);
    }

    getIsChangedTargetField(name) {
        const rule = this.flow.decisions.find(d => d.rules && !Array.isArray(d.rules) && d.rules.name === name).rules;
        const targetCondition = rule.conditions.find(c => c.rightValue.elementReference !== undefined);
        return this.resolveValue(targetCondition.rightValue);
    }

    getActionSequence(actions: Array<ActionCall | RecordUpdate | RecordCreate>, nextActionName: string) {
        const nextAction = this.getAction(nextActionName);
        if (nextAction) {
            actions.push(nextAction);
            if (nextAction.connector) {
                this.getActionSequence(actions, nextAction.connector.targetReference);
            }
        } else if (actions.length === 0) {
            const pmDecision = this.getDecision(nextActionName);
            if (pmDecision) {
                const rules = toArray(pmDecision.rules);
                const connectedRule = rules.find(r => r.connector !== undefined);
                if (connectedRule) {
                    this.getActionSequence(actions, connectedRule.connector.targetReference);
                }
            }
        }
        return actions;
    }

    getAction(name: string): ActionCall | RecordCreate | RecordUpdate {
        return (
            this.flow.actionCalls.find(a => a.name === name) ||
            this.flow.recordCreates.find(a => a.name === name) ||
            this.flow.recordUpdates.find(a => a.name === name)
        );
    }

    resolveValue = (value: string | InputParamValue | ProcessMetadataValue) => {
        if (!value) {
            return '$GlobalConstant.null';
        }
        // Chatter Message
        if (implementsProcessMetadataValue(value)) {
            if (value.name === 'textJson') {
                return JSON.parse(unescapeHtml(value.value.stringValue)).message;
            }
            const key = Object.keys(value.value)[0];
            return value.value[key];
        }
        // String
        if (typeof value === 'string') {
            return this.replaceVariableNameToObjectName(value);
        }
        // Object
        const key = Object.keys(value)[0]; // stringValue or elementReference
        if (key === 'elementReference') {
            if (!value[key].includes('.')) {
                return this.getFormulaExpression(value[key]);
            }
            return this.replaceVariableNameToObjectName(value[key]);
        }
        return value[key];
    };

    getConditionType = condition => {
        if (condition.processMetadataValues) {
            return condition.processMetadataValues.find(p => p.name === 'rightHandSideType').value.stringValue;
        }
        return undefined;
    };

    getFormulaExpression(name) {
        const formula = this.flow.formulas.find(f => f.name === name);
        return formula ? formula.processMetadataValues.value.stringValue : undefined;
    }

    getDecisionFormulaExpression(decision: Decision): string {
        const formulaName = decision.rules.conditions.leftValueReference;
        const formulaExpression = this.getFormulaExpression(formulaName);
        return formulaExpression ? unescape(formulaExpression) : undefined;
    }

    getObjectVariable(name) {
        const variable = this.flow.variables.find(v => v.name === name);
        return variable.objectType;
    }

    replaceVariableNameToObjectName(string) {
        if (!string.includes('.')) {
            return string;
        }
        const variableName = string.split('.')[0];
        const objectName = this.getObjectVariable(variableName);
        return string.replace(variableName, `[${objectName}]`);
    }

    createReadableProcess(): ReadableProcess {
        const result: ReadableProcess = {
            name: this.name,
            label: this.getLabel(),
            processType: this.getProcessType(),
            objectType: this.getObjectType(),
            description: this.getDescription(),
            triggerType: this.getTriggerType(),
            eventType: this.getEventType(),
            eventMatchingConditions: this.getEventMatchingConditions(),
            actionGroups: this.getReadableActionGroups(),
        };
        return result;
    }

    getLabel() {
        return this.flow.label;
    }

    getProcessType() {
        return this.flow.processType;
    }

    getDescription() {
        return this.flow.description ? this.flow.description : '';
    }

    getObjectType() {
        return this.flow.processMetadataValues.find(p => p.name === 'ObjectType').value.stringValue;
    }

    /**
     * Returns trigger type (e.g., only in create, both create and edit) for workflow type process
     */
    getTriggerType() {
        const triggerTypePmv = this.flow.processMetadataValues.find(p => p.name === 'TriggerType');
        return triggerTypePmv ? triggerTypePmv.value.stringValue : undefined;
    }

    /**
     * Returns platform event type
     */
    getEventType() {
        const eventTypePmv = this.flow.processMetadataValues.find(p => p.name === 'EventType');
        return eventTypePmv ? eventTypePmv.value.stringValue : undefined;
    }

    /**
     * Returns matching condition for platform event based process
     */
    getEventMatchingConditions(): Array<ReadableCondition> {
        if (this.getProcessType() === 'CustomEvent') {
            const startElementName = this.getStartElement();
            const recordLookup = this.getRecordLookup(startElementName);
            return getRecordLookupFilter(this, recordLookup);
        }
        return undefined;
    }

    getReadableActionGroups(): Array<ReadableActionGroup> {
        const actionGroups: Array<ReadableActionGroup> = [];
        const decisions = this.getStandardDecisions();
        for (const d of decisions) {
            const actionGroup: ReadableActionGroup = {
                decision: this.convertToReadableDecision(d),
                evaluatesNext: false,
            };
            if (d.rules.connector) {
                const firstActionName = d.rules.connector.targetReference;
                const rawActions = this.getActionSequence([], firstActionName);
                actionGroup.actions = this.convertToReadableActionItems(rawActions);
                const lastRawAction = rawActions.slice(-1)[0];
                if (lastRawAction.connector) {
                    actionGroup.scheduledActionSections = this.getReadableScheduledActionSections(
                        lastRawAction.connector.targetReference
                    );
                    const nextDecision = this.getDecision(lastRawAction.connector.targetReference);
                    actionGroup.evaluatesNext = nextDecision && nextDecision.processMetadataValues !== undefined;
                }
            }
            actionGroups.push(actionGroup);
        }
        return actionGroups;
    }

    convertToReadableDecision(decision: Decision): ReadableDecision {
        const readableDecision: ReadableDecision = {
            label: decision.label,
            criteria: this.getActionExecutionCriteria(decision),
            conditionLogic: decision.rules.conditionLogic.toUpperCase(),
            conditions: this.getReadableDecisionConditions(decision),
        };
        if (readableDecision.criteria === 'FORMULA_EVALUATES_TO_TRUE') {
            readableDecision.formulaExpression = this.getDecisionFormulaExpression(decision);
        }
        return readableDecision;
    }

    getReadableDecisionConditions(decision: Decision): Array<ReadableCondition> {
        const rawConditions = toArray(decision.rules.conditions);
        const result: Array<ReadableCondition> = [];
        for (const c of rawConditions) {
            const leftValue = this.resolveValue(c.leftValueReference);
            const isChanged = leftValue.startsWith('isChanged'); // FIXME: This is a fragile implementation
            result.push({
                field: isChanged ? this.getIsChangedTargetField(leftValue) : leftValue,
                operator: isChanged ? 'ISCHANGED' : c.operator,
                type: this.getConditionType(c),
                value: this.resolveValue(c.rightValue),
            });
        }
        return result;
    }

    convertToReadableActionItems(actions: Array<ActionCall | RecordUpdate | RecordCreate>): Array<ReadableActionItem> {
        return actions.map(a => this.convertToReadableActionItem(a));
    }

    convertToReadableActionItem = (action: ActionCall | RecordCreate | RecordUpdate): ReadableActionItem => {
        if (implementsActionCall(action)) {
            return convertToReadableActionCall(this, action);
        }
        if (implementsRecordCreate(action)) {
            return convertToReadableRecordCreate(this, action);
        }
        if (implementsRecordUpdate(action)) {
            return convertToReadableRecordUpdate(this, action);
        }
        return undefined;
    };

    getReadableScheduledActionSections(waitName: string): Array<ReadableScheduledActionSection> {
        const wait = this.flow.waits.find(a => a.name === waitName);
        if (!wait) {
            return undefined;
        }
        const waitEvents = toArray(wait.waitEvents);
        const sections: Array<ReadableScheduledActionSection> = [];
        for (const waitEvent of waitEvents) {
            const waitEventSummary = this.getReadableWaitEventSummary(waitEvent);
            const waitEventActions = this.getWaitEventActions(
                waitEvent,
                Object.prototype.hasOwnProperty.call(waitEventSummary, 'field')
            );
            const section: ReadableScheduledActionSection = {
                summary: waitEventSummary,
                actions: this.convertToReadableActionItems(waitEventActions),
            };
            sections.push(section);
        }
        return sections;
    }

    getReadableWaitEventSummary = (waitEvent): ReadableWaitEventSummary => {
        const inputParams = toArray(waitEvent.inputParameters);
        const rawTimeOffset = Number(inputParams.find(i => i.name === 'TimeOffset').value.numberValue);
        const referencedFieldParam = inputParams.find(i => i.name === 'TimeFieldColumnEnumOrId');
        const summary: ReadableWaitEventSummary = {
            offset: Math.abs(rawTimeOffset),
            isAfter: rawTimeOffset > 0,
            unit: inputParams.find(i => i.name === 'TimeOffsetUnit').value.stringValue,
        };
        if (referencedFieldParam) {
            summary.field = referencedFieldParam.value.stringValue;
        }
        return summary;
    };

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
}

import {
    Flow,
    Decision,
    ScheduledActionSection,
    WaitEventSummary,
    ActionCall,
    implementsActionCall,
    InputParamValue,
    IteratableFlow,
} from '../types/flow';
import {
    RecordCreate,
    RecordUpdate,
    implementsRecordCreate,
    implementsRecordUpdate,
    RecordLookup,
} from '../types/flowRecordAction';
import { getActionCallDetail, getRecordCreateDetail, getRecordUpdateDetail } from './actionParser';
import { toArray } from './arrayUtils';

export default class FlowParser {
    private readonly flow: IteratableFlow;

    constructor(flow: Flow) {
        this.flow = flow as IteratableFlow;

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
        return ['Workflow', 'CustomEvent'].includes(this.flow.processType);
    }

    getProcessType() {
        return this.flow.processType;
    }

    getLabel() {
        return this.flow.label;
    }

    getEventType() {
        return this.flow.processMetadataValues.find(p => p.name === 'EventType').value.stringValue;
    }

    getObjectType() {
        return this.flow.processMetadataValues.find(p => p.name === 'ObjectType').value.stringValue;
    }

    getTriggerType() {
        return this.flow.processMetadataValues.find(p => p.name === 'TriggerType').value.stringValue;
    }

    getStartElement() {
        return this.flow.startElementReference;
    }

    getDecision(name: string) {
        return this.flow.decisions.find(d => d.name === name);
    }

    getAction(name: string): ActionCall | RecordUpdate | RecordCreate {
        return (
            this.flow.actionCalls.find(a => a.name === name) ||
            this.flow.recordCreates.find(a => a.name === name) ||
            this.flow.recordUpdates.find(a => a.name === name)
        );
    }

    getRecordLookup(name: string): RecordLookup {
        return this.flow.recordLookups.find(r => r.name === name);
    }

    getStandardDecisions(): Decision[] {
        return this.flow.decisions
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

    hasAlwaysTrueFormula(name) {
        return this.flow.formulas.some(f => f.name === name && f.dataType === 'Boolean' && f.expression === 'true');
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
                const rules = toArray(pmDecision.rules);
                const connectedRule = rules.find(r => r.connector !== undefined);
                if (connectedRule) {
                    this.getActionSequence(actions, connectedRule.connector.targetReference);
                }
            }
        }
        return actions;
    }

    getActionDetail = (action: ActionCall | RecordCreate | RecordUpdate) => {
        if (implementsActionCall(action)) {
            return getActionCallDetail(this, action);
        }
        if (implementsRecordCreate(action)) {
            return getRecordCreateDetail(this, action);
        }
        if (implementsRecordUpdate(action)) {
            return getRecordUpdateDetail(this, action);
        }
        return { rows: [] };
    };

    getScheduledActionSections(waitName) {
        const wait = this.flow.waits.find(a => a.name === waitName);
        if (!wait) {
            return undefined;
        }
        const waitEvents = toArray(wait.waitEvents);
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

    getWaitEventSummary = (waitEvent): WaitEventSummary => {
        const inputParams = toArray(waitEvent.inputParameters);
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

    resolveValue = (value: string | InputParamValue) => {
        if (!value) {
            return '$GlobalConstant.null';
        }
        // String
        if (typeof value === 'string') {
            if (value.includes('myVariable_current')) {
                return value.replace('myVariable_current', `[${this.getObjectType()}]`);
            }
            return value;
        }
        // Object
        const key = Object.keys(value)[0]; // stringValue or elementReference
        if (key === 'elementReference') {
            if (!value[key].includes('.')) {
                return this.getFormulaExpression(value[key]);
            }
            if (value[key].includes('myVariable_current')) {
                return value[key].replace('myVariable_current', `[${this.getObjectType()}]`);
            }
        }
        return value[key];
    };

    getFormulaExpression(name) {
        const result = this.flow.formulas.find(f => f.name === name);
        return result.processMetadataValues.value.stringValue;
    }
}

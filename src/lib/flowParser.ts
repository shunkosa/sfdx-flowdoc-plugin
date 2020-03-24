import { Flow, ScheduledActionSection, WaitEventSummary } from '../types/flow';

export default class FlowParser {
    private readonly flow: Flow;

    private readonly processMetadataValues;

    private readonly decisions;

    private readonly processActions;

    private readonly formulas;

    private readonly waits;

    constructor(flow: Flow) {
        this.flow = flow;
        
        this.processMetadataValues = this.toArray(this.flow.processMetadataValues);
    
        this.decisions = this.toArray(this.flow.decisions);

        const actions = this.toArray(this.flow.actionCalls);
        const rawRecordUpdates = this.toArray(this.flow.recordUpdates);
        const recordUpdates = rawRecordUpdates.map(a => ({...a, actionType: 'RECORD_UPDATE'}));
        const rawRecordCreates = this.toArray(this.flow.recordCreates);
        const recordCreates = rawRecordCreates.map(a => ({...a, actionType: 'RECORD_CREATE'}))
        this.processActions =[...actions, ...recordUpdates, ...recordCreates];

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
    
    getStandardDecisions() {
        return this.decisions
                .filter(d => d.processMetadataValues !== undefined)
                .sort((d1, d2) => {
                    return Number(d1.processMetadataValues.value.numberValue) - Number(d2.processMetadataValues.value.numberValue);
                });
    }
    
    getActionExecutionCriteria(decision) {
        if (!Array.isArray(decision.rules.conditions)) {
            const condition = decision.rules.conditions;
            if (condition.operator === 'EqualTo' 
                && condition.rightValue.booleanValue
                && condition.rightValue.booleanValue === 'true') {
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
            if(pmDecision) {
                const rules = this.toArray(pmDecision.rules);
                const connectedRule = rules.find(r => r.connector !== undefined);
                this.getActionSequence(actions, connectedRule.connector.targetReference);
            }
        }
        return actions;
    }

    getDecision(name) {
        return this.decisions.find(d => d.name === name);
    }

    getAction(name) {
        return this.processActions.find(a => a.name === name);
    }

    getScheduledActionSections(waitName) {
        const wait = this.waits.find(a => a.name === waitName);
        if (!wait) {
            return undefined;
        }
        const waitEvents = this.toArray(wait.waitEvents);
        const sections: ScheduledActionSection[] = [];
        for(const waitEvent of waitEvents) {
            const waitEventSummary = this.getWaitEventSummary(waitEvent);
            const section: ScheduledActionSection = {
                wait: waitEventSummary,
                actions: this.getWaitEventActions(waitEvent, Object.prototype.hasOwnProperty.call(waitEventSummary, 'field'))
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
        return this.formulas.some(f => f.name === name && f.dataType === 'Boolean' && f.expression === 'true' );
    }
    
    getFormulaExpression(name) {
        const result = this.formulas.find(f => f.name === name );
        return result.processMetadataValues.value.stringValue;
    }

    toArray = (elements) => {
        return Array.isArray(elements) ? elements : [elements];
    }
}
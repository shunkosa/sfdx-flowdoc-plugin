import ReadableMetadata from '../readableMetadata';
import {
    ReadableActionGroup,
    ReadableCondition,
    ReadableActionItem,
    ReadableScheduledActionSection,
    ReadableWaitEventSummary,
    ReadableProcessDecision,
} from '../../../types/converter/process';
import { ActionCall, implementsActionCall, Decision } from '../../../types/metadata/flow';
import {
    getRecordLookupFilter,
    convertToReadableActionCall,
    convertToReadableRecordCreate,
    convertToReadableRecordUpdate,
} from './actionParser';
import {
    RecordUpdate,
    RecordCreate,
    implementsRecordCreate,
    implementsRecordUpdate,
} from '../../../types/metadata/flowRecordAction';
import { toArray } from '../../util/arrayUtils';

export default class ReadableProcessMetadata extends ReadableMetadata {
    createReadableProcess() {
        return {
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
    }

    /**
     * Returns matching condition for platform event based process
     */
    private getEventMatchingConditions(): Array<ReadableCondition> {
        if (this.getProcessType() === 'CustomEvent') {
            const startElementName = this.getStartElementName();
            const recordLookup = this.getRecordLookup(startElementName);
            return getRecordLookupFilter(this, recordLookup);
        }
        return undefined;
    }

    /**
     * Returns readable action group (decision and actions) based on the metadata
     * @returns {Array<ReadableActionGroup>}
     */
    private getReadableActionGroups(): Array<ReadableActionGroup> {
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

    /* Decisions */
    private getStandardDecisions(): Array<Decision> {
        return this.flow.decisions
            .filter(d => d.processMetadataValues !== undefined)
            .sort((d1, d2) => {
                return (
                    Number(d1.processMetadataValues.value.numberValue) -
                    Number(d2.processMetadataValues.value.numberValue)
                );
            });
    }

    private convertToReadableDecision(decision: Decision): ReadableProcessDecision {
        const readableDecision: ReadableProcessDecision = {
            label: decision.rules.label,
            criteria: this.getActionExecutionCriteria(decision),
            conditionLogic: decision.rules.conditionLogic.toUpperCase(),
            conditions: this.getReadableDecisionConditions(decision),
        };
        if (readableDecision.criteria === 'FORMULA_EVALUATES_TO_TRUE') {
            readableDecision.formulaExpression = this.getDecisionFormulaExpression(decision);
        }
        return readableDecision;
    }

    private getReadableDecisionConditions(decision: Decision): Array<ReadableCondition> {
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

    private getDecisionFormulaExpression(decision: Decision): string {
        const formulaName = decision.rules.conditions.leftValueReference;
        const formulaExpression = this.getFormulaExpression(formulaName);
        return formulaExpression ? unescape(formulaExpression) : undefined;
    }

    private getActionExecutionCriteria(decision: Decision) {
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

    private hasIsChangedCondition(name) {
        return this.flow.decisions.some(d => d.rules && !Array.isArray(d.rules) && d.rules.name === name);
    }

    private getIsChangedTargetField(name) {
        const rule = this.flow.decisions.find(d => d.rules && !Array.isArray(d.rules) && d.rules.name === name).rules;
        const targetCondition = rule.conditions.find(c => c.rightValue.elementReference !== undefined);
        return this.resolveValue(targetCondition.rightValue);
    }

    private getConditionType = condition => {
        if (condition.processMetadataValues) {
            return condition.processMetadataValues.find(p => p.name === 'rightHandSideType').value.stringValue;
        }
        return undefined;
    };

    /**
     * Check if the given formula has always return true. This method is used in 'no criteria' decision.
     */
    private hasAlwaysTrueFormula(name) {
        return this.flow.formulas.some(f => f.name === name && f.dataType === 'Boolean' && f.expression === 'true');
    }

    /* Actions */
    private getActionSequence(actions: Array<ActionCall | RecordUpdate | RecordCreate>, nextActionName: string) {
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

    private getAction(name: string): ActionCall | RecordCreate | RecordUpdate {
        return (
            this.flow.actionCalls.find(a => a.name === name) ||
            this.flow.recordCreates.find(a => a.name === name) ||
            this.flow.recordUpdates.find(a => a.name === name)
        );
    }

    private convertToReadableActionItems(
        actions: Array<ActionCall | RecordUpdate | RecordCreate>
    ): Array<ReadableActionItem> {
        return actions.map(a => this.convertToReadableActionItem(a));
    }

    private convertToReadableActionItem = (action: ActionCall | RecordCreate | RecordUpdate): ReadableActionItem => {
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

    /* Scheduled Actions */
    private getReadableScheduledActionSections(waitName: string): Array<ReadableScheduledActionSection> {
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

    private getReadableWaitEventSummary = (waitEvent): ReadableWaitEventSummary => {
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

    private getWaitEventActions(waitEvent, comparedToField) {
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

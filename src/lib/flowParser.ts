import { Flow } from '../types/flow';

export default class FlowParser {
    
    constructor(private flow: Flow) {
        this.flow = flow;
        if(this.flow.processType !== 'Workflow') {
            throw new Error('Only object process is supported.');
        }
    }

    getLabel() {
        return this.flow.label;
    }

    getObjectType() {
        const pmvs = Array.isArray(this.flow.processMetadataValues) ? this.flow.processMetadataValues : [this.flow.processMetadataValues];
        return pmvs.find(p => p.name === 'ObjectType').value.stringValue;
    }
    
    getTriggerType() {
        const pmvs = Array.isArray(this.flow.processMetadataValues) ? this.flow.processMetadataValues : [this.flow.processMetadataValues];
        return pmvs.find(p => p.name === 'TriggerType').value.stringValue;
    }
    
    getStandardDecisions() {
        if(Array.isArray(this.flow.decisions)) {
            return this.flow.decisions
                .filter(d => d.processMetadataValues != null)
                .sort((d1, d2) => {
                    return Number(d1.processMetadataValues.value.numberValue) - Number(d2.processMetadataValues.value.numberValue);
                });
        }
        return [this.flow.decisions];
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
    
    getAction(name) {
        const actions = Array.isArray(this.flow.actionCalls) ? this.flow.actionCalls : [this.flow.actionCalls];
        return actions.find(a => a.name === name);
    }

    /*
    getRecordUpdate(name) {
        return '';
    }

    getRecordCreate(name) {
        return '';
    }
    */

    hasAlwaysTrueFormula(name) {
        const formulas = Array.isArray(this.flow.formulas) ? this.flow.formulas : [this.flow.formulas];
        return formulas.some(f => f.name === name && f.dataType === 'Boolean' && f.expression === 'true' 
        );
    }
    
    getFormulaExpression(name) {
        const formulas = Array.isArray(this.flow.formulas) ? this.flow.formulas : [this.flow.formulas];
        const result = formulas.find(f => f.name === name );
        return result.processMetadataValues.value.stringValue;
    }
}
import { InputParamValue, Flow } from '../../types/metadata/flow';
import { IteratableFlow } from '../../types/converter/main';
import { RecordLookup } from '../../types/metadata/flowRecordAction';
import { implementsProcessMetadataValue, ProcessMetadataValue } from '../../types/metadata/processMetadataValue';
import { unescapeHtml } from '../util/stringUtils';
import convertToIteratableMetadata from './iteratableMetadata';
import { isProcess } from '../util/flowUtils';

export default class ReadableMetadata {
    protected readonly flow: IteratableFlow;

    protected readonly name: string;

    protected readonly isProcess: boolean;

    constructor(flow: Flow, name: string) {
        this.flow = convertToIteratableMetadata(flow);
        this.name = name;
        this.isProcess = isProcess(flow);
    }

    /**
     * @return {string} Returns display label of the flow
     */
    public getLabel(): string {
        return this.flow.label;
    }

    /**
     * @return {strign} Returns type of the flow / process
     */
    protected getProcessType() {
        return this.flow.processType;
    }

    /**
     * @return {string} Returns flow description
     */
    protected getDescription() {
        return this.flow.description ? this.flow.description : '';
    }

    /**
     * @return {string} Returns sObject type of the flow
     */
    protected getObjectType() {
        return this.flow.processMetadataValues.find(p => p.name === 'ObjectType').value.stringValue;
    }

    /**
     * @return {string} Returns trigger type
     */
    protected getTriggerType() {
        const triggerTypePmv = this.flow.processMetadataValues.find(p => p.name === 'TriggerType');
        return triggerTypePmv ? triggerTypePmv.value.stringValue : undefined;
    }

    /**
     * @retuns {string} Returns platform event type
     */
    protected getEventType() {
        const eventTypePmv = this.flow.processMetadataValues.find(p => p.name === 'EventType');
        return eventTypePmv ? eventTypePmv.value.stringValue : undefined;
    }

    /**
     * @returns {string} Returns name of start element
     */
    protected getStartElementName() {
        return this.flow.startElementReference;
    }

    protected getDecision(name: string) {
        return this.flow.decisions.find(d => d.name === name);
    }

    protected getRecordLookup(name: string): RecordLookup {
        return this.flow.recordLookups.find(r => r.name === name);
    }

    /**
     * @returns {string} Returns formula expression
     */
    protected getFormulaExpression(name) {
        const formula = this.flow.formulas.find(f => f.name === name);
        return formula ? formula.processMetadataValues.value.stringValue : undefined;
    }

    private getObjectVariable(name) {
        const variable = this.flow.variables.find(v => v.name === name);
        return variable.objectType;
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
                // reference to formula
                return this.getFormulaExpression(value[key]);
            }
            return this.replaceVariableNameToObjectName(value[key]);
        }
        return value[key];
    };

    // for process builder
    private replaceVariableNameToObjectName(string) {
        if (!string.includes('.') || !this.isProcess) {
            return string;
        }
        const variableName = string.split('.')[0];
        const objectName = this.getObjectVariable(variableName);
        return string.replace(variableName, `[${objectName}]`);
    }
}

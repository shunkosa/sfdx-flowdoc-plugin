import { ProcessMetadataValue } from '../metadata/processMetadataValue';
import { Variable, Decision, ActionCall } from '../metadata/flow';
import { RecordUpdate, RecordCreate, RecordLookup, RecordDelete } from '../metadata/flowRecordAction';

/**
 * Flow which has array parameters to find elements using prototype.array methods.
 * (explicit array option is too redundant for a complex flow)
 */
export interface IteratableFlow {
    processType: string;
    label: string;
    description: string;
    startElementReference?: string;
    variables: Array<Variable>;
    processMetadataValues: Array<ProcessMetadataValue>;
    formulas: any;
    decisions: Array<Decision>;
    assignments?: any;
    actionCalls?: Array<ActionCall>;
    recordUpdates?: Array<RecordUpdate>;
    recordCreates?: Array<RecordCreate>;
    recordLookups?: Array<RecordLookup>;
    recordDeletes?: Array<RecordDelete>;
    loops?: any;
    waits: any;
    start?: any;
}

/**
 * Base flow element
 */
export interface ReadableFlowElement {
    type: string;
    name: string;
    label: string;
    description?: string;
}

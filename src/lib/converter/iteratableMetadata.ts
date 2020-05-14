import { toArray } from '../util/arrayUtils';
import { Flow } from '../../types/metadata/flow';
import { IteratableFlow } from '../../types/converter';

export default function convertToIteratableMetadata(flow: Flow): IteratableFlow {
    return {
        processType: flow.processType,
        label: flow.label,
        description: flow.description,
        startElementReference: flow.startElementReference,
        variables: toArray(flow.variables),
        formulas: toArray(flow.formulas),
        waits: toArray(flow.waits),
        start: flow.start,
        processMetadataValues: toArray(flow.processMetadataValues),
        assignments: toArray(flow.assignments),
        loops: toArray(flow.loops),
        decisions: toArray(flow.decisions),
        actionCalls: toArray(flow.actionCalls),
        recordLookups: toArray(flow.recordLookups),
        recordCreates:
            toArray(flow.recordCreates).length > 0
                ? toArray(flow.recordCreates).map(action => ({ ...action, actionType: 'recordCreate' }))
                : [],
        recordUpdates:
            toArray(flow.recordUpdates).length > 0
                ? toArray(flow.recordUpdates).map(action => ({ ...action, actionType: 'recordUpdate' }))
                : [],
        recordDeletes:
            toArray(flow.recordDeletes).length > 0
                ? toArray(flow.recordDeletes).map(action => ({ ...action, actionType: 'recordDelete' }))
                : [],
    };
}

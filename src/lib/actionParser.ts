import { ActionCall, InputParamValue } from '../types/flow';
import { RecordCreate, RecordUpdate, RecordFilter, RecordLookup } from '../types/flowRecordAction';
import { toArray } from './arrayUtils';
import { ProcessMetadataValue } from '../types/processMetadataValue';

const layout = require('./actionLayout.json');

export function getActionCallDetail(flowParser, action: ActionCall) {
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
            let isMatched = true;
            for (const k of keys) {
                const param = action[k.type].find(p => p.name === k.name);
                isMatched = isMatched && (param && param.value ? param.value[k.valueType] === k.value : false);
            }
            if (isMatched) {
                targetLayout = l;
                break;
            }
        }
    }
    const actionPmvs = toArray(action.processMetadataValues);
    const actionInputs = toArray(action.inputParameters);

    const rows = [];

    for (const m of toArray(targetLayout.structure.metadata)) {
        rows.push({
            name: m.name,
            value: actionPmvs.find(pmv => pmv.name === m.name).value[m.type],
        });
    }
    for (const param of toArray(targetLayout.structure.params)) {
        const inputParamValue: InputParamValue = {};
        const inputParam = actionInputs.find(i => i.name === param.name);
        inputParamValue[param.type] = inputParam.value ? inputParam.value[param.type] : '';
        rows.push({
            name: param.name,
            value: flowParser.resolveValue(inputParamValue),
        });
    }

    if (targetLayout.structure.hasFields) {
        const params = toArray(action.inputParameters);
        const fields = [];
        for (const i of params) {
            const field = i.processMetadataValues.find(ap => ap.name === 'leftHandSideLabel').value.stringValue;
            const type = i.processMetadataValues.find(ap => ap.name === 'dataType').value.stringValue;
            const value = flowParser.resolveValue(i.value);
            fields.push([field, type, value]);
        }
        return { rows, fields };
    }
    return { rows };
}

export function getRecordCreateDetail(flowParser, action: RecordCreate) {
    const recordType = action.object;

    const assignments = toArray(action.inputAssignments);
    const fields = [];
    for (const a of assignments) {
        const field = a.processMetadataValues.find(ap => ap.name === 'leftHandSideLabel').value.stringValue;
        const type = a.processMetadataValues.find(ap => ap.name === 'rightHandSideType').value.stringValue;
        const value = flowParser.resolveValue(a.value);
        fields.push([field, type, value]);
    }

    return {
        rows: [{ name: 'recordType', value: recordType }],
        fields,
    };
}

export function getRecordUpdateDetail(flowParser, action: RecordUpdate) {
    const pmvs = toArray<ProcessMetadataValue>(action.processMetadataValues);
    const record = pmvs.find(p => p.name === 'reference').value.stringValue;

    const assignments = toArray(action.inputAssignments);
    const fields = [];
    for (const a of assignments) {
        const field = a.processMetadataValues.find(ap => ap.name === 'leftHandSideLabel').value.stringValue;
        const type = a.processMetadataValues.find(ap => ap.name === 'rightHandSideType').value.stringValue;
        const value = flowParser.resolveValue(a.value);
        fields.push([field, type, value]);
    }

    const explicitFilters = toArray(action.filters).filter(f => isExplicit(f));
    const filters = [];
    for (const f of explicitFilters) {
        const field = f.processMetadataValues.find(ap => ap.name === 'leftHandSideLabel').value.stringValue;
        const type = f.processMetadataValues.find(ap => ap.name === 'rightHandSideType').value.stringValue;
        const value = flowParser.resolveValue(f.value);
        filters.push([field, type, value]);
    }

    return {
        rows: [{ name: 'record', value: record }],
        fields,
        filters,
    };
}

function isExplicit(filter: RecordFilter) {
    const pmvs = toArray<ProcessMetadataValue>(filter.processMetadataValues);
    return pmvs.find(p => p.name === 'implicit').value.booleanValue === 'false';
}

export function getRecordLookupFilter(flowParser, action: RecordLookup) {
    const explicitFilters = toArray(action.filters).filter(f => isExplicit(f));
    const filters = [];
    for (const f of explicitFilters) {
        const field = f.processMetadataValues.find(ap => ap.name === 'leftHandSideLabel').value.stringValue;
        const type = f.processMetadataValues.find(ap => ap.name === 'rightHandSideType').value.stringValue;
        const operator = f.processMetadataValues.find(ap => ap.name === 'rightHandSideType').value.stringValue;
        const value = flowParser.resolveValue(f.value);
        filters.push([field, operator, type, value]);
    }
    return filters;
}

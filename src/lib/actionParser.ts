import { ActionCall } from '../types/flow';
import { RecordCreate, RecordUpdate } from '../types/flowRecordAction';
import { toArray } from './arrayUtils';

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
        rows.push({
            name: param.name,
            value: actionInputs.find(i => i.name === param.name).value[param.type],
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

export function getRecordUpdateDetail(action: RecordUpdate) {
    return { rows: [] };
}

export default { getActionCallDetail, getRecordCreateDetail, getRecordUpdateDetail };

/* eslint-disable no-param-reassign */
import i18n from '../../config/i18n';
import { ReadableProcess } from '../../types/parser';
import { toUpperSnakeCase } from '../util/stringUtils';

export default function buildLocalizedJson(flow: ReadableProcess, locale: string) {
    const _i18n = i18n(locale);

    if (flow.processType === 'Workflow') {
        flow.triggerType =
            flow.triggerType === 'onAllChanges'
                ? _i18n.__('WHEN_A_RECORD_IS_CREATED_OR_EDITED')
                : _i18n.__('ONLY_WHEN_A_RECORD_IS_CREATED');
    }

    if (flow.actionGroups) {
        for (const actionGroup of flow.actionGroups) {
            actionGroup.decision.criteria = _i18n.__(actionGroup.decision.criteria);
            if (actionGroup.actions) {
                for (const action of actionGroup.actions) {
                    if (action.details) {
                        for (const detail of action.details) {
                            detail.name = _i18n.__(
                                `ACTION_DETAIL_${toUpperSnakeCase(action.type)}_${toUpperSnakeCase(detail.name)}`
                            );
                        }
                    }
                    action.type = _i18n.__(`ACTION_TYPE_${toUpperSnakeCase(action.type)}`);
                }
            }
        }
    }
    return flow;
}

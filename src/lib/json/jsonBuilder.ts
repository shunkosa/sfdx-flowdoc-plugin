/* eslint-disable no-param-reassign */
import i18n from '../../config/i18n';
import { toUpperSnakeCase } from '../util/stringUtils';
import {
    DocumentBuilder,
    ReadableFlowMetadataConverter,
    ReadableProcessMetadataConverter,
} from '../converter/metadataConverter';

export default class JsonBuilder extends DocumentBuilder {
    i18n = i18n(this.locale);

    buildFlowDocument(converter: ReadableFlowMetadataConverter) {
        // TODO: translate labels
        console.log(`building json... ${this.i18n}`);
        return converter.readableMetadata;
    }

    buildProcessDocument(converter: ReadableProcessMetadataConverter) {
        const flow = converter.readableMetadata;
        if (flow.processType === 'Workflow') {
            flow.triggerType =
                flow.triggerType === 'onAllChanges'
                    ? this.i18n.__('WHEN_A_RECORD_IS_CREATED_OR_EDITED')
                    : this.i18n.__('ONLY_WHEN_A_RECORD_IS_CREATED');
        }

        if (flow.actionGroups) {
            for (const actionGroup of flow.actionGroups) {
                actionGroup.decision.criteria = this.i18n.__(actionGroup.decision.criteria);
                if (actionGroup.actions) {
                    for (const action of actionGroup.actions) {
                        if (action.details) {
                            for (const detail of action.details) {
                                detail.name = this.i18n.__(
                                    `ACTION_DETAIL_${toUpperSnakeCase(action.type)}_${toUpperSnakeCase(detail.name)}`
                                );
                            }
                        }
                        action.type = this.i18n.__(`ACTION_TYPE_${toUpperSnakeCase(action.type)}`);
                    }
                }
            }
        }
        return flow;
    }
}

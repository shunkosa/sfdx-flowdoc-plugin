import ReadableMetadata from '../readableMetadata';
import {
    ReadableFlow,
    ReadableAssignmentItem,
    ReadableAssignment,
    ReadableFlowBuilderItem,
    ReadableLoop,
    ReadableFlowDecisionRoute,
    ReadableFlowDecision,
    ReadableRecordLookup,
} from '../../../types/converter/flow';
import {
    Flow,
    FlowBuilderItem,
    implementsAssignment,
    Assignment,
    AssignmentItem,
    Loop,
    implementsLoop,
    implementsDecision,
    Decision,
} from '../../../types/metadata/flow';
import { toArray } from '../../util/arrayUtils';
import ReadableFlowStartElement from './readableFlowStart';
import { RecordLookup, implementsRecordLookup } from '../../../types/metadata/flowRecordAction';

export default class ReadableFlowMetadata extends ReadableMetadata {
    flowBuilderItems: ReadonlyArray<FlowBuilderItem>;

    visitedItemNameSet: Set<string>;

    constructor(flow: Flow, name: string) {
        super(flow, name);
        this.flowBuilderItems = [
            ...this.flow.actionCalls,
            ...this.flow.assignments,
            ...this.flow.loops,
            ...this.flow.decisions,
            ...this.flow.recordLookups,
            ...this.flow.recordCreates,
            ...this.flow.recordUpdates,
            ...this.flow.recordDeletes,
        ];
        this.visitedItemNameSet = new Set<string>();
    }

    createReadableFlow(): ReadableFlow {
        const start = new ReadableFlowStartElement(this.flow);

        return {
            name: this.name,
            label: this.getLabel(),
            processType: this.getProcessType(),
            description: this.getDescription(),
            start: start.getReadableElement(),
            elements: this.getReadableFlowElements([], this.getFirstElementName()),
        };
    }

    private getFirstElementName() {
        return this.flow.start.connector ? this.flow.start.connector.targetReference : undefined;
    }

    // Array<ReadableFlowBuilderItem>
    private getReadableFlowElements(
        currentElements: Array<any>,
        targetReference: string
    ): Array<ReadableFlowBuilderItem> {
        if (!targetReference) {
            return currentElements;
        }
        const nextElement = this.flowBuilderItems.find(e => e.name === targetReference);
        if (nextElement) {
            this.visitedItemNameSet.add(nextElement.name);
            // Get the details of element and find next. Elements inside loop and decision results are traced in each convert method.
            let nextReference;
            if (implementsLoop(nextElement)) {
                nextReference = nextElement.noMoreValuesConnector
                    ? nextElement.noMoreValuesConnector.targetReference
                    : undefined;
                currentElements.push(this.convertToReadableLoop(nextElement));
            } else if (implementsDecision(nextElement)) {
                currentElements.push(this.convertToReadableDecision(nextElement));
            } else {
                nextReference = nextElement.connector ? nextElement.connector.targetReference : undefined;
                currentElements.push(this.convertToReadableFlowElement(nextElement));
            }
            this.getReadableFlowElements(currentElements, nextReference);
        }
        return currentElements;
    }

    private convertToReadableFlowElement(flowBuilderItem: FlowBuilderItem): ReadableFlowBuilderItem {
        if (implementsAssignment(flowBuilderItem)) {
            return this.convertToReadableAssingment(flowBuilderItem);
        }
        if (implementsRecordLookup(flowBuilderItem)) {
            return this.convertToReadableRecordLookup(flowBuilderItem);
        }
        return undefined;
    }

    private convertToReadableDecision(decision: Decision): ReadableFlowDecision {
        const defaultRoute: ReadableFlowDecisionRoute = {
            name: decision.defaultConnectorLabel,
            label: undefined,
            elements: this.traceDecisionRouteElements([], decision.defaultConnector.targetReference),
        };
        const rules = toArray(decision.rules);
        const ruleRoutes: Array<ReadableFlowDecisionRoute> = [];
        for (const rule of rules) {
            if (rule.connector) {
                ruleRoutes.push({
                    name: rule.name,
                    label: rule.label,
                    elements: this.traceDecisionRouteElements([], rule.connector.targetReference),
                });
            }
        }
        return {
            type: 'decision',
            name: decision.name,
            label: decision.label,
            routes: [defaultRoute, ...ruleRoutes],
        };
    }

    private traceDecisionRouteElements(
        routeElements: Array<any>,
        targetReference: string
    ): Array<ReadableFlowBuilderItem> {
        if (!targetReference || this.visitedItemNameSet.has(targetReference)) {
            return routeElements;
        }
        const nextElement = this.flowBuilderItems.find(e => e.name === targetReference);
        if (nextElement) {
            routeElements.push({ label: nextElement.label, name: nextElement.name });
            let nextReference;
            if (implementsLoop(nextElement)) {
                nextReference = nextElement.noMoreValuesConnector
                    ? nextElement.noMoreValuesConnector.targetReference
                    : undefined;
            } else if (implementsDecision(nextElement)) {
                nextReference = nextElement.defaultConnector ? nextElement.defaultConnector.targetReference : undefined;
            } else {
                nextReference = nextElement.connector ? nextElement.connector.targetReference : undefined;
            }
            this.traceDecisionRouteElements(routeElements, nextReference);
        }
        return routeElements;
    }

    private convertToReadableAssingment(assignment: Assignment): ReadableAssignment {
        const assignments: Array<ReadableAssignmentItem> = toArray<AssignmentItem>(assignment.assignmentItems).map(
            item => ({
                reference: item.assignToReference,
                operator: item.operator,
                value: this.resolveValue(item.value),
            })
        );
        return {
            type: 'assignment',
            name: assignment.name,
            label: assignment.label,
            description: assignment.description,
            assignments,
        };
    }

    private convertToReadableLoop(loop: Loop): ReadableLoop {
        const elements = loop.nextValueConnector
            ? this.getReadableFlowElements([], loop.nextValueConnector.targetReference)
            : [];
        return {
            type: 'loop',
            name: loop.name,
            label: loop.label,
            description: loop.description,
            elements,
        };
    }

    private convertToReadableRecordLookup(lookup: RecordLookup): ReadableRecordLookup {
        return {
            type: 'lookup',
            name: lookup.name,
            label: lookup.label,
            object: lookup.object,
            filterCondition: lookup.filters ? 'MEET_ALL_CONDITIONS' : 'NONE',
            filters: this.getReadableFlowRecordLookupFilters(lookup.filters),
            sortBy: {
                order: lookup.sortOrder ? lookup.sortOrder.toUpperCase() : 'NONE',
            },
            numberOfRecords: lookup.getFirstRecordOnly ? 'ONLY_FIRST' : 'ALL',
            output: {
                method: lookup.storeOutputAutomatically ? 'ALL_FIELDS' : undefined,
            },
        };
    }

    getReadableFlowRecordLookupFilters = filters => {
        if (!filters) {
            return undefined;
        }
        return toArray(filters).map(f => ({
            field: f.field,
            operator: f.operator,
            value: this.resolveValue(f.value),
        }));
    };
}

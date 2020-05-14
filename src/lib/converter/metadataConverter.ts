import { Flow } from '../../types/metadata/flow';
import { ReadableProcess, ReadableFlow } from '../../types/converter';
import ReadableFlowMetadata from './helper/readableFlow';
import ReadableProcessMetadata from './helper/readableProcess';

interface MetadataConverter {
    accept(builder: DocumentBuilder);
}

export class ReadableFlowMetadataConverter implements MetadataConverter {
    readableMetadata: ReadableFlow;

    constructor(flow: Flow, name: string) {
        const metadataConverter = new ReadableFlowMetadata(flow, name);
        this.readableMetadata = metadataConverter.createReadableFlow();
    }

    accept(builder: DocumentBuilder) {
        return builder.visit(this);
    }
}

export class ReadableProcessMetadataConverter implements MetadataConverter {
    readableMetadata: ReadableProcess;

    constructor(flow: Flow, name: string) {
        const metadataConverter = new ReadableProcessMetadata(flow, name);
        this.readableMetadata = metadataConverter.createReadableProcess();
    }

    accept(builder: DocumentBuilder) {
        return builder.visit(this);
    }
}

interface DocumentBuilder {
    visit(parser: ReadableFlowMetadataConverter);
    visit(parser: ReadableProcessMetadataConverter);
}

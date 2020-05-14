import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import * as fs from 'fs-extra';
import * as docx from 'docx';

import { Flow } from '../../../types/metadata/flow';
import {
    ReadableProcessMetadataConverter,
    ReadableFlowMetadataConverter,
} from '../../../lib/converter/metadataConverter';
import { isSupported, isProcess } from '../../../lib/util/flowUtils';
import DocxBuilder from '../../../lib/docx/docxBuilder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sfdx-flowdoc-plugin', 'messages');

const API_VERSION = '48.0';
export default class Generate extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx flowdoc:docx:generate Example
  Retrieving the process metadata... done
  Documentation of 'Example' flow is successfully generated.
  `,
        `$ sfdx flowdoc:docx:generate Example -l ja
  Retrieving the process metadata... done
  Documentation of 'Example' flow is successfully generated.
  `,
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        locale: flags.string({ char: 'l', description: messages.getMessage('localeFlagDescription') }),
        outdir: flags.string({ char: 'o', description: messages.getMessage('outdirFlagDescription') }),
    };

    protected static requiresUsername = true;

    protected static requiresProject = true;

    public async run(): Promise<any> {
        if (!this.args.file) {
            throw new SfdxError(messages.getMessage('errorParamNotFound'));
        }

        this.ux.startSpinner('Retrieving the process metadata');
        const conn = this.org.getConnection();
        conn.setApiVersion(API_VERSION);

        const flow = ((await conn.metadata.read('Flow', this.args.file)) as unknown) as Flow;
        if (Object.keys(flow).length === 0) {
            this.ux.stopSpinner('failed.');
            throw new SfdxError(messages.getMessage('errorFlowNotFound'));
        }

        if (!isSupported(flow)) {
            this.ux.stopSpinner('failed.');
            throw new SfdxError(messages.getMessage('errorUnsupportedFlow'));
        }
        this.ux.stopSpinner();

        const docxBuilder = new DocxBuilder(this.flags.locale);
        const doc = isProcess(flow)
            ? new ReadableProcessMetadataConverter(flow, this.args.file).accept(docxBuilder)
            : new ReadableFlowMetadataConverter(flow, this.args.file).accept(docxBuilder);

        const outdir = this.flags.outdir ? this.flags.outdir : '.';
        await fs.ensureDir(outdir);
        const targetPath = `${this.args.file}.docx`;
        docx.Packer.toBuffer(doc).then(buffer => {
            fs.writeFileSync(`${outdir}/${targetPath}`, buffer);
        });

        this.ux.log(`Documentation of '${flow.label}' flow is successfully generated.`);

        return flow;
    }
}

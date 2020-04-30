import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import * as fs from 'fs-extra';
import { Flow } from '../../../types/flow';
import FlowParser from '../../../lib/flowParser';
import fonts from '../../../style/font';
import buildPdfContent from '../../../lib/pdf/pdfBuilder';

const Pdf = require('pdfmake');

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sfdx-flowdoc-plugin', 'messages');

const API_VERSION = '48.0';
export default class Generate extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx flowdoc:pdf:generate Example
  Documentation of 'Example' flow is successfully generated.
  `,
        `$ sfdx flowdoc:pdf:generate Example -l ja
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

        const conn = this.org.getConnection();
        conn.setApiVersion(API_VERSION);

        const flow = await conn.metadata.read('Flow', this.args.file);
        if (Object.keys(flow).length === 0) {
            throw new SfdxError(messages.getMessage('errorFlowNotFound'));
        }
        const fp = new FlowParser((flow as unknown) as Flow, this.args.file);
        if (!fp.isSupportedFlow()) {
            throw new SfdxError(messages.getMessage('errorUnsupportedFlow'));
        }

        const hrDoc = fp.createReadableProcess();
        const docDefinition = buildPdfContent(hrDoc, this.flags.locale);

        const printer = new Pdf(fonts);
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        const targetPath = `${this.args.file}.pdf`;
        pdfDoc.pipe(fs.createWriteStream(targetPath));
        pdfDoc.end();
        const label: string = fp.getLabel();
        this.ux.log(`Documentation of '${label}' flow is successfully generated.`);

        return flow;
    }
}

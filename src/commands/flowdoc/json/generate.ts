import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import * as fs from 'fs-extra';

import { Flow } from '../../../types/metadata/flow';
import { isSupported, isProcess } from '../../../lib/util/flowUtils';
import JsonBuilder from '../../../lib/json/jsonBuilder';
import {
    ReadableProcessMetadataConverter,
    ReadableFlowMetadataConverter,
} from '../../../lib/converter/metadataConverter';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sfdx-flowdoc-plugin', 'messages');

const API_VERSION = '48.0';
export default class Generate extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx flowdoc:json:generate Example
  Retrieving the process metadata... done
  Documentation of 'Example' flow is successfully generated.
  `,
        `$ sfdx flowdoc:json:generate Example -l ja
  Retrieving the process metadata... done
  Documentation of 'Example' flow is successfully generated.
  `,
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        locale: flags.string({ char: 'l', description: messages.getMessage('localeFlagDescription') }),
        outdir: flags.string({ char: 'o', description: messages.getMessage('outdirFlagDescription') }),
        nospinner: flags.boolean({ description: messages.getMessage('nospinnerFlagDescription') }),
    };

    protected static requiresUsername = true;

    protected static requiresProject = true;

    public async run(): Promise<any> {
        if (!this.args.file) {
            throw new SfdxError(messages.getMessage('errorParamNotFound'));
        }

        if (!this.flags.nospinner) this.ux.startSpinner('Retrieving the process metadata');
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

        const jsonBuilder = new JsonBuilder(this.flags.locale);
        const json = isProcess(flow)
            ? new ReadableProcessMetadataConverter(flow, this.args.file).accept(jsonBuilder)
            : new ReadableFlowMetadataConverter(flow, this.args.file).accept(jsonBuilder);

        const targetPath = `${this.args.file}.json`;

        const outdir = this.flags.outdir ? this.flags.outdir : '.';
        await fs.ensureDir(outdir);
        fs.writeFileSync(`${outdir}/${targetPath}`, JSON.stringify(json, null, '  '));

        this.ux.log(`Documentation of '${flow.label}' flow is successfully generated.`);

        return flow;
    }
}

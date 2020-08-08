import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';

import { Flow } from '../../../types/metadata/flow';
import { isSupported, isProcess } from '../../../lib/util/flowUtils';
import JsonBuilder from '../../../lib/json/jsonBuilder';
import {
    ReadableProcessMetadataConverter,
    ReadableFlowMetadataConverter,
} from '../../../lib/converter/metadataConverter';
import { API_VERSION } from '../../../lib/converter/helper/constants';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sfdx-flowdoc-plugin', 'messages');

export default class Display extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx flowdoc:json:display Example
  { Object }
  `,
        `$ sfdx flowdoc:json:display Example -l ja
  { Object }
  `,
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        locale: flags.string({ char: 'l', description: messages.getMessage('localeFlagDescription') }),
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
        this.ux.log(JSON.stringify(json, null, '  '));

        return flow;
    }
}

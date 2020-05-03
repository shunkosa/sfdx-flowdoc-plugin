import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';

import { Flow } from '../../../types/flow';
import FlowParser from '../../../lib/flowParser';
import buildLocalizedJson from '../../../lib/json/jsonBuilder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sfdx-flowdoc-plugin', 'messages');

const API_VERSION = '48.0';
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

        const flow = await conn.metadata.read('Flow', this.args.file);

        if (Object.keys(flow).length === 0) {
            this.ux.stopSpinner('failed.');
            throw new SfdxError(messages.getMessage('errorFlowNotFound'));
        }
        const fp = new FlowParser((flow as unknown) as Flow, this.args.file);
        if (!fp.isSupportedFlow()) {
            this.ux.stopSpinner('failed.');
            throw new SfdxError(messages.getMessage('errorUnsupportedFlow'));
        }
        this.ux.stopSpinner();

        const readableFlow = fp.createReadableProcess();
        const localizedJson = buildLocalizedJson(readableFlow, this.flags.locale);
        this.ux.log(JSON.stringify(localizedJson, null, '  '));

        return flow;
    }
}

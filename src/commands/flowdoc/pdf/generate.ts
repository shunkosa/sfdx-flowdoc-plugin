import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, SfdxProject } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';
import FlowParser from '../../../lib/flowParser';
import Renderer from '../../../lib/renderer';
import fonts from '../../../style/font';

const Pdf = require('pdfmake');
const xml2js = require('xml2js');


Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sfdx-flowdoc-plugin', 'messages')
const FLOW_PATH = 'main/default/flows';
const xmlParser = new xml2js.Parser({ explicitArray : false });

export default class Generate extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx flowdoc:pdf:generate force-app/main/default/flow/Example.flow-meta.xml
  Documentation of 'Example' flow is successfully generated.
  `,
  `$ sfdx flowdoc:pdf:generate --name Example
  Documentation of 'Example' flow is successfully generated.
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    outdir: flags.string({char: 'o', description: messages.getMessage('outdirFlagDescription')})
  };

  protected static requiresUsername = true;

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    if(!this.flags.name && !this.args.file) {
      throw new SfdxError(messages.getMessage('errorParamNotFound'));
    }

    const projectPath = await SfdxProject.resolveProjectPath();
    const project = await SfdxProject.resolve();
    const projectJson = await project.resolveProjectConfig();

    const packagePathObj = (projectJson.packageDirectories as any).find(pd => pd.default);
    if(!packagePathObj) {
      throw new SfdxError(messages.getMessage('errorInvalidProjectPath'));
    }
    const sourcePath = (this.flags.name) ? `${projectPath}/${packagePathObj.path}/${FLOW_PATH}/${this.flags.name}.flow-meta.xml` : this.args.file
    const targetPath = `${this.flags.name}.pdf`;

    const data = fs.readFileSync(sourcePath);
    const result = await xmlParser.parseStringPromise(data);

    const fp = new FlowParser(result.Flow); 
    const r = new Renderer(fp);

    const docDefinition = r.createDocDefinition();

    const printer = new Pdf(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    // fs.ensureDirSync(targetPath);
    pdfDoc.pipe(fs.createWriteStream(targetPath));
    pdfDoc.end();
    this.ux.log('Created!')

    return result;
  }
}

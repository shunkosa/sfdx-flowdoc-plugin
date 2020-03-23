import i18n from '../config/i18n';

const styles = require('../style/style.json');

export default class Renderer {
    flowParser;

    i18n;

    constructor(flowParser, locale: string) {
        this.flowParser = flowParser;
        this.i18n = i18n(locale);
    }

    createDocDefinition() {
        return {
            content: this.createContent(),
            styles,
            defaultStyle: {
                font: "NotoSans"
            }
        }
    }

    createContent() {
        const content = [];
        // Title
        /*
        content.push({
            image: path.join(__dirname, '../assets/img/process_120.png'),
            fit: [30, 30]
        });
        */

        content.push({ text: this.flowParser.getLabel() , style: 'h1' });
        content.push({ text: 'Opportunity_Process' }); // TODO: Developer Name
        
        // The process starts when
        content.push({ text: 'The process starts when', margin: [0, 10, 0, 5] });
        
        // Object and Trigger type
        const object = this.flowParser.getObjectType();
        const triggerType = this.flowParser.getTriggerType() === 'onAllChanges'
            ? this.i18n.__('WHEN_A_RECORD_IS_CREATED_OR_EDITED')
            : this.i18n.__('ONLY_WHEN_A_RECORD_IS_CREATED'); 
        const overview = {
            layout: 'lightHorizontalLines', // optional
            table: {
              widths: [ 200, 'auto' ],
              body: [
                [ this.th('Object'), object ],
                [ this.th('When the process starts'), triggerType ],
              ]
            }
          }
        content.push(overview);
        
        // Decision Groups
        const decisions = this.flowParser.getStandardDecisions()
        // 1.Decison
        for(let i=0; i<decisions.length; i++ ) {
            content.push(this.h2(`${this.i18n.__('ACTION_GROUP')} ${i+1}`));
            const criteria = this.flowParser.getActionExecutionCriteria(decisions[i]);
            content.push(this.renderDecision(decisions[i], criteria));
            if (criteria === 'CONDITIONS_ARE_MET') {
                content.push(this.renderDecisionConditions(decisions[i].rules.conditions));
            }
            
            if(decisions[i].rules.connector) {
            const nextActionName = decisions[i].rules.connector.targetReference;
            const actions = this.flowParser.getDecisionActions([], nextActionName);
            if (actions.length > 0) {
                content.push(this.h3('Actions'));
            }
            for (const action of actions) {
                content.push(this.renderAction(action));
            }
            }
        }

        // TODO Time-Based Action
        return content;
    }

    renderDecision(decision, criteria) {
        const table = {
            table: {
              widths: [ 200, 'auto' ],
              body: [
                [ this.i18n.__('CONDITION_NAME'), decision.rules.label ], 
                [ this.i18n.__('CRITERIA_FOR_EXECUTING_ACTIONS'), this.i18n.__(criteria) ],
              ]
            }
        }
        if (criteria === 'FORMULA_EVALUATES_TO_TRUE') {
            const formulaName = decision.rules.conditions.leftValueReference;
            const formulaExpression = this.flowParser.getFormulaExpression(formulaName);
            table.table.body.push([ 'Formula', unescape(formulaExpression)]);
        } else if (criteria === 'CONDITIONS_ARE_MET') {
            table.table.body.push([ 'Condition Logic', decision.rules.conditionLogic.toUpperCase() ])
        }
        return table;
    }

    renderDecisionConditions = (rawConditions) => {
        const conditions = Array.isArray(rawConditions) ? rawConditions : [rawConditions];
        const conditionTable = {
            layout: 'lightHorizontalLines', 
            table: {
                headerRows: 1,
                width: [ 'auto', 100, 'auto', 'auto'],
                body:  [
                    [this.i18n.__('FIELD'),this.i18n.__('OPERATOR'),this.i18n.__('TYPE'),this.i18n.__('VALUE')],
                ],
            },
            margin: [15, 5, 0, 0]
        }
        for(const c of conditions) {
            conditionTable.table.body.push([
                c.leftValueReference, c.operator, Object.keys(c.rightValue)[0], Object.values(c.rightValue)[0] 
            ]);
        }
        return conditionTable;
    }

    renderAction = (action) => {
        const actionTable = {
            layout: 'lightHorizontalLines', 
            table: {
                body:  [
                    ['Action Type', action.actionType ],
                    ['Action Name', this.i18n.__(`ACTION_TYPE_${action.label}`)]
                ],
            },
        }
        return actionTable;
    }

    th = (text) => {
        return { text, style: 'bold' }
    }
    
    h2 = (text) => {
        return { text, style: 'h2', margin: [0, 10]}
    }

    h3 = (text) => {
        return { text, style: 'h3', margin: [0, 10]}
    }
}
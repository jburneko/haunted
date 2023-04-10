import { HauntedActor } from "../documents/haunted-actor.mjs";

class RollInfo {
    constructor() {
        this.effortSpent = 0;
        this.helpers = []
    }

    createHelper() {
        const helper = {
            id: "",
            index: this.helpers.length,
            count: 0
        };

        this.helpers.push(helper);
    }

    update(expandedData) {
        expandedData["help-dice"] = expandedData["help-dice"] || [];
        expandedData["helper-choice"] = expandedData["helper-choice"] || []

        if(!Array.isArray(expandedData["help-dice"])) expandedData["help-dice"] = [expandedData["help-dice"]];
        if(!Array.isArray(expandedData["helper-choice"])) expandedData["helper-choice"] = [expandedData["helper-choice"]]

        this.effortSpent = expandedData.effortSpent;
        this.helpers = this.helpers.map((helper, index) => {
            return {
                id: expandedData["helper-choice"][index],
                count: expandedData["help-dice"][index] || 0,
                index: index
            }
        });
    }

    deleteHelper(index) {
        if(index >= 0 && index < this.helpers.length) {
            this.helpers.splice(index, 1);
            this.helpers = this.helpers.map((helper, index) => {
                const newHelper = {...helper};
                newHelper.index = index;
                return newHelper;
            });
        }
    } 
}

export class InfluenceRollDialog extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "influence-roll-dialog";
        options.title = game.i18n.localize("HAUNTED.Dialogs.InfluenceRoll");
        options.template = "systems/haunted/templates/dialogs/influence-roll-dialog.hbs";
        options.width = 256;
        options.height = 256;
        options.userId = game.userId;
        options.closeOnSubmit = false;
        options.submitOnChange = true;
        return options
    }

    constructor() {
        super();
        this.rollInfo = new RollInfo();
    }

    get helperChoices() {
        const helpers = HauntedActor.getCharacterType([...HauntedActor.CHARACTER_TYPE.SUPPORT, HauntedActor.CHARACTER_TYPE.GHOST])
            .map(helper => ({ key:helper.id, label:helper.name }));
        return helpers;
    }

    getData() {
        const data = {
            helperChoices: this.helperChoices,
            rollInfo: this.rollInfo
        };

        return data;
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);

        this.rollInfo.update(expandedData);

        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".influence-roll-button").click(this._onRollInfluence.bind(this));
        html.find(".add-helper").click(this._onAddHelper.bind(this));
        html.find(".rollable").click(this._onDeleteHelper.bind(this));
    }

    _onDeleteHelper(event) {
        event.preventDefault();
        const index = parseInt(event.currentTarget.getAttribute("data-index"));
        this.rollInfo.deleteHelper(index)
        this.render();
    }

    _onAddHelper(event) {
        event.preventDefault();        
        this.rollInfo.createHelper();
        this.render();
    }

    _onRollInfluence(event) {
        event.preventDefault();

        this.close();

        this.actor.rollAttribute(HauntedActor.ATTRIBUTE.INFLUENCE, this.rollInfo.effortSpent, this.rollInfo.helpers);
    }
}
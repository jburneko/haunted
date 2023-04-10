import { HauntedActor } from "../documents/haunted-actor.mjs";

export class InfluenceRollDialog extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "influence-roll-dialog";
        options.title = game.i18n.localize("HAUNTED.Dialogs.InfluenceRoll");
        options.template = "systems/haunted/templates/dialogs/influence-roll-dialog.hbs";
        options.width = 256;
        options.height = 256;
        return options
    }

    constructor() {
        super();
        this.helpers = [];
        this.effortSpent = 0;
    }

    get helperChoices() {
        const helpers = HauntedActor.getCharacterType([...HauntedActor.CHARACTER_TYPE.SUPPORT, HauntedActor.CHARACTER_TYPE.GHOST])
            .map(helper => ({ key:helper.id, label:helper.name }));
        return helpers;
    }

    getData() {
        const data = {
            helperChoices: this.helperChoices,
            helpers: this.helpers,
            effortSpent: this.effortSpent
        };

        return data;
    }

    createHelper() {
        const helper = {
            id: "",
            index: this.helpers.length,
            count: 0
        }
        this.helpers.push(helper);
    }

    updateHelper(index, id, count) {
        if(index >= 0 && index < this.helpers.length) {
            const helper = this.helpers[index];
            helper.id = id;
            helper.count = count;
        }
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

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".influence-roll-button").click(this._onRollInfluence.bind(this));
        html.find(".add-helper").click(this._onAddHelper.bind(this));
        html.find(".rollable").click(this._onDeleteHelper.bind(this));
        html.find(".help-dice").change(this._onUpdateHelper.bind(this));
        html.find(".helper-choices").change(this._onUpdateHelper.bind(this));
        html.find(".number-field").change(this._onUpdateEffort.bind(this));
    }

    _onUpdateHelper(event) {
        const index = parseInt(event.target.getAttribute("data-index"));
        const helper = $(event.currentTarget).parents(".helper-params")[0]
        const count = parseInt($(helper).find(".help-dice").val());
        const id = $(helper).find(".helper-choices").val();

        this.updateHelper(index, id, count);
        this.render();
    }

    _onUpdateEffort(event) {
        this.effortSpent = parseInt(event.target.value);
        this.render();
    }

    _onDeleteHelper(event) {
        const index = parseInt(event.currentTarget.getAttribute("data-index"));
        
        this.deleteHelper(index)
        this.render();
    }

    _onAddHelper(event) {        
        this.createHelper();
        this.render();
    }

    _onRollInfluence(event) {
        event.preventDefault();
        
        const form = $(event.currentTarget).parents(".roll-influence-dialog")[0];
        const effortSpent = parseInt($(form).find("input[name=effort-spent]").val());
    
        this.close();

        this.actor.rollAttribute(HauntedActor.ATTRIBUTE.INFLUENCE, effortSpent, this.helpers);
    }
}
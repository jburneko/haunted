export class InfluenceRollDialog extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "influence-roll-dialog";
        options.title = game.i18n.localize("HAUNTED.Dialogs.InfluenceRoll");
        options.template = "systems/haunted/templates/influence-roll-dialog.hbs";
        options.width = 256;
        options.height = 256;
        return options
    }

    getData() {
        return {};
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".influence-roll-button").click(this._onInfluenceRoll.bind(this));
    }

    _onInfluenceRoll(event) {
        event.preventDefault();
        const form = $(event.currentTarget).parents(".roll-influence-dialog")[0];
        const effortSpent = parseInt($(form).find("input[name=effort-spent]").val());
        const helpDice = parseInt($(form).find("input[name=help-dice]").val());
    
        this.close();

        this.actor.rollInfluence(effortSpent, helpDice);

    }
}
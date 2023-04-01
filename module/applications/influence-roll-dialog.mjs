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
}
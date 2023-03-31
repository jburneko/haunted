export class MurdererSheet extends ActorSheet {
    static TEMPLATES = {
        SHEET: "systems/haunted/templates/murderer-sheet.hbs"
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          template: MurdererSheet.TEMPLATES.SHEET
        });
      }

    getData () {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system;
        context.flags = actorData.flags;

        console.log(context);
        return context;
    }
} 
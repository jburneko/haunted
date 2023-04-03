export class MurdererSheet extends ActorSheet {
    static TEMPLATES = {
        SHEET: "systems/haunted/templates/sheets/murderer-sheet.hbs"
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          template: MurdererSheet.TEMPLATES.SHEET,
          classes: ["haunted"]
        });
      }

    getData () {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system;
        context.flags = actorData.flags;

        return context;
    }

    activateListeners(html) {

      if (this.actor.isOwner) {
        html.find(".rollable").click(this._rollInfluence.bind(this));
      }

      super.activateListeners(html);
    }

    _rollInfluence(event) {
      event.preventDefault();
      this.actor.showInfluenceRollDialog();
    }
} 
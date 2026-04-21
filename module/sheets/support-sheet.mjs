import { HauntedActor } from "../documents/haunted-actor.mjs";
import { CharacterSheet } from "./character-sheet.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";

export class SupportSheet extends CharacterSheet {
  static PARTS = {
    ...super.PARTS,
    front: {
      template: "systems/haunted/templates/sheets/support-sheet.hbs",
    },
  };

  static DEFAULT_OPTIONS = {
    actions: {
      increaseDisposition: this.#increaseDisposition,
      decreaseDisposition: this.#decreaseDisposition,
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.dispositionChoices = HauntedActor.DISPOSITION_TABLE.map(
      (entry) => ({
        key: entry.disposition,
        label: HauntedActor.DISPOSITION.getLocalString(entry.disposition),
      }),
    );

    return context;
  }

  static async #increaseDisposition(event) {
    event.preventDefault();
    this.actor.adjustDisposition(1);
  }

  static async #decreaseDisposition(event) {
    event.preventDefault();
    this.actor.adjustDisposition(-1);
  }
}

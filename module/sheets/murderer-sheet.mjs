import { CharacterSheet } from "./character-sheet.mjs";

export class MurdererSheet extends CharacterSheet {
  static PARTS = {
    ...super.PARTS,
    front: {
      template: "systems/haunted/templates/sheets/murderer-sheet.hbs",
    },
  };

  static DEFAULT_OPTIONS = {
    actions: {
      increaseInfluence: this.#increaseInfluence,
    },
  };

  static async #increaseInfluence(event, target) {
    event.preventDefault();
    this.actor.increaseMurdererInfluence();
  }
}

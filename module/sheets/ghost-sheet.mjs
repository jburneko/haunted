import { CharacterSheet } from "./character-sheet.mjs";

export class GhostSheet extends CharacterSheet {
  static PARTS = {
    form: {
      template: "systems/haunted/templates/sheets/ghost-sheet.hbs",
    },
  };

  static DEFAULT_OPTIONS = {
    actions: {
      rollAttribute: this.#rollAttribute,
    },
  };

  static async #rollAttribute(event, target) {
    event.preventDefault();
    const attribute = target.dataset.attribute;
    this.actor.rollAttribute(attribute);
  }
}

import { CharacterSheet } from "./character-sheet.mjs";

export class MurdererSheet extends CharacterSheet {

  static TEMPLATES = {
      SHEET: "systems/haunted/templates/sheets/murderer-sheet.hbs"
  }

  static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        template: MurdererSheet.TEMPLATES.SHEET,
        classes: ["haunted"]
      });
    }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".increase-influence").click(this._onIncreaseInfluence.bind(this));
  }

  _onIncreaseInfluence(event) {
    event.preventDefault();
    this.actor.increaseMurdererInfluence();
  }
} 
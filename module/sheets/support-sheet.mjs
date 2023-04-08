import { CharacterSheet } from "./character-sheet.mjs";

export class SupportSheet extends CharacterSheet {
    static TEMPLATES = {
        SHEET: "systems/haunted/templates/sheets/support-sheet.hbs"
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          template: SupportSheet.TEMPLATES.SHEET,
          classes: ["haunted"]
        });
      }
    
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".increase-disposition").click(this._onIncreaseDisposition.bind(this));
        html.find(".decrease-disposition").click(this._onDecreaseDisposition.bind(this));
    }

    _onIncreaseDisposition(event) {
      event.preventDefault();
      this.actor.adjustDisposition(1);
    }

    _onDecreaseDisposition(event) {
      event.preventDefault();
      this.actor.adjustDisposition(-1);
    }
} 
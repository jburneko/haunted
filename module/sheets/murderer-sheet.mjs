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
} 
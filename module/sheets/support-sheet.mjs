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
} 
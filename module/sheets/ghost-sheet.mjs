import { CharacterSheet } from "./character-sheet.mjs";

export class GhostSheet extends CharacterSheet {
    static TEMPLATES = {
        SHEET: "systems/haunted/templates/sheets/ghost-sheet.hbs"
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          template: GhostSheet.TEMPLATES.SHEET,
          classes: ["haunted"]
        });
      }
} 
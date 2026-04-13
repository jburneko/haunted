import { HauntedActor } from "../documents/haunted-actor.mjs";
import { CharacterSheet } from "./character-sheet.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";

export class SupportSheet extends CharacterSheet {
  static TEMPLATES = {
    SHEET: "systems/haunted/templates/sheets/support-sheet.hbs",
  };

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: SupportSheet.TEMPLATES.SHEET,
      classes: ["haunted"],
    });
  }

  getData() {
    const context = super.getData();
    context.dispositionChoices = HauntedActor.DISPOSITION_TABLE.map(
      (entry) => ({
        key: entry.disposition,
        label: HauntedActor.DISPOSITION.getLocalString(entry.disposition),
      }),
    );

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html
      .find(".increase-disposition")
      .click(this._onIncreaseDisposition.bind(this));
    html
      .find(".decrease-disposition")
      .click(this._onDecreaseDisposition.bind(this));
    html
      .find(".increase-influence")
      .click(this._onIncreaseInfluence.bind(this));
  }

  _onIncreaseDisposition(event) {
    event.preventDefault();
    this.actor.adjustDisposition(1);
  }

  _onDecreaseDisposition(event) {
    event.preventDefault();
    this.actor.adjustDisposition(-1);
  }

  _onIncreaseInfluence(event) {
    event.preventDefault();
    this.actor.increaseSupportInfluence();
  }
}

import { HauntedActor } from "../documents/haunted-actor.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";

const { ApplicationV2, DocumentSheetV2, HandlebarsApplicationMixin } =
  foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["haunted"],
    form: {
      submitOnChange: true,
    },
    position: {
      width: "auto",
      height: "auto",
    },
    actions: {
      rollAttribute: this.#rollAttribute,
      editImage: this.#editImage,
    },
  };

  static PARTS = {
    tabs: {
      template: "systems/haunted/templates/sheets/partials/character-tabs.hbs",
    },
    back: {
      template: "systems/haunted/templates/sheets/partials/character-notes.hbs",
    },
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "front", label: "HAUNTED.Character.Front" },
        { id: "back", label: "HAUNTED.Character.Back" },
      ],
      initial: "front", // Set the initial tab
    },
  };

  get title() {
    return this.document.name;
  }

  static async #editImage(event, target) {
    const field = target.dataset.field || "img";
    const current = foundry.utils.getProperty(this.document, field);

    const fp = new foundry.applications.apps.FilePicker({
      type: "image",
      current: current,
      callback: (path) => this.document.update({ [field]: path }),
    });

    fp.render(true);
  }

  static async #rollAttribute(event, target) {
    event.preventDefault();
    this.actor.showInfluenceRollDialog();
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.notesHTML =
      await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.document.system.notes,
        {
          secrets: this.document.isOwner,
          relativeTo: this.document,
        },
      );
    DebugUtils.log_data("CONTEXT FETCH", context);
    return context;
  }
}

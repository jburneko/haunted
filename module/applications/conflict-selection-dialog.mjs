import { HauntedActor } from "../documents/haunted-actor.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ConflictSelectionDialog extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  static DEFAULT_OPTIONS = {
    id: "conflict-selection-dialog",
    classes: ["haunted"],
    form: {
      handler: ConflictSelectionDialog.#onSubmit,
      closeOnSubmit: true,
      submitOnChange: false,
    },
    position: {
      width: "auto",
      height: "auto",
    },
    tag: "form", // The default is "div"
    window: {
      title: "HAUNTED.Dialogs.ConflictSelection",
    },
    actions: {},
  };

  static PARTS = {
    dialog: {
      template:
        "systems/haunted/templates/dialogs/conflict-selection-dialog.hbs",
    },
  };

  static createDefaultChoices() {
    const choices = HauntedActor.getCharacterType([
      ...HauntedActor.CHARACTER_TYPE.SUPPORT,
      HauntedActor.CHARACTER_TYPE.GHOST,
    ]).map((choice) => ({
      key: choice.id,
      entry: { label: choice.name, checked: false },
    }));
    return choices;
  }

  init(conflict) {
    this.conflict = conflict;
    this.currentChoices = ConflictSelectionDialog.createDefaultChoices();
  }

  async _prepareContext(options) {
    const context = {
      currentChoices: this.currentChoices,
    };

    DebugUtils.log_data("DIALOG CONTEXT", context);

    return context;
  }

  static async #onSubmit(event, form, formData) {
    event.preventDefault();

    const expandedData = foundry.utils.expandObject(formData.object);
    const actorList = expandedData.conflictSelection.filter(
      (id) => id !== null,
    );

    this.conflict.addActorsToConflict(actorList);
    this.conflict.startCombat();
  }
}

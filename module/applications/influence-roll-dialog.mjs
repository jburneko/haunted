import { HauntedActor } from "../documents/haunted-actor.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";
import { RollInfo } from "../utlis/roll-info.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class InfluenceRollDialog extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  static DEFAULT_OPTIONS = {
    id: "influence-roll-dialog",
    form: {
      handler: InfluenceRollDialog.#onSubmit,
      closeOnSubmit: false,
      submitOnChange: true,
    },
    position: {
      width: "auto",
      height: "auto",
    },
    tag: "form", // The default is "div"
    window: {
      title: "HAUNTED.Dialogs.InfluenceRoll",
    },
    actions: {
      rollInfluence: InfluenceRollDialog.#rollInfluence,
      addHelper: InfluenceRollDialog.#addHelper,
      deleteHelper: InfluenceRollDialog.#deleteHelper,
    },
  };

  static PARTS = {
    dialog: {
      template: "systems/haunted/templates/dialogs/influence-roll-dialog.hbs",
    },
  };

  get title() {
    DebugUtils.log_data("INFLUENCE DIALOG TITLE", this);
    return (
      game.i18n.localize("HAUNTED.Dialogs.InfluenceRoll") +
      `: ${this.actor.name}`
    );
  }

  static get helperChoices() {
    const helpers = HauntedActor.getCharacterType([
      ...HauntedActor.CHARACTER_TYPE.SUPPORT,
      HauntedActor.CHARACTER_TYPE.GHOST,
    ]).map((helper) => ({ key: helper.id, label: helper.name }));
    return helpers;
  }

  init(actor) {
    this.actor = actor;
    this.rollInfo = new RollInfo();
  }

  async _prepareContext(options) {
    const data = {
      influence: this.actor.system.influence,
      effort: this.actor.system.effort,
      helperChoices: InfluenceRollDialog.helperChoices,
      rollInfo: this.rollInfo,
    };

    return data;
  }

  static async #onSubmit(event, form, formData) {
    event.preventDefault();

    const expandedData = foundry.utils.expandObject(formData.object);

    this.rollInfo.update(expandedData);

    this.render();
  }

  static async #deleteHelper(event) {
    event.preventDefault();
    const indexStr = event.target.getAttribute("data-index");
    const index = parseInt(event.target.getAttribute("data-index"));
    this.rollInfo.deleteHelper(index);
    this.render();
  }

  static async #addHelper(event) {
    event.preventDefault();
    this.rollInfo.createHelper();
    this.render();
  }

  static async #rollInfluence(event) {
    event.preventDefault();

    this.close();

    this.actor.rollAttribute(
      HauntedActor.ATTRIBUTE.INFLUENCE,
      this.rollInfo.effortSpent,
      this.rollInfo.helpers,
    );
  }
}

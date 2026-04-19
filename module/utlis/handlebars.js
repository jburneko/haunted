import { DiceFormater } from "./dice-formater.mjs";
import { HauntedActor } from "../documents/haunted-actor.mjs";
import { DebugUtils } from "./debug-utils.mjs";

export const configureHandlebars = () => {
  Handlebars.registerHelper("format_dice", (dice) => {
    const diceObj = DiceFormater.highlightDice(dice);
    const diceStr = DiceFormater.diceToString(diceObj);
    return diceStr;
  });

  Handlebars.registerHelper("format_conflict_dice", (dice, victories) => {
    const diceObj = DiceFormater.highlightVictories(dice, victories);
    const diceStr = DiceFormater.diceToString(diceObj);
    return diceStr;
  });

  Handlebars.registerHelper("isdefined", function (value) {
    const result = value !== undefined;
    return result;
  });

  Handlebars.registerHelper("local_disposition", function (value) {
    console.log("LOCALIZE DISPOSITION");
    console.log(value);
    const result = HauntedActor.DISPOSITION.getLocalString(value);
    console.log(result);
    return result;
  });

  Handlebars.registerHelper("local_attribute", function (value) {
    return HauntedActor.ATTRIBUTE.getLocalString(value);
  });

  Handlebars.registerHelper("local_attribute", function (value) {
    return HauntedActor.ATTRIBUTE.getLocalString(value);
  });

  Handlebars.registerHelper("issupport", function (value) {
    return HauntedActor.CHARACTER_TYPE.SUPPORT.includes(value);
  });

  Handlebars.registerHelper("get_help_max", function (value) {
    const actor = game.actors.get(value);
    let result = undefined;

    if (actor.type === HauntedActor.CHARACTER_TYPE.GHOST)
      result = actor.system.presence.value;
    else result = actor.system.effort;

    return result;
  });

  Handlebars.registerHelper(
    "checkBoxes",
    function checkBoxes(name, choices, options) {
      const localize = options.hash.localize || false;
      let html = "";
      for (const item of choices) {
        if (localize) item.entry.label = game.i18n.localize(item.entry.label);
        DebugUtils.log_data("ITEM", item);
        const element = document.createElement("label");
        element.classList.add("checkbox");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = name;
        input.value = item.key;
        input.defaultChecked = item.entry.checked;
        element.append(input, " ", item.entry.label);
        html += element.outerHTML;
      }
      return new Handlebars.SafeString(html);
    },
  );
};

export async function preloadTemplates() {
  const templatePaths = [
    "systems/haunted/templates/sheets/partials/character-header.hbs",
    "systems/haunted/templates/sheets/partials/character-attributes.hbs",
    "systems/haunted/templates/sheets/partials/character-notes.hbs",
  ];

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

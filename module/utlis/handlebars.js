import { DiceFormater } from "./dice-formater.mjs";
import { HauntedActor } from "../documents/haunted-actor.mjs";

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
    console.log("HELP MAX RESULT");
    console.log(result);
    return result;
  });
};

export async function preloadTemplates() {
  const templatePaths = [
    "systems/haunted/templates/sheets/partials/character-header.hbs",
    "systems/haunted/templates/sheets/partials/character-attributes.hbs",
    "systems/haunted/templates/sheets/partials/character-notes.hbs",
  ];

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

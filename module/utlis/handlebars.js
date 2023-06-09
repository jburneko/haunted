import { DiceFormater } from "./dice-formater.mjs"
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

    Handlebars.registerHelper('isdefined', function (value) {
      return value !== undefined;
    });

    Handlebars.registerHelper('local_disposition', function (value) {
      return HauntedActor.DISPOSITION.getLocalString(value);
    });

    Handlebars.registerHelper('local_attribute', function (value) {
      return HauntedActor.ATTRIBUTE.getLocalString(value);
    });

    Handlebars.registerHelper('local_attribute', function (value) {
      return HauntedActor.ATTRIBUTE.getLocalString(value);
    });

    Handlebars.registerHelper('issupport', function (value) {
      return HauntedActor.CHARACTER_TYPE.SUPPORT.includes(value);
    });

    Handlebars.registerHelper('get_help_max', function (value) {
      const actor = game.actors.get(value);
      if(actor.type === HauntedActor.CHARACTER_TYPE.GHOST)
        return actor.system.presence.value;
      else
        return actor.system.effort;
    });
};

export async function preloadTemplates() {
    const templatePaths = [
      "systems/haunted/templates/sheets/partials/character-header.hbs",
      "systems/haunted/templates/sheets/partials/character-attributes.hbs",
      "systems/haunted/templates/sheets/partials/character-notes.hbs"
    ];
  
    return loadTemplates(templatePaths);
  }
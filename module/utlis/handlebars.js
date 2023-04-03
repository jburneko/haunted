import { DiceFormater } from "./dice-formater.mjs"

export const configureHandlebars = () => {
    Handlebars.registerHelper("format_dice", (dice) => {
        const diceObj = DiceFormater.highlightDice(dice);
        const diceStr = DiceFormater.diceToString(diceObj);
        return diceStr;
    });
};

export async function preloadTemplates() {
    const templatePaths = [
      "systems/haunted/templates/sheets/partials/character-header.hbs",
      "systems/haunted/templates/sheets/partials/character-attributes.hbs",
    ];
  
    return loadTemplates(templatePaths);
  }
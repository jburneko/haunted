import { HauntedActor } from "./documents/haunted-actor.mjs";
import { MurdererSheet } from "./sheets/murderer-sheet.mjs";

async function preloadTemplates() {
    const templatePaths = [
      "systems/haunted/templates/partials/character-attributes.hbs",
    ];
  
    return loadTemplates(templatePaths);
  }

function defineFonts() {
  CONFIG.fontDefinitions["PermanentMarker"] = {
    "editor": true,
    "fonts": [{urls: [`systems/haunted/assets/fonts/PermanentMarker-Regular.ttf`]}]
  }

  CONFIG.fontDefinitions["CarbonScript"] = {
    "editor": true,
    "fonts": [{urls: [`systems/haunted/assets/fonts/CarbonScript.ttf`]}]
  }
}

Hooks.once("init", () => {
    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = HauntedActor;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("haunted", MurdererSheet, { types: ["murderer"], makeDefault: true});

    defineFonts();
    preloadTemplates();
});
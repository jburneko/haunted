import { MurdererSheet } from "./sheets/murderer-sheet.mjs";

async function preloadTemplates() {
    const templatePaths = [
      "systems/haunted/templates/partials/character-attributes.hbs",
    ];
  
    return loadTemplates(templatePaths);
  }

Hooks.once("init", () => {
    CONFIG.debug.hooks = true;
    console.log(game);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("haunted", MurdererSheet, { types: ["murderer"], makeDefault: true});

    preloadTemplates();
});
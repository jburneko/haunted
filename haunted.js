//import { MurdererSheet } from "./scripts/murderer-sheet.js"

Hooks.once("init", () => {
    CONFIG.debug.hooks = true;
    console.log(game);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("haunted", MurdererSheet, { types: ["murderer"], makeDefault: true});
});
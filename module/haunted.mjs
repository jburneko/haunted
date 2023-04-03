import { HauntedActor } from "./documents/haunted-actor.mjs";
import { MurdererSheet } from "./sheets/murderer-sheet.mjs";
import { SupportSheet } from "./sheets/support-sheet.mjs";
import { configureHandlebars, preloadTemplates } from "./utlis/handlebars.js";

Hooks.once("init", () => {
    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = HauntedActor;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("haunted", MurdererSheet, { types: [HauntedActor.CHARACTER_TYPE.MURDERER], makeDefault: true});
    Actors.registerSheet("haunted", SupportSheet, { types: [...HauntedActor.CHARACTER_TYPE.SUPPORT], makeDefault: true});

    preloadTemplates();
    configureHandlebars();
});
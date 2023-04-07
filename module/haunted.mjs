import { HauntedActor } from "./documents/haunted-actor.mjs";
import { MurdererSheet } from "./sheets/murderer-sheet.mjs";
import { GhostSheet } from "./sheets/ghost-sheet.mjs";
import { SupportSheet } from "./sheets/support-sheet.mjs";
import { configureHandlebars, preloadTemplates } from "./utlis/handlebars.js";
import { HauntedToken } from "./placeables/HauntedToken.mjs";
import { ActorToSVG } from "./utlis/actor-to-svg.mjs";
import { SocketHandler } from "./networking/socket-handler.mjs";

Hooks.once("init", () => {
    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = HauntedActor;
    CONFIG.Token.objectClass = HauntedToken;

    console.log(CONST);
    console.log(CONFIG);
    console.log(game);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("haunted", MurdererSheet, { types: [HauntedActor.CHARACTER_TYPE.MURDERER], makeDefault: true});
    Actors.registerSheet("haunted", GhostSheet, { types: [HauntedActor.CHARACTER_TYPE.GHOST], makeDefault: true});
    Actors.registerSheet("haunted", SupportSheet, { types: [...HauntedActor.CHARACTER_TYPE.SUPPORT], makeDefault: true});

    ActorToSVG.createPath();
   
    preloadTemplates();
    configureHandlebars();

    game.socket.on(`system.haunted`, (data) => {
        SocketHandler.processEvent(data);
       });
});


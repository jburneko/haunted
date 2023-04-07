import { HauntedActor } from "./documents/haunted-actor.mjs";
import { MurdererSheet } from "./sheets/murderer-sheet.mjs";
import { GhostSheet } from "./sheets/ghost-sheet.mjs";
import { SupportSheet } from "./sheets/support-sheet.mjs";
import { configureHandlebars, preloadTemplates } from "./utlis/handlebars.js";
import { HauntedToken } from "./placeables/HauntedToken.mjs";
import { ActorToSVG } from "./utlis/actor-to-svg.mjs";
import { SocketHandler } from "./networking/socket-handler.mjs";
import { SceneLoader } from "./utlis/scene-loader.mjs";

Hooks.once("init", () => {
    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = HauntedActor;
    CONFIG.Token.objectClass = HauntedToken;

    console.log(CONST);
    console.log(CONFIG);
    console.log(game);

    const scenes = game.packs.get("haunted.scenes");

    console.log(scenes);

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

Hooks.once("ready", () => {
    if(game.scenes.size === 0) {
        SceneLoader.loadScene();
    }
});

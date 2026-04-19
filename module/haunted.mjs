import { HauntedActor } from "./documents/haunted-actor.mjs";
import { MurdererSheet } from "./sheets/murderer-sheet.mjs";
import { GhostSheet } from "./sheets/ghost-sheet.mjs";
import { SupportSheet } from "./sheets/support-sheet.mjs";
import { configureHandlebars, preloadTemplates } from "./utlis/handlebars.js";
import { HauntedToken } from "./placeables/HauntedToken.mjs";
import { ActorToSVG } from "./utlis/actor-to-svg.mjs";
import { SocketHandler } from "./networking/socket-handler.mjs";
import { SceneLoader } from "./utlis/scene-loader.mjs";
import { HauntedConflict } from "./documents/haunted-conflict.mjs";
import {
  MurdererDataModel,
  GhostDataModel,
  SupportDataModel,
  VictimSupportDataModel,
} from "./data-models/actor-models.mjs";
import { HauntedUI } from "./ui/conflict-ui.mjs";

Hooks.once("init", () => {
  CONFIG.debug.hooks = true;

  CONFIG.Actor.documentClass = HauntedActor;
  CONFIG.Token.objectClass = HauntedToken;
  CONFIG.Combat.documentClass = HauntedConflict;

  const actors = foundry.documents.collections.Actors;

  CONFIG.Actor.dataModels = {
    [HauntedActor.CHARACTER_TYPE.MURDERER]: MurdererDataModel,
    [HauntedActor.CHARACTER_TYPE.GHOST]: GhostDataModel,
    [HauntedActor.CHARACTER_TYPE.SUPPORT_MURDERER]: SupportDataModel,
    [HauntedActor.CHARACTER_TYPE.SUPPORT_VICTIM]: VictimSupportDataModel,
    [HauntedActor.CHARACTER_TYPE.SUPPORT_BOTH]: VictimSupportDataModel,
  };

  CONFIG.Actor.trackableAttributes = {
    [HauntedActor.CHARACTER_TYPE.MURDERER]: {
      bar: [],
      value: ["influence", "effort"],
    },
    [HauntedActor.CHARACTER_TYPE.GHOST]: {
      bar: ["presence"],
      value: [],
    },
    [HauntedActor.CHARACTER_TYPE.SUPPORT_MURDERER]: {
      value: ["influence", "effort"],
      bar: [],
    },
    [HauntedActor.CHARACTER_TYPE.SUPPORT_VICTIM]: {
      value: ["influence", "effort"],
      bar: [],
    },
    [HauntedActor.CHARACTER_TYPE.SUPPORT_BOTH]: {
      value: ["influence", "effort"],
      bar: [],
    },
  };

  //actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  actors.registerSheet("haunted", MurdererSheet, {
    types: [HauntedActor.CHARACTER_TYPE.MURDERER],
    makeDefault: true,
  });
  actors.registerSheet("haunted", GhostSheet, {
    types: [HauntedActor.CHARACTER_TYPE.GHOST],
    makeDefault: true,
  });
  actors.registerSheet("haunted", SupportSheet, {
    types: [...HauntedActor.CHARACTER_TYPE.SUPPORT],
    makeDefault: true,
  });

  ActorToSVG.createPath();

  preloadTemplates();
  configureHandlebars();

  game.socket.on(`system.haunted`, (data) => {
    SocketHandler.processEvent(data);
  });
});

Hooks.once("ready", () => {
  SceneLoader.loadScene();

  const tracker = game.settings.get("core", "combatTrackerConfig");
  tracker.resource = "influence";
  game.settings.set("core", "combatTrackerConfig", tracker);
});

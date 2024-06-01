import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";
import { DiceFormater } from "../utlis/dice-formater.mjs";
import { ActorToSVG } from "../utlis/actor-to-svg.mjs";
import { SocketEvents } from "../networking/socket-events.mjs";
import { HauntedToken } from "../placeables/HauntedToken.mjs";
import { UserUtils } from "../utlis/user-utils.mjs";

export class HauntedActor extends Actor {
  static CHARACTER_TYPE = {
    MURDERER: "murderer",
    GHOST: "ghost",
    SUPPORT: ["support-murderer", "support-victim", "support-both"],
    SUPPORT_MURDERER: "support-murderer",
    SUPPORT_VICTIM: "support-victim",
    SUPPORT_BOTH: "support-both",
  };

  static ATTRIBUTE_STRS = {
    influence: "HAUNTED.Character.Influence",
    presence: "HAUNTED.Character.Presence",
  };

  static ATTRIBUTE = {
    INFLUENCE: "influence",
    PRESENCE: "presence",

    getStringID: (attribute) => {
      return HauntedActor.ATTRIBUTE_STRS[attribute];
    },

    getLocalString: (attribute) => {
      return game.i18n.localize(HauntedActor.ATTRIBUTE.getStringID(attribute));
    },
  };

  static DISPOSITION_STRS = [
    "HAUNTED.Disposition.Unknown",
    "HAUNTED.Disposition.Adversary",
    "HAUNTED.Disposition.Unfriendly",
    "HAUNTED.Disposition.Conflicted",
    "HAUNTED.Disposition.Friendly",
    "HAUNTED.Disposition.Advocate",
  ];

  static DISPOSITION = {
    UNKNOWN: 0,
    ADVERSARY: 1,
    UNFRIENDLY: 2,
    CONFLICTED: 3,
    FRIENDLY: 4,
    ADVOCATE: 5,

    getStringID: (disposition) => {
      return HauntedActor.DISPOSITION_STRS[disposition];
    },

    getLocalString: (disposition) => {
      return game.i18n.localize(
        HauntedActor.DISPOSITION.getStringID(disposition)
      );
    },
  };

  static DISPOSITION_TABLE = [
    { min: 2, max: 3, disposition: HauntedActor.DISPOSITION.ADVOCATE },
    { min: 4, max: 5, disposition: HauntedActor.DISPOSITION.FRIENDLY },
    { min: 6, max: 8, disposition: HauntedActor.DISPOSITION.CONFLICTED },
    { min: 9, max: 10, disposition: HauntedActor.DISPOSITION.UNFRIENDLY },
    { min: 11, max: 12, disposition: HauntedActor.DISPOSITION.ADVERSARY },
  ];

  static async create(data, options = {}) {
    data.system = data.system || {};
    data.ownership = data.ownership || {};
    data.prototypeToken = data.prototypeToken || {};

    console.log(data);

    const system = {};
    const ownership = {};
    const prototypeToken = {
      actorLink: true,
      height: 3,
      width: 5,
    };

    switch (data.type) {
      case HauntedActor.CHARACTER_TYPE.MURDERER:
        data.img = "systems/haunted/assets/icons/spy.svg";
        system.influence = 2;
        system.effort = 4;

        ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
        break;

      case HauntedActor.CHARACTER_TYPE.GHOST:
        data.img = "systems/haunted/assets/icons/haunting.svg";
        system.presence = {
          value: 6,
          max: 6,
        };
        ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
        break;

      case HauntedActor.CHARACTER_TYPE.SUPPORT_MURDERER:
      case HauntedActor.CHARACTER_TYPE.SUPPORT_BOTH:
        const disposition = HauntedActor.generateDisposition();
        system.disposition = disposition;

      case HauntedActor.CHARACTER_TYPE.SUPPORT_VICTIM:
        const roll = new Roll("1d4+1").evaluate({ async: false });
        const influence = roll.total;
        const effort = 6 - influence;

        system.influence = influence;
        system.effort = effort;

        data.img = "systems/haunted/assets/icons/character.svg";

        ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
        break;
    }

    mergeObject(data.system, system, { overwrite: false });
    mergeObject(data.ownership, ownership, { overwrite: false });
    mergeObject(data.prototypeToken, prototypeToken, { overwrite: false });

    return super.create(data, options);
  }

  static generateDisposition() {
    const roll = new Roll("2d6");
    roll.evaluate({ async: false });
    const result = roll.total;

    for (const entry of HauntedActor.DISPOSITION_TABLE) {
      if (result >= entry.min && result <= entry.max) return entry.disposition;
    }
  }

  static getCharacterType(types) {
    if (!Array.isArray(types)) types = [types];
    return game.actors.contents.filter((character) =>
      types.includes(character.type)
    );
  }

  static async _spendHelpDice(helpers) {
    for (const helper of helpers) {
      if (helper.count === 0) continue;

      const actor = game.actors.get(helper.id);
      let update = {};

      if (actor.type === HauntedActor.CHARACTER_TYPE.GHOST) {
        const conflict = game.combat;
        if (conflict?.started) conflict.ghostHelped = true;
        update = {
          "system.presence.value": actor.system.presence.value - helper.count,
        };
      } else
        update = {
          "system.effort":
            actor.system.effort - Math.min(actor.system.effort, helper.count),
        };

      await actor.update(update);
    }
  }

  get inConflict() {
    const conflict = game.combat;

    if (conflict?.started) {
      const characters = conflict.combatants;
      if (characters.find((character) => character.actorId === this.id))
        return true;
    }

    return false;
  }

  async showInfluenceRollDialog() {
    const dialog = new InfluenceRollDialog(this);
    dialog.render(true);
  }

  async rollAttribute(attribute, effortSpent = 0, helpers = []) {
    effortSpent = effortSpent <= 0 ? 0 : await this.spendEffort(effortSpent);
    const helpDice = this.totalHelpDice(helpers);
    await this.spendHelpDice(helpers);

    let value = this.system[attribute];
    if (typeof value !== "number") value = value.value;

    const totalDice = value + effortSpent + helpDice;
    const diceFormula = `${totalDice}d6`;
    const roll = new Roll(diceFormula, this.getRollData());

    roll.evaluate({ async: false });

    if (game.dice3d) {
      game.dice3d.showForRoll(roll, game.user, true);
    }

    const dice = DiceFormater.sortDice(roll.terms[0].results);

    if (this.inConflict) game.combat.addRoll(this, dice);
    else this.reportAttributeRoll(attribute, dice);
  }

  async reportAttributeRoll(attribute, dice) {
    const chatData = {
      attribute: attribute,
      roll: dice,
    };

    const html = await renderTemplate(
      "systems/haunted/templates/chat/attribute-roll-single.hbs",
      chatData
    );

    ChatMessage.create({
      content: html,
      sound: CONFIG.sounds.dice, //TODO: Support Dice So Nice?
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  async spendEffort(effortSpent) {
    effortSpent =
      effortSpent <= this.system.effort ? effortSpent : this.system.effort;
    const newEffort = this.system.effort - effortSpent;
    await this.update({ "system.effort": newEffort });
    return effortSpent;
  }

  async increaseEffort(addedEffort) {
    const newEffort = this.system.effort + addedEffort;
    this.update({ "system.effort": newEffort });
  }

  async spendHelpDice(helpers) {
    if (UserUtils.isGM) await HauntedActor._spendHelpDice(helpers);
    else SocketEvents.spendHelpDice(helpers);
  }

  totalHelpDice(helpers) {
    return helpers.reduce((accumulator, helper) => {
      if (helper.count === 0) return accumulator;

      const actor = game.actors.get(helper.id);
      if (actor.type === HauntedActor.CHARACTER_TYPE.GHOST)
        return accumulator + helper.count;
      return accumulator + Math.min(helper.count, actor.system.effort);
    }, 0);
  }

  async adjustDisposition(delta) {
    let newDisposition = (this.system.disposition += delta);
    if (newDisposition <= HauntedActor.DISPOSITION.UNKNOWN)
      newDisposition = HauntedActor.DISPOSITION.ADVOCATE;
    else if (newDisposition > HauntedActor.DISPOSITION.ADVOCATE)
      newDisposition = HauntedActor.DISPOSITION.ADVERSARY;
    this.update({ "system.disposition": newDisposition });
  }

  async increaseSupportInfluence() {
    const currentInfluence = this.system.influence;
    const currentEffort = this.system.effort;
    const cost = (currentInfluence + 1) * 2;

    if (currentEffort >= cost) {
      this.update({
        "system.influence": currentInfluence + 1,
        "system.effort": currentEffort - cost,
      });
    }
  }

  async adjustPresence(amount, adjustMax) {
    let value = this.system.presence.value;
    const max = this.system.presence.max;

    value = Math.min(value + amount, max);

    let adjustments = { "system.presence.value": value };
    if (adjustMax)
      adjustments = {
        ...adjustments,
        "system.presence.max": max + amount,
      };

    this.update(adjustments);
  }

  async increaseMurdererInfluence() {
    const ghost = HauntedActor.getCharacterType(
      HauntedActor.CHARACTER_TYPE.GHOST
    )[0];
    const currentMaxPresence = ghost.system.presence.max;
    const currentInfluence = this.system.influence;

    if (currentMaxPresence > 0) {
      this.update({
        "system.influence": currentInfluence + 1,
      });

      if (UserUtils.isGM) ghost.adjustPresence(-1, true);
      else SocketEvents.decreasePresence(ghost.id);
    }
  }

  async updateToken() {
    const svgFile = ActorToSVG.createSVG(this);
    await ActorToSVG.uploadFile(svgFile);
    HauntedToken.redrawToken(this.id);
    SocketEvents.refreshToken(this.id);
  }
}

Hooks.on("createActor", (document, options, userID) => {
  if (UserUtils.isGM)
    document.update({
      "prototypeToken.texture.src": ActorToSVG.getFullPath(document),
    });
});

Hooks.on("preUpdateActor", (document, changes, options, userID) => {});

Hooks.on("updateActor", (document, changes, options, userID) => {
  if (UserUtils.isGM) document.updateToken();
});

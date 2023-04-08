import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";
import { DiceFormater } from "../utlis/dice-formater.mjs";
import { ActorToSVG } from "../utlis/actor-to-svg.mjs";
import { SocketEvents } from "../networking/socket-events.mjs";
import { HauntedToken } from "../placeables/HauntedToken.mjs";

export class HauntedActor extends Actor {

    static CHARACTER_TYPE = {
        MURDERER: 'murderer',
        GHOST: "ghost",
        SUPPORT: ["support-murderer", "support-victim", "support-both"],
        SUPPORT_MURDERER: "support-murderer",
        SUPPORT_VICTIM: "support-victim",
        SUPPORT_BOTH: "support-both"
    }

    static ATTRIBUTE_STRS = {
        influence: "HAUNTED.Character.Influence",
        presence: "HAUNTED.Character.Presence"
    }

    static ATTRIBUTE = {
        INFLUENCE: "influence",
        PRESENCE: "presence",

        getStringID: (attribute) => {
            return HauntedActor.ATTRIBUTE_STRS[attribute];
        },

        getLocalString: (attribute) => {
            return game.i18n.localize(HauntedActor.ATTRIBUTE.getStringID(attribute));
        }
    }

    static DISPOSITION_STRS = [
        "HAUNTED.Disposition.Unknown",
        "HAUNTED.Disposition.Adversary",
        "HAUNTED.Disposition.Unfriendly",
        "HAUNTED.Disposition.Conflicted",
        "HAUNTED.Disposition.Friendly",
        "HAUNTED.Disposition.Advocate"
    ]

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
            return game.i18n.localize(HauntedActor.DISPOSITION.getStringID(disposition));
        }
    }
  
    static DISPOSITION_TABLE = [
        {min: 2, max:3, disposition: HauntedActor.DISPOSITION.ADVOCATE},
        {min: 4, max:5, disposition: HauntedActor.DISPOSITION.FRIENDLY},
        {min: 6, max:8, disposition: HauntedActor.DISPOSITION.CONFLICTED},
        {min: 9, max:10, disposition: HauntedActor.DISPOSITION.UNFRIENDLY},
        {min: 11, max:12, disposition: HauntedActor.DISPOSITION.ADVERSARY}      
    ]

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
            width: 5
        };

        switch(data.type) {
            case HauntedActor.CHARACTER_TYPE.MURDERER:
                data.img = "systems/haunted/assets/icons/spy.svg";
                system.influence = 2;
                system.effort = 6;

                ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
                break;
    
            case HauntedActor.CHARACTER_TYPE.GHOST:
                data.img = "systems/haunted/assets/icons/haunting.svg";
                system.presence = 8

                ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
                break;
    
            case HauntedActor.CHARACTER_TYPE.SUPPORT_MURDERER:
            case HauntedActor.CHARACTER_TYPE.SUPPORT_BOTH:
                data.img = "systems/haunted/assets/icons/character.svg";
                const disposition = HauntedActor.generateDisposition();
                system.disposition = disposition;
    
            case HauntedActor.CHARACTER_TYPE.SUPPORT_VICTIM:
                const roll = new Roll("1d6+1").evaluate({async: false});
                const influence = roll.total;
                const effort = 8 - influence;
    
                system.influence = influence;
                system.effort = effort;
    
                ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
                break;
        }

        mergeObject(data.system, system, {overwrite: false});
        mergeObject(data.ownership, ownership, {overwrite: false});
        mergeObject(data.prototypeToken, prototypeToken, {overwrite: false});

        return super.create(data, options);
    }

    static generateDisposition() {
        const roll = new Roll("2d6");
        roll.evaluate({async:false})
        const result = roll.total;

        for (const entry of HauntedActor.DISPOSITION_TABLE) {
            if(result >= entry.min && result <= entry.max)
                return entry.disposition;
        }
    }

    async showInfluenceRollDialog() {
        const dialog = new InfluenceRollDialog();
        dialog.actor = this;
        dialog.render(true);
    }

    async rollAttribute(attribute, effortSpent = 0, helpDice= 0) {
        effortSpent = effortSpent <= 0 ? 0 : await this.spendEffort(effortSpent); 
        const totalDice = this.system[attribute] + effortSpent + helpDice;
        const diceFormula = `${totalDice}d6`;
        const roll = new Roll(diceFormula, this.getRollData());
        
        roll.evaluate({async:false});
   
        this.reportAttributeRoll(attribute, roll);
    }

    async reportAttributeRoll(attribute, roll) {
        const dice = DiceFormater.sortDice(roll.terms[0].results);
        const chatData = {
            attribute: attribute,
            roll: dice
        };
        const html = await renderTemplate(
            "systems/haunted/templates/chat/attribute-roll-single.hbs",
            chatData
        );

        ChatMessage.create({
            content: html,
            sound: CONFIG.sounds.dice, //TODO: Support Dice So Nice?
            speaker: ChatMessage.getSpeaker({actor: this}),
        });
    }

    async spendEffort(effortSpent) {
        effortSpent = effortSpent <= this.system.effort ? effortSpent : this.system.effort;
        const newEffort = this.system.effort - effortSpent;
        await this.update({"system.effort": newEffort});
        return effortSpent;
    }

    async updateToken() {
        const svgFile = ActorToSVG.createSVG(this);
        await ActorToSVG.uploadFile(svgFile);
        HauntedToken.redrawToken(this.id);
        SocketEvents.refreshToken(this.id);
    }
}

Hooks.on("createActor", (document, options, userID) => {
    const user = game.users.get(game.userId);
    if(user.hasRole(CONST.USER_ROLES.GAMEMASTER))
        document.update({"prototypeToken.texture.src": ActorToSVG.getFullPath(document)});
})

Hooks.on("preUpdateActor", (document, changes, options, userID) => {
})

Hooks.on("updateActor", (document, changes, options, userID) => {
    const user = game.users.get(game.userId);
    if(user.hasRole(CONST.USER_ROLES.GAMEMASTER))
        document.updateToken();
})
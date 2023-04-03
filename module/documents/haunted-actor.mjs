import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";
import { DiceFormater } from "../utlis/dice-formater.mjs";

export class HauntedActor extends Actor {

    static CHARACTER_TYPE = {
        MURDERER: 'murderer',
        GHOST: "ghost",
        SUPPORT: ["support-murderer", "support-victim", "support-both"],
        SUPPORT_MURDERER: "support-murderer",
        SUPPORT_VICTIM: "support-victim",
        SUPPORT_BOTH: "support-both"
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

    async rollInfluence(effortSpent, helpDice) {
        effortSpent = effortSpent <= 0 ? 0 : await this.spendEffort(effortSpent); 
        const totalDice = this.system.influence + effortSpent + helpDice;
        const diceFormula = `${totalDice}d6`;
        const influceRoll = new Roll(diceFormula, this.getRollData());
        
        influceRoll.evaluate({async:false});
   
        this.reportInfluenceRoll(influceRoll);
    }

    async reportInfluenceRoll(influenceRoll) {
        const dice = DiceFormater.sortDice(influenceRoll.terms[0].results);
        const chatData = {influenceRoll: dice};
        const html = await renderTemplate(
            "systems/haunted/templates/chat/influence-roll-single.hbs",
            chatData
        )

        ChatMessage.create({
            content: html,
            sound: CONFIG.sounds.dice, //TODO: Support Dice So Nice?
            speaker: ChatMessage.getSpeaker({actor: this}),
        });
    }

    async spendEffort(effortSpent)
    {
        effortSpent = effortSpent <= this.system.effort ? effortSpent : this.system.effort;
        const newEffort = this.system.effort - effortSpent;
        await this.update({"system.effort": newEffort});
        return effortSpent;
    }
}

Hooks.on("createActor", (actorData, ...args) => {
    let stats = {};
    let disposition = {};
    let ownership = {};

    console.log(actorData);

    switch(actorData.type) {
        case HauntedActor.CHARACTER_TYPE.MURDERER:
            stats = {
                "system.influence": 2,
                "system.effort": 6 
            };
            break;

        case HauntedActor.CHARACTER_TYPE.SUPPORT_MURDERER:
        case HauntedActor.CHARACTER_TYPE.SUPPORT_BOTH:
            const attitude = HauntedActor.generateDisposition();
            disposition = {
                "system.disposition": attitude
            };

        case HauntedActor.CHARACTER_TYPE.SUPPORT_VICTIM:
            const roll = new Roll("1d6+1").evaluate({async: false});
            const influence = roll.total;
            const effort = 8 - influence;

            stats = {
                "system.influence": influence,
                "system.effort": effort
            };

            ownership = {
                "ownership.default": CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
            };
            break;
    }

    const initState = {
        ...stats,
        ...disposition,
        ...ownership
    };

    actorData.update(initState);
});
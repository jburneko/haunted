import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";
import { DiceFormater } from "../utlis/dice-formater.mjs";

export class HauntedActor extends Actor {

    static CHARACTER_TYPES = {
        MURDERER: 'murderer',
        GHOST: "ghost",
        SUPPORT: "supporting"
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
    switch(actorData.type) {
        case HauntedActor.CHARACTER_TYPES.MURDERER:
            actorData.update({"system.influence": 2,
                          "system.effort": 6 });
            break;

        case HauntedActor.CHARACTER_TYPES.SUPPORT:
            const roll = new Roll("1d6+1").evaluate({async: false});
            const influence = roll.total;
            const effort = 8 - influence;

            actorData.update({"system.influence": influence,
                              "system.effort": effort});
            break;
    }
});
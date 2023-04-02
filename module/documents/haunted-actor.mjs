import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";

export class HauntedActor extends Actor {

    static CHARACTER_TYPES = {
        MURDERER: 'murderer'
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

    async reportInfluenceRoll(influceRoll) {
        const dice = influceRoll.terms[0].results
            .map(a => a.result)
            .sort((a, b) => a - b)
            .reverse();

        console.log(dice);
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
    if(actorData.type === HauntedActor.CHARACTER_TYPES.MURDERER) {
        actorData.update({"system.influence": 2,
                          "system.effort": 6 });
    }
});
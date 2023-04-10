import { UserUtils } from "../utlis/user-utils.mjs";
import { SocketEvents } from "../networking/socket-events.mjs";
import { DiceFormater } from "../utlis/dice-formater.mjs";

export class HauntedConflict extends Combat {

    static get conflict() {
        return game.combat;
    }

    static async _addRoll(actorId, dice) {
        const conflict = HauntedConflict.conflict;

        await conflict.setFlag("haunted", "conflictData", {[actorId]: dice});

        console.log(conflict.conflictData);

        conflict.processRolls();
    }

    get conflictData() {
        return this.getFlag("haunted", "conflictData");
    }

    get sortableData() {
        const result = []
        const data = this.conflictData;

        for (const key in data) {
            const entry = { actorId: key, dice: data[key]};
            result.push(entry);
        }

        return result;
    }

    get allIn() {
       const entries = this.combatants;
       const data = this.conflictData;
        for (const entry of entries)
            if(!(entry.actorId in data))
                return false;
        return true;
    }

    async addRoll(actor, dice) {
        if(UserUtils.isGM) HauntedConflict._addRoll(actor.id, dice);
        else SocketEvents.addConflictRoll(actor.id, dice);
    }

    findTies(data, highDie) {
        const result = [];
        for(const entry of data) {
            if(entry.dice[0] === highDie)
                result.push(entry);
        }
        return result;
    }

    determineOutcome() {
        let data = this.sortableData;
        let tieFound = false;

        do {
            data = DiceFormater.sortDiceList(data);
            console.log(data);
            const highDie = data[0].dice[0];
            if(highDie !== 0) {
                const tiedSets = data.filter(entry => entry.dice[0] === highDie);
                if(tiedSets.length > 1) {
                    tieFound = true;
                    for (const set of tiedSets) set.dice[0] = 0;
                    for(const entry of data) entry.dice = DiceFormater.sortDiceArray(entry.dice);
                }
                else
                    tieFound = false;
            }
        } while(tieFound);

        return data;
    }

    processRolls() {
        if(this.allIn) {
            console.log("*****Determining Outcome*****")
            const outcome = this.determineOutcome();
            console.log(outcome);
        }
    }
}
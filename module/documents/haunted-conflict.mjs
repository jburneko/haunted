import { UserUtils } from "../utlis/user-utils.mjs";
import { SocketEvents } from "../networking/socket-events.mjs";
import { DiceFormater } from "../utlis/dice-formater.mjs";
import { HauntedActor } from "./haunted-actor.mjs";

export class HauntedConflict extends Combat {

    static get conflict() {
        return game.combat;
    }

    static async _addRoll(actorId, dice) {
        const conflict = HauntedConflict.conflict;

        await conflict.setFlag("haunted", "conflictData", {[actorId]: dice});

        const character = conflict.combatants.contents.filter(entry => entry.actorId === actorId)[0];
        character.update({"hidden":false});

        conflict.processRolls();
    }

    get ghostHelped() {
        const flag = this.getFlag("haunted", "ghostHelped");
        if(flag === undefined)
            return false;
        return flag;
    }

    set ghostHelped(flag) {
        this.setFlag("haunted", "ghostHelped", flag);
    }

    get conflictData() {
        return this.getFlag("haunted", "conflictData");
    }

    get sortableData() {
        const result = []
        const data = this.conflictData;
        console.log(data);

        for (const key in data) {
            const entry = { actorId: key, victories: 0, dice:[...data[key]]};
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

    countVictories(outcome) {
        const secondHighest = outcome[1].dice[0];

        if(outcome[0].dice[0] === 0) return 0; // Super Edge Case of All Dice Canceling Each Other

        if(secondHighest === 0) return 1; // Edge case of the loser having all dice canceled.

        return outcome[0].dice.reduce((accumulator, die) => {
            if(die > secondHighest ) return accumulator + 1;
            return accumulator;
        }, 0);
    }

    determineOutcome() {
        let data = this.sortableData;
        let tieFound;
        
        do {
            tieFound = false;
            data = DiceFormater.sortDiceList(data);
            const highDie = data[0].dice[0];
            if(highDie !== 0) {
                const tiedSets = data.filter(entry => entry.dice[0] === highDie);
                if(tiedSets.length > 1) {
                    tieFound = true;
                    for (const set of tiedSets) set.dice[0] = 0;
                    for(const entry of data) entry.dice = DiceFormater.sortDiceArray(entry.dice);
                }
            }
        } while(tieFound);

        const victories = this.countVictories(data);
        data[0].victories = victories;

        return data;
    }

    getOutcomeState(outcome) {
        const outcomeState  = {
            didMurdererWin: false,
            didGhostWin: false,
            didGhostRoll: false,
            ghostActor: null,
        };

        const winner = game.actors.get(outcome[0].actorId);

        if(winner.type === HauntedActor.CHARACTER_TYPE.MURDERER) outcomeState.didMurdererWin = true;
        if(winner.type === HauntedActor.CHARACTER_TYPE.GHOST) outcomeState.didGhostWin = true;
        
        for(const entry of outcome) {
            const character = game.actors.get(entry.actorId);
            if(character.type === HauntedActor.CHARACTER_TYPE.GHOST) {
                outcomeState.didGhostRoll = true;
                outcomeState.ghostActor = character;
                break;
            }
        }

        return outcomeState
    }

    applyVictories(outcome) {
        const victories = outcome[0].victories;
        const outcomeState = this.getOutcomeState(outcome);
        if(outcomeState.didGhostRoll) {
            if(outcomeState.didMurdererWin) outcomeState.ghostActor.adjustPresence(-victories, false);
            if(outcomeState.didGhostWin) outcomeState.ghostActor.adjustPresence(victories, false);
        }
        else {
            const winner = game.actors.get(outcome[0].actorId);
            winner.increaseEffort(victories);
        }

        if(!this.ghostHelped && !outcomeState.didGhostRoll) {
            const ghost = HauntedActor.getCharacterType(HauntedActor.CHARACTER_TYPE.GHOST)[0];
            ghost.adjustPresence(1, false);
        }
    }

    processRolls() {
        if(this.allIn) {
            console.log("*****Determining Outcome*****")
            const outcome = this.determineOutcome();
            this.applyVictories(outcome);
            this.reportConflictOutcome(outcome);
            this.forceConflictEnd();
        }
    }

    addPrintInfo(outcome) {
        for (const entry of outcome) {
            const actor = game.actors.get(entry.actorId);
            entry.name = actor.name;
            if(actor.type === HauntedActor.CHARACTER_TYPE.GHOST)
                entry.attribute = game.i18n.localize("HAUNTED.Character.Presence");
            else
                entry.attribute = game.i18n.localize("HAUNTED.Character.Influence");
        }
    }

    async reportConflictOutcome(outcome) {
        this.addPrintInfo(outcome);

        const chatData = {
            outcome:outcome
        };

        const html = await renderTemplate(
            "systems/haunted/templates/chat/conflict-outcome.hbs",
            chatData
        );

        ChatMessage.create({
            content: html,
            sound: CONFIG.sounds.dice, //TODO: Support Dice So Nice?
            //speaker: ChatMessage.getSpeaker({actor: this}),
        });
    }

    forceConflictEnd() {
        this.delete();
    }

    static getActorFromUI(element) {
        const id = $(element).parents(".combatant.actor").attr("data-combatant-id");
        const entry = game.combat.combatants.get(id);
        const actor = game.actors.get(entry.actorId);
        return actor;
    }

    static onDieImage(event) {
        event.preventDefault();
        const actor = HauntedConflict.getActorFromUI(this);
        if(actor.type === HauntedActor.CHARACTER_TYPE.GHOST) {
            actor.rollAttribute(HauntedActor.ATTRIBUTE.PRESENCE);
        }
        else
            actor.showInfluenceRollDialog();
    }
}

Hooks.on("combatStart", (combat, options) => {
    if(UserUtils.isGM) {
        for (const entry of combat.combatants.contents) {
            entry.update({"hidden":true});
        }
    }
});

Hooks.on("createCombatant", (character, options, uuid) => {
    if(UserUtils.isGM) {
        const actor = game.actors.get(character.actorId);
        character.update({"img": actor.img});
    }
});

Hooks.on("renderCombatTracker", (tracker) => {
    const initiative = $(tracker.element).find(".combatant-control.roll")
    $(initiative).off("click");
    $(initiative).css("background", "url(systems/haunted/assets/icons/rolling-dices.svg) no-repeat 50% 50%");
    $(initiative).css("background-size", "32px");
    $(initiative).attr("data-tooltip", "Roll");

    for(const element of initiative)
        $(element).click(HauntedConflict.onDieImage.bind(element));

    const token_names = $(tracker.element).find(".token-name");
    for(const token_name of token_names) {
        if(game.combat?.started)
        {
            const actor = HauntedConflict.getActorFromUI(token_name);
            const conflictData = game.combat.conflictData;
            let dice = conflictData[actor.id];
            if(Array.isArray(dice)) {
                dice = DiceFormater.highlightVictories(dice, 0);
                dice = DiceFormater.diceToString(dice);
                $(token_name).append(`<span class="haunted"><div class="attribute-dice conflict-dice">${dice}</div></spen>`);

                const token_img = $(token_name).siblings(".token-image");
                $(token_img).css("width", "68px");
                $(token_img).css("height", "68px");

                const token_initiative = $(token_name).siblings(".token-initiative");
                $(token_initiative).css("display", "none");
            }
        }
    }
});

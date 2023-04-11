import { HauntedActor } from "../documents/haunted-actor.mjs";
import { HauntedToken } from "../placeables/HauntedToken.mjs";
import { UserUtils } from "../utlis/user-utils.mjs";
import { HauntedConflict } from "../documents/haunted-conflict.mjs";

export class SocketHandler {
    static processEvent(data) {
        switch(data.event_id) {
            case `SOCKETEVENT.refreshToken`: SocketHandler.refreshToken(data.data); break;
            case `SOCKETEVENT.decreasePresence`: SocketHandler.decreasePresence(data.data); break;
            case `SOCKETEVENT.spendHelpDice`: SocketHandler.spendHelpDice(data.data); break;
            case `SOCKETEVENT.addConflictRoll`: SocketHandler.addConflictRoll(data.data); break;
        }
    }

    static refreshToken(actorId) {
        HauntedToken.redrawToken(actorId);
    }

    static decreasePresence(actorId) {
        if (UserUtils.isGM) {
            console.log(actorId);
            console.log(game.actors);

            const ghost = game.actors.get(actorId);
            ghost.adjustPresence(-1, true);
        }
    }

    static spendHelpDice(helpers) {
        if (UserUtils.isGM)
            HauntedActor._spendHelpDice(helpers);
    }

    static addConflictRoll(data) {
        const actorId = data.actorId;
        const dice = data.dice;
        HauntedConflict._addRoll(actorId, dice);
    }
}
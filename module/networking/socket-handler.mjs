import { HauntedToken } from "../placeables/HauntedToken.mjs";
import { UserUtils } from "../utlis/user-utils.mjs";

export class SocketHandler {
    static processEvent(data) {
        switch(data.event_id) {
            case `SOCKETEVENT.refreshToken`: SocketHandler.refreshToken(data.data); break;
            case `SOCKETEVENT.decreasePresence`: SocketHandler.decreasePresence(data.data); break;
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

            console.log(ghost);

            ghost.decreasePresence();
        }
    }
}
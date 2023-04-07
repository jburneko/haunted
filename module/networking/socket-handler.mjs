import { HauntedToken } from "../placeables/HauntedToken.mjs";
export class SocketHandler {
    static processEvent(data) {
        switch(data.event_id) {
            case `SOCKETEVENT.refreshToken`: SocketHandler.refreshToken(data.data); break;
        }
    }

    static refreshToken(actorId) {
        console.log("***** Socket Event Refresh Token *****");
        HauntedToken.redrawToken(actorId);
    } 
}
export class SocketEvents {

    static send(eventData) {
        game.socket.emit('system.haunted', eventData);
    }

    static refreshToken(actorId) {
        const eventData = {
            event_id : `SOCKETEVENT.refreshToken`,
            data: actorId
        };
        SocketEvents.send(eventData);
    }

    static decreasePresence(actorId) {
        const eventData = {
            event_id : `SOCKETEVENT.decreasePresence`,
            data: actorId
        };
        SocketEvents.send(eventData);
    }

    static spendHelpDice(helpers) {
        const eventData = {
            event_id: `SOCKETEVENT.spendHelpDice`,
            data: helpers
        };
        SocketEvents.send(eventData);
    }
}
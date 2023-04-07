export class SocketEvents {
    static refreshToken(actorId) {
        const eventData = {
            event_id : `SOCKETEVENT.refreshToken`,
            data: actorId
        }
        game.socket.emit('system.haunted', eventData);
    }
}
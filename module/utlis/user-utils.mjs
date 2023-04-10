export class UserUtils {
    static get isGM() {
        const user = game.users.get(game.userId);
        if(user.hasRole(CONST.USER_ROLES.GAMEMASTER))
            return true;
        return false;
    }
}
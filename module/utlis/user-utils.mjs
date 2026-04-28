import { DebugUtils } from "./debug-utils.mjs";

export class UserUtils {
  static get CurrentUser() {
    const user = game.users.get(game.userId);
    return user;
  }

  static get isActiveGM() {
    return UserUtils.CurrentUser.isActiveGM;
  }

  static canUpload(user = UserUtils.CurrentUser) {
    return user.hasPermission("FILES_UPLOAD");
  }

  static isSourceOfTruth(user = UserUtils.CurrentUser) {
    return user.isActiveGM && UserUtils.canUpload(user);
  }

  static get hasSourceOfTruth() {
    for (const user of game.users) {
      if (UserUtils.isSourceOfTruth(user)) return true;
    }
    return false;
  }
}

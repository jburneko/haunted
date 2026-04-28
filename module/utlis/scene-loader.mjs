import { DebugUtils } from "./debug-utils.mjs";
import { SocialDiagram } from "../documents/haunted-diagram.mjs";

export class SceneLoader {
  static async loadScene() {
    let diagram_scene = SocialDiagram.instance;

    if (diagram_scene === undefined) {
      const pack = game.packs.get("haunted.scenes");
      for (const scene of pack.index) {
        let result = game.scenes.find(
          (game_scene) => game_scene.id === scene._id,
        );

        if (result === undefined)
          result = await game.scenes.importFromCompendium(pack, scene._id);

        SocialDiagram.SetInstance(result);
        result.activate();
      }
    }
  }
}

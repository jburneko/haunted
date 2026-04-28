import { ActorToSVG } from "../utlis/actor-to-svg.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";
import { UserUtils } from "../utlis/user-utils.mjs";
import { SocialDiagram } from "../documents/haunted-diagram.mjs";

export class HauntedToken extends foundry.canvas.placeables.Token {
  static INDEX_CARD_SIZES = {
    SMALL: { x: 5, y: 3 },
    MEDIUM: { x: 6, y: 4 },
    LARGE: { x: 8, y: 5 },
    XLARGE: { x: 9, y: 6 },
  };

  static _currentSize = HauntedToken.INDEX_CARD_SIZES.SMALL;
  static get IndexCardSize() {
    return HauntedToken._currentSize;
  }

  static redrawToken(actorId) {
    const token = canvas.tokens.placeables.find(
      (placeable) => placeable.document.actorId === actorId,
    );
    if (token) token.redraw();
    else if (UserUtils.isSourceOfTruth()) {
      const scene = SocialDiagram.instance;
      const actor = game.actors.get(actorId);
      const tokenData = actor.prototypeToken.toObject();
      tokenData.actorId = actorId;
      scene.createEmbeddedDocuments("Token", [tokenData]);
    }
  }

  async redraw() {
    const src = this.document.texture.src;
    await PIXI.Assets.unload(src);
    /* const texture = await PIXI.Assets.load(src);
    foundry.canvas.TextureLoader.loader.setCache(src, texture);
    this.texture = texture;
    this.mesh.texture = texture;*/
    this.draw();
  }
}

Hooks.on("createToken", (token, options, userID) => {});

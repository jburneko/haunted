import { ActorToSVG } from "../utlis/actor-to-svg.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";

export class HauntedToken extends foundry.canvas.placeables.Token {
  static redrawToken(actorId) {
    for (const token of canvas.tokens.placeables) {
      if (token.document.actorId === actorId) {
        token.redraw();
      }
    }
  }

  async redraw() {
    const src = this.document.texture.src;
    await PIXI.Assets.unload(src);
    const newTexture = await PIXI.Assets.load(src);
    foundry.canvas.TextureLoader.loader.setCache(src, newTexture);
    this.texture = newTexture;
    this.mesh.texture = newTexture;
  }
}

Hooks.on("createToken", (token, options, userID) => {});

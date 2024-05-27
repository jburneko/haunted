import { ActorToSVG } from "../utlis/actor-to-svg.mjs";

export class HauntedToken extends Token {
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
    TextureLoader.loader.setCache(src, newTexture);
    this.texture = newTexture;
    this.mesh.texture = newTexture;
  }
}

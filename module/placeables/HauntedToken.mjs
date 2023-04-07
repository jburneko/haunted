import { ActorToSVG } from "../utlis/actor-to-svg.mjs";

export class HauntedToken extends Token {

    static redrawToken(actorId) {
        for (const token of canvas.tokens.placeables) {
            if(token.document.actorId === actorId) {
                token.redraw();
            }
        }
    }

    clearCache() {
        const oldTexture = TextureLoader.loader.getCache(this.document.texture.src);
        const srcURL = oldTexture?.resource?.source?.src;
        if (srcURL) URL.revokeObjectURL(srcURL);
        if (!oldTexture?._destroyed) oldTexture?.destroy(true);
    }

    async redraw() {
        this.clearCache();
        const newTexture = await loadTexture(this.document.texture.src);
        this.texture = newTexture
        this.mesh.texture = newTexture
    } 
}

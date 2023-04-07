export class SceneLoader {
    static async loadScene() {
        const pack = game.packs.get("haunted.scenes");
        for (const scene of pack.index) {
            const result = await game.scenes.importFromCompendium(pack, scene._id);
            result.activate();
        }       
    }
}
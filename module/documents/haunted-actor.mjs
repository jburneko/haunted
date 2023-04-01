import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";

export class HauntedActor extends Actor {

    static CHARACTER_TYPES = {
        MURDERER: 'murderer'
    }

    async showInfluenceRollDialog() {
        const dialog = new InfluenceRollDialog();
        dialog.actor = this;
        dialog.render(true);
    }
}

Hooks.on("createActor", (actorData, ...args) => {
    if(actorData.type === HauntedActor.CHARACTER_TYPES.MURDERER) {
        actorData.update({"system.influence": 2,
                          "system.effort": 6 });
    }
});
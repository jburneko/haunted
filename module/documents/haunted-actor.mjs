export class HauntedActor extends Actor {

static CHARACTER_TYPES = {
    MURDERER: 'murderer'
}

}

Hooks.on("createActor", (actorData, ...args) => {
   
    if(actorData.type === HauntedActor.CHARACTER_TYPES.MURDERER) {
        actorData.update({"system.influence": 2,
                          "system.effort": 6 });
    }

});
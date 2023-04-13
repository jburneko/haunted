import { HauntedActor } from "../documents/haunted-actor.mjs";

export class CharacterSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 512,
            height: 512
        });
    }

    getData () {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system;
        context.flags = actorData.flags;

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
    
        if (this.actor.isOwner) {
            html.find(".rollable").click(this._rollAttribute.bind(this));
        }
      }
    
    _rollAttribute(event) {
        event.preventDefault();
        this.actor.showInfluenceRollDialog();
    }
} 
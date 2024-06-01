import { DiceFormater } from "../utlis/dice-formater.mjs";
import { HauntedActor } from "../documents/haunted-actor.mjs";
import { UserUtils } from "../utlis/user-utils.mjs";

export class HauntedUI {
  static getActorFromUI(element) {
    const id = $(element).parents(".combatant.actor").attr("data-combatant-id");
    const entry = game.combat.combatants.get(id);
    const actor = game.actors.get(entry.actorId);
    return actor;
  }

  static onDieImage(event) {
    event.preventDefault();
    if (game.combat?.started) {
      const actor = HauntedUI.getActorFromUI(this);
      if (actor.type === HauntedActor.CHARACTER_TYPE.GHOST) {
        actor.rollAttribute(HauntedActor.ATTRIBUTE.PRESENCE);
      } else actor.showInfluenceRollDialog();
    }
  }
}

Hooks.on("combatStart", (combat, options) => {
  if (UserUtils.isGM) {
    for (const entry of combat.combatants.contents) {
      entry.update({ hidden: true });
    }
  }
});

Hooks.on("createCombatant", (character, options, uuid) => {
  if (UserUtils.isGM) {
    const actor = game.actors.get(character.actorId);
    character.update({ img: actor.img });
  }
});

Hooks.on("renderCombatTracker", (tracker) => {
  const initiative = $(tracker.element).find(".combatant-control.roll");
  $(initiative).off("click");
  $(initiative).css(
    "background",
    "url(systems/haunted/assets/icons/rolling-dices.svg) no-repeat 50% 50%"
  );
  $(initiative).css("background-size", "32px");
  $(initiative).attr("data-tooltip", "Roll");

  for (const element of initiative)
    $(element).click(HauntedUI.onDieImage.bind(element));

  const token_names = $(tracker.element).find(".token-name");
  for (const token_name of token_names) {
    const actor = HauntedUI.getActorFromUI(token_name);

    const re = $(token_name).parents(".combatant.actor").find(".resource");
    $(re).replaceWith(
      `<span class="resource">${actor.system.influence}/${actor.system.effort}</span>`
    );

    if (game.combat?.started) {
      const conflictData = game.combat.conflictData;
      if (conflictData) {
        let dice = conflictData[actor.id];
        if (Array.isArray(dice)) {
          dice = DiceFormater.highlightVictories(dice, 0);
          dice = DiceFormater.diceToString(dice);
          $(token_name).append(
            `<span class="haunted"><div class="attribute-dice conflict-dice">${dice}</div></spen>`
          );

          const token_img = $(token_name).siblings(".token-image");
          $(token_img).css("width", "68px");
          $(token_img).css("height", "68px");

          const token_initiative = $(token_name).siblings(".token-initiative");
          $(token_initiative).css("display", "none");
        }
      }
    }
  }
});

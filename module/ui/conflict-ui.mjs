import { DiceFormater } from "../utlis/dice-formater.mjs";
import { HauntedActor } from "../documents/haunted-actor.mjs";
import { UserUtils } from "../utlis/user-utils.mjs";
import { DebugUtils } from "../utlis/debug-utils.mjs";

export class HauntedUI {
  static getActorFromCombatantElement(combatantElement) {
    const combatantId = combatantElement.getAttribute("data-combatant-id");
    const combatant = game.combat.combatants.get(combatantId);
    const actorId = combatant.actorId;
    const actor = game.actors.get(actorId);
    return actor;
  }
  static getActorFromUI(token_name) {
    const combatantElement = token_name.parentElement;
    const actor = HauntedUI.getActorFromCombatantElement(combatantElement);
    return actor;
  }

  static cleanByClass(element, className) {
    const resourceElements = [...element.getElementsByClassName(className)];
    for (const resourceElement of resourceElements) {
      resourceElement.remove();
    }
  }

  static cleanByAttribute(element, className, attributeName, attributeValues=[]){
    const controlElements = [
      ...element.getElementsByClassName(className),
    ];
    for (const controlElement of controlElements) {
      const action = controlElement.getAttribute(attributeName);
      if (attributeValues.includes(action))
        controlElement.remove();
    }

  }

  static cleanHeader(element) {
    const parentElement = element.parentElement;
    const header = parentElement.getElementsByClassName("combat-tracker-header")[0];
    HauntedUI.cleanByAttribute(header, "combat-control", "data-action", ["rollAll", "rollNPC"]);
    const topBar = header.getElementsByClassName("encounters tabbed");
    if(topBar.length > 0) topBar[0].remove();
  }

  static cleanTracker(element) {
    HauntedUI.cleanHeader(element);
    HauntedUI.cleanByClass(element, "token-effects");
    HauntedUI.cleanByAttribute(element, "combatant-control", "data-action", ["toggleHidden", "toggleDefeated"]);

    const combatantElements = element.getElementsByClassName("combatant");
    for (const combatantElement of combatantElements) {
      if (combatantElement.classList.contains("active")){
        combatantElement.classList.remove("active");
      }
    }
  }

  static replaceInitiativeButton(element) {
    const dice_buttons = element.getElementsByClassName(
      "combatant-control roll",
    );

    for (const dice_button of dice_buttons) {
      dice_button.setAttribute("data-tooltip", "Roll");
    }
  }

  static addResources(element) {
    HauntedUI.cleanByClass(element, "token-resource");

    const token_names = element.getElementsByClassName("token-name");

    for (const token_name of token_names) {
      const actor = HauntedUI.getActorFromUI(token_name);
      const div = document.createElement("div");

      div.className = "token-resource";
      if (actor.isGhost) {
        div.innerHTML = `<span class="resource">${actor.system.presence.value}/${actor.system.presence.max}</span>`;
      } else {
        div.innerHTML = `<span class="resource">${actor.system.influence}/${actor.system.effort}</span>`;
      }
      token_name.after(div);
    }
  }

  static addDice(element) {
    const combatants = element.getElementsByClassName("combatant");
    for (const combatant of combatants) {
      const actor = HauntedUI.getActorFromCombatantElement(combatant);
      const conflictData = game.combat.conflictData;
      if (conflictData) {
        let dice = conflictData[actor.id];
        if (Array.isArray(dice)) {
          dice = DiceFormater.highlightVictories(dice, 0);
          dice = DiceFormater.diceToString(dice);

          const nameElement = combatant.getElementsByClassName("name")[0];
          const span = document.createElement("span");
          span.className = "haunted";
          span.innerHTML = `<div class="rolled-dice conflict-dice">${dice}</div>`;
          nameElement.after(span);

          /*const token_img = combatant.getElementsByClassName("token-image")[0];
          $(token_img).css("width", "68px");
          $(token_img).css("height", "68px");*/

          const token_initiative =
            combatant.getElementsByClassName("token-initiative")[0];
          token_initiative.remove();

          const token_resource =
            combatant.getElementsByClassName("token-resource")[0];
          token_resource.remove();
        }
      }
    }
  }
}

Hooks.on("combatStart", (combat, options) => {
 /* if (UserUtils.isSourceOfTruth()) {
    for (const entry of combat.combatants.contents) {
      entry.update({ hidden: true });
    }
  }*/
});

Hooks.on("createCombatant", (character, options, uuid) => {
  if (UserUtils.isSourceOfTruth()) {
    const actor = game.actors.get(character.actorId);
    character.update({ img: actor.img });
  }
});

Hooks.on("renderCombatTracker", (tracker, element, context, options) => {
  HauntedUI.cleanTracker(element);
  HauntedUI.replaceInitiativeButton(element);
  HauntedUI.addResources(element);
  if (game.combat?.started) HauntedUI.addDice(element);
});

Hooks.on("renderSidebar", (sidebar, element, context, options) => {
  const button = element.getElementsByClassName(CONFIG.Combat.sidebarIcon)[0];
  button.setAttribute("aria-label", "Conflict");
});

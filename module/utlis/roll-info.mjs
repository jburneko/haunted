import { InfluenceRollDialog } from "../applications/influence-roll-dialog.mjs";

export class RollInfo {
  constructor() {
    this.effortSpent = 0;
    this.helpers = [];
  }

  createHelper() {
    const helper = {
      id: InfluenceRollDialog.helperChoices[0].key,
      index: this.helpers.length,
      count: 0,
    };

    this.helpers.push(helper);
  }

  update(expandedData) {
    expandedData["help-dice"] = expandedData["help-dice"] || [];
    expandedData["helper-choice"] = expandedData["helper-choice"] || [];

    if (!Array.isArray(expandedData["help-dice"]))
      expandedData["help-dice"] = [expandedData["help-dice"]];
    if (!Array.isArray(expandedData["helper-choice"]))
      expandedData["helper-choice"] = [expandedData["helper-choice"]];

    this.effortSpent = expandedData.effortSpent;
    this.helpers = this.helpers.map((helper, index) => {
      return {
        id: expandedData["helper-choice"][index],
        count: expandedData["help-dice"][index] || 0,
        index: index,
      };
    });
  }

  deleteHelper(index) {
    if (index >= 0 && index < this.helpers.length) {
      this.helpers.splice(index, 1);
      this.helpers = this.helpers.map((helper, index) => {
        const newHelper = { ...helper };
        newHelper.index = index;
        return newHelper;
      });
    }
  }
}

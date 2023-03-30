class MurdererSheet extends ActorSheet {
    static TEMPLATES = {
        SHEET: "systems/haunted/templates/murderer-sheet.hbs"
    }

    get template() {
        return MurdererSheet.TEMPLATES.SHEET;
    }
} 

export class ActorToSVG {
    static HEADER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300">`
    static RECT = `<rect x="0" y="0" width="500" height="300" style="fill:rgb(250,249,246);"/>`
    static FOOTER = `</svg>`
    static MARGIN = 12.5
    static X = ActorToSVG.MARGIN
    static FONT_SIZE = 26.666
    static LEADING = 27.466
    static STYLE = `font-family:'PermanentMarker-Regular', 'Permanent Marker';font-size:${ActorToSVG.FONT_SIZE}px;fill:rgb(139,0,0);`

    static PROPERTIES = [
        {label: "HAUNTED.Character.Ambition", field: "ambition"},
        {label: "HAUNTED.Character.Problem", field: "problem"},
        {label: "HAUNTED.Character.UnfinishedBusiness", field: "unfinishedBusiness"},
        {label: "HAUNTED.Character.Disposition", field: "disposition"},
        {label: "HAUNTED.Character.Influence", field: "influence"},
        {label: "HAUNTED.Character.Effort", field: "effort"},
    ]

    static createText(field, entry, y_pos) {
        return `<text  x="${ActorToSVG.X}" y="${y_pos}" style="${ActorToSVG.STYLE}">${field}: ${entry}</text>`
    }

    static getPath() {
        return `worlds/${game.world.id}/HauntedTokens`;
    }

    static getFileName (actorData) {
        return `${actorData.uuid}-token.svg`
    }

    static getFullPath(actorData) {
        return `${ActorToSVG.getPath()}/${ActorToSVG.getFileName(actorData)}`;
    }

    static async createPath() {
        try {
            await FilePicker.browse("data", ActorToSVG.getPath());
        } catch (e) {
            await FilePicker.createDirectory("data", ActorToSVG.getPath());
        }
    }

    static async uploadFile(file) {
        return FilePicker.upload("data", ActorToSVG.getPath(), file, {}, {notify:false});
    }

    static createSVG(actorData) {
        
        let svgStr = ActorToSVG.HEADER + ActorToSVG.RECT;
        let y = ActorToSVG.MARGIN + ActorToSVG.FONT_SIZE;
        svgStr += this.createText(game.i18n.localize("HAUNTED.Character.Name"), actorData.name, y);
        for (const property of ActorToSVG.PROPERTIES) {
            const value = actorData.system[property.field];
            if(value !== undefined) {
                const localLabel = game.i18n.localize(property.label);
                y += ActorToSVG.LEADING * 2;
                svgStr += this.createText(localLabel, value, y);
            }
        }
        svgStr += ActorToSVG.FOOTER;
        
        return new File([svgStr], ActorToSVG.getFileName(actorData));
    }
}
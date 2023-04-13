import { HauntedActor } from "../documents/haunted-actor.mjs"

export class ActorToSVG {
    static HEADER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300">`
    static RECT = `<rect x="0" y="0" width="500" height="300" style="fill:rgb(250,249,246);"/>`
    static FOOTER = `</svg>`
    static MARGIN = 12.5
    static X = ActorToSVG.MARGIN
    static FONT_SIZE = 26.666
    static LEADING = 27.466
    static STYLE = `font-family:'Permanent Marker';font-size:${ActorToSVG.FONT_SIZE}px;fill:rgb(139,0,0);`

    static PROPERTIES = [
        {label: "HAUNTED.Character.Ambition", field: "ambition"},
        {label: "HAUNTED.Character.Problem", field: "problem"},
        {label: "HAUNTED.Character.UnfinishedBusiness", field: "unfinishedBusiness"},
        {label: "HAUNTED.Character.Disposition", field: "disposition"},
        {label: "HAUNTED.Character.Influence", field: "influence"},
        {label: "HAUNTED.Character.Effort", field: "effort"},
        {label: "HAUNTED.Character.Presence", field: "presence"},
    ]

    static async createPath() {
        try {
            await FilePicker.browse("data", ActorToSVG.getPath());
        } catch (e) {
            await FilePicker.createDirectory("data", ActorToSVG.getPath());
        }
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

    static async uploadFile(file) {
        return FilePicker.upload("data", ActorToSVG.getPath(), file, {}, {notify:false});
    }

    static wrap (text, limit) { //limt between 30 and 33 maybe 26?
        if (text.length > limit) {
          // find the last space within limit
          let edge = text.slice(0, limit).lastIndexOf(' ');
          if (edge > 0) {
            let line = text.slice(0, edge);
            let remainder = text.slice(edge + 1);
            return line + '\n' + ActorToSVG.wrap(remainder, limit);
          }
        }
        return text;
    }

    static createText(field, entry, y_pos) {
        let text = `${field}: ${entry}`;
        text = ActorToSVG.wrap(text, 32);
        text = text.split('\n');

        const result = {svgStr: ``};
        for (const line of text) {
            result.svgStr += `<text  x="${ActorToSVG.X}" y="${y_pos}" style="${ActorToSVG.STYLE}">${line}</text>`;
            y_pos += ActorToSVG.LEADING;
        }

        result.y_pos = y_pos;

        return result;
    }

    static createSVG(actorData) {
        let svgStr = ActorToSVG.HEADER + ActorToSVG.RECT;
        let y = ActorToSVG.MARGIN + ActorToSVG.FONT_SIZE;

        let lines = this.createText(game.i18n.localize("HAUNTED.Character.Name"), actorData.name, y);
        svgStr += lines.svgStr;
        y = lines.y_pos;

        for (const property of ActorToSVG.PROPERTIES) {
            let value = actorData.system[property.field];
            if(value !== undefined) {
                const localLabel = game.i18n.localize(property.label);
                if(property.field === "disposition") value = HauntedActor.DISPOSITION.getLocalString(value);
                if(property.field === "presence") value = `${value.value} / ${value.max}`
                y += ActorToSVG.LEADING;
                lines = this.createText(localLabel, value, y);
                svgStr += lines.svgStr;
                y = lines.y_pos;
            }
        }

        svgStr += ActorToSVG.FOOTER;
        
        return new File([svgStr], ActorToSVG.getFileName(actorData));
    }
}
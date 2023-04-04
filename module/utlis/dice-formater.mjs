export class DiceFormater {
    static DIE_COLOR = {
        WHITE: 0,
        BLACK: 1
    };

    static DICE_MAPS = [
        ['q', 'a', 'b', 'c', 'd', 'e', 'f'], 
        ['Q', 'A', 'B', 'C', 'D', 'E', 'F']
    ];

    static getMap(color) {
        return DiceFormater.DICE_MAPS[color];
    }

    static sortDice(dice) {
        return dice.map(a => a.result)
                    .sort((a, b) => a - b)
                    .reverse();
    }

    static diceToString(dice) {
        if(!Array.isArray(dice))
            dice = new Array(dice);

        const diceStr = dice.reduce((str, die) => {
            let map = DiceFormater.getMap(DiceFormater.DIE_COLOR.WHITE);

            if(str.length > 0)
                str += ` `;

            if(typeof die !== 'number') {
                map = DiceFormater.getMap(die.color)
                die = die.value;
            }

            str += `${map[die]}`;

            return str;
        }, "");
        return diceStr;
    }

    static highlightDice(dice) {
        const highestDie = dice[0];
        return dice.map(die => {
            const obj = {value: die, color: DiceFormater.DIE_COLOR.WHITE}
            if(die === highestDie)
                obj.color = DiceFormater.DIE_COLOR.BLACK;
            return obj;
        });
    }
}


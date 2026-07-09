class AvailableCard {

    player: string = ""
    unit_num: number = -1
    stack_num: number = -1
    card_num: number = -1
    action?: Action

    highlight() {
        let card: StackTag | UnitTag;

        if (this.card_num >= 0) {
            let hand_id = this.player === "enemy" ? "opp_hand" : "hand";

            card = document.getElementById(hand_id)!.getElementsByTagName("card-stack")[this.card_num] as StackTag;
        }
        else {
            let units_id = this.player === "enemy" ? "opp_units" : "units";

            let unit = document.getElementById(units_id)!.getElementsByTagName("unit-card")[this.unit_num];

            if (this.stack_num >= 0)
                card = unit.parentElement!.children[this.stack_num + 1] as UnitTag;
            else
                card = unit as UnitTag;
        }

        card.style.cursor = "pointer";
        card.style.outline = "yellow dashed 0.3vw";
        card.style.zIndex = "1";

        card.onclick = () => this.action!.select(this);
    }

}

class Action {

    action?: "select" | "roll" | "cancelable_roll"
    available_cards: AvailableCard[] = []
    selected_card?: AvailableCard

    setup_cards() {
        let available_cards = [];

        for (let card of this.available_cards) {
            let available_card = Object.assign(new AvailableCard, card);
            available_card.action = this;
            available_card.highlight();
            available_cards.push(available_card);
        }
    }

    select(available_card: AvailableCard) {
        if (!this.selected_card) {
            this.selected_card = available_card;
            available_card.action = undefined;
            sock.send(JSON.stringify(available_card));
        }
    }

    roll() {
        let dice = document.getElementById("dice")!;
        dice.onclick = () => {
            sock.send("confirm");
            dice.setAttribute("rolling", "true");
            tick_number();
        };

        document.getElementById("overlays")!.hidden = false;

        if (this.action == "cancelable_roll")
            document.getElementById("cancel-roll-btn")!.hidden = false;
        else
            document.getElementById("cancel-roll-btn")!.hidden = true;
    }

}

function handle_actions(message: string) {
    if (message.startsWith("action: ")) {
        let data = JSON.parse(message.substring("action: ".length));
        console.log(data);
        let action: Action = Object.assign(new Action, data)

        if (action.action == "select")
            action.setup_cards();
        else
            action.roll();
    }
    else if (message.startsWith("rolled: ")) {
        let roll = Number(message.substring("rolled: ".length));

        let dice = document.getElementById("dice")!;
        setTimeout(() => {
            dice.removeAttribute("rolling");
            dice.innerText = roll.toString();
            document.getElementById("overlays")!.onclick = () => {
                document.getElementById("overlays")!.hidden = true;
                dice.innerText = "20";
                sock.send("rolled");
                dice.onclick = () => {};
            }
        }, 2000);
    }
}

function tick_number() {
    let dice = document.getElementById("dice")!;

    if (!(dice.getAttribute("rolling") === "true"))
        return;

    dice.innerText = Math.floor(Math.random() * 100 % 20 + 1).toString();
    setTimeout(tick_number, 50);
}

function cancel_roll() {
    sock.send("cancel");
    
    document.getElementById("overlays")!.hidden = true;
    document.getElementById("dice")!.innerText = "20";
}
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

    count: number = -1
    available_cards: AvailableCard[] = []
    selected_cards: AvailableCard[] = []

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
        this.selected_cards.push(available_card);

        if (this.selected_cards.length >= this.count) {
            for (let card of this.selected_cards)
                card.action = undefined;

            sock.send(JSON.stringify(this.selected_cards));
        }
    }

}

function handle_actions(message: string) {
    if (message.startsWith("action: ")) {
        let data = JSON.parse(message.substring("action: ".length));
        console.log(data);
        Object.assign(new Action, data).setup_cards();
    }
}
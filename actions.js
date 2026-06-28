class AvailableCards {

    player
    unit_num
    stack_num
    card_num
    action

    highlight() {

        if (this.card_num >= 0) {
            return;
        }

        let units_id = this.player === "enemy" ? "opp_units" : "units";

        let unit = document.getElementById(units_id).getElementsByTagName("unit-card")[this.unit_num];

        if (this.stack_num >= 0) {
            return;
        }

        unit.style.cursor = "pointer";
        unit.style.border = "yellow dashed 0.5vw";

        unit.onclick = () => this.action.select(this);
    }

}

class Action {

    action
    count
    available_cards
    selected_cards = []

    setup_cards() {
        let available_cards = [];

        for (let card of this.available_cards) {
            let available_card = Object.assign(new AvailableCards, card);
            available_card.action = this;
            available_card.highlight();
            available_cards.push(available_card);
        }
    }

    select(available_card) {
        this.selected_cards.push(available_card);

        if (this.selected_cards.length >= this.count) {
            for (let card of this.selected_cards)
                card.action = undefined;

            sock.send(JSON.stringify(this.selected_cards));
        }
    }

}

function handle_actions(message) {
    if (message.startsWith("action: ")) {
        let data = JSON.parse(message.substring("action: ".length));
        console.log(data);
        let action = Object.assign(new Action, data);
        action.setup_cards();
    }
}
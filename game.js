play = () => sock.send("play"); card = (i) => sock.send(JSON.stringify([{card_num: i}])); hand = () => sock.send("hand");

function handle_game_messages(message) {
    if (message.startsWith("board: ")) {
        let data = JSON.parse(message.substring("board: ".length));

        let opp_units = [];
        for (let i = 0; i < data["enemy"]["units"].length; i++) {
            let unit = data["enemy"]["units"][i];
            let stacks = [];

            for (let j = 0; j < unit.stacks.length; j++) {
                let stack = unit.stacks[j];

                stacks.push(
                    new Stack(stack["ident"], stack["count"], stack["stack_bonus"], stack["active"])
                );
            }

            opp_units.push(
                new Unit(unit["ident"], unit["name"], unit["attack"], unit["block"], stacks)
            );
        }

        let self_units = [];
        for (let i = 0; i < data["self"]["units"].length; i++) {
            let unit = data["self"]["units"][i];
            let stacks = [];

            for (let j = 0; j < unit.stacks.length; j++) {
                let stack = unit.stacks[j];

                stacks.push(
                    new Stack(stack["ident"], stack["count"], stack["stack_bonus"], stack["active"])
                );
            }

            self_units.push(
                new Unit(unit["ident"], unit["name"], unit["attack"], unit["block"], stacks)
            );
        }

        draw_board(data["self"]["lives"], data["enemy"]["lives"], self_units, opp_units);
    }

    else
        handle_actions(message);
}

function set_names(self, opp) {
    document.getElementById("opp_name").innerText = opp;
    document.getElementById("name").innerText = self;
}

function draw_board(self_lives, opp_lives, self_units, opp_units) {
    document.getElementById("lives").innerText = self_lives;
    document.getElementById("opp_lives").innerText = opp_lives;

    let units_div = document.getElementById("units");
    units_div.replaceChildren();

    for (let unit of self_units) {
        let unit_card = document.createElement("unit-card");

        let unit_div = document.createElement("div");
        unit_div.classList.add("h-100", "d-flex", "align-items-start", "flex-column");
        unit_div.style.width = "8vw";

        unit_card.build(unit);

        unit_div.appendChild(unit_card);

        if (unit.stacks)
            for (let stack of unit.stacks) {
                if (!stack.card_ident)
                    continue;

                let card_stack = document.createElement("card-stack");
                card_stack.build_only_artwork(stack);

                unit_div.appendChild(card_stack)
            }

        units_div.appendChild(unit_div);
    }

    let opp_units_div = document.getElementById("opp_units");
    opp_units_div.replaceChildren();

    for (let unit of opp_units) {
        let unit_card = document.createElement("unit-card");

        let unit_div = document.createElement("div");
        unit_div.classList.add("h-100", "d-flex", "align-items-end", "flex-column-reverse");
        unit_div.style.width = "8vw";

        unit_card.build(unit);
        unit_div.appendChild(unit_card);

        if (unit.stacks)
            for (let stack of unit.stacks) {
                if (!stack.card_ident)
                    continue;

                let card_stack = document.createElement("card-stack");
                card_stack.build_only_artwork(stack);

                unit_div.appendChild(card_stack)
            }

        opp_units_div.appendChild(unit_div);
    }

}
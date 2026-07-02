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

        draw_board(data["self"]["lives"], data["enemy"]["lives"], self_units, opp_units, data["self"]["hand"], data["enemy"]["hand"]);
    }

    else
        handle_actions(message);
}

function set_names(self, opp) {
    document.getElementById("opp_name").innerText = opp;
    document.getElementById("name").innerText = self;

    const resizeObserver = new ResizeObserver(() => {deselect_card(); deselect_card(true)});
    resizeObserver.observe(document.getElementById("hand"));
}

function draw_board(self_lives, opp_lives, self_units, opp_units, self_hand, opp_hand_count) {
    document.getElementById("lives").innerText = self_lives;
    document.getElementById("opp_lives").innerText = opp_lives;

    draw_units(self_units, "self");
    draw_units(opp_units, "enemy");

    draw_hand(self_hand);
    draw_hand(undefined, opp_hand_count);
}

function draw_units(units, player) {
    let units_div = document.getElementById(player == "enemy" ? "opp_units" : "units");
    units_div.replaceChildren();

    for (let unit of units) {
        let unit_card = document.createElement("unit-card");

        let unit_div = document.createElement("div");
        unit_div.classList.add("h-100", "d-flex", "align-items-" + (player == "enemy" ? "end" : "start"), "flex-column" + (player == "enemy" ? "-reverse" : ""));
        unit_div.style.width = "8vw";

        unit_card.build(unit);
        unit_div.appendChild(unit_card);

        if (unit.stacks)
            for (let stack of unit.stacks) {
                let card_stack = document.createElement("card-stack");

                if (!stack.card_ident)
                    card_stack.build_empty();
                else 
                    card_stack.build_only_artwork(stack);

                unit_div.appendChild(card_stack);
            }

        units_div.appendChild(unit_div);
    }
}

function select_card(selected_card_num) {
    let hand_div = document.getElementById("hand");
    
    let card_height = hand_div.clientWidth / 2 / (7 / 10);
    let card_height_compacted = (hand_div.clientHeight - card_height) / (hand_div.children.length - 1);
    
    for (let i = 0; i < hand_div.children.length; i++) {
        let stack_tag = hand_div.children[i];

        let translation;
        if (i > selected_card_num)
            translation = -i * (card_height - card_height_compacted) + (card_height - card_height_compacted);
        else
            translation = -i * (card_height - card_height_compacted);

        stack_tag.style.transform = "translateY(" + translation + "px)";
    }
}

function deselect_card(enemy = false) {
    let hand_div;
    if (enemy)
        hand_div = document.getElementById("hand");
    else
        hand_div = document.getElementById("opp_hand");
    
    let card_height = hand_div.clientWidth / 2 / (7 / 10);
    let card_height_compacted = hand_div.clientHeight / hand_div.children.length;
    
    for (let i = 0; i < hand_div.children.length; i++) {
        let translation = -i * (card_height - card_height_compacted);

        hand_div.children[i].style.transform = "translateY(" + translation + "px)";
    }
}

function draw_hand(hand, hand_count, selected_card_num) {
    let enemy = false;

    if (hand_count) {
        hand = Array.from({length: hand_count}, () => "");
        enemy = true;
    }

    if (!hand)
        return;

    let hand_div;
    if (enemy)
        hand_div = document.getElementById("opp_hand");
    else
        hand_div = document.getElementById("hand");

    hand_div.replaceChildren();
    
    let card_height = hand_div.clientWidth / 2 / (7 / 10);
    let card_height_compacted = hand_div.clientHeight / hand.length;

    for (let i = 0; i < hand.length; i++) {
        let stack_tag = document.createElement("card-stack");
        if (!enemy)
            stack_tag.build(new Stack(hand[i], 1, false, true));
        else
            stack_tag.build_card_back();

        stack_tag.style.zIndex = i;
        stack_tag.style.width = "50%";

        let translation = -i * (card_height - card_height_compacted);

        stack_tag.style.transform = "translateY(" + translation + "px)";

        if (!enemy) {
            stack_tag.onclick = () => {
                if (!stack_tag.style.left || stack_tag.style.left === "0") {
                    stack_tag.style.left = "25%";
                    sock.send("play;" + JSON.stringify({card_num: i}));
                }
                else {
                    stack_tag.style.left = "0";
                    sock.send("cancel");
                }
            };

            stack_tag.onmouseover = () => select_card(i);
            stack_tag.onmouseout = deselect_card;
        }

        hand_div.appendChild(stack_tag);
    }
}
function handle_game_messages(message: string) {
    if (message.startsWith("board: ")) {
        let board: Board = JSON.parse(message.substring("board: ".length));
        draw_board(board);
    }

    else
        handle_actions(message);
}

function set_names(self: string, opp: string) {
    document.getElementById("opp_name")!.innerText = opp;
    document.getElementById("name")!.innerText = self;

    const resizeObserver = new ResizeObserver(() => {deselect_card(); deselect_card(true)});
    resizeObserver.observe(document.getElementById("hand")!);
}

function draw_board(board: Board) {
    document.getElementById("turn_number")!.innerText = "Turn: " + (board.game.turn_number + 1);
    document.getElementById("lives")!.innerText = String(board.self.lives);
    document.getElementById("opp_lives")!.innerText = String(board.enemy.lives);

    draw_units(board.self.units, "self", board.game.self_turn === true ? board.game.current_unit_slot : undefined);
    draw_units(board.enemy.units, "enemy", board.game.self_turn === false ? board.game.current_unit_slot : undefined);

    draw_hand(board.self.hand);
    draw_hand([], board.enemy.hand);

    draw_discard_pile("discard_pile", board.self.discard_pile);
    draw_discard_pile("opp_discard_pile", board.enemy.discard_pile);
}

function draw_units(units: Unit[], player: "enemy" | "self", current_unit_slot?: number) {
    let units_div = document.getElementById(player == "enemy" ? "opp_units" : "units")!;
    units_div.replaceChildren();

    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        let unit_card = document.createElement("unit-card") as UnitTag;

        let unit_div = document.createElement("div");
        unit_div.classList.add("d-flex", "align-items-" + (player == "enemy" ? "end" : "start"), "flex-column" + (player == "enemy" ? "-reverse" : ""));
        unit_div.style.minHeight = "100%";
        unit_div.style.height = "fit-content";
        unit_div.style.width = "8vw";

        if (i === current_unit_slot) {
            unit_div.classList.add("rounded-2");
            unit_div.style.background = "aliceblue";
            unit_div.style.outline = "0.5vw aliceblue solid";
        }

        unit_card.build(unit);
        unit_div.appendChild(unit_card);

        if (unit.stacks)
            for (let stack of unit.stacks) {
                let card_stack = document.createElement("card-stack") as StackTag;

                if (!stack.ident)
                    card_stack.build_empty();
                else 
                    card_stack.build_only_artwork(stack);

                unit_div.appendChild(card_stack);
            }

        units_div.appendChild(unit_div);
    }
}

function select_card(selected_card_num: number) {
    let hand_div = document.getElementById("hand")!;
    
    let card_height = hand_div.clientWidth / 2 / (7 / 10);
    let card_height_compacted = (hand_div.clientHeight - card_height) / (hand_div.children.length - 1);
    
    for (let i = 0; i < hand_div.children.length; i++) {
        let stack_tag: StackTag = hand_div.children[i] as StackTag;

        let translation;
        if (i > selected_card_num)
            translation = -i * (card_height - card_height_compacted) + (card_height - card_height_compacted);
        else
            translation = -i * (card_height - card_height_compacted);

        stack_tag.style.transform = "translateY(" + translation + "px)";
    }
}

function deselect_card(enemy: boolean = false) {
    let hand_div;
    if (!enemy)
        hand_div = document.getElementById("hand")!;
    else
        hand_div = document.getElementById("opp_hand")!;
    
    let card_height = hand_div.clientWidth / 2 / (7 / 10);
    let card_height_compacted = hand_div.clientHeight / hand_div.children.length;
    
    for (let i = 0; i < hand_div.children.length; i++) {
        let translation = -i * (card_height - card_height_compacted);

        (hand_div.children[i] as HTMLElement).style.transform = "translateY(" + translation + "px)";
    }
}

function draw_hand(hand: string[], hand_count?: number) {
    let enemy = false;

    if (hand_count !== undefined) {
        hand = Array.from({length: hand_count}, () => "");
        enemy = true;
    }

    if (!hand)
        return;

    let hand_div;
    if (enemy)
        hand_div = document.getElementById("opp_hand")!;
    else
        hand_div = document.getElementById("hand")!;

    hand_div.replaceChildren();
    
    let card_height = hand_div.clientWidth / 2 / (7 / 10);
    let card_height_compacted = hand_div.clientHeight / hand.length;

    for (let i = 0; i < hand.length; i++) {
        let stack_tag: StackTag = document.createElement("card-stack") as StackTag;
        if (!enemy)
            stack_tag.build(new Stack(hand[i], 1, false, true));
        else
            stack_tag.build_card_back();

        stack_tag.style.zIndex = String(i);
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
            stack_tag.onmouseout = () => deselect_card();
        }

        hand_div.appendChild(stack_tag);
    }
}

function draw_discard_pile(pile_id: "discard_pile" | "opp_discard_pile", discard_pile: string[]) {
    let top_card = document.getElementById(pile_id + "_card");

    if (top_card)
        top_card.remove();

    if (discard_pile.length > 0) {
        let pile = document.getElementById(pile_id)!;
        document.getElementById(pile_id + "_empty")!.setAttribute("hidden", "");

        let top_card: StackTag = document.createElement("card-stack") as StackTag;
        top_card.build(new Stack(discard_pile[discard_pile.length - 1], 1, false, true));
        top_card.id = pile_id + "_card";
        top_card.classList.add("w-75");

        if (discard_pile.length > 1) {
            top_card.style.borderBottom = (discard_pile.length) * 0.03 + "vw solid";
            top_card.style.borderRight = (discard_pile.length) * 0.03 + "vw solid";
        }

        pile.appendChild(top_card);
    }
    else
        document.getElementById(pile_id + "_empty")!.removeAttribute("hidden");
}
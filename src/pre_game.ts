const sock = new WebSocket("wss://lon.run.place:9999/");
const cards: { [key: string]: Card } = {};
const units: { [key: string]: Unit } = {};
const decks: { [key: string]: Deck } = {};

var selected_units_idents: string[] = ["", "", ""];
var selected_name = "";

sock.onmessage = (event) => {
    if (event.data.startsWith("Execute: "))
        return eval(event.data.substring("Execute: ".length));

    if (event.data.startsWith("Cards: ")) {
        let data = JSON.parse(event.data.substring("Cards: ".length));
        for (let card of data)
            cards[card.ident] = card as Card;

        return;
    }

    if (event.data.startsWith("Units: ")) {
        let data = JSON.parse(event.data.substring("Units: ".length));
        for (let unit of data)
            units[unit.ident] = unit as Unit;

        return create_units();
    }

    if (event.data.startsWith("Decks: ")) {
        let data = JSON.parse(event.data.substring("Decks: ".length));
        for (let deck of data)
            decks[deck.ident] = deck as Deck;

        return create_decks();
    }

    if (event.data.startsWith("Start: ")) {
        let data = event.data.substring("Start: ".length).split(";");
        let opp_name = data[0];
        let opp_units = JSON.parse(data[1]);
        return start_game(opp_name, opp_units);
    }

    if (event.data.startsWith("Reply: ")) {
        return sock.send(event.data.substring("Reply: ".length));
    }
}

function create_units() {
    let units_div = document.getElementById("units_select")!;
    let count = 0;

    for (let ident in units) {
        let unit_div = document.createElement("div");

        let unit: UnitTag = document.createElement("unit-card") as UnitTag;
        unit.build(units[ident]);
        unit.style.width = "100%";
        unit.onclick = () => click_unit(unit);

        let num_span = document.createElement("span");
        num_span.id = unit.ident + "_num";
        num_span.classList.add("position-absolute", "top-0", "start-100", "translate-middle", "badge", "rouded-pill", "bg-danger");
        num_span.style.zIndex = "1";
        num_span.hidden = true;
        unit.appendChild(num_span);

        let outer_tooltip_div = document.createElement("div");
        outer_tooltip_div.style.zIndex = "1";
        outer_tooltip_div.style.position = "relative";
        outer_tooltip_div.hidden = true;

        unit.onmouseenter = () => {outer_tooltip_div.hidden = false};
        unit.onmouseleave = () => {outer_tooltip_div.hidden = true};

        let inner_tooltip_div = document.createElement("div");
        inner_tooltip_div.style.position = "absolute";
        inner_tooltip_div.style.background = "aliceblue";
        inner_tooltip_div.style.border = "black solid";
        inner_tooltip_div.style.borderRadius = "20px";
        inner_tooltip_div.style.padding = "0.5vw 1vw";
        outer_tooltip_div.appendChild(inner_tooltip_div);

        let header = document.createElement("h3");
        header.innerText = "Included cards:";
        inner_tooltip_div.appendChild(header);

        let cards_div = document.createElement("div");
        cards_div.style.display = "flex";
        cards_div.style.gap = "1vw";
        inner_tooltip_div.appendChild(cards_div);

        for (let card_ident of units[ident].included_cards) {
            let stack_tag = document.createElement("card-stack") as StackTag;
            stack_tag.build(new Stack(card_ident));

            stack_tag.style.fontSize = "small";
            stack_tag.style.width = "10vw";

            cards_div.appendChild(stack_tag);
        }

        let tooltip_width_vw = 2 + cards_div.children.length * 10 + (cards_div.children.length - 1) * 1;
        let start_pos_vw = 1 + (count + 1) * (11.5);

        if (tooltip_width_vw + start_pos_vw >= 100) {
            outer_tooltip_div.style.right = tooltip_width_vw + "vw";
            unit_div.appendChild(outer_tooltip_div);
        }

        unit_div.appendChild(unit);

        if (tooltip_width_vw + start_pos_vw < 100) {
            outer_tooltip_div.style.left = "1vw";
            unit_div.appendChild(outer_tooltip_div);
        }

        units_div.appendChild(unit_div);

        count++;
    }
}

function create_decks() {
    let deck_select = document.getElementById("deck_select")!;

    for (let ident in decks) {
        let option = document.createElement("option");
        option.value = ident;
        option.innerText = decks[ident].name;

        deck_select.appendChild(option);
    }

    update_selected_deck();
}

function update_selected_deck() {
    let deck = (document.getElementById('deck_select') as HTMLSelectElement).value;
    let selected_deck_div = document.getElementById("selected_deck")!;

    selected_deck_div.replaceChildren();

    for (let included_card of decks[deck].cards) {
        let card = document.createElement("card-stack") as StackTag;
        card.build(new Stack(included_card.ident));
        card.name_elem!.innerText = included_card.count.toString() + " * " + card.name_elem?.innerText;

        card.style.width = "10vw";

        selected_deck_div.appendChild(card);
    }
}

function click_unit(unit: UnitTag) {
    if (selected_units_idents.includes(unit.ident)) {
        selected_units_idents[selected_units_idents.indexOf(unit.ident)] = "";
        unit.style.outline = "";
        document.getElementById(unit.ident + "_num")!.hidden = true;
    }
    else {
        let index = selected_units_idents.indexOf("");

        if (index > -1) {
            selected_units_idents[index] = unit.ident;
            unit.style.outline = "limegreen solid 0.25vw";
            let num_span = document.getElementById(unit.ident + "_num")!;
            num_span.innerText = String(index + 1);
            num_span.hidden = false;
        }
    }
}

function ready_up() {
    if (set_name() && set_units() && set_deck()) {
        sock.send('ready_up');
        document.getElementById("ready_up_btn")?.setAttribute("disabled", "");
    }
}

function set_name() {
    let name = (document.getElementById('name_input') as HTMLInputElement).value;
    if (!name)
        return alert("name is required");

    selected_name = name;
    sock.send('set_name: ' + name);
    return true;
}

function set_units() {
    if (selected_units_idents.indexOf("") > -1)
        return alert("select 3 units");

    sock.send("set_units: " + JSON.stringify(selected_units_idents));
    return true;
}

function set_deck() {
    let deck = (document.getElementById('deck_select') as HTMLSelectElement).value;
    if (!deck)
        return alert("Deck is required");

    sock.send('set_deck: ' + deck);
    return true;
}

function start_game(opp_name: string, opp_units_idents: string[]) {
    sock.onmessage = (event) => handle_game_messages(event.data);

    // Alert user if they try to refresh
    window.addEventListener("beforeunload", (e) => {e.preventDefault();});

    document.getElementById("pre_game")!.remove();

    let opp_units = opp_units_idents.map(ident => units[ident]);
    let selected_units = selected_units_idents.map(ident => units[ident]);

    set_names(selected_name, opp_name);
    draw_board({
        game: {
            self_turn: false,
            rotation_number: 0,
            current_unit_slot: 0
        },
        enemy: {
            lives: 80,
            units: opp_units,
            hand: 0,
            discard_pile: []
        },
        self: {
            lives: 80,
            units: selected_units,
            hand: [],
            discard_pile: []
        }
    });

    document.getElementById("game")!.classList.remove("d-none");
}
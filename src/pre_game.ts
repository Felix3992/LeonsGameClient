const sock = new WebSocket("ws://localhost:9999/");
const cards: { [key: string]: Card } = {};
const units: { [key: string]: Unit } = {};
const decks: Deck[] = [];

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
            decks.push(deck as Deck);

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
    for (let ident in units) {
        let unit: UnitTag = document.createElement("unit-card") as UnitTag;
        unit.build(units[ident]);
        unit.onclick = () => click_unit(unit);

        let num_span = document.createElement("span");
        num_span.id = unit.ident + "_num";
        num_span.classList.add("position-absolute", "top-0", "start-100", "translate-middle", "badge", "rouded-pill", "bg-danger");
        num_span.hidden = true;
        unit.appendChild(num_span);

        units_div.appendChild(unit);
    }
}

function create_decks() {

}

function click_unit(unit: UnitTag) {
    if (selected_units_idents.includes(unit.ident)) {
        selected_units_idents[selected_units_idents.indexOf(unit.ident)] = "";
        unit.style.border = "";
        document.getElementById(unit.ident + "_num")!.hidden = true;
    }
    else {
        let index = selected_units_idents.indexOf("");

        if (index > -1) {
            selected_units_idents[index] = unit.ident;
            unit.style.border = "limegreen solid 0.5vw";
            let num_span = document.getElementById(unit.ident + "_num")!;
            num_span.innerText = String(index + 1);
            num_span.hidden = false;
        }
    }
}

function ready_up() {
    if (set_name() && set_units() && set_deck())
        sock.send('ready_up');
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
    let deck = (document.getElementById('deck') as HTMLInputElement).value;
    if (!deck)
        return alert("Deck is required");

    sock.send('set_deck: ' + deck);
    return true;
}

function start_game(opp_name: string, opp_units_idents: string[]) {
    sock.onmessage = (event) => handle_game_messages(event.data);

    document.getElementById("pre_game")!.remove();

    let opp_units = opp_units_idents.map(ident => {
        return units[ident]
    })

    let selected_units = selected_units_idents.map(ident => {
        return units[ident]
    })

    set_names(selected_name, opp_name);
    draw_board({
        game: {
            self_turn: undefined,
            turn_number: 0,
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
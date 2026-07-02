const sock = new WebSocket("ws://localhost:9999/");
const cards = {};
const units = {};
const decks = [];

var selected_units = [undefined, undefined, undefined];
var selected_name = "";

sock.onmessage = (event) => {
    if (event.data.startsWith("Execute: "))
        return eval(event.data.substring("Execute: ".length));

    if (event.data.startsWith("Cards: ")) {
        let data = JSON.parse(event.data.substring("Cards: ".length));
        for (let card of data)
            cards[card.ident] = Object.assign(new Card, card);

        return;
    }

    if (event.data.startsWith("Units: ")) {
        let data = JSON.parse(event.data.substring("Units: ".length));
        for (let unit of data)
            units[unit.ident] = Object.assign(new Unit, unit);

        return create_units();
    }

    if (event.data.startsWith("Decks: ")) {
        let data = JSON.parse(event.data.substring("Decks: ".length));
        for (let deck of data)
            decks.push(Object.assign(new Deck, deck));

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
    let units_div = document.getElementById("units_select");
    for (let ident in units) {
        let card = document.createElement("unit-card");
        card.build(units[ident], true);

        units_div.appendChild(card);
    }
}

function create_decks() {

}

function click_unit(card) {
    if (selected_units.includes(card.ident)) {
        selected_units[selected_units.indexOf(card.ident)] = undefined;
        card.style.border = "";
        document.getElementById(card.ident + "_num").hidden = true;
    }
    else {
        index = selected_units.indexOf(undefined);

        if (index > -1) {
            selected_units[index] = card.ident;
            card.style.border = "limegreen solid 0.5vw";
            num_span = document.getElementById(card.ident + "_num");
            num_span.innerText = index + 1;
            num_span.hidden = false;
        }
    }
}

function ready_up() {
    if (set_name() && set_units() && set_deck())
        sock.send('ready_up');
}

function set_name() {
    let name = document.getElementById('name_input').value;
    if (!name)
        return alert("name is required");

    selected_name = name;
    sock.send('set_name: ' + name);
    return true;
}

function set_units() {
    if (selected_units.indexOf(undefined) > -1)
        return alert("select 3 units");

    sock.send("set_units: " + JSON.stringify(selected_units));
    return true;
}

function set_deck() {
    let deck = document.getElementById('deck').value;
    if (!deck)
        return alert("Deck is required");

    sock.send('set_deck: ' + deck);
    return true;
}

function start_game(opp_name, opp_units) {
    sock.onmessage = (event) => handle_game_messages(event.data);

    document.getElementById("pre_game").remove();

    opp_units = opp_units.map(ident => {
        return units[ident]
    })

    selected_units = selected_units.map(ident => {
        return units[ident]
    })

    set_names(selected_name, opp_name);
    draw_board(80, 80, selected_units, opp_units, [], 0, [], []);

    document.getElementById("game").classList.remove("d-none");
}
// function create_stack() {
//     stack = new Stack("", "piracy", 2, false, true);
//     document.getElementById("stack").build(stack);
// }

function set_names(self, opp) {
    document.getElementById("opp_name").innerText = opp;
    // document.getElementById("name").innerText = self;
}

function draw_board(self_lives, opp_lives, self_units, opp_units) {
    document.getElementById("lives").innerText = self_lives;
    document.getElementById("opp_lives").innerText = opp_lives;

    let units_div = document.getElementById("units");
    units_div.replaceChildren();

    for (let unit of opp_units) {
        let unit_card = document.createElement("unit-card");
        unit_card.build(unit);
        unit_card.classList.add("h-50");

        units_div.appendChild(unit_card);
    }

    let opp_units_div = document.getElementById("opp_units");
    opp_units_div.replaceChildren();

    for (let unit of opp_units) {
        let unit_card = document.createElement("unit-card");
        unit_card.build(unit);
        unit_card.classList.add("h-50");

        opp_units_div.appendChild(unit_card);
    }

}
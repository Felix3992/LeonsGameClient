class Card {

    constructor(ident, name, description, card_type, stack_count, stack_bonus_desc) {
        this.ident = ident;
        this.name = name;
        this.description = description;
        this.card_type = card_type;
        this.stack_count = stack_count;
        this.stack_bonus_desc = stack_bonus_desc;
    }

}

class Unit {

    constructor(ident, name, attack, block, included_cards) {
        this.ident = ident;
        this.name = name;
        this.attack = attack;
        this.block = block;
        this.included_cards = included_cards;
    }

}

class UnitTag extends HTMLElement {

    build(unit, is_selectable = false) {    
        this.ident = unit.ident;
        this.classList.add("card", "bg-transparent", "rounded-3");
        this.style = "background-image: url('assets/" + unit.ident + ".png');";
        if (is_selectable) {
            this.onclick = () => click_unit(this);

            let num_span = document.createElement("span");
            num_span.id = unit.ident + "_num";
            num_span.classList.add("position-absolute", "top-0", "start-100", "translate-middle", "badge", "rouded-pill", "bg-danger");
            num_span.hidden = true;
            this.appendChild(num_span);
        }

        let name_span = document.createElement("span");
        name_span.classList.add("card-title", "align-self-center", "text-center", "text-nowrap");
        name_span.innerText = unit.name;
        // Adjust font size to not overflow
        name_span.style.fontSize = -0.11 * unit.name.length + 2.56 + "vw";

        let card_body = document.createElement("div");
        card_body.classList.add("card-body", "d-flex");

        let attack_span = document.createElement("span");
        attack_span.classList.add("fw-bold", "align-self-end", "flex-grow-1");
        attack_span.innerText = unit.attack;

        let block_span = document.createElement("span");
        block_span.classList.add("fw-bold", "align-self-end");
        block_span.innerText = unit.block;

        this.appendChild(name_span);
        this.appendChild(card_body);

        card_body.appendChild(attack_span);
        card_body.appendChild(block_span);
    }

}
customElements.define("unit-card", UnitTag);

class Deck {

    constructor(ident, name, cards) {
        this.ident = ident;
        this.name = name;
        this.cards = cards;
    }

}

class Stack {

    constructor(unit, card_ident, count, stack_bonus, active) {
        this.unit = unit;
        this.card_ident = card_ident;
        this.count = count;
        this.stack_bonus = stack_bonus;
        this.active = active;
    }

}

class StackTag extends HTMLElement {

    build(stack) {
        let card = cards[stack.card_ident];
        this.classList.add("card", "p-absolute");
        this.style.aspectRatio =  "7 / " + (2 * stack.count + 8);
        this.style.fontSize

        for (let i = 0; i < stack.count; i++) {
            let header = document.createElement("div");
            header.classList.add("card-header", "d-flex", "w-100", "p-0");
            
            let card_img = document.createElement("img");
            card_img.classList.add("w-75");
            card_img.src = "assets/" + stack.card_ident + ".png";

            let type_img = document.createElement("img");
            type_img.classList.add("w-25");
            type_img.src = "assets/" + card.card_type + ".png";

            header.appendChild(card_img);
            header.appendChild(type_img);

            this.append(header);
        }

        let body = document.createElement("div");
        body.classList.add("card-body");

        let description = document.createElement("span");
        description.innerText = card.description;

        body.appendChild(description);
        this.appendChild(body);

        if (card.stack_bonus_desc) {
            let footer = document.createElement("div");
            footer.classList.add("card-footer");
        
            let stack_bonus_desc = document.createElement("span");
            stack_bonus_desc.innerText = card.stack_bonus_desc;

            footer.appendChild(stack_bonus_desc);
            this.appendChild(footer);
        }
    }

}
customElements.define("card-stack", StackTag);
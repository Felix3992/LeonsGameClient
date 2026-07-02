class Card {

    constructor(ident, name, description, card_type, stack_count, activation_bonus_desc, stack_bonus_desc) {
        this.ident = ident;
        this.name = name;
        this.description = description;
        this.card_type = card_type;
        this.stack_count = stack_count;
        this.activation_bonus_desc = activation_bonus_desc;
        this.stack_bonus_desc = stack_bonus_desc;
    }

}

class Unit {

    constructor(ident, name, attack, block, stacks, included_cards) {
        this.ident = ident;
        this.name = name;
        this.attack = attack;
        this.block = block;
        this.stacks = stacks;
        this.included_cards = included_cards;
    }

}

class UnitTag extends HTMLElement {

    build(unit, is_selectable = false) {    
        this.ident = unit.ident;
        this.classList.add("unit", "card", "bg-transparent", "rounded-3");
        this.style = "background-image: url('assets/" + unit.ident + ".png');";
        this.style.backgroundSize = "cover";
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

    constructor(card_ident, count, stack_bonus, active) {
        this.card_ident = card_ident;
        this.count = count;
        this.stack_bonus = stack_bonus;
        this.active = active;
    }

}

class StackTag extends HTMLElement {

    build(stack) {
        let card = cards[stack.card_ident];
        this.classList.add("card");
        this.style.aspectRatio =  "7 / 10";
        this.style.fontSize;

        let header = document.createElement("div");
        header.classList.add("card-header", "d-flex", "w-100", "p-0");
        
        let card_img = document.createElement("img");
        card_img.classList.add("w-75");
        // card_img.src = "assets/" + stack.card_ident + ".png";
        card_img.src = "assets/attack_up.png";
        header.appendChild(card_img);

        this.append_stack_icon(stack, card, header);

        this.append(header);

        let body = document.createElement("div");
        body.classList.add("card-body");

        let description = document.createElement("span");
        description.innerText = card.description;

        body.appendChild(description);
        this.appendChild(body);

        if (card.stack_bonus_desc) {
            let footer = document.createElement("div");
            footer.classList.add("card-footer");
        
            let bonus_desc = document.createElement("span");
            if (card.stack_bonus_desc)
                bonus_desc.innerText = card.stack_bonus_desc;
            else if (card.activation_bonus_desc)
                bonus_desc.innerText = card.activation_bonus_desc;

            footer.appendChild(bonus_desc);
            this.appendChild(footer);
        }
    }

    build_card_back() {
        this.classList.add("card");
        this.style.aspectRatio =  "7 / 10";
        this.style.backgroundImage = "url(assets/cardback.png)";
        this.style.backgroundSize = "cover";
    }

    build_only_artwork(stack) {
        let card = cards[stack.card_ident];
        this.classList.add("my-2", "w-100");

        let header = document.createElement("div");
        header.classList.add("d-flex", "w-100", "p-0");
        
        let card_img = document.createElement("img");
        card_img.classList.add("w-75");
        card_img.src = "assets/" + stack.card_ident + ".png";

        header.appendChild(card_img);

        this.append_stack_icon(stack, card, header);

        this.append(header);
    }

    build_empty() {
        this.classList.add("my-2", "w-100");

        let header = document.createElement("div");
        header.classList.add("w-100", "p-0");
        header.style.aspectRatio = "4 / 1";
        header.style.border = "0.15vw dashed black";

        this.append(header);
    }

    append_stack_icon(stack, card, header) {
        if (card.stack_count > 0) {
            let stack_div = document.createElement("div");
            stack_div.classList.add("w-25", "d-flex", "align-items-center");
            stack_div.style.border = "1px solid";

            let current_span = document.createElement("span");
            current_span.style.alignSelf = "start";
            current_span.style.padding = "2px 0 0 2px";
            current_span.innerText = stack.count;

            let divider = document.createElement("div");
            divider.classList.add("w-100");
            divider.style.border = "1px solid";
            divider.style.transform = "rotate(-60deg)";
            divider.style.height = "0";

            let count_span = document.createElement("span");
            count_span.style.alignSelf = "end";
            count_span.style.padding = "0 2px 2px 0";
            count_span.innerText = card.stack_count;

            stack_div.appendChild(current_span);
            stack_div.appendChild(divider);
            stack_div.appendChild(count_span);

            header.appendChild(stack_div);
        }
        else {
            let type_img = document.createElement("img");
            type_img.classList.add("w-25");
            type_img.src = "assets/" + card.card_type + ".png";

            header.appendChild(type_img);
        }
    }

}
customElements.define("card-stack", StackTag);
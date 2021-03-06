"use strict";
// Array that contains the paths to image files
const symbol_files = ["img/ic_account_balance_black_24px.svg",
    "img/ic_build_black_24px.svg", "img/ic_extension_black_24px.svg",
    "img/ic_hearing_black_24px.svg", "img/ic_language_black_24px.svg",
    "img/ic_lock_black_24px.svg", "img/ic_shopping_basket_black_24px.svg",
    "img/ic_visibility_black_24px.svg"];

const cards = [];
const star2 = 24, star3 = 16;
let star2_changed = false, star3_changed = false;
let count_of_moves = 0;
let previous_clicked_card_id = null;
const completed_cards = []
let while_animation = false;
let start_time, total_time, interval_id;

// Show the symbol on the card
const show_symbol = function (td, id) {
    $(td).append(`<img src="${cards[parseInt(id, 10)].symbol_file}">`);
};

// Check whether the two cards has the same symbol
const check_same_symbol = function (id1, id2) {
    return cards[parseInt(id1, 10)].symbol_file ===
        cards[parseInt(id2, 10)].symbol_file
};

// Play the success animation and show the model if the full gird has completed
// Mark the card as completed
const set_completed = function (ids) {
    for (let id of ids) {
        cards[parseInt(id, 10)].completed = true;
        cards[parseInt(id, 10)].completed = true;
    }
    $(`td[id=${ids[0]}]`).addClass("completed animated rubberBand").one("animationend", function () { $(this).removeClass("animated rubberBand"); });
    $(`td[id=${ids[1]}]`).addClass("completed animated rubberBand").one("animationend", function () {
        $(this).removeClass("animated rubberBand");
        while_animation = false;
        if (check_grid_completed()) {
            clearInterval(interval_id);
            total_time = new Date() - start_time;
            show_modal();
        }
    });
};

// Check whether the full grid is successfully completed
const check_grid_completed = function () {
    for (let card of cards) {
        if (!card.completed) {
            return false;
        }
    }
    return true;
};

// Check whether the card is successfully completed
const check_card_completed = function (id) {
    return cards[parseInt(id, 10)].completed;
};

// distribute the symbols on the cards randomly
const distribute_symbols_on_cards = function () {
    for (let i = 0; i < symbol_files.length; i++) {
        for (let k = 0; k < 2; k++) {
            let rand_try;
            do {
                rand_try = Math.floor(Math.random() * 16);
            } while (cards[rand_try] !== undefined);
            cards[rand_try] = {
                symbol_file: symbol_files[i],
                completed: false
            }
        }
    }
};

// Manipulate the DOM to show the current move
const increment_moves = function () {
    count_of_moves++;
    $(".count-of-moves").html((count_of_moves).toString());
    set_stars();
};

// Manipulate the dom to show the current stars
const set_stars = function () {
    if (count_of_moves > star2 && !star2_changed) {
        $("#star2").attr("src", "img/ic_star_border_black_24px.svg");
        star2_changed = true;
    } else if (count_of_moves > star3 && !star3_changed) {
        $("#star3").attr("src", "img/ic_star_border_black_24px.svg");
        star3_changed = true;
    }
};

// Manipulate the dom to show the timer
const start_timer = function () {
    let start = new Date;
    start_time = start;

    interval_id = setInterval(function () {
        $('.timer').text(parseInt((new Date - start) / 1000, 10));
    }, 1000);
};

// Show the modal after winning the game
const show_modal = function () {
    let text = `You have completed the game in about ${Math.round(total_time / 1000)} seconds.`
        + `\nYou have earned ${star2_changed && star3_changed ? "1 star" : (star3_changed ? "2 stars" : "3 stars")}.`
    $(".modal-body").text(text);
    $('#modal').modal("show");
};

// Get the variable values back to the first state
const restart_game = function () {
    total_time = undefined;
    start_time = undefined;
    while_animation = false;
    count_of_moves = 0;
    previous_clicked_card_id = null;
    star2_changed = false;
    star3_changed = false;
    cards.splice(0, cards.length);
    completed_cards.splice(0, completed_cards.length);
    reset_dom();
    distribute_symbols_on_cards();
    clearInterval(interval_id);
    start_timer();
};

// Get the html back to the first state
const reset_dom = function () {
    $(".timer").html("");
    $(".count-of-moves").html("");
    $("#star2").attr("src", "img/ic_star_black_24px.svg");
    $("#star3").attr("src", "img/ic_star_black_24px.svg");
    $("td").empty();
    $("td").removeClass("completed");
    $("td").addClass("uncompleted");
};

// Play the animation then hide the symbols
const show_wrong = function (ids) {
    // One card
    $(`td[id=${ids[0]}]`).addClass("wrong animated wobble").one("animationend", function () {
        $(this).removeClass("wrong completed animated wobble");
        $(this).empty();
        $(this).addClass("uncompleted");
    });
    // The other card
    $(`td[id=${ids[1]}]`).addClass("wrong animated wobble").one("animationend", function () {
        $(this).removeClass("wrong completed animated wobble");
        $(this).empty();
        $(this).addClass("uncompleted");
        while_animation = false;
    });
};

// Handle the clicks on the cards
$("table").on("click", "td", function (event) {
    const id = $(this).attr("id");
    if (id !== previous_clicked_card_id   // Prevent action after the first click
        && !while_animation                   // Prevent action while animbation
        && !check_card_completed(id)) {          // Prevent action on completed cards
        if (previous_clicked_card_id === null) {       // The first click in the move
            show_symbol(this, id);
            $(this).addClass("first-card");
            while_animation = true;
            // Play the animation of clicking the first card
            $(this).addClass("animated flipInY").one("animationend", function () {
                $(this).removeClass("animated flipInY");
                while_animation = false;
            });
            previous_clicked_card_id = id;    // To compare in the next click
        } else {                              // The second click in the move
            increment_moves();
            show_symbol(this, id);
            $(`td[id=${previous_clicked_card_id}]`).removeClass("first-card");
            if (check_same_symbol(id, previous_clicked_card_id)) { // Check whether the cards has the same symbol
                // If they have the same symbol do:
                set_completed([id, previous_clicked_card_id]);
                while_animation = true;
            } else {   // If they don't have the same symbol do:
                // Hide symbols
                while_animation = true;
                const temp_previous = previous_clicked_card_id;
                show_wrong([id, temp_previous]);
            }
            previous_clicked_card_id = null;        // Prepare to the next move
        }
    } else {
        // Producing effect with every click that do nothing with symbols
        $(this).addClass("border");
        setTimeout(function () { $(`td[id=${id}]`).removeClass("border"); }, 150);
    }
});

// This to restart the game from the modal
$("#play-again").click(() => {
    restart_game();
    $("#modal").modal("hide");
});

// This to restart the game from the restart button
$("#restart").click(() => { restart_game(); });

// distribute the symbols on the cards randomly
distribute_symbols_on_cards();

// Starts the counter
start_timer();

let prodBtn = document.getElementById("productivity-btn")
let entBtn = document.getElementById("entertainment-btn")
let socBtn = document.getElementById("social-btn")
let shopBtn = document.getElementById("shopping-btn")
let eduBtn = document.getElementById("education-btn")
let idleBtn = document.getElementById("idle-btn")

prodBtn.onclick = a => setCategory(a, "productivity");
entBtn.onclick = a => setCategory(a, "entertainment");
socBtn.onclick = a => setCategory(a, "social");
shopBtn.onclick = a => setCategory(a, "shopping");
eduBtn.onclick = a => setCategory(a, "education");
idleBtn.onclick = a => setCategory(a, "idle");

let buttons = [prodBtn, entBtn, socBtn, shopBtn, eduBtn, idleBtn];

function activateButton(b) {
    b.style.border = "1px solid #7bc979";
    b.style.backgroundColor = "#caf5c9";
}

chrome.runtime.sendMessage({ getCategory: 1 }, (cat) => {
    for (let button of buttons) {
        if (button.id.startsWith(cat)) {
            activateButton(button);
        }
    }
});

function consoleLog(msg) {
    chrome.runtime.sendMessage({ log: msg });
}

function setCategory(e, category) {
    for (let button of buttons) {
        button.style.border = "";
        button.style.backgroundColor = "";
    }
    activateButton(e.currentTarget);

    chrome.runtime.sendMessage({ cat: category });
}

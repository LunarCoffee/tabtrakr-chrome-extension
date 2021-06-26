document.getElementById("productivity-btn").onclick = (a, b) => setCategory("productivity");
document.getElementById("entertainment-btn").onclick = (a, b) => setCategory("entertainment");
document.getElementById("social-btn").onclick = (a, b) => setCategory("social");
document.getElementById("shopping-btn").onclick = (a, b) => setCategory("shopping");
document.getElementById("education-btn").onclick = (a, b) => setCategory("education");
document.getElementById("idle-btn").onclick = (a, b) => setCategory("idle");

function setCategory(category) {
    chrome.runtime.sendMessage({ cat: category });
}

let currentMac = "";

function loadDevice() {
    const mac = macInput().trim();
    if (!mac) return alert("Enter MAC Address");

    currentMac = mac;
    const data = localStorage.getItem("ziko_" + mac);
    document.getElementById("status").textContent =
        data ? data : "No playlist configured";
}

function switchType() {
    hideAll();
    const type = playlistType().value;
    if (type) document.getElementById(type + "Box").style.display = "block";
}

function savePlaylist() {
    if (!currentMac) return alert("Load device first");

    const type = playlistType().value;
    if (!type) return alert("Select playlist type");

    let payload = { type, updated: new Date().toISOString() };

    if (type === "m3u") {
        payload.url = m3uUrl().value;
    }

    if (type === "xtream") {
        payload.server = xtServer().value;
        payload.username = xtUser().value;
        payload.password = xtPass().value;
    }

    if (type === "stalker") {
        payload.portal = stalkerUrl().value;
    }

    localStorage.setItem("ziko_" + currentMac, JSON.stringify(payload, null, 2));
    document.getElementById("status").textContent =
        JSON.stringify(payload, null, 2);
}

function removePlaylist() {
    if (!currentMac) return;
    if (confirm("Remove playlist for this device?")) {
        localStorage.removeItem("ziko_" + currentMac);
        document.getElementById("status").textContent = "Playlist removed";
    }
}

function hideAll() {
    document.querySelectorAll(".type-box").forEach(e => e.style.display = "none");
}

/* shortcuts */
const macInput = () => document.getElementById("mac").value;
const playlistType = () => document.getElementById("playlistType");
const m3uUrl = () => document.getElementById("m3uUrl");
const xtServer = () => document.getElementById("xtServer");
const xtUser = () => document.getElementById("xtUser");
const xtPass = () => document.getElementById("xtPass");
const stalkerUrl = () => document.getElementById("stalkerUrl");

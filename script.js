let currentMac = "";

// تحميل بيانات الجهاز من Firebase
function loadDevice() {
    const mac = macInput().trim();
    if (!mac) return alert("Enter MAC Address");

    currentMac = mac;
    const docId = mac.replace(/:/g, "");

    db.collection("devices").doc(docId).get()
        .then(doc => {
            if (doc.exists) {
                displayPlaylist(doc.data());
            } else {
                document.getElementById("status").textContent = "No playlist configured";
            }
        })
        .catch(error => {
            console.error("Error getting document:", error);
            document.getElementById("status").textContent = "Error loading device";
        });
}

// عرض البيانات
function displayPlaylist(data) {
    const status = document.getElementById("status");
    status.innerHTML = `
MAC: ${data.mac || currentMac}

M3U: ${data.m3u && data.m3u.enabled ? data.m3u.url : "غير مفعل"}
Xtream: ${data.xtream && data.xtream.enabled ? data.xtream.server + " | " + data.xtream.username : "غير مفعل"}
MAG/Stalker: ${data.stalker && data.stalker.enabled ? data.stalker.portal + " | MAC: " + data.stalker.mac : "غير مفعل"}

آخر تحديث: ${data.updated || "غير معروف"}
    `;
}

// التحكم في واجهة اختيار النوع
function switchType() {
    hideAll();
    const type = playlistType().value;
    if (type) document.getElementById(type + "Box").style.display = "block";
}

function hideAll() {
    document.querySelectorAll(".type-box").forEach(e => e.style.display = "none");
}

// حفظ البيانات في Firestore
function savePlaylist() {
    if (!currentMac) return alert("Load device first");

    const type = playlistType().value;
    if (!type) return alert("Select playlist type");

    let payload = {
        mac: currentMac,
        m3u: { enabled: false, url: "" },
        xtream: { enabled: false, server: "", username: "", password: "" },
        stalker: { enabled: false, mac: "", portal: "" },
        updated: new Date().toISOString()
    };

    if (type === "m3u") {
        payload.m3u.enabled = true;
        payload.m3u.url = m3uUrl().value;
    }

    if (type === "xtream") {
        payload.xtream.enabled = true;
        payload.xtream.server = xtServer().value;
        payload.xtream.username = xtUser().value;
        payload.xtream.password = xtPass().value;
    }

    if (type === "stalker") {
        payload.stalker.enabled = true;
        payload.stalker.portal = stalkerPortal().value;
        payload.stalker.mac = stalkerMac().value || currentMac;
    }

    const docId = currentMac.replace(/:/g, "");
    db.collection("devices").doc(docId).set(payload)
        .then(() => {
            displayPlaylist(payload);
            alert("Playlist saved successfully!");
        })
        .catch(error => {
            console.error("Error writing document:", error);
            alert("Failed to save playlist");
        });
}

// حذف البيانات
function removePlaylist() {
    if (!currentMac) return;
    const docId = currentMac.replace(/:/g, "");
    if (confirm("Remove playlist for this device?")) {
        db.collection("devices").doc(docId).delete()
            .then(() => {
                document.getElementById("status").textContent = "Playlist removed";
            })
            .catch(error => {
                console.error("Error removing document:", error);
                alert("Failed to remove playlist");
            });
    }
}

// اختصارات DOM
const macInput = () => document.getElementById("mac").value;
const playlistType = () => document.getElementById("playlistType");
const m3uUrl = () => document.getElementById("m3uUrl");
const xtServer = () => document.getElementById("xtServer");
const xtUser = () => document.getElementById("xtUser");
const xtPass = () => document.getElementById("xtPass");
const stalkerPortal = () => document.getElementById("stalkerPortal");
const stalkerMac = () => document.getElementById("stalkerMac");

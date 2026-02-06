let currentMac = "";

// -----------------------------
// تحميل بيانات الجهاز من Firestore
// -----------------------------
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
                clearInputs();
                document.getElementById("status").textContent = "No playlist configured";
            }
        })
        .catch(error => {
            console.error("Error loading device:", error);
            document.getElementById("status").textContent = "Error loading device";
        });
}

// -----------------------------
// عرض بيانات الجهاز
// -----------------------------
function displayPlaylist(data) {
    const status = document.getElementById("status");
    status.innerHTML = `
MAC: ${data.mac || currentMac}

M3U: ${data.m3u?.enabled ? data.m3u.url : "غير مفعل"}
Xtream: ${data.xtream?.enabled ? data.xtream.server + " | " + data.xtream.username : "غير مفعل"}
MAG/Stalker: ${data.stalker?.enabled ? data.stalker.portal + " | MAC: " + data.stalker.mac : "غير مفعل"}

آخر تحديث: ${data.updated || "غير معروف"}
    `;

    // تحديث الحقول في الواجهة تلقائيًا
    if (data.m3u?.enabled) m3uUrl().value = data.m3u.url;
    if (data.xtream?.enabled) {
        xtServer().value = data.xtream.server;
        xtUser().value = data.xtream.username;
        xtPass().value = data.xtream.password;
    }
    if (data.stalker?.enabled) {
        stalkerPortal().value = data.stalker.portal;
        stalkerMac().value = data.stalker.mac;
    }
}

// -----------------------------
// واجهة اختيار نوع القائمة
// -----------------------------
function switchType() {
    hideAll();
    const type = playlistType().value;
    if (type) document.getElementById(type + "Box").style.display = "block";
}

function hideAll() {
    document.querySelectorAll(".type-box").forEach(e => e.style.display = "none");
}

// -----------------------------
// حفظ البيانات في Firestore
// -----------------------------
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

    // تعبئة البيانات حسب النوع
    switch(type) {
        case "m3u":
            payload.m3u.enabled = true;
            payload.m3u.url = m3uUrl().value.trim();
            break;
        case "xtream":
            payload.xtream.enabled = true;
            payload.xtream.server = xtServer().value.trim();
            payload.xtream.username = xtUser().value.trim();
            payload.xtream.password = xtPass().value.trim();
            break;
        case "stalker":
            payload.stalker.enabled = true;
            payload.stalker.portal = stalkerPortal().value.trim();
            payload.stalker.mac = stalkerMac().value.trim() || currentMac;
            break;
    }

    const docId = currentMac.replace(/:/g, "");
    db.collection("devices").doc(docId).set(payload)
        .then(() => {
            displayPlaylist(payload);
            alert("Playlist saved successfully!");
        })
        .catch(error => {
            console.error("Error saving playlist:", error);
            alert("Failed to save playlist");
        });
}

// -----------------------------
// حذف البيانات
// -----------------------------
function removePlaylist() {
    if (!currentMac) return;
    const docId = currentMac.replace(/:/g, "");
    if (confirm("Remove playlist for this device?")) {
        db.collection("devices").doc(docId).delete()
            .then(() => {
                clearInputs();
                document.getElementById("status").textContent = "Playlist removed";
            })
            .catch(error => {
                console.error("Error removing playlist:", error);
                alert("Failed to remove playlist");
            });
    }
}

// -----------------------------
// مسح الحقول عند عدم وجود بيانات
// -----------------------------
function clearInputs() {
    m3uUrl().value = "";
    xtServer().value = "";
    xtUser().value = "";
    xtPass().value = "";
    stalkerPortal().value = "";
    stalkerMac().value = "";
    hideAll();
}

// -----------------------------
// اختصارات DOM
// -----------------------------
const macInput = () => document.getElementById("mac").value;
const playlistType = () => document.getElementById("playlistType");
const m3uUrl = () => document.getElementById("m3uUrl");
const xtServer = () => document.getElementById("xtServer");
const xtUser = () => document.getElementById("xtUser");
const xtPass = () => document.getElementById("xtPass");
const stalkerPortal = () => document.getElementById("stalkerPortal");
const stalkerMac = () => document.getElementById("stalkerMac");

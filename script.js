let currentMac = "";

// -----------------------------
// تحميل بيانات الجهاز من JSON على GitHub
// -----------------------------
function loadDevice() {
    const mac = macInput().trim();
    if (!mac) return alert("Enter MAC Address");

    currentMac = mac;

    // تحويل MAC لاسم ملف بدون النقطتين (:)
    const fileName = mac.replace(/:/g, "") + ".json";

    // رابط الملف على GitHub Pages
    const url = `https://kadikadari.github.io/ziko-iptv-panel/data/${fileName}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("No JSON file for this MAC");
            return response.json();
        })
        .then(data => {
            displayPlaylist(data);
        })
        .catch(error => {
            console.log("GitHub fetch failed, checking localStorage...");
            // fallback لاستخدام localStorage
            const dataLS = localStorage.getItem("ziko_" + mac);
            document.getElementById("status").textContent =
                dataLS ? dataLS : "No playlist configured";
        });
}

// -----------------------------
// عرض البيانات على الموقع
// -----------------------------
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

// -----------------------------
// التحكم في واجهة اختيار النوع
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
// حفظ البيانات محليًا (اختياري)
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
        // الآن المستخدم يمكنه إدخال MAC خاص
        payload.stalker.portal = document.getElementById("stalkerPortal").value;
        payload.stalker.mac = document.getElementById("stalkerMac").value || currentMac;
    }

    // حفظ محلي مؤقت
    localStorage.setItem("ziko_" + currentMac, JSON.stringify(payload, null, 2));
    displayPlaylist(payload);
}

// -----------------------------
// حذف البيانات
// -----------------------------
function removePlaylist() {
    if (!currentMac) return;
    if (confirm("Remove playlist for this device?")) {
        localStorage.removeItem("ziko_" + currentMac);
        document.getElementById("status").textContent = "Playlist removed";
    }
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

document.addEventListener('DOMContentLoaded', () => {

    // --- Date & Time Update ---
    function updateDateTime() {
        const datetimeElement = document.getElementById('datetime');
        if (datetimeElement) {
            const now = new Date();
            const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
            const timeString = now.toLocaleTimeString('en-US', timeOptions);
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            const dateString = `${day}-${month}-${year}`;
            datetimeElement.innerHTML = `${timeString}<br>${dateString}`;
        }
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    // --- System Tray Popups ---
    const systemTrayPopup = document.getElementById('system-tray-popup');
    const wifiIcon = document.getElementById('wifi-icon');
    const volumeIcon = document.getElementById('volume-icon');
    const batteryIcon = document.getElementById('battery-icon');

    let currentPopupIcon = null;

    function getRandomWifiData() {
        const ssids = ["HomeNet_5G", "WorkWiFi", "Public_Access", "Guest_Network", "Akash_Net"];
        const status = ["Connected to", "No Internet access", "Identifying...", "Looking for networks"];
        const randomSSID = ssids[Math.floor(Math.random() * ssids.length)];
        const randomStatus = status[Math.floor(Math.random() * status.length)];

        return randomStatus === "Connected to"
            ? `<strong>${randomStatus} ${randomSSID}</strong><p>Internet access</p>`
            : `<strong>${randomStatus}</strong><p>No connections available</p>`;
    }

    function getRandomVolumeData() {
        const volumeLevels = [0, 25, 50, 75, 100];
        const randomLevel = volumeLevels[Math.floor(Math.random() * volumeLevels.length)];
        const muted = Math.random() < 0.2;
        return muted
            ? `<strong>Volume: Muted</strong><p>Speakers</p>`
            : `<strong>Volume: ${randomLevel}%</strong><p>Speakers</p>`;
    }

    function getRandomBatteryData() {
        const charge = Math.floor(Math.random() * 100) + 1;
        const charging = Math.random() < 0.3;
        const saving = Math.random() < 0.1;

        let status = charging ? "Charging" : saving ? "Battery saver on" : "Discharging";
        return `<strong>${charge}% available</strong><p>${status}</p>`;
    }

    function showSystemTrayPopup(iconElement, contentGenerator) {
        hideStartPanel();
        if (currentPopupIcon === iconElement) {
            systemTrayPopup.style.display = 'none';
            currentPopupIcon = null;
            return;
        }

        systemTrayPopup.innerHTML = contentGenerator();
        const iconRect = iconElement.getBoundingClientRect();
        const taskbarRect = document.getElementById('taskbar').getBoundingClientRect();

        const bottomPos = taskbarRect.height + 10;
        const rightPos = document.body.clientWidth - iconRect.right;

        systemTrayPopup.style.bottom = `${bottomPos}px`;
        systemTrayPopup.style.right = `${rightPos}px`;
        systemTrayPopup.style.left = 'auto';
        systemTrayPopup.style.display = 'block';
        currentPopupIcon = iconElement;

        if (systemTrayPopup.getBoundingClientRect().left < 0) {
            systemTrayPopup.style.left = '10px';
            systemTrayPopup.style.right = 'auto';
        }
    }

    function hideSystemTrayPopup() {
        systemTrayPopup.style.display = 'none';
        currentPopupIcon = null;
    }

    wifiIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        showSystemTrayPopup(wifiIcon, getRandomWifiData);
    });
    volumeIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        showSystemTrayPopup(volumeIcon, getRandomVolumeData);
    });
    batteryIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        showSystemTrayPopup(batteryIcon, getRandomBatteryData);
    });

    // --- Start Panel ---
    const windowsIcon = document.getElementById('windows-icon');
    const startPanel = document.getElementById('start-panel');

    function toggleStartPanel() {
        hideSystemTrayPopup();
        startPanel.classList.toggle('show');
    }

    function hideStartPanel() {
        startPanel.classList.remove('show');
    }

    windowsIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStartPanel();
    });

    // --- Power Button Shutdown ---
    const powerButton = document.getElementById('power-button');
    const shutdownOverlay = document.getElementById('shutdown-overlay');

    powerButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideStartPanel();
        hideSystemTrayPopup();
        shutdownOverlay.classList.add('show');
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 4000);
    });

    // --- Visitor Logging (Cloudflare Worker) ---
    fetch("https://wispy-resonance-7604.akaxh.workers.dev", {
        method: "POST"
    })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Visitor logged:", data);
        })
        .catch(err => {
            console.error("❌ Failed to log visitor:", err);
        });

    // --- Global Click Listener ---
    document.addEventListener('click', function (e) {
        if (systemTrayPopup.style.display === 'block' &&
            !systemTrayPopup.contains(e.target) &&
            !wifiIcon.contains(e.target) &&
            !volumeIcon.contains(e.target) &&
            !batteryIcon.contains(e.target)) {
            hideSystemTrayPopup();
        }

        if (startPanel.classList.contains('show') &&
            !startPanel.contains(e.target) &&
            !windowsIcon.contains(e.target)) {
            hideStartPanel();
        }
    });

    startPanel.addEventListener('click', (e) => e.stopPropagation());
    systemTrayPopup.addEventListener('click', (e) => e.stopPropagation());
});

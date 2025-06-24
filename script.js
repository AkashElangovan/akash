// --- Date & Time Update ---
function updateDateTime() {
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        const now = new Date();

        // Format time (e.g., 8:01 PM)
        const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = now.toLocaleTimeString('en-US', timeOptions);

        // Format date to DD-MM-YY (e.g., 24-06-25)
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = String(now.getFullYear()).slice(-2); // Get last two digits of the year
        const dateString = `${day}-${month}-${year}`; // Changed to hyphens

        datetimeElement.innerHTML = `${timeString}<br>${dateString}`;
    }
}

// Update immediately on load
updateDateTime();

// Update every second
setInterval(updateDateTime, 1000);

// --- System Tray Popups ---
const systemTrayPopup = document.getElementById('system-tray-popup');
const wifiIcon = document.getElementById('wifi-icon');
const volumeIcon = document.getElementById('volume-icon');
const batteryIcon = document.getElementById('battery-icon');

let currentPopupIcon = null; // To track which icon opened the popup

function getRandomWifiData() {
    const ssids = ["HomeNet_5G", "WorkWiFi", "Public_Access", "Guest_Network", "Akash_Net"];
    const status = ["Connected to", "No Internet access", "Identifying...", "Looking for networks"];
    const randomSSID = ssids[Math.floor(Math.random() * ssids.length)];
    const randomStatus = status[Math.floor(Math.random() * status.length)];

    if (randomStatus === "Connected to") {
        return `<strong>${randomStatus} ${randomSSID}</strong><p>Internet access</p>`;
    } else {
        return `<strong>${randomStatus}</strong><p>No connections available</p>`;
    }
}

function getRandomVolumeData() {
    const volumeLevels = [0, 25, 50, 75, 100];
    const randomLevel = volumeLevels[Math.floor(Math.random() * volumeLevels.length)];
    const muted = Math.random() < 0.2; // 20% chance of being muted

    if (muted) {
        return `<strong>Volume: Muted</strong><p>Speakers</p>`;
    } else {
        return `<strong>Volume: ${randomLevel}%</strong><p>Speakers</p>`;
    }
}

function getRandomBatteryData() {
    const charge = Math.floor(Math.random() * 100) + 1; // 1-100%
    const charging = Math.random() < 0.3; // 30% chance of charging
    const saving = Math.random() < 0.1; // 10% chance of battery saver
     
    let status = "";
    if (charging) {
        status = "Charging";
    } else if (saving) {
        status = "Battery saver on";
    } else {
        status = "Discharging";
    }

    return `<strong>${charge}% available</strong><p>${status}</p>`;
}

function showSystemTrayPopup(iconElement, contentGenerator) {
    hideStartPanel(); // Hide start panel if open

    if (currentPopupIcon === iconElement) {
        systemTrayPopup.style.display = 'none';
        currentPopupIcon = null;
        return;
    }

    const content = contentGenerator();
    systemTrayPopup.innerHTML = content;

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

wifiIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    showSystemTrayPopup(wifiIcon, getRandomWifiData);
});
volumeIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    showSystemTrayPopup(volumeIcon, getRandomVolumeData);
});
batteryIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    showSystemTrayPopup(batteryIcon, getRandomBatteryData);
});


// --- Windows (Start) Icon & Panel ---
const windowsIcon = document.getElementById('windows-icon');
const startPanel = document.getElementById('start-panel');

function toggleStartPanel() {
    hideSystemTrayPopup(); // Hide tray popup if open

    startPanel.classList.toggle('show');
}

function hideStartPanel() {
    startPanel.classList.remove('show');
}

windowsIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleStartPanel();
});


// --- Power Button Shutdown ---
const powerButton = document.getElementById('power-button');
const shutdownOverlay = document.getElementById('shutdown-overlay');

powerButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    event.stopPropagation(); // Stop propagation to prevent document click from interfering

    hideStartPanel(); // Hide start panel
    hideSystemTrayPopup(); // Hide any tray popups

    shutdownOverlay.classList.add('show'); // Show the GIF overlay

    // After the GIF plays (approx 4 seconds), redirect to a blank page
    setTimeout(() => {
        window.location.href = 'about:blank'; // Redirect to a blank page
    }, 4000); // GIF duration is approx 4 seconds
});
// Log visitor IP and user agent using your Cloudflare Worker
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


// --- Global Click Listener to Hide Popups/Panels ---
document.addEventListener('click', function(event) {
    if (systemTrayPopup.style.display === 'block' && !systemTrayPopup.contains(event.target) && !wifiIcon.contains(event.target) && !volumeIcon.contains(event.target) && !batteryIcon.contains(event.target)) {
        hideSystemTrayPopup();
    }

    if (startPanel.classList.contains('show') && !startPanel.contains(event.target) && !windowsIcon.contains(event.target)) {
        hideStartPanel();
    }
});

// Prevent clicks inside the start panel or popup from closing them immediately
startPanel.addEventListener('click', (event) => {
    event.stopPropagation();
});
systemTrayPopup.addEventListener('click', (event) => {
    event.stopPropagation();
});

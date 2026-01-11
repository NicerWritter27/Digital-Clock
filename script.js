function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const month = now.toLocaleString('en-US', { month: 'long' });
    const day = now.getDate();
    const weekDay = now.toLocaleString('en-US', { weekday: 'long' });
    const dateString = month + ' ' + day + ', ' + weekDay;

    const settings = window.__clockSettings || {};
    const use24 = settings.use24Hour === true;
    const hideSeconds = settings.hideSeconds === true;
    const hideAmpm = settings.hideAmPm === true;

    let displayHours = hours;
    if (!use24) displayHours = hours % 12 || 12;

    let timeString = displayHours + ':' + minutes;
    if (!hideSeconds) timeString += ':' + seconds;
    if (!use24 && !hideAmpm) timeString += ' ' + ampm;

    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if (clockEl) clockEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
}

setInterval(updateClock, 1000);

function injectStylesheet(stylesheet) {
    const stylesheetLink = document.getElementById('stylesheet-link');
    if (stylesheetLink) stylesheetLink.href = chrome.runtime.getURL(stylesheet);
}

const borderColorMap = {
    'styles/black_white.css': '#ffffff',
    'styles/black_red.css': '#ff3b30',
    'styles/black_lime_green.css': '#32cd32',
    'styles/classic_lcd.css': '#7d8c76',
    'styles/white_black.css': '#0b1220',
    'styles/white_red.css': '#ff3b30',
    'styles/white_lime_green.css': '#32cd32',
    'styles/white_arial.css': '#0b1220'
};

chrome.storage.sync.get(['includeDate', 'stylesheet', 'addBorder', 'use24Hour', 'hideSeconds', 'hideAmPm', 'timeFontSize', 'dateFontSize'], (data) => {
    const includeDate = data.includeDate !== undefined ? data.includeDate : true;
    const stylesheet = data.stylesheet || 'styles/black_lime_green.css';
    const addBorder = data.addBorder === true;

    injectStylesheet(stylesheet);

    const dateElement = document.getElementById('date');
    if (dateElement) dateElement.style.display = includeDate ? 'block' : 'none';

    const wrapper = document.getElementById('clock-wrapper');
    if (wrapper) {
        if (addBorder) {
            const color = borderColorMap[stylesheet] || '#0b1220';
            wrapper.style.border = '2px solid ' + color;
            wrapper.style.borderRadius = '8px';
            wrapper.style.padding = '8px';
        } else {
            wrapper.style.border = 'none';
            wrapper.style.padding = '';
            wrapper.style.borderRadius = '';
        }
    }

    const settings = {
        includeDate: includeDate,
        use24Hour: data.use24Hour === true,
        hideSeconds: data.hideSeconds === true,
        hideAmPm: data.hideAmPm === true,
        timeFontSize: data.timeFontSize || 36,
        dateFontSize: data.dateFontSize || 14
    };
    window.__clockSettings = settings;

    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if (clockEl) clockEl.style.fontSize = settings.timeFontSize + 'px';
    if (dateEl) dateEl.style.fontSize = settings.dateFontSize + 'px';
});

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('open-options-window');
    const wrapper = document.getElementById('clock-wrapper');
    if (wrapper) wrapper.style.position = wrapper.style.position || 'relative';
    if (!btn) return;

    btn.style.position = 'absolute';
    btn.style.top = '6px';
    btn.style.right = '8px';
    btn.style.padding = '6px';
    btn.style.borderRadius = '6px';
    btn.style.border = 'none';
    btn.style.background = 'transparent';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';

    const setGearColor = (stylesheet) => {
        const color = borderColorMap[stylesheet] || '#0b1220';
        btn.style.color = color;
    };

    const wrapperEl = document.getElementById('clock-wrapper');
    if (wrapperEl) {
        wrapperEl.classList.add('controls-visible-temporary');
        setTimeout(() => wrapperEl.classList.remove('controls-visible-temporary'), 3000);
    }

    chrome.storage.sync.get('stylesheet', (d) => { setGearColor(d.stylesheet || 'styles/black_lime_green.css'); });

    btn.addEventListener('click', async() => {
        const targetUrl = chrome.runtime.getURL('options.html');
        const all = await chrome.windows.getAll({ populate: true });
        let found = null;
        for (const w of all) {
            if (!w.tabs) continue;
            for (const t of w.tabs) {
                if (t.url && t.url.indexOf('options.html') !== -1) {
                    found = w;
                    break;
                }
            }
            if (found) break;
        }

        const width = 900;
        const height = 600;

        if (found) {
            chrome.windows.update(found.id, { focused: true, width: width, height: height });
        } else {
            chrome.windows.create({ url: targetUrl, type: 'popup', width: width, height: height });
        }
    });

    const injectBtn = document.getElementById('inject-btn');
    if (injectBtn) {
        injectBtn.style.position = 'absolute';
        injectBtn.style.top = '6px';
        injectBtn.style.left = '8px';
        injectBtn.style.border = 'none';
        injectBtn.style.background = 'transparent';
        injectBtn.style.cursor = 'pointer';
        injectBtn.style.fontSize = '14px';

        injectBtn.addEventListener('click', async() => {
            try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tabs || !tabs[0]) return;
                const tabId = tabs[0].id;
                await chrome.scripting.insertCSS({ target: { tabId }, files: ['content_overlay.css'] });
                await chrome.scripting.executeScript({ target: { tabId }, files: ['content_overlay.js'] });
            } catch (e) {
                console.error('Inject overlay error', e);
                alert('Unable to inject overlay into this page.');
            }
        });
    }
});
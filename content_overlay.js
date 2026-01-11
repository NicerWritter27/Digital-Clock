(function() {
    const EXISTING_ID = 'digital-clock-overlay';

    const existing = document.getElementById(EXISTING_ID);
    if (existing) {
        try { existing.remove(); } catch (e) {}
        if (window.__digitalClockInterval) {
            clearInterval(window.__digitalClockInterval);
            delete window.__digitalClockInterval;
        }
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = EXISTING_ID;
    overlay.style.position = 'fixed';
    overlay.style.top = '12px';
    overlay.style.right = '12px';
    overlay.style.zIndex = '2147483647';
    overlay.style.pointerEvents = 'auto';

    const buildFallbackWrapper = () => {
        const w = document.createElement('div');
        w.id = 'clock-wrapper';
        w.style.position = 'relative';

        const clockDiv = document.createElement('div');
        clockDiv.id = 'clock';
        w.appendChild(clockDiv);

        const dateDiv = document.createElement('div');
        dateDiv.id = 'date';
        w.appendChild(dateDiv);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'dc-close-overlay';
        closeBtn.textContent = '×';
        closeBtn.title = 'Close overlay';
        closeBtn.style.position = 'absolute';
        closeBtn.style.left = '8px';
        closeBtn.style.top = '6px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'transparent';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            try { overlay.remove(); } catch (e) {}
            if (window.__digitalClockInterval) {
                clearInterval(window.__digitalClockInterval);
                delete window.__digitalClockInterval;
            }
        });
        w.appendChild(closeBtn);

        return w;
    };

    document.body.appendChild(overlay);

    const useStorage = !!(chrome && chrome.storage && chrome.storage.sync);

    const startWithSettings = async(settings) => {
        const stylesheet = settings.stylesheet || 'styles/black_lime_green.css';
        const includeDate = settings.includeDate !== undefined ? settings.includeDate : true;
        const addBorder = settings.addBorder === true;
        const timeFontSize = settings.timeFontSize || null;
        const dateFontSize = settings.dateFontSize || null;

        let wrapperNode = null;
        try {
            const popupUrl = chrome.runtime.getURL('popup.html');
            const r = await fetch(popupUrl);
            const html = await r.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const remoteWrapper = doc.getElementById('clock-wrapper');
            if (remoteWrapper) wrapperNode = document.importNode(remoteWrapper, true);
        } catch (e) {
            console.warn('Could not fetch popup.html for exact markup', e);
        }

        if (!wrapperNode) wrapperNode = buildFallbackWrapper();

        if (!wrapperNode.querySelector('#clock')) {
            const cd = document.createElement('div');
            cd.id = 'clock';
            wrapperNode.appendChild(cd);
        }
        if (!wrapperNode.querySelector('#date')) {
            const dd = document.createElement('div');
            dd.id = 'date';
            wrapperNode.appendChild(dd);
        }

        const shadow = overlay.attachShadow({ mode: 'open' });

        try {
            const fontUrl = chrome.runtime.getURL('styles/Digital.otf');
            const fontStyle = document.createElement('style');
            fontStyle.textContent = "@font-face { font-family: 'Digital'; src: url('" + fontUrl + "') format('opentype'); font-display: swap; }";
            shadow.appendChild(fontStyle);
        } catch (e) { console.warn('Could not inject font into shadow root', e); }

        try {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = chrome.runtime.getURL(stylesheet);
            shadow.appendChild(link);
        } catch (e) { console.warn('Could not link stylesheet inside shadow root', e); }

        shadow.appendChild(wrapperNode);

        try {
            const url = chrome.runtime.getURL(stylesheet);
            const res = await fetch(url);
            const textStyles = await res.text();
            const transformed = textStyles.replace(/\bbody\b/g, '#clock-wrapper');
            const style = document.createElement('style');
            style.textContent = transformed;
            shadow.appendChild(style);
        } catch (e) { console.warn('Could not fetch stylesheet for overlay styling', e); }

        const clockEl = shadow.querySelector('#clock') || wrapperNode.querySelector('#clock');
        const dateEl = shadow.querySelector('#date') || wrapperNode.querySelector('#date');
        if (timeFontSize && clockEl) clockEl.style.fontSize = timeFontSize + 'px';
        if (dateFontSize && dateEl) dateEl.style.fontSize = dateFontSize + 'px';

        if (addBorder) {
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
            const color = borderColorMap[settings.stylesheet] || '#0b1220';
            overlay.style.border = '2px solid ' + color;
            overlay.style.borderRadius = '8px';
            overlay.style.padding = '8px';
        }

        function update() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const use24 = settings.use24Hour === true;
            const hideSeconds = settings.hideSeconds === true;
            const hideAmpm = settings.hideAmPm === true;

            let displayHours = hours;
            if (!use24) displayHours = hours % 12 || 12;
            let timeString = displayHours + ':' + minutes;
            if (!hideSeconds) timeString += ':' + seconds;
            if (!use24 && !hideAmpm) timeString += ' ' + ampm;
            if (clockEl) clockEl.textContent = timeString;

            const month = now.toLocaleString('en-US', { month: 'long' });
            const day = now.getDate();
            const weekday = now.toLocaleString('en-US', { weekday: 'long' });
            if (dateEl) dateEl.textContent = month + ' ' + day + ', ' + weekday;
        }

        update();
        window.__digitalClockInterval = setInterval(update, 1000);
    };

    if (useStorage) {
        chrome.storage.sync.get(['stylesheet', 'includeDate', 'addBorder', 'timeFontSize', 'dateFontSize', 'use24Hour', 'hideSeconds', 'hideAmPm'], (d) => {
            startWithSettings(d || {});
        });
    } else {
        startWithSettings({});
    }
})();
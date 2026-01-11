const style1Button = document.getElementById('style1-button');
const style2Button = document.getElementById('style2-button');
const style3Button = document.getElementById('style3-button');
const style4Button = document.getElementById('style4-button');
const style5Button = document.getElementById('style5-button');
const style6Button = document.getElementById('style6-button');
const style7Button = document.getElementById('style7-button');
const style8Button = document.getElementById('style8-button');

style1Button.addEventListener('click', () => saveStylesheet('styles/black_white.css'));
style2Button.addEventListener('click', () => saveStylesheet('styles/black_red.css'));
style3Button.addEventListener('click', () => saveStylesheet('styles/black_lime_green.css'));
style4Button.addEventListener('click', () => saveStylesheet('styles/classic_lcd.css'));
style5Button.addEventListener('click', () => saveStylesheet('styles/white_black.css'));
style6Button.addEventListener('click', () => saveStylesheet('styles/white_red.css'));
style7Button.addEventListener('click', () => saveStylesheet('styles/white_lime_green.css'));
style8Button.addEventListener('click', () => saveStylesheet('styles/white_arial.css'));

function saveStylesheet(stylesheet) {
    chrome.runtime.sendMessage({ action: 'saveStylesheet', stylesheet }, () => {
        console.log('Stylesheet saved');
    });
}

const includeDateCheckbox = document.getElementById('include-date-checkbox');
const addBorderCheckbox = document.getElementById('add-border-checkbox');
const hideSecondsCheckbox = document.getElementById('hide-seconds-checkbox');
const hideAmPmCheckbox = document.getElementById('hide-ampm-checkbox');
const use24hCheckbox = document.getElementById('use-24h-checkbox');
const timeSizeRange = document.getElementById('time-size');
const dateSizeRange = document.getElementById('date-size');
const timeSizeValue = document.getElementById('time-size-value');
const dateSizeValue = document.getElementById('date-size-value');

chrome.storage.sync.get(['includeDate', 'addBorder', 'hideSeconds', 'hideAmPm', 'use24Hour', 'timeFontSize', 'dateFontSize'], (data) => {
    includeDateCheckbox.checked = data.includeDate !== undefined ? data.includeDate : true;
    addBorderCheckbox.checked = data.addBorder === true;
    hideSecondsCheckbox.checked = data.hideSeconds === true;
    hideAmPmCheckbox.checked = data.hideAmPm === true;
    use24hCheckbox.checked = data.use24Hour === true;

    const defaultTime = data.timeFontSize || 36;
    const defaultDate = data.dateFontSize || 14;
    timeSizeRange.value = defaultTime;
    timeSizeValue.textContent = defaultTime + 'px';
    dateSizeRange.value = defaultDate;
    dateSizeValue.textContent = defaultDate + 'px';
    if (use24hCheckbox.checked) {
        hideAmPmCheckbox.checked = false;
        hideAmPmCheckbox.disabled = true;
    } else if (hideAmPmCheckbox.checked) {
        use24hCheckbox.checked = false;
        use24hCheckbox.disabled = true;
    } else {
        hideAmPmCheckbox.disabled = false;
        use24hCheckbox.disabled = false;
    }
});

function saveBool(key, value) {
    const obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj);
}

includeDateCheckbox.addEventListener('change', () => saveBool('includeDate', includeDateCheckbox.checked));
addBorderCheckbox.addEventListener('change', () => saveBool('addBorder', addBorderCheckbox.checked));
hideSecondsCheckbox.addEventListener('change', () => saveBool('hideSeconds', hideSecondsCheckbox.checked));

hideAmPmCheckbox.addEventListener('change', () => {
    if (hideAmPmCheckbox.checked) {
        use24hCheckbox.checked = false;
        use24hCheckbox.disabled = true;
        saveBool('use24Hour', false);
    } else {
        use24hCheckbox.disabled = false;
    }
    saveBool('hideAmPm', hideAmPmCheckbox.checked);
});

use24hCheckbox.addEventListener('change', () => {
    if (use24hCheckbox.checked) {
        hideAmPmCheckbox.checked = false;
        hideAmPmCheckbox.disabled = true;
        saveBool('hideAmPm', false);
    } else {
        hideAmPmCheckbox.disabled = false;
    }
    saveBool('use24Hour', use24hCheckbox.checked);
});

timeSizeRange.addEventListener('input', () => {
    const val = parseInt(timeSizeRange.value, 10);
    timeSizeValue.textContent = val + 'px';
    chrome.storage.sync.set({ timeFontSize: val });
});

dateSizeRange.addEventListener('input', () => {
    const val = parseInt(dateSizeRange.value, 10);
    dateSizeValue.textContent = val + 'px';
    chrome.storage.sync.set({ dateFontSize: val });
});

const resetBtn = document.getElementById('reset-options');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        const defaults = {
            stylesheet: 'styles/black_lime_green.css',
            includeDate: true,
            addBorder: false,
            hideSeconds: false,
            hideAmPm: false,
            use24Hour: false,
            timeFontSize: 36,
            dateFontSize: 14
        };
        chrome.storage.sync.set(defaults, () => {
            chrome.runtime.sendMessage({ action: 'saveStylesheet', stylesheet: defaults.stylesheet });
            includeDateCheckbox.checked = defaults.includeDate;
            addBorderCheckbox.checked = defaults.addBorder;
            hideSecondsCheckbox.checked = defaults.hideSeconds;
            hideAmPmCheckbox.checked = defaults.hideAmPm;
            use24hCheckbox.checked = defaults.use24Hour;
            timeSizeRange.value = defaults.timeFontSize;
            timeSizeValue.textContent = defaults.timeFontSize + 'px';
            dateSizeRange.value = defaults.dateFontSize;
            dateSizeValue.textContent = defaults.dateFontSize + 'px';
            hideAmPmCheckbox.disabled = false;
            use24hCheckbox.disabled = false;
        });
    });
}
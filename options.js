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
style6Button.addEventListener('click', () => saveStylesheet('styles/white_red_green.css'));
style7Button.addEventListener('click', () => saveStylesheet('styles/white_lime_green.css'));
style8Button.addEventListener('click', () => saveStylesheet('styles/white_arial.css'));

function saveStylesheet(stylesheet) {
  chrome.runtime.sendMessage({ action: 'saveStylesheet', stylesheet }, () => {
    console.log('Stylesheet saved');
  });
}
// ... existing JavaScript ...
const includeDateCheckbox = document.getElementById('include-date-checkbox');

includeDateCheckbox.addEventListener('change', () => {
  chrome.storage.sync.set({ includeDate: includeDateCheckbox.checked }, () => {
    console.log('Include date setting saved');
  });
});
document.getElementById('include-date-checkbox').checked = true;
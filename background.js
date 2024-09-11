chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveStylesheet') {
      chrome.storage.sync.set({ stylesheet: request.stylesheet }, () => {
        console.log('Stylesheet saved');
        sendResponse({ success: true });
      });
    }
  });
// ... existing JavaScript ...
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ... existing message handling ...
  if (request.action === 'toggleDate') {
    chrome.storage.sync.set({ includeDate: request.includeDate }, () => {
      console.log('Include date setting saved');
      sendResponse({ success: true });
    });
  }
});
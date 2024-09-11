function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var seconds = now.getSeconds().toString().padStart(2, '0');
    var timeString = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

    var month = now.toLocaleString('en-US', { month: 'long' });
    var day = now.getDate();
    var weekDay = now.toLocaleString('en-US', { weekday: 'long' });
    var dateString = month + ' ' + day + ', ' + weekDay;

    document.getElementById('clock').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

setInterval(updateClock, 1000);
chrome.storage.sync.get('stylesheet', (data) => {
    const stylesheet = data.stylesheet || 'styles/black_lime_green.css';
    injectStylesheet(stylesheet);
  });
  
  function injectStylesheet(stylesheet) {
    const stylesheetLink = document.getElementById('stylesheet-link');
    stylesheetLink.href = chrome.runtime.getURL(stylesheet);
  }
  chrome.storage.sync.get(['includeDate', 'stylesheet'], (data) => {
    const { includeDate, stylesheet } = data;
    injectStylesheet(stylesheet);
  
    // Get the date element
    const dateElement = document.getElementById('date');
  
    if (includeDate) {
      dateElement.style.display = 'block'; // Show the date element
    } else {
      dateElement.style.display = 'none'; // Hide the date element
    }
  });
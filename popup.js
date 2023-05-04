chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.runtime.sendMessage({ action: 'checkCurrentTab', tabId: tab.id }, (response) => {
    const messageContainer = document.getElementById('message-container');
    const noData = document.getElementById('no-data');
    const feedback = document.getElementById('feedback');

    if (response.hasData) {
      messageContainer.innerHTML = `
        <h1>Heads up!</h1><p>People have reported that this establishment has service fees in addition to menu prices.</p>
        ${response.surchargeAmount ? `<h2>Fee Amount:</h2><p>${response.surchargeAmount}</p>` : ''}
        ${response.feeLanguage ? `<h2>Fee Language:</h2><p>"${response.feeLanguage}"</p>` : ''}
      `;
      noData.style.display = 'none';
    } else {
      messageContainer.style.display = 'none';
    }
    feedback.style.display = 'block';
  });
});

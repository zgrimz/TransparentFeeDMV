chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.runtime.sendMessage({ action: 'checkCurrentTab', tabId: tab.id }, (response) => {
    const messageContainer = document.getElementById('message-container');
    const noData = document.getElementById('no-data');
    const feedback = document.getElementById('feedback');

    if (response.hasData) {
      let feeLanguageSection = (response.feeLanguage && response.feeLanguage !== 'null') ? `<h2>Fee Language:</h2><p>"${response.feeLanguage}"</p>` : '';

      messageContainer.innerHTML = `
        <h1>Heads up!</h1><p>People have reported this establishment has a service fee in addition to menu prices.</p>
        ${response.surchargeAmount ? `<h2>Fee Amount:</h2><p>${response.surchargeAmount}</p>` : ''}
        ${feeLanguageSection}
      `;
      noData.style.display = 'none';
    } else {
      messageContainer.style.display = 'none';
    }
    feedback.style.display = 'block';
  });
});

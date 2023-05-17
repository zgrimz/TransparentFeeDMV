importScripts('node_modules/papaparse/papaparse.min.js');

// Cache expiry duration: 12 hours in milliseconds
const CACHE_EXPIRY = 12 * 60 * 60 * 1000;

// Initialize global variables
let closedTabs = new Set();
let tabUrls = {};

function parseCSV(csvText) {
  const parseResult = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  return parseResult.data;
}

async function fetchRestaurantInformation() {
  // Check if the cache is still valid
  const cache = await getFromCache('websites', 'lastFetched');
  if (cache.websites && cache.lastFetched && Date.now() - cache.lastFetched < CACHE_EXPIRY) {
    console.log("Using local cached websites:", cache.websites);
    return cache.websites;
  }

  const csvUrl = 'https://www.dropbox.com/s/0gt4i4g5hzzw2ia/database.csv?dl=1';
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  const parseResult = parseCSV(csvText);
  const fetchedWebsites = parseResult.reduce((accumulator, row) => {
    const domain = removeWwwPrefix(row[0]);
    accumulator[domain] = {
      surchargeAmount: row[1],
      feeLanguage: row[2],
    };
    return accumulator;
  }, {});
  await saveToCache({ websites: fetchedWebsites, lastFetched: Date.now() });

  console.log("Fetched websites:", fetchedWebsites);

  return fetchedWebsites;
}

// Function to get dagetFromCacheta from the Chrome storage
async function getFromCache(...keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
}

async function saveToCache(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

function removeWwwPrefix(hostname) {
  return hostname.replace(/^www\./, '');
}

async function executeScript(tabId, code) {
  return chrome.scripting.executeScript({
    target: { tabId },
    function: new Function(code),
  });
}

async function checkRestaurantWebsite(tabId, websites) {
  const currentUrl = new URL((await chrome.tabs.get(tabId)).url);
  const currentHostname = removeWwwPrefix(currentUrl.hostname);
  const websiteData = websites[currentHostname];

  console.log("Checking restaurant website:", currentUrl, currentHostname, websiteData);

  if (websiteData) {
    // Set badge background color and text
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#FF6B6B' });
    chrome.action.setBadgeText({ tabId, text: '!' });

    chrome.scripting.executeScript({
      target: { tabId },
      function: function () {
        const isMessageClosed = sessionStorage.getItem('messageClosed');

        if (isMessageClosed) {
          return;
        }
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '10px';
        iframe.style.right = '10px';
        iframe.style.zIndex = 9999;
        iframe.style.border = 'none';
        iframe.style.width = '350px';
        iframe.style.height = 'auto';
        iframe.style.maxWidth = '90%';
        iframe.style.boxSizing = 'border-box';
        document.body.appendChild(iframe);

        const iframeDocument = iframe.contentWindow.document;

        const message = iframeDocument.createElement('div');
        message.style.position = 'relative';
        message.innerHTML = `<p style="font-family: Montserrat, sans-serif; font-weight: bold; font-size: 18px; margin: 0 0 4px 0; padding: 0; color: #182952;">Heads up!</p> <p style="font-family: Open Sans, sans-serif; font-weight: light; font-size: 14px; margin: 0; padding: 0;">People have reported this establishment has a service fee in addition to menu prices.</p> <span style="cursor:pointer; position: absolute; top: 0; right: 0; margin: 0; padding: 8px; color: #007A4D;">&times;</span>`;
        message.style.padding = '16px';
        message.style.backgroundColor = '#FFFFFF';
        message.style.color = '#182952';
        message.style.borderRadius = '8px';
        message.style.border = '1px solid #D8D8D8';
        message.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        message.style.fontFamily = 'Open Sans, sans-serif';
        message.style.fontSize = '14px';
        message.style.lineHeight = '1.4';
        message.style.textAlign = 'left';
        message.style.width = '100%';
        message.style.boxSizing = 'border-box';
        iframeDocument.body.appendChild(message);

        message.querySelector('span').onclick = () => {
          iframe.remove();
          sessionStorage.setItem('messageClosed', 'true');
        };
      },
    });
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
  }
}

async function checkGoogleEntry(tabId, websites) {
  const currentUrl = new URL((await chrome.tabs.get(tabId)).url);
  console.log("Checking Google entry:", currentUrl);

  if (
    (currentUrl.hostname.includes('google.com') || currentUrl.hostname.includes('google.')) &&
    (currentUrl.pathname.includes('/maps/') || currentUrl.pathname.includes('/search'))
  ) {
    chrome.scripting.executeScript({
      target: { tabId },
      function: function (websites) {
        function removeWwwPrefix(hostname) {
          return hostname.replace(/^www\./, '');
        }

        const websiteButton = document.querySelector('.QqG1Sd .ab_button[href], .kno-rdesc .fl a[href]');
        if (!websiteButton) return;
        const websiteUrl = new URL(websiteButton.href);
        const websiteHostname = removeWwwPrefix(websiteUrl.hostname);

        if (websites.some((site) => removeWwwPrefix(site) === websiteHostname)) {

          // Identifier for the alert
          const alertId = 'fee-alert-message';

          // Check if the alert is already present
          if (!document.getElementById(alertId)) {

            // Create and insert an alert message
            const alertText = document.createElement('div');
            alertText.id = alertId;
            alertText.innerHTML = 'Heads up! People have reported this establishment has a surcharge.';
            alertText.style.marginTop = '4px';
            alertText.style.fontWeight = 'bold';

            websiteButton.closest('.QqG1Sd').parentElement.insertAdjacentElement('beforeend', alertText);
          }
        }
      },
      args: [Object.keys(websites)],
    });
  }
}


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const websites = await fetchRestaurantInformation();
    checkRestaurantWebsite(tabId, websites);
    checkGoogleEntry(tabId, websites);
  }

  if (changeInfo.url) {
    tabUrls[tabId] = changeInfo.url;
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabUrls[tabId]) {
    delete tabUrls[tabId];
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkCurrentTab') {
    checkCurrentTab(request.tabId, sendResponse);
    return true;
  }
});

async function checkCurrentTab(tabId, sendResponse) {
  const websites = await fetchRestaurantInformation();
  const currentUrl = new URL((await chrome.tabs.get(tabId)).url);
  const currentHostname = removeWwwPrefix(currentUrl.hostname);

  const websiteData = websites[currentHostname];

  if (websiteData) {
    sendResponse({
      hasData: true,
      surchargeAmount: websiteData.surchargeAmount,
      feeLanguage: websiteData.feeLanguage,
    });
  } else {
    sendResponse({ hasData: false });
  }
}
chrome.runtime.onInstalled.addListener(async () => {
  await fetchRestaurantInformation();
});
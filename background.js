// Import Papaparse library for CSV parsing
importScripts('papaparse.min.js');

// Cache expiry duration: 12 hours in milliseconds
const CACHE_EXPIRY = 12 * 60 * 60 * 1000;

// Initialize global variables
let websitesCache = null;
let lastFetched = null;
let closedTabs = new Set();
let tabUrls = {};

// Function to parse CSV text
function parseCSV(csvText) {
  const parseResult = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  return parseResult.data;
}

// Function to fetch restaurant information from the CSV file
async function fetchRestaurantInformation() {
  // Check if the cache is still valid
  if (websitesCache && lastFetched && Date.now() - lastFetched < CACHE_EXPIRY) {
    return websitesCache;
  }

  // Fetch the CSV file
  const csvUrl = 'https://www.dropbox.com/s/0gt4i4g5hzzw2ia/database.csv?dl=1';
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  // Parse the CSV and construct the websites data object
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

  // Update the global cache variables
  websitesCache = fetchedWebsites;
  lastFetched = Date.now();

  console.log("Fetched websites:", fetchedWebsites);

  return fetchedWebsites;
}

// Function to get data from the Chrome storage
async function getFromCache(...keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
}

// Function to save data to Chrome storage
async function saveToCache(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

// Function to remove 'www.' prefix from a hostname
function removeWwwPrefix(hostname) {
  return hostname.replace(/^www\./, '');
}

// Function to execute script on a specific tab
async function executeScript(tabId, code) {
  return chrome.scripting.executeScript({
    target: { tabId },
    function: new Function(code),
  });
}

// Function to check if the website is in the list of restaurants with surcharges
async function checkRestaurantWebsite(tabId, websites) {
  const currentUrl = new URL((await chrome.tabs.get(tabId)).url);
  const currentHostname = removeWwwPrefix(currentUrl.hostname);
  const websiteData = websites[currentHostname];

  console.log("Checking restaurant website:", currentUrl, currentHostname, websiteData);

  // If the website has data, display a badge and inject an iframe with a message
  if (websiteData) {
    // Set badge background color and text
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#FF6B6B' });
    chrome.action.setBadgeText({ tabId, text: '!' });

    // Inject the iframe with the message
    chrome.scripting.executeScript({
      target: { tabId },
      function: function() {
        const isMessageClosed = sessionStorage.getItem('messageClosed');
        if (isMessageClosed) {
          return;
        }
        // Create and style the iframe
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

        // Create and style the message div
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

        // Add click event listener to close the message and remove the iframe
        message.querySelector('span').onclick = () => {
          iframe.remove();
          sessionStorage.setItem('messageClosed', 'true');
        };
      },
    });
  } else {
    // Remove the badge text if the website is not in the list
    chrome.action.setBadgeText({ tabId, text: '' });
  }
}

// Function to check if a Google Maps or Google Search result page contains a restaurant with surcharges
async function checkGoogleEntry(tabId, websites) {
  const currentUrl = new URL((await chrome.tabs.get(tabId)).url);
  console.log("Checking Google entry:", currentUrl);

  // Check if the URL is a Google Maps or Google Search result page
  if (
    (currentUrl.hostname.includes('google.com') || currentUrl.hostname.includes('google.')) &&
    (currentUrl.pathname.includes('/maps/') || currentUrl.pathname.includes('/search'))
  ) {
    // Inject script to display an alert if the website is in the list of restaurants with surcharges
    chrome.scripting.executeScript({
      target: { tabId },
      function: function(websites) {
        function removeWwwPrefix(hostname) {
          return hostname.replace(/^www\./, '');
        }

        // Find the website button element
        const websiteButton = document.querySelector('.QqG1Sd .ab_button[href], .kno-rdesc .fl a[href]');
        if (!websiteButton) return;
        const websiteUrl = new URL(websiteButton.href);
        const websiteHostname = removeWwwPrefix(websiteUrl.hostname);

        // Check if the website is in the list of restaurants with surcharges
        if (websites.some((site) => removeWwwPrefix(site) === websiteHostname)) {
          // Create and insert an alert message
          const alertText = document.createElement('div');
          alertText.innerHTML = 'Heads up! People have reported this establishment has a surcharge.</a>';
          alertText.style.marginTop = '4px';
          alertText.style.fontWeight = 'bold';

          websiteButton.closest('.QqG1Sd').parentElement.insertAdjacentElement('beforeend', alertText);
        }
      },
      args: [Object.keys(websites)],
    });
  }
}

// Event listener for when a tab is updated
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

// Event listener for when a tab is removed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabUrls[tabId]) {
    delete tabUrls[tabId];
  }
});

// Event listener for runtime messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkCurrentTab') {
    checkCurrentTab(request.tabId, sendResponse);
    return true;
  }
});

// Function to check the current tab for a restaurant with surcharges and send a response with the data
async function checkCurrentTab(tabId, sendResponse) {
  const websites = await fetchRestaurantInformation();
  const currentUrl = new URL((await chrome.tabs.get(tabId)).url);
  const currentHostname = removeWwwPrefix(currentUrl.hostname);

  const websiteData = websites[currentHostname];

  // If the website has data, send the data in the response
  if (websiteData) {
    sendResponse({
      hasData: true,
      surchargeAmount: websiteData.surchargeAmount,
      feeLanguage: websiteData.feeLanguage,
    });
  } else {
    // If the website doesn't have data, send a response with hasData set to false
    sendResponse({ hasData: false });
  }
}

// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  await fetchRestaurantInformation();
});

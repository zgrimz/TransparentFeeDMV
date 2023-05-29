import Papa from 'papaparse';

/**
 * Parses a CSV string and returns an array of arrays representing the CSV data.
 * @param {string} csvText - The CSV string to parse.
 * @returns {Array<Array<string>>} - An array of arrays representing the CSV data.
 */
function parseCSV(csvText) {
  const parseResult = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });
  
  return parseResult.data;
}

/**
 * Removes the "www." prefix from a hostname string.
 * @param {string} hostname - The hostname string to remove the "www." prefix from.
 * @returns {string} - The hostname string without the "www." prefix.
 */
function removeWwwPrefix(hostname) {
  return hostname.replace(/^www\./, '');
}

/**
 * Fetches restaurant information from a CSV file located at the URL specified in the environment variable CSV_URL.
 * @returns {Promise<Object>} - A promise that resolves to an object containing restaurant information.
 */
async function getRestarauntInfoFromCsv() {
  const csvUrl = process.env.CSV_URL;
  console.log('Fetching CSV from:', csvUrl);
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

  return fetchedWebsites;
}

export {
  getRestarauntInfoFromCsv,
  removeWwwPrefix,
  parseCSV,
};
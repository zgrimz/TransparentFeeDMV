import { parseCSV, removeWwwPrefix, getRestarauntInfoFromCsv } from '../../src/background/utils';
const fetch = require('node-fetch');
require('dotenv').config({ path: './src/.env' });

global.fetch = fetch;

describe('getRestarauntInfoFromCsv', () => {
  test('validate that we can fetch the csv and that the data is as we expect', async () => {

    const result = await getRestarauntInfoFromCsv();
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    for (const [key, value] of Object.entries(result)) {
      try{
        // These last two checks should be removed once we get the CSV properly formatted
        // without the 0,1,2 line and with proper header parsing
        if (key === undefined || key == 0 || key == 'Restaurant Website Domain') {
          continue;
        }
        new URL(`https://${key}`);
      } catch (e) {
        console.log(`Error validating URL for entry: ${key}`);
        console.log(value);
        throw e;
      }
    }
  });
});

describe('parseCSV', () => {
  test('should parse CSV text into an array of arrays', () => {
    const csvText = 'John,Doe\nJane,Smith';
    const expected = [
      ['John', 'Doe'],
      ['Jane', 'Smith'],
    ];
    expect(parseCSV(csvText)).toEqual(expected);
  });

  test('should skip empty lines', () => {
    const csvText = 'John,Doe\n\nJane,Smith\n';
    const expected = [
      ['John', 'Doe'],
      ['Jane', 'Smith'],
    ];
    expect(parseCSV(csvText)).toEqual(expected);
  });
});

describe('removeWwwPrefix', () => {
  test('should remove "www." prefix from hostname', () => {
    const hostname = 'www.example.com';
    const expected = 'example.com';
    expect(removeWwwPrefix(hostname)).toEqual(expected);
  });

  test('should not remove "www." if it is not at the beginning', () => {
    const hostname = 'test.www.example.com';
    const expected = 'test.www.example.com';
    expect(removeWwwPrefix(hostname)).toEqual(expected);
  });

  test('should not remove anything if there is no "www."', () => {
    const hostname = 'example.com';
    const expected = 'example.com';
    expect(removeWwwPrefix(hostname)).toEqual(expected);
  });
});
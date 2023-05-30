# TransparentFeeDMV
TransparentFee DMV is a Chrome Extension designed to help consumers stay informed about service fees and surcharges at restaurants and bars in the DC, Maryland, and Virginia (DMV) area. With the rising popularity of service fees and surcharges, it's more important than ever to know what you're paying for.

This extension aims to promote transparency, trust, and a more positive dining environment by providing users with clear and easily accessible information about service charges when browsing a restaurant's website or Google Search results.

## Features
* Fetches and stores information about service fees and surcharges for various establishments in the DMV area.
* Displays a badge on the browser toolbar when browsing a website that is known to have a surcharge.
* Injects a message on the webpage informing users about the surcharge.
* Provides fee information in Google Search results for establishments known to have a surcharge.
* Caches fetched data for 12 hours to minimize the need for repeated network requests.

## Installation
TransparentFee DMV is available on the [Chrome Web Store here](https://chrome.google.com/webstore/detail/transparentfee-dmv/dkllokigbmjkjfociilfmhjedekehnod).

Alternativly, you can follow these steps to install it via Chrome dev tools:
* Download the latest ZIP file from this repository's [releases page](https://github.com/zgrimz/TransparentFeeDMV/releases) and extract it to your local machine.
* Open the Chrome browser and navigate to chrome://extensions/.
* Enable Developer mode by clicking the toggle switch located in the top right corner.
* Click Load unpacked and select the extension's directory.
* The extension should now be installed and visible in your extensions list.

## Usage
After installation, the extension will automatically fetch data about establishments known to have a surcharge. When you navigate to a website or Google Search result associated with an establishment known to have a surcharge, the extension will display a badge on the browser toolbar and inject a message on the webpage to inform you about the surcharge.

## Support
If you encounter any issues while using the TransparentFee DMV Chrome Extension, please create an issue on this GitHub repository. We'll do our best to resolve the issue as quickly as possible.

## Contributing
If you'd like to contribute to the TransparentFee DMV Chrome Extension, please fork this repository and submit a pull request with your changes. We'll review your changes and merge them into the main branch if they meet our standards.

### Development
To get started with development, follow these steps:
* Clone this repository to your local machine.
* Install node.js and npm.
* Run `npm install` to install the project's dependencies.
* Run `npm run build:production` to build the project.
* Follow the steps in the Installation section to install the extension in Chrome, selecting the `dist` directory as the extension's directory.
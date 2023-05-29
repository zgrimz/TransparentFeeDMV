const path = require('path');
const { setup: setupDevServer, teardown: teardownDevServer } = require('jest-dev-server');

async function startServers() {
  const testDataPath = path.join(__dirname, './testdata');

  const servers = await setupDevServer([
    {
      command: 'npx http-server -p 8080',
      launchTimeout: 50000,
      protocol: 'http',
      port: 8080
    },
    {
      command: 'npx http-server -p 8000',
      launchTimeout: 50000,
      protocol: 'http',
      port: 8000
    },
    {
      command: 'npx http-server -p 5000 ' + testDataPath,
      protocol: 'http',
      launchTimeout: 50000,
      port: 5000
    },
  ]);

  return servers;
}

async function stopServers(servers) {
  console.log('stopping servers');
  await teardownDevServer(servers);
}

module.exports = { startServers, stopServers };
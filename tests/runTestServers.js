const { startServers, stopServers } = require('./server');

async function start() {
  var servers = await startServers();
  console.log('servers started');
  // wait for user input to stop servers
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  console.log('Press any key to stop servers');
  process.stdin.on('data', function () {
    stop(servers);
  });
}

async function stop(servers) {
  await stopServers(servers);
  process.exit();
}

start();
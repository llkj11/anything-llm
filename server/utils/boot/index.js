const { Telemetry } = require("../../models/telemetry");
const { BackgroundService } = require("../BackgroundWorkers");
const { EncryptionManager } = require("../EncryptionManager");
const { CommunicationKey } = require("../comKey");
const setupTelemetry = require("../telemetry");
const portfinder = require('portfinder');

// Testing SSL? You can make a self signed certificate and point the ENVs to that location
// make a directory in server called 'sslcert' - cd into it
// - openssl genrsa -aes256 -passout pass:gsahdg -out server.pass.key 4096
// - openssl rsa -passin pass:gsahdg -in server.pass.key -out server.key
// - rm server.pass.key
// - openssl req -new -key server.key -out server.csr
// Update .env keys with the correct values and boot. These are temporary and not real SSL certs - only use for local.
// Test with https://localhost:<port>/api/ping
// build and copy frontend to server/public with correct API_BASE and start server in prod model and all should be ok
async function bootSSL(app, preferredPort = 3001) {
  try {
    const actualPort = await portfinder.getPortPromise({ port: preferredPort, stopPort: preferredPort + 100 });
    if (actualPort !== preferredPort) {
      console.log(`\x1b[33m[Warning]\x1b[0m Port ${preferredPort} was busy, using ${actualPort} instead.`);
    }

    console.log(
      `\x1b[33m[SSL BOOT ENABLED]\x1b[0m Loading the certificate and key for HTTPS mode on port ${actualPort}...`
    );
    const fs = require("fs");
    const https = require("https");
    const privateKey = fs.readFileSync(process.env.HTTPS_KEY_PATH);
    const certificate = fs.readFileSync(process.env.HTTPS_CERT_PATH);
    const credentials = { key: privateKey, cert: certificate };
    const server = https.createServer(credentials, app);

    server
      .listen(actualPort, async () => {
        await setupTelemetry();
        new CommunicationKey(true);
        new EncryptionManager();
        new BackgroundService().boot();
        console.log(`Primary server in HTTPS mode listening on port ${actualPort}`);
      })
      .on("error", (err) => {
        // If listen fails (e.g., EADDRINUSE), portfinder should have prevented it,
        // but handle other potential errors.
        console.error(`\x1b[31m[SSL Boot Error]\x1b[0m Failed to listen on port ${actualPort}: ${err.message}`);
        catchSigTerms(err); // Pass error to handler if needed
        process.exit(1); // Exit if server can't start
      });

    require("@mintplex-labs/express-ws").default(app, server);
    return { app, server };
  } catch (e) {
    console.error(
      `\x1b[31m[SSL BOOT FAILED]\x1b[0m ${e.message} - falling back to HTTP boot.`,
      {
        ENABLE_HTTPS: process.env.ENABLE_HTTPS,
        HTTPS_KEY_PATH: process.env.HTTPS_KEY_PATH,
        HTTPS_CERT_PATH: process.env.HTTPS_CERT_PATH,
        stacktrace: e.stack,
      }
    );
    // Fallback to HTTP using the original preferred port for searching
    return await bootHTTP(app, preferredPort);
  }
}

async function bootHTTP(app, preferredPort = 3001) {
  if (!app) throw new Error('No "app" defined - crashing!');
  const actualPort = await portfinder.getPortPromise({ port: preferredPort, stopPort: preferredPort + 100 });
  if (actualPort !== preferredPort) {
    console.log(`\x1b[33m[Warning]\x1b[0m Port ${preferredPort} was busy, using ${actualPort} instead.`);
  }

  const server = app
    .listen(actualPort, async () => {
      await setupTelemetry();
      new CommunicationKey(true);
      new EncryptionManager();
      new BackgroundService().boot();
      console.log(`Primary server in HTTP mode listening on port ${actualPort}`);
    })
    .on("error", (err) => {
      // If listen fails (e.g., EADDRINUSE), portfinder should have prevented it,
      // but handle other potential errors.
      console.error(`\x1b[31m[HTTP Boot Error]\x1b[0m Failed to listen on port ${actualPort}: ${err.message}`);
      catchSigTerms(err); // Pass error to handler if needed
      process.exit(1); // Exit if server can't start
    });

  return { app, server }; // Return both app and server
}

// Handle termination signals
function catchSigTerms(err) {
  console.error(err);
  process.exit(1);
}

module.exports = {
  bootHTTP,
  bootSSL,
};

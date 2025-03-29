process.env.NODE_ENV === "development"
  ? require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
  : require("dotenv").config();

require("./utils/logger")();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { reqBody } = require("./utils/http");
const { systemEndpoints } = require("./endpoints/system");
const { workspaceEndpoints } = require("./endpoints/workspaces");
const { chatEndpoints } = require("./endpoints/chat");
const { embeddedEndpoints } = require("./endpoints/embed");
const { embedManagementEndpoints } = require("./endpoints/embedManagement");
const { getVectorDbClass } = require("./utils/helpers");
const { adminEndpoints } = require("./endpoints/admin");
const { inviteEndpoints } = require("./endpoints/invite");
const { utilEndpoints } = require("./endpoints/utils");
const { developerEndpoints } = require("./endpoints/api");
const { extensionEndpoints } = require("./endpoints/extensions");
const { bootHTTP, bootSSL } = require("./utils/boot");
const { workspaceThreadEndpoints } = require("./endpoints/workspaceThreads");
const { documentEndpoints } = require("./endpoints/document");
const { agentWebsocket } = require("./endpoints/agentWebsocket");
const { experimentalEndpoints } = require("./endpoints/experimental");
const { browserExtensionEndpoints } = require("./endpoints/browserExtension");
const { communityHubEndpoints } = require("./endpoints/communityHub");
const { agentFlowEndpoints } = require("./endpoints/agentFlows");
const { autoMigrateDatabaseIfNeeded } = require("./utils/autoDatabaseMigrate");

(async () => { // Start Async IIFE
// Auto-migrate database if needed before starting the server
try {
  await autoMigrateDatabaseIfNeeded();
} catch (error) {
  console.error('Database auto-migration failed:', error);
  // Continue server startup even if migration fails
}

const app = express();
const apiRouter = express.Router();
const FILE_LIMIT = "3GB";

app.use(cors({ origin: true }));
app.use(bodyParser.text({ limit: FILE_LIMIT }));
app.use(bodyParser.json({ limit: FILE_LIMIT }));
app.use(
  bodyParser.urlencoded({
    limit: FILE_LIMIT,
    extended: true,
  })
);

const preferredPort = Number(process.env.SERVER_PORT) || 3001;

if (!!process.env.ENABLE_HTTPS) {
  await bootSSL(app, preferredPort);
} else {
  require("@mintplex-labs/express-ws").default(app); // load WebSockets in non-SSL mode.
  await bootHTTP(app, preferredPort);
}

app.use("/api", apiRouter);
systemEndpoints(apiRouter);
extensionEndpoints(apiRouter);
workspaceEndpoints(apiRouter);
workspaceThreadEndpoints(apiRouter);
chatEndpoints(apiRouter);
adminEndpoints(apiRouter);
inviteEndpoints(apiRouter);
embedManagementEndpoints(apiRouter);
utilEndpoints(apiRouter);
documentEndpoints(apiRouter);
agentWebsocket(apiRouter);
experimentalEndpoints(apiRouter);
developerEndpoints(app, apiRouter);
communityHubEndpoints(apiRouter);
agentFlowEndpoints(apiRouter);

// Externally facing embedder endpoints
embeddedEndpoints(apiRouter);

// Externally facing browser extension endpoints
browserExtensionEndpoints(apiRouter);

// Handle React routing, return all requests to React app if not API request
app.use(express.static(path.join(__dirname, "public")));
app.get("*", function (_, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

})(); // End Async IIFE

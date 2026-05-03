function writeErr(...parts) {
  process.stderr.write(parts.join(" ") + "\n");
}

process.on("unhandledRejection", (reason) => {
  writeErr("[fatal] unhandledRejection:", String(reason));
  if (reason && reason.stack) writeErr(reason.stack);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  writeErr("[fatal] uncaughtException:", err.message);
  writeErr(err.stack || "");
  process.exit(1);
});

function fatal(err, label) {
  writeErr(`[fatal] ${label}`);
  if (err && err.message) writeErr(err.message);
  else writeErr(String(err));
  if (err && err.stack) writeErr(err.stack);
  process.exit(1);
}

(async function main() {
  writeErr("[pg-backend] starting...");

  try {
    require("./config/env");
  } catch (err) {
    fatal(err, "Environment validation failed");
  }

  const http = require("http");
  const { Server } = require("socket.io");

  let app;
  try {
    app = require("./app");
  } catch (err) {
    fatal(err, "Failed to load Express app (check dependencies and routes)");
  }

  const connectDB = require("./db");
  const { MONGODB_URI, PORT } = require("./config/env");

  let registerSocket;
  let socketCorsConfig;
  try {
    ({ registerSocket, socketCorsConfig } = require("./socket"));
  } catch (err) {
    fatal(err, "Failed to load Socket.IO layer");
  }

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: socketCorsConfig(),
  });
  registerSocket(io);

  try {
    await connectDB(MONGODB_URI);
  } catch (err) {
    fatal(
      err,
      "MongoDB connection failed — use Atlas (not localhost), whitelist 0.0.0.0/0 in Atlas Network Access, verify MONGODB_URI user/password"
    );
  }

  const BASE_PORT = PORT;

  const startServer = (port) => {
    server
      .listen(port, "0.0.0.0", () => {
        process.stdout.write(`Server running on port ${port}\n`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          writeErr(`Port ${port} busy, trying ${port + 1}...`);
          startServer(port + 1);
          return;
        }
        fatal(err, "HTTP server listen error");
      });
  };

  startServer(BASE_PORT);
})();

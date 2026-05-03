try {
  require("./config/env");
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./db");
const { MONGODB_URI, PORT } = require("./config/env");
const { registerSocket, socketCorsConfig } = require("./socket");

const server = http.createServer(app);

const io = new Server(server, {
  cors: socketCorsConfig(),
});

registerSocket(io);

const BASE_PORT = PORT;

const startServer = (port) => {
  server
    .listen(port, () => {
      console.log(`Server running on port ${port}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} busy, trying ${port + 1}...`);
        startServer(port + 1);
        return;
      }

      throw err;
    });
};

(async () => {
  try {
    await connectDB(MONGODB_URI);
    startServer(BASE_PORT);
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
})();

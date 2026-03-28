/**
 * TCP forwarder — routes ALL traffic from PORT (18115) to the Express API server on port 8080.
 * Express handles everything: API routes, OAuth callbacks, landing page, and static files.
 * No HTTP parsing, no path matching, no proxy complexity — just raw socket forwarding.
 */

const net = require("net");

const API_PORT = 8080;
const port = parseInt(process.env.PORT || "18115", 10);

const server = net.createServer((client) => {
  const api = net.connect(API_PORT, "127.0.0.1");

  client.pipe(api);
  api.pipe(client);

  api.on("error", () => {
    client.destroy();
  });
  client.on("error", () => {
    api.destroy();
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`TCP forwarding port ${port} → localhost:${API_PORT}`);
});

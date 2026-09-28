import net from "node:net";
import fs from "node:fs";

const configPath = process.env.CENTRALDARK_TS_PORTS_CONFIG || "/root/CentralDark/data/runtime/tailscale-local-ports.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const servers = [];

function log(event, data = {}) {
  const clean = { event, ts: new Date().toISOString(), ...data };
  console.log(JSON.stringify(clean));
}

for (const route of config.routes || []) {
  const server = net.createServer((client) => {
    const upstream = net.connect({ host: route.target_host, port: route.target_port });
    client.on("error", () => upstream.destroy());
    upstream.on("error", () => client.destroy());
    client.pipe(upstream);
    upstream.pipe(client);
  });
  server.on("error", (err) => {
    log("route_error", { id: route.id, message: err.message });
  });
  server.listen(route.listen_port, route.listen_host, () => {
    log("route_listening", {
      id: route.id,
      listen: `${route.listen_host}:${route.listen_port}`,
      target: `${route.target_host}:${route.target_port}`,
      owner: route.owner,
    });
  });
  servers.push(server);
}

process.on("SIGTERM", () => {
  log("shutdown", { routes: servers.length });
  for (const server of servers) server.close();
  setTimeout(() => process.exit(0), 250).unref();
});

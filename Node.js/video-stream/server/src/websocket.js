// Add this to your server (separate from Fastify HTTP server)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });
const wsClients = new Set();

wss.on('connection', (ws, req) => {
  wsClients.add(ws);

  // Optionally, parse session from query string
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('session');
  ws.sessionId = sessionId;

  ws.on('close', () => wsClients.delete(ws));
  console.log(`Active WebSocket clients: ${wsClients.size}`);
});
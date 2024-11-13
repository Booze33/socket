import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';

const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  const clientId = Date.now();
  clients.set(clientId, ws);

  ws.on('message', (rawMessage) => {
    try {
      const messageData = JSON.parse(rawMessage.toString());
      console.log('Received message:', messageData);

      clients.forEach((client, id) => {
        if (id !== clientId && client.readyState === ws.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            data: messageData
          }));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(clientId);
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

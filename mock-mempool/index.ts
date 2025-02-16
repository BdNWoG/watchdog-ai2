/* mock-mempool/index.ts */
import WebSocket from "ws";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const wss = new WebSocket.Server({ port: 4000 });
console.log("Mock mempool WebSocket running on ws://localhost:4000");

wss.on("connection", (socket) => {
  console.log("Client connected to mock mempool watcher");
  // We don't do anything special until we get a request from the user
});

// For demonstration, we add a POST endpoint so the frontend can "trigger" a rug action
app.post("/rug", (req, res) => {
  const { token } = req.body;

  // Broadcast to all connected WS clients that a rug is attempted
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const data = {
        event: "RugAttempt",
        txHash: "0xFakeHash123",
        txFrom: "0xAttacker",
        token,
      };
      client.send(JSON.stringify(data));
    }
  });

  // Pretend we front-run
  // We can send another event for "FrontRun success"
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const data = {
        event: "FrontRunSuccess",
        msg: `We front-ran liquidity removal for token ${token}`,
      };
      client.send(JSON.stringify(data));
    }
  });

  return res.json({ status: "Rug attempt broadcasted, front-run triggered" });
});

app.listen(4001, () => {
  console.log("Mock mempool REST server on http://localhost:4001");
});

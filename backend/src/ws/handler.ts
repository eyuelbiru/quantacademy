import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { SimulationManager } from '../sessions.js';
import { Simulation } from '../core/simulation.js';
import { createOrder } from '../core/matching_engine.js';
import { Side, OrderType, OrderStatus } from '../core/types.js';

interface WsClient {
  ws: WebSocket;
  sessionId: string | null;
  interval: ReturnType<typeof setInterval> | null;
}

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const sessions = SimulationManager.getInstance();
  const clients = new Map<WebSocket, WsClient>();

  wss.on('connection', (ws) => {
    const client: WsClient = { ws, sessionId: null, interval: null };
    clients.set(ws, client);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleClientMessage(ws, msg, client, sessions);
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    ws.on('close', () => {
      if (client.interval) clearInterval(client.interval);
      clients.delete(ws);
    });

    // Welcome message
    ws.send(JSON.stringify({ type: 'welcome', message: 'QuantAcademy WebSocket connected' }));
  });

  return wss;
}

function handleClientMessage(
  ws: WebSocket,
  msg: any,
  client: WsClient,
  sessions: SimulationManager
): void {
  switch (msg.type) {
    case 'subscribe': {
      if (!msg.sessionId) {
        ws.send(JSON.stringify({ type: 'error', message: 'sessionId required' }));
        return;
      }
      try {
        const sim = sessions.getSession(msg.sessionId);
        client.sessionId = msg.sessionId;
        if (client.interval) clearInterval(client.interval);
        client.interval = setInterval(() => streamData(ws, sim, msg.sessionId!), msg.intervalMs || 500);
        ws.send(JSON.stringify({ type: 'subscribed', sessionId: msg.sessionId }));
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
      }
      break;
    }

    case 'unsubscribe': {
      if (client.interval) clearInterval(client.interval);
      client.interval = null;
      ws.send(JSON.stringify({ type: 'unsubscribed' }));
      break;
    }

    case 'order': {
      if (!client.sessionId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Subscribe to a session first' }));
        return;
      }
      try {
        const sim = sessions.getSession(client.sessionId);
        const side = msg.side === 'buy' ? Side.Buy : Side.Sell;
        const orderType = msg.orderType === 'limit' ? OrderType.Limit : OrderType.Market;
        const order = createOrder(msg.symbol, side, msg.quantity, orderType, 0n, msg.price);
        const fills = sim.submitOrder(order);
        ws.send(JSON.stringify({ type: 'order_result', fills }));
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
      break;
    }

    case 'step': {
      if (!client.sessionId) return;
      try {
        const sim = sessions.getSession(client.sessionId);
        if (msg.mode === 'bar') sim.stepBar();
        else sim.stepTick();
        broadcastState(ws, sim, client.sessionId);
      } catch {
        // noop
      }
      break;
    }
  }
}

function streamData(ws: WebSocket, sim: Simulation, sessionId: string): void {
  if (ws.readyState !== WebSocket.OPEN || !sim.isRunning) return;
  const [tick, bars] = sim.stepTick();
  const state = sim.stats();
  const positions = Array.from(sim.positions.values()).map((ps) => ps.position);
  const payload = {
    type: 'update',
    sessionId,
    tick: tick
      ? { symbol: tick.symbol, price: tick.price, volume: tick.volume }
      : null,
    bars: bars.map((b) => ({
      symbol: b.symbol,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    })),
    state,
    positions,
  };
  ws.send(JSON.stringify(payload));
}

function broadcastState(ws: WebSocket, sim: Simulation, sessionId: string): void {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(
    JSON.stringify({
      type: 'state',
      sessionId,
      stats: sim.stats(),
      capital: sim.getCapital(),
    })
  );
}

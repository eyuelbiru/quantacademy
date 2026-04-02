import { Router } from 'express';
import { SimulationManager } from '../sessions.js';
import { createOrder } from '../core/matching_engine.js';
import { Side, OrderType, OrderStatus } from '../core/types.js';

const router = Router();
const sessions = SimulationManager.getInstance();

// -- Symbols --
router.get('/symbols', (_req, res) => {
  const result: Record<string, Record<string, number>> = {};
  let i = 0;
  for (const [id, sim] of sessions.activeSessions()) {
    const syms = sim.getMarketData().symbolsList();
    result[id] = {};
    for (const s of syms) {
      const price = sim.getMarketData().currentPrice(s);
      result[id][s] = price ?? 0;
    }
    i++;
  }
  res.json({ symbols: result, count: i });
});

// Create simulation
router.post('/simulations', (req, res) => {
  const { symbol, initialPrice, volatility, initialCapital, seed, symbolType } = req.body;
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });
  const simId = sessions.createSession({
    symbol: symbol || 'BTC/USD',
    initialPrice: initialPrice || 50_000,
    volatility,
    initialCapital,
    seed: seed ?? 42,
    symbolType,
  });
  res.status(201).json({ id: simId, status: 'created' });
});

// Start simulation
router.post('/simulations/:id/start', (req, res) => {
  const { id } = req.params;
  try {
    sessions.startSession(id);
    res.json({ status: 'running' });
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Stop simulation
router.post('/simulations/:id/stop', (req, res) => {
  const { id } = req.params;
  try {
    sessions.stopSession(id);
    res.json({ status: 'stopped' });
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Step simulation
router.post('/simulations/:id/step', (req, res) => {
  const { id } = req.params;
  const { mode, count } = req.body;
  try {
    const sim = sessions.getSession(id);
    if (mode === 'bar') {
      const n = count || 1;
      for (let i = 0; i < n; i++) sim.stepBar();
    } else {
      const n = count || 1;
      for (let i = 0; i < n; i++) sim.stepTick();
    }
    res.json({ status: 'stepped', mode: mode || 'tick', count });
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Run bars/ticks in a single call
router.post('/simulations/:id/run', (req, res) => {
  const { id } = req.params;
  const { mode = 'bars', count = 1 } = req.body;
  try {
    const sim = sessions.getSession(id);
    if (mode === 'bars') sim.runBars(count);
    else sim.runTicks(count);
    res.json({ status: 'run_complete', mode, count });
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Get simulation state
router.get('/simulations/:id/state', (req, res) => {
  const { id } = req.params;
  try {
    const sim = sessions.getSession(id);
    const positions = Array.from(sim.positions.values()).map((ps) => ({
      symbol: ps.position.symbol,
      side: ps.position.side,
      quantity: ps.position.quantity,
      entryPrice: ps.position.entryPrice,
      realizedPnl: ps.position.realizedPnl,
      unrealizedPnl: ps.position.unrealizedPnl,
    }));
    res.json({
      stats: sim.stats(),
      capital: sim.getCapital(),
      positions,
      isRunning: sim.isRunning,
      eventsEmitted: sim.eventLog.length,
      fills: sim.fillLog.map((f) => ({
        orderId: f.orderId,
        symbol: f.symbol,
        side: f.side,
        quantity: f.quantity,
        price: f.price,
        timestampNanos: f.timestampNanos.toString(),
      })),
    });
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Get latest market data
router.get('/market/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  let found: { symbol: string; price: number } | null = null;
  for (const [, sim] of sessions.activeSessions()) {
    const price = sim.getMarketData().currentPrice(symbol);
    if (price !== null) {
      found = { symbol, price };
      break;
    }
  }
  if (!found) return res.status(404).json({ error: 'Symbol not found' });
  res.json(found);
});

// Submit order
router.post('/orders', (req, res) => {
  const { symbol, side, quantity, orderType: reqOrderType, price, sessionId } = req.body;
  if (!symbol || !side || !quantity || !sessionId) {
    return res.status(400).json({ error: 'symbol, side, quantity, sessionId required' });
  }
  try {
    const sim = sessions.getSession(sessionId);
    const orderSide = side === 'buy' ? Side.Buy : Side.Sell;
    const orderTypeVal =
      reqOrderType === 'limit'
        ? OrderType.Limit
        : reqOrderType === 'market'
        ? OrderType.Market
        : OrderType.Market;
    const order = createOrder(symbol, orderSide, quantity, orderTypeVal, 0n, price);
    const fills = sim.submitOrder(order);
    res.status(201).json({
      order: { id: order.id, symbol, side: orderSide, orderType: orderTypeVal, quantity, price },
      fills: fills.map((f) => ({
        orderId: f.orderId,
        symbol: f.symbol,
        side: f.side,
        quantity: f.quantity,
        price: f.price,
      })),
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Cancel order
router.delete('/orders/:orderId', (_req, res) => {
  res.status(501).json({ error: 'Orders are tied to simulation sessions' });
});

export default router;

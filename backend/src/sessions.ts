import { v4 as uuidv4 } from 'uuid';
import { Simulation, SimConfig, defaultSimConfig } from './core/simulation.js';
import {
  SymbolConfig,
  makeSymbolConfig,
  forexConfig,
  equityConfig,
  cryptoConfig,
} from './core/market_data.js';

interface SessionOptions {
  symbol?: string;
  initialPrice?: number;
  volatility?: number;
  initialCapital?: number;
  seed?: number;
  symbolType?: 'forex' | 'equity' | 'crypto';
}

export class SimulationManager {
  private static instance: SimulationManager;
  private sessions = new Map<string, Simulation>();

  static getInstance(): SimulationManager {
    if (!SimulationManager.instance) {
      SimulationManager.instance = new SimulationManager();
    }
    return SimulationManager.instance;
  }

  createSession(opts: SessionOptions = {}): string {
    const id = uuidv4();
    const config: Partial<SimConfig> = {
      initialCapital: opts.initialCapital,
      seed: opts.seed,
    };
    const sim = new Simulation(config);

    // Add symbol
    let symConfig: SymbolConfig;
    const symbol = opts.symbol || 'BTC/USD';
    switch (opts.symbolType ?? 'crypto') {
      case 'forex':
        symConfig = forexConfig(symbol, opts.initialPrice ?? 1.1);
        break;
      case 'equity':
        symConfig = equityConfig(symbol, opts.initialPrice ?? 150);
        break;
      case 'crypto':
        symConfig = cryptoConfig(symbol, opts.initialPrice ?? 50_000);
        break;
    }
    sim.addSymbol(symConfig);

    this.sessions.set(id, sim);
    return id;
  }

  getSession(id: string): Simulation {
    const sim = this.sessions.get(id);
    if (!sim) throw new Error(`Session ${id} not found`);
    return sim;
  }

  startSession(id: string): void {
    this.getSession(id).start();
  }

  stopSession(id: string): void {
    this.getSession(id).stop();
  }

  removeSession(id: string): void {
    this.sessions.delete(id);
  }

  activeSessions(): Map<string, Simulation> {
    return this.sessions;
  }
}

// Ported from quantacademy/core/src/order_book.rs

import { Side } from './types.js';

export interface PriceLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

interface BookOrder {
  id: string;
  price: number;
  quantity: number;
  timestampNanos: bigint;
}

class OrderSide {
  levels: PriceLevel[] = [];

  add(price: number, quantity: number): void {
    const eps = 1e-10;
    const level = this.levels.find((l) => Math.abs(l.price - price) < eps);
    if (level) {
      level.quantity += quantity;
      level.orderCount += 1;
    } else {
      this.levels.push({ price, quantity, orderCount: 1 });
    }
    this.rebuild();
  }

  protected rebuild(): void {}
}

function priceAsc(a: PriceLevel, b: PriceLevel): number {
  return a.price - b.price;
}

function priceDesc(a: PriceLevel, b: PriceLevel): number {
  return b.price - a.price;
}

export class Bids extends OrderSide {
  protected override rebuild(): void {
    this.levels.sort(priceDesc);
  }
}

export class Asks extends OrderSide {
  protected override rebuild(): void {
    this.levels.sort(priceAsc);
  }
}

export class OrderBook {
  symbol: string;
  bids: Bids;
  asks: Asks;
  orders: Map<string, BookOrder>;
  lastTradePrice: number | null = null;
  volume = 0.0;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.bids = new Bids();
    this.asks = new Asks();
    this.orders = new Map();
  }

  bestBid(): number | null {
    return this.bids.levels[0]?.price ?? null;
  }

  bestAsk(): number | null {
    return this.asks.levels[0]?.price ?? null;
  }

  midPrice(): number | null {
    const bid = this.bestBid();
    const ask = this.bestAsk();
    if (bid !== null && ask !== null) return (bid + ask) / 2.0;
    return null;
  }

  spread(): number | null {
    const bid = this.bestBid();
    const ask = this.bestAsk();
    if (bid !== null && ask !== null) return ask - bid;
    return null;
  }

  addOrder(
    orderId: string,
    price: number,
    quantity: number,
    side: Side,
    ts: bigint
  ): void {
    if (quantity <= 0.0 || price <= 0.0) return;
    this.orders.set(orderId, { id: orderId, price, quantity, timestampNanos: ts });
    if (side === Side.Buy) {
      this.bids.add(price, quantity);
    } else {
      this.asks.add(price, quantity);
    }
  }

  removeOrder(orderId: string): void {
    const order = this.orders.get(orderId);
    if (!order) return;
    this.orders.delete(orderId);
    this.removeFromSide(this.bids, order.price, order.quantity);
    this.removeFromSide(this.asks, order.price, order.quantity);
  }

  private removeFromSide(side: OrderSide, price: number, quantity: number): void {
    const eps = 1e-10;
    const idx = side.levels.findIndex((l) => Math.abs(l.price - price) < eps);
    if (idx !== -1) {
      side.levels[idx].quantity -= quantity;
      side.levels[idx].orderCount -= 1;
      if (side.levels[idx].quantity <= 0.0) {
        side.levels.splice(idx, 1);
      }
    }
  }

  matchQuantity(side: Side, quantity: number): { price: number; fillQty: number } | null {
    if (side === Side.Buy) {
      const ask = this.asks.levels[0];
      if (!ask) return null;
      const fillQty = Math.min(quantity, ask.quantity);
      ask.quantity -= fillQty;
      ask.orderCount -= 1;
      if (ask.quantity <= 0) this.asks.levels.shift();
      return { price: ask.price, fillQty };
    } else {
      const bid = this.bids.levels[0];
      if (!bid) return null;
      const fillQty = Math.min(quantity, bid.quantity);
      bid.quantity -= fillQty;
      bid.orderCount -= 1;
      if (bid.quantity <= 0) this.bids.levels.shift();
      return { price: bid.price, fillQty };
    }
  }

  depthAt(side: Side, levels: number): number {
    const ref = side === Side.Buy ? this.bids.levels : this.asks.levels;
    return ref.slice(0, levels).reduce((sum, l) => sum + l.quantity, 0);
  }
}

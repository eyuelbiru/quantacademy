// Ported from quantacademy/core/src/matching_engine.rs

import { v4 as uuidv4 } from 'uuid';
import { OrderBook } from './order_book.js';
import { Order, Fill, Side, OrderType, OrderStatus, Liquidity } from './types.js';

export interface MatchResult {
  fills: Fill[];
  updatedOrder: Order;
  rejected: boolean;
  rejectionReason?: string;
}

export class MatchingEngine {
  books: Map<string, OrderBook>;
  commissionRate: number;

  constructor(commissionRate: number) {
    this.books = new Map();
    this.commissionRate = commissionRate;
  }

  getBook(symbol: string): OrderBook {
    let book = this.books.get(symbol);
    if (!book) {
      book = new OrderBook(symbol);
      this.books.set(symbol, book);
    }
    return book;
  }

  addLiquidity(
    symbol: string,
    price: number,
    quantity: number,
    side: Side,
    ts: bigint,
    id: string
  ): void {
    this.getBook(symbol).addOrder(id, price, quantity, side, ts);
  }

  cancelOrder(orderId: string): void {
    for (const book of this.books.values()) {
      book.removeOrder(orderId);
    }
  }

  matchMarketOrder(order: Order, timestampNanos: bigint): MatchResult {
    const fills: Fill[] = [];

    const remaining = order.quantity - order.filledQuantity;
    if (remaining <= 0.0) {
      return {
        fills,
        updatedOrder: order,
        rejected: true,
        rejectionReason: 'Order already fully filled',
      };
    }

    const { side, symbol, id } = order;
    let remainingQty = remaining;

    while (true) {
      const book = this.getBook(symbol);
      const matchResult = book.matchQuantity(side, remainingQty);
      if (!matchResult) break;

      const fill: Fill = {
        orderId: id,
        symbol,
        side,
        quantity: matchResult.fillQty,
        price: matchResult.price,
        timestampNanos,
        liquidity: Liquidity.Taker,
      };

      remainingQty -= fill.quantity;
      order.filledQuantity += fill.quantity;
      fills.push(fill);

      if (remainingQty <= 1e-10) break;
    }

    if (order.filledQuantity >= order.quantity - 1e-10) {
      order.status = OrderStatus.Filled;
    } else if (order.filledQuantity > 0.0) {
      order.status = OrderStatus.PartiallyFilled;
    }

    return { fills, updatedOrder: order, rejected: false };
  }
}

export function createOrder(
  symbol: string,
  side: Side,
  quantity: number,
  orderType: OrderType = OrderType.Market,
  timestamp: bigint = 0n,
  price?: number
): Order {
  return {
    id: uuidv4(),
    symbol,
    side,
    orderType,
    quantity,
    filledQuantity: 0.0,
    price: price,
    status: OrderStatus.New,
    timestampNanos: timestamp,
  };
}

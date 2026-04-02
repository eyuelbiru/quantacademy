// Ported from quantacademy/core/src/types.rs

export enum Side {
  Buy = 'buy',
  Sell = 'sell',
}

export enum OrderType {
  Market = 'market',
  Limit = 'limit',
  Stop = 'stop',
  StopLimit = 'stop_limit',
}

export enum OrderStatus {
  New = 'new',
  PartiallyFilled = 'partially_filled',
  Filled = 'filled',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
}

export enum Liquidity {
  Maker = 'maker',
  Taker = 'taker',
}

export interface Order {
  id: string;
  symbol: string;
  side: Side;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  price?: number;
  stopPrice?: number;
  status: OrderStatus;
  timestampNanos: bigint;
}

export interface Fill {
  orderId: string;
  symbol: string;
  side: Side;
  quantity: number;
  price: number;
  timestampNanos: bigint;
  liquidity: Liquidity;
}

export interface Position {
  symbol: string;
  side: Side;
  quantity: number;
  entryPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  openTimestampNanos: bigint;
}

export function createPosition(
  symbol: string,
  side: Side,
  quantity: number,
  entryPrice: number,
  ts: bigint
): Position {
  return {
    symbol,
    side,
    quantity,
    entryPrice,
    realizedPnl: 0.0,
    unrealizedPnl: 0.0,
    openTimestampNanos: ts,
  };
}

export function updateUnrealized(position: Position, currentPrice: number): void {
  position.unrealizedPnl =
    position.side === Side.Buy
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;
}

export type Event =
  | { type: 'order_placed'; order: Order }
  | { type: 'order_filled'; fill: Fill }
  | { type: 'order_cancelled'; orderId: string }
  | { type: 'position_opened'; position: Position }
  | { type: 'position_closed'; symbol: string; pnl: number; timestampNanos: bigint }
  | { type: 'tick'; symbol: string; price: number; timestampNanos: bigint }
  | {
      type: 'bar_closed';
      symbol: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      timestampNanos: bigint;
    };

export interface Tick {
  symbol: string;
  price: number;
  volume: number;
  timestampNanos: bigint;
}

export interface Bar {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestampNanos: bigint;
}

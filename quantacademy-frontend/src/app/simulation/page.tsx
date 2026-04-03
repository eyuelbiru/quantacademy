"use client";

import { useState, useEffect, useCallback } from "react";

// --- Types ---

type Market = "Forex" | "Equities" | "Crypto";
type Side = "BUY" | "SELL";

interface Position {
  id: string;
  market: Market;
  symbol: string;
  side: Side;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  closed: boolean;
  createdAt: number;
}

interface Transaction {
  id: string;
  market: Market;
  symbol: string;
  side: Side;
  quantity: number;
  price: number;
  pnl?: number;
  type: "OPEN" | "CLOSE";
  timestamp: number;
}

interface AccountState {
  balance: number;
  positions: Position[];
  transactions: Transaction[];
}

const STORAGE_KEY = "quantacademy_paper_trading";
const INITIAL_BALANCE = 100000;

// Simulated price movement (random walk around entry price with slight drift)
function simulateCurrentPrice(entryPrice: number, side: Side): number {
  const drift = (Math.random() - 0.5) * 0.02; // +-1% random drift
  const price = entryPrice * (1 + drift);
  const decimals = entryPrice < 10 ? 5 : entryPrice < 100 ? 4 : 2;
  return Number(price.toFixed(decimals));
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadState(): AccountState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fall through
  }
  return { balance: INITIAL_BALANCE, positions: [], transactions: [] };
}

function saveState(state: AccountState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState(): AccountState {
  const fresh: AccountState = { balance: INITIAL_BALANCE, positions: [], transactions: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

// --- Styles ---

const theme = {
  bg: "#0a0a0a",
  bgCard: "#141414",
  bgInput: "#1a1a1a",
  border: "#2a2a2a",
  borderFocus: "#3b82f6",
  text: "#e5e5e5",
  textMuted: "#737373",
  textDim: "#525252",
  accent: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  redHover: "#dc2626",
  yellow: "#eab308",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.bg,
    color: theme.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "2rem 1.5rem",
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "0.25rem",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: theme.textMuted,
  },
  balanceCard: {
    backgroundColor: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: "1.5rem",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  balanceLabel: {
    fontSize: "0.875rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.textMuted,
    marginBottom: "0.5rem",
  },
  balanceValue: {
    fontSize: "2.5rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  resetBtn: {
    padding: "0.625rem 1.25rem",
    backgroundColor: "transparent",
    border: `1px solid ${theme.red}`,
    color: theme.red,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 600,
    transition: "all 0.15s",
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: "1rem",
  },
  card: {
    backgroundColor: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: "1.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.textMuted,
  },
  input: {
    padding: "0.625rem 0.75rem",
    backgroundColor: theme.bgInput,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    color: theme.text,
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s",
  },
  select: {
    padding: "0.625rem 0.75rem",
    backgroundColor: theme.bgInput,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    color: theme.text,
    fontSize: "0.875rem",
    outline: "none",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "0.75rem 2rem",
    backgroundColor: theme.accent,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.875rem",
  },
  th: {
    textAlign: "left" as const,
    padding: "0.75rem 1rem",
    borderBottom: `1px solid ${theme.border}`,
    color: theme.textMuted,
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: `1px solid ${theme.border}`,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap" as const,
  },
  closeBtn: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "transparent",
    border: `1px solid ${theme.yellow}`,
    color: theme.yellow,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  emptyRow: {
    textAlign: "center" as const,
    color: theme.textDim,
    padding: "2rem 1rem",
    fontSize: "0.875rem",
  },
  badge: {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: 4,
    fontSize: "0.75rem",
    fontWeight: 600,
  },
};

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${sign}$${abs.toFixed(2)}`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// --- Component ---

export default function SimulationPage() {
  const [state, setState] = useState<AccountState>(loadState);
  const [market, setMarket] = useState<Market>("Forex");
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<Side>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  // Persist state on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Simulate price movement periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const computedPositions = state.positions.map((p) => ({
    ...p,
    currentPrice: p.closed ? p.currentPrice : simulateCurrentPrice(p.entryPrice, p.side),
    unrealizedPnL: p.closed
      ? 0
      : p.side === "BUY"
        ? (simulateCurrentPrice(p.entryPrice, p.side) - p.entryPrice) * p.quantity
        : (p.entryPrice - simulateCurrentPrice(p.entryPrice, p.side)) * p.quantity,
  }));

  const totalUnrealizedPnL = computedPositions
    .filter((p) => !p.closed)
    .reduce((sum, p) => sum + p.unrealizedPnL, 0);

  const totalRealizedPnL = state.positions.reduce((sum, p) => sum + (p.realizedPnL || 0), 0);

  const equity = state.balance + totalUnrealizedPnL;

  const handleOrder = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const qty = parseFloat(quantity);
      const prc = parseFloat(price);
      if (!symbol.trim() || isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
        return;
      }
      const cost = qty * prc;
      if (cost > state.balance) {
        alert("Insufficient balance for this order.");
        return;
      }

      const position: Position = {
        id: generateId(),
        market,
        symbol: symbol.trim().toUpperCase(),
        side,
        quantity: qty,
        entryPrice: prc,
        currentPrice: prc,
        unrealizedPnL: 0,
        realizedPnL: 0,
        closed: false,
        createdAt: Date.now(),
      };

      const transaction: Transaction = {
        id: generateId(),
        market,
        symbol: symbol.trim().toUpperCase(),
        side,
        quantity: qty,
        price: prc,
        type: "OPEN",
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        balance: prev.balance - cost,
        positions: [...prev.positions, position],
        transactions: [transaction, ...prev.transactions],
      }));

      setSymbol("");
      setQuantity("");
      setPrice("");
    },
    [market, symbol, side, quantity, price, state.balance]
  );

  const handleClosePosition = useCallback(
    (positionId: string) => {
      setState((prev) => {
        const pos = prev.positions.find((p) => p.id === positionId);
        if (!pos || pos.closed) return prev;

        const closePrice = simulateCurrentPrice(pos.entryPrice, pos.side);
        const pnl =
          pos.side === "BUY"
            ? (closePrice - pos.entryPrice) * pos.quantity
            : (pos.entryPrice - closePrice) * pos.quantity;
        const proceeds = pos.quantity * closePrice;

        const closeTransaction: Transaction = {
          id: generateId(),
          market: pos.market,
          symbol: pos.symbol,
          side: pos.side === "BUY" ? "SELL" : "BUY",
          quantity: pos.quantity,
          price: closePrice,
          pnl,
          type: "CLOSE",
          timestamp: Date.now(),
        };

        const updatedPosition: Position = {
          ...pos,
          currentPrice: closePrice,
          unrealizedPnL: 0,
          realizedPnL: pnl,
          closed: true,
        };

        return {
          ...prev,
          balance: prev.balance + proceeds,
          positions: prev.positions.map((p) => (p.id === positionId ? updatedPosition : p)),
          transactions: [closeTransaction, ...prev.transactions],
        };
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    if (!confirm("Reset all positions, transactions, and balance back to $100,000?")) return;
    setState(resetState());
    setSymbol("");
    setQuantity("");
    setPrice("");
  }, []);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Paper Trading Simulator</div>
        <div style={styles.subtitle}>
          Practice trading risk-free with virtual funds. Prices simulate real-time movement.
        </div>
      </div>

      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <div>
          <div style={styles.balanceLabel}>Available Balance</div>
          <div style={{ ...styles.balanceValue, color: state.balance >= INITIAL_BALANCE ? theme.green : theme.text }}>
            {formatCurrency(state.balance)}
          </div>
        </div>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={styles.balanceLabel}>Unrealized P&L</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: totalUnrealizedPnL >= 0 ? theme.green : theme.red, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totalUnrealizedPnL)}
            </div>
          </div>
          <div>
            <div style={styles.balanceLabel}>Realized P&L</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: totalRealizedPnL >= 0 ? theme.green : theme.red, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totalRealizedPnL)}
            </div>
          </div>
          <div>
            <div style={styles.balanceLabel}>Total Equity</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.accent, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(equity)}
            </div>
          </div>
        </div>
        <button style={styles.resetBtn} onClick={handleReset}>
          Reset Account
        </button>
      </div>

      {/* Order Form */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Place Order</div>
        <div style={styles.card}>
          <form onSubmit={handleOrder}>
            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Market</label>
                <select style={styles.select} value={market} onChange={(e) => setMarket(e.target.value as Market)}>
                  <option value="Forex">Forex</option>
                  <option value="Equities">Equities</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Symbol</label>
                <input
                  style={styles.input}
                  placeholder={market === "Forex" ? "e.g. EUR/USD" : market === "Equities" ? "e.g. AAPL" : "e.g. BTC"}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Side</label>
                <select style={styles.select} value={side} onChange={(e) => setSide(e.target.value as Side)}>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Quantity</label>
                <input
                  style={styles.input}
                  type="number"
                  step="any"
                  placeholder="e.g. 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Price</label>
                <input
                  style={styles.input}
                  type="number"
                  step="any"
                  placeholder="e.g. 1.0850"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            {quantity && price && (
              <div style={{ fontSize: "0.875rem", color: theme.textMuted, marginBottom: "1rem" }}>
                Estimated Cost: <strong style={{ color: theme.text }}>{formatCurrency(parseFloat(quantity) * parseFloat(price))}</strong>
              </div>
            )}
            <button type="submit" style={styles.submitBtn}>
              Submit Order
            </button>
          </form>
        </div>
      </div>

      {/* Open Positions */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Open Positions ({computedPositions.filter((p) => !p.closed).length})
        </div>
        <div style={styles.card}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Market</th>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Side</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Entry</th>
                  <th style={styles.th}>Current</th>
                  <th style={styles.th}>Unrealized P&L</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {computedPositions
                  .filter((p) => !p.closed)
                  .map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.market}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{p.symbol}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: p.side === "BUY" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                            color: p.side === "BUY" ? theme.green : theme.red,
                          }}
                        >
                          {p.side}
                        </span>
                      </td>
                      <td style={styles.td}>{p.quantity}</td>
                      <td style={styles.td}>{p.entryPrice}</td>
                      <td style={styles.td}>{p.currentPrice}</td>
                      <td
                        style={{
                          ...styles.td,
                          color: p.unrealizedPnL >= 0 ? theme.green : theme.red,
                          fontWeight: 600,
                        }}
                      >
                        {p.unrealizedPnL >= 0 ? "+" : ""}
                        {formatCurrency(p.unrealizedPnL)}
                      </td>
                      <td style={styles.td}>
                        <button style={styles.closeBtn} onClick={() => handleClosePosition(p.id)}>
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                {computedPositions.filter((p) => !p.closed).length === 0 && (
                  <tr>
                    <td colSpan={8} style={styles.emptyRow}>
                      No open positions. Place an order above to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Transaction History ({state.transactions.length})
        </div>
        <div style={styles.card}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Market</th>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Side</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {state.transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={styles.td}>{formatTimestamp(t.timestamp)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: t.type === "OPEN" ? "rgba(59,130,246,0.15)" : "rgba(234,179,8,0.15)",
                          color: t.type === "OPEN" ? theme.accent : theme.yellow,
                        }}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td style={styles.td}>{t.market}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{t.symbol}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: t.side === "BUY" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: t.side === "BUY" ? theme.green : theme.red,
                        }}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td style={styles.td}>{t.quantity}</td>
                    <td style={styles.td}>{t.price}</td>
                    <td
                      style={{
                        ...styles.td,
                        color: t.pnl != null ? (t.pnl >= 0 ? theme.green : theme.red) : theme.textDim,
                        fontWeight: t.pnl != null ? 600 : 400,
                      }}
                    >
                      {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}${formatCurrency(t.pnl)}` : "—"}
                    </td>
                  </tr>
                ))}
                {state.transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} style={styles.emptyRow}>
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

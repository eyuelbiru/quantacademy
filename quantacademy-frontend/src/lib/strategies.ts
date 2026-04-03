export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Strategy {
  id: number;
  name: string;
  slug: string;
  market: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  concept: string;
  indicators: string;
  risk_management: string;
  family: string;
  steps: string[];
  quiz_questions: QuizQuestion[];
}

export const STRATEGY_FAMILIES = [
  "Trend/Momentum",
  "Mean Reversion",
  "SMC/ICT",
  "Pattern-Based",
  "Institutional",
  "Volume-Based",
  "Event-Driven",
  "Systematic/Passive",
  "Time-Frame Based",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchStrategies(
  market?: string,
  difficulty?: string
): Promise<Strategy[]> {
  const params = new URLSearchParams();
  if (market) params.set("market", market);
  if (difficulty) params.set("difficulty", difficulty);
  const res = await fetch(
    `${API_BASE}/api/strategies${params.toString() ? "?" + params.toString() : ""}`
  );
  if (!res.ok) return FALLBACK_STRATEGIES;
  return res.json();
}

export async function fetchStrategy(slug: string): Promise<Strategy | null> {
  const res = await fetch(`${API_BASE}/api/strategies/${slug}`);
  if (!res.ok) return FALLBACK_STRATEGIES.find((s) => s.slug === slug) || null;
  return res.json();
}

export async function fetchFamilies(): Promise<
  { name: string; count: number; strategies: { name: string; slug: string; difficulty: string }[] }[]
> {
  const res = await fetch(`${API_BASE}/api/strategies/families`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchQuiz(slug: string): Promise<{
  questions: QuizQuestion[];
}> {
  const res = await fetch(`${API_BASE}/api/quiz/${slug}`);
  if (!res.ok) return { questions: [] };
  return res.json();
}

// Fallback data - first 8 strategies fully populated
const FALLBACK_STRATEGIES: Strategy[] = [
  {
    id: 1, name: "Trend Following", slug: "trend-following",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Trade in the direction of the prevailing market trend. Buy in uptrends (higher highs, higher lows) and sell/short in downtrends.",
    indicators: "ADX, DMI, 20/50/200 MA, trendlines, HH/HL/LH/LL patterns",
    risk_management: "Trail stops below swing lows. Position size 1-2% per trade. ATR-based stops. Scale out at targets.",
    family: "Trend/Momentum",
    steps: ["Identify trend direction using higher timeframe", "Wait for pullback to moving average", "Enter on trend continuation candle", "Trail stop below recent swing structure"],
    quiz_questions: [
      { question: "What defines an uptrend?", options: ["Lower highs and lower lows", "Higher highs and higher lows", "Equal highs and lows", "Random price movement"], correct_index: 1, explanation: "An uptrend is characterized by a series of higher highs and higher lows." },
      { question: "Which indicator measures trend strength?", options: ["RSI", "Stochastic", "ADX", "MACD"], correct_index: 2, explanation: "ADX (Average Directional Index) specifically measures the strength of a trend regardless of direction." },
      { question: "Where do you place a trailing stop for long positions?", options: ["Above entry", "Below recent swing low", "At the high of the day", "At Fibonacci 50%"], correct_index: 1, explanation: "Trailing stops for longs are placed below recent swing lows to protect profits while allowing the trend to continue." },
    ],
  },
  {
    id: 2, name: "Mean Reversion", slug: "mean-reversion",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Prices tend to revert to their historical average. Trade overextended moves expecting reversion toward center.",
    indicators: "RSI, Bollinger Bands (2+ sigma), Z-Score, Hurst Exponent, VWAP distance",
    risk_management: "Tight stops beyond extremes. Wait for reversal confirmation. Avoid catching falling knives. Use time stops.",
    family: "Mean Reversion",
    steps: ["Identify overextended price using RSI/Bollinger", "Wait for reversal candle", "Enter against the extreme", "Target the mean/average"],
    quiz_questions: [
      { question: "RSI above 70 indicates?", options: ["Oversold", "Overbought", "Neutral", "Bullish divergence"], correct_index: 1, explanation: "RSI above 70 is considered overbought, suggesting a potential reversal downward." },
      { question: "Price at 2+ sigma Bollinger Band suggests?", options: ["Continuation", "Potential reversal zone", "Trend strengthening", "No signal"], correct_index: 1, explanation: "Price at or beyond 2 standard deviations from the mean suggests an overextended move likely to revert." },
      { question: "Main risk with mean reversion?", options: ["Missing the trend", "Catching a falling knife", "High fees", "Slippage"], correct_index: 1, explanation: "The biggest risk is entering too early against a strong trend, as prices can continue far beyond expectations." },
    ],
  },
  {
    id: 3, name: "Breakout", slug: "breakout",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Enter when price breaks through significant support/resistance with conviction, expecting continuation.",
    indicators: "Consolidation patterns, volume, Donchian channels, ATR expansion, opening range",
    risk_management: "Stop just inside broken level. Expect 60%+ false breakouts. Position size reduced for low-volume breakouts.",
    family: "Trend/Momentum",
    steps: ["Identify consolidation pattern", "Wait for decisive break with volume", "Enter on breakout", "Stop just inside pattern"],
    quiz_questions: [
      { question: "What confirms a valid breakout?", options: ["Price movement alone", "Volume expansion", "RSI divergence", "Moving average crossover"], correct_index: 1, explanation: "Volume expansion confirms genuine buying/selling pressure behind the breakout rather than a false move." },
      { question: "Where to place stop on breakout?", options: ["At entry", "Below support", "Just inside broken level", "At ATR distance"], correct_index: 2, explanation: "Stops placed just inside the broken level protect against false breakouts." },
      { question: "What is a false breakout?", options: ["A gap up", "Price breaks then returns to range", "Volume spike", "Trend continuation"], correct_index: 1, explanation: "A false breakout (bull/bear trap) occurs when price briefly breaks a level then returns to the range." },
    ],
  },
  {
    id: 4, name: "Range Trading", slug: "range-trading",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Trade within sideways markets by buying support and selling resistance as price oscillates.",
    indicators: "Horizontal S/R, Stochastic, RSI, channel lines, Bollinger squeeze",
    risk_management: "Stops outside range boundaries. Exit on decisive close outside range. Reduce exposure near range edges.",
    family: "Mean Reversion",
    steps: ["Identify range boundaries", "Buy at support, sell at resistance", "Set stops outside range", "Exit on range break"],
    quiz_questions: [
      { question: "When do you exit a range trade?", options: ["At the middle", "On decisive close outside range", "After 3 touches", "On RSI divergence"], correct_index: 1, explanation: "A decisive close outside the range signals the range is broken and the edge is lost." },
      { question: "Best indicator for range trading?", options: ["MACD", "Stochastic", "ATR", "Volume"], correct_index: 1, explanation: "Stochastic is excellent for range trading as it identifies overbought/oversold conditions within the range." },
      { question: "Where to place stops?", options: ["At support", "Just outside range", "At the middle", "No stop needed"], correct_index: 1, explanation: "Stops placed just outside the range boundaries protect against sudden range breaks." },
    ],
  },
  {
    id: 5, name: "Scalping", slug: "scalping",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "High volume of very short-duration trades (seconds to minutes), profiting from tiny price movements and small spreads.",
    indicators: "1-5min charts, order book, Level 2, Tick charts, VWAP, 5-9 EMA",
    risk_management: "Extremely tight stops (1-5 pips). Win rate >60%. Daily profit/loss limits. Only high-liquidity instruments.",
    family: "Time-Frame Based",
    steps: ["Identify liquid instrument", "Use 1-5min chart", "Enter on micro-signal", "Exit at tiny profit target", "Repeat"],
    quiz_questions: [
      { question: "Required win rate for scalping?", options: ["40%+", "50%+", "60%+", "80%+"], correct_index: 2, explanation: "Scalping requires above 60% win rate due to tight profit targets and commission costs." },
      { question: "Maximum trade duration?", options: ["Hours", "Minutes", "Seconds to minutes", "Days"], correct_index: 2, explanation: "Scalping trades last from seconds to a few minutes at most." },
      { question: "Critical requirement for scalping?", options: ["High spread", "Low spread/high liquidity", "High volatility", "News events"], correct_index: 1, explanation: "Low spreads and high liquidity are essential since scalpers profit from tiny movements." },
    ],
  },
  {
    id: 6, name: "Swing Trading", slug: "swing-trading",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Capture multi-day to multi-week price swings within broader trends, avoiding day trading noise.",
    indicators: "4H/D1 charts, Fibonacci, MACD, RSI, chart patterns, moving average pullbacks",
    risk_management: "1-3% per trade. Stops below swing structure. Trailing stops. Avoid overnight gap risk in equities.",
    family: "Time-Frame Based",
    steps: ["Identify trend on daily chart", "Find pullback to support/Fib", "Enter with reversal confirmation", "Target next swing high/low"],
    quiz_questions: [
      { question: "Typical holding period?", options: ["Minutes", "Days to weeks", "Months", "Years"], correct_index: 1, explanation: "Swing trading holds positions for days to weeks to capture meaningful price moves." },
      { question: "Best timeframe for analysis?", options: ["1-5 minute", "15-30 minute", "4H/Daily", "Weekly"], correct_index: 2, explanation: "4-hour and daily charts provide the optimal balance of signal and noise for swing trading." },
      { question: "Key advantage over day trading?", options: ["More trades", "Less noise, bigger moves", "No risk", "Lower skill needed"], correct_index: 1, explanation: "Swing trading filters out intraday noise and captures larger, more meaningful price movements." },
    ],
  },
  {
    id: 7, name: "Position Trading", slug: "position-trading",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Hold positions for weeks to months based on fundamental and long-term technical analysis.",
    indicators: "Weekly/monthly charts, macro indicators, fundamental analysis, 200-day MA, trendlines",
    risk_management: "Wide stops. Larger sizing with longer horizon. Use options for protection. Portfolio-level risk management.",
    family: "Time-Frame Based",
    steps: ["Analyze fundamentals", "Identify long-term trend", "Enter with wide stop", "Hold for major move"],
    quiz_questions: [
      { question: "Holding period?", options: ["Hours", "Days", "Weeks to months", "Years"], correct_index: 2, explanation: "Position trading holds for weeks to months to capture major market moves." },
      { question: "Key analysis type?", options: ["Only technical", "Fundamental + technical", "Only news-based", "Sentiment only"], correct_index: 1, explanation: "Position trading combines both fundamental and long-term technical analysis." },
      { question: "Important risk management tool?", options: ["Tight stops", "Wide stops and options hedge", "No stops needed", "Daily check"], correct_index: 1, explanation: "Wide stops accommodate volatility over the longer holding period, and options provide portfolio protection." },
    ],
  },
  {
    id: 8, name: "Fibonacci Retracement", slug: "fibonacci-retracement",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Markets retrace to Fibonacci levels (38.2%, 50%, 61.8%) before continuing in original direction.",
    indicators: "Fib levels, extensions (127.2%, 161.8%), confluence zones, trend structure",
    risk_management: "Entry on pullback with confirmation. Stop beyond next Fib level. Combine with ATR.",
    family: "Pattern-Based",
    steps: ["Identify swing high/low", "Draw Fib from low to high", "Wait for pullback to 38.2/61.8%", "Enter with reversal confirmation"],
    quiz_questions: [
      { question: "Key Fibonacci levels?", options: ["10%, 25%, 40%", "38.2%, 50%, 61.8%", "20%, 40%, 80%", "33%, 66%, 100%"], correct_index: 1, explanation: "The most watched Fibonacci retracement levels are 38.2%, 50%, and 61.8%." },
      { question: "Most important level?", options: ["23.6%", "38.2%", "50%", "61.8% (Golden Ratio)"], correct_index: 3, explanation: "The 61.8% level (Golden Ratio) is the most watched and respected Fibonacci level." },
      { question: "What confirms entry at a Fib level?", options: ["Nothing needed", "Reversal candle/pattern", "Volume decrease", "Time delay"], correct_index: 1, explanation: "Always wait for a reversal candle or pattern to confirm the Fib level is holding." },
    ],
  },
];

export const ALL_STRATEGY_NAMES: { name: string; slug: string; difficulty: string; family: string; market: string[] }[] = [
  { name: "Trend Following", slug: "trend-following", difficulty: "beginner", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "Mean Reversion", slug: "mean-reversion", difficulty: "intermediate", family: "Mean Reversion", market: ["Forex", "Equities", "Crypto"] },
  { name: "Breakout", slug: "breakout", difficulty: "intermediate", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "Range Trading", slug: "range-trading", difficulty: "beginner", family: "Mean Reversion", market: ["Forex", "Equities", "Crypto"] },
  { name: "Scalping", slug: "scalping", difficulty: "advanced", family: "Time-Frame Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Swing Trading", slug: "swing-trading", difficulty: "intermediate", family: "Time-Frame Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Position Trading", slug: "position-trading", difficulty: "intermediate", family: "Time-Frame Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Day Trading", slug: "day-trading", difficulty: "intermediate", family: "Time-Frame Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Carry Trade", slug: "carry-trade", difficulty: "intermediate", family: "Institutional", market: ["Forex"] },
  { name: "Arbitrage", slug: "arbitrage", difficulty: "advanced", family: "Institutional", market: ["Forex", "Equities", "Crypto"] },
  { name: "Statistical Arbitrage", slug: "statistical-arbitrage", difficulty: "advanced", family: "Institutional", market: ["Equities", "Crypto"] },
  { name: "Pairs Trading", slug: "pairs-trading", difficulty: "advanced", family: "Institutional", market: ["Equities", "Crypto", "Forex"] },
  { name: "Momentum", slug: "momentum", difficulty: "intermediate", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "Smart Money (SMC)", slug: "smc", difficulty: "advanced", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "ICT Method", slug: "ict-method", difficulty: "advanced", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "Wyckoff Method", slug: "wyckoff-method", difficulty: "advanced", family: "Pattern-Based", market: ["Equities", "Crypto", "Forex"] },
  { name: "Elliott Wave", slug: "elliott-wave", difficulty: "advanced", family: "Pattern-Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Fibonacci Retracement", slug: "fibonacci-retracement", difficulty: "beginner", family: "Pattern-Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Supply & Demand", slug: "supply-demand", difficulty: "intermediate", family: "Volume-Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Order Flow", slug: "order-flow", difficulty: "advanced", family: "Volume-Based", market: ["Forex", "Equities"] },
  { name: "Volume Profile", slug: "volume-profile", difficulty: "intermediate", family: "Volume-Based", market: ["Equities", "Crypto"] },
  { name: "Price Action", slug: "price-action", difficulty: "intermediate", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "Candlestick Patterns", slug: "candlestick-patterns", difficulty: "beginner", family: "Pattern-Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Support & Resistance", slug: "support-resistance", difficulty: "beginner", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "MA Crossover", slug: "ma-crossover", difficulty: "beginner", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "RSI Divergence", slug: "rsi-divergence", difficulty: "intermediate", family: "Mean Reversion", market: ["Forex", "Equities", "Crypto"] },
  { name: "MACD Strategies", slug: "macd-strategies", difficulty: "intermediate", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "Bollinger Bands", slug: "bollinger-bands", difficulty: "intermediate", family: "Mean Reversion", market: ["Forex", "Equities", "Crypto"] },
  { name: "Ichimoku Cloud", slug: "ichimoku-cloud", difficulty: "advanced", family: "Trend/Momentum", market: ["Forex", "Equities", "Crypto"] },
  { name: "Harmonic Patterns", slug: "harmonic-patterns", difficulty: "advanced", family: "Pattern-Based", market: ["Forex", "Equities", "Crypto"] },
  { name: "Fair Value Gaps", slug: "fair-value-gaps", difficulty: "intermediate", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "Order Blocks", slug: "order-blocks", difficulty: "advanced", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "Liquidity Sweeps", slug: "liquidity-sweeps", difficulty: "advanced", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "Change of Character", slug: "change-of-character", difficulty: "intermediate", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "Break of Structure", slug: "break-of-structure", difficulty: "intermediate", family: "SMC/ICT", market: ["Forex", "Equities", "Crypto"] },
  { name: "Gap Trading", slug: "gap-trading", difficulty: "intermediate", family: "Event-Driven", market: ["Equities"] },
  { name: "News Trading", slug: "news-trading", difficulty: "advanced", family: "Event-Driven", market: ["Forex", "Equities", "Crypto"] },
  { name: "Volatility Trading", slug: "volatility-trading", difficulty: "advanced", family: "Institutional", market: ["Equities", "Crypto", "Forex"] },
  { name: "Grid Trading", slug: "grid-trading", difficulty: "intermediate", family: "Systematic/Passive", market: ["Forex", "Crypto"] },
  { name: "DCA", slug: "dca", difficulty: "beginner", family: "Systematic/Passive", market: ["Forex", "Equities", "Crypto"] },
  { name: "Seasonality", slug: "seasonality", difficulty: "intermediate", family: "Event-Driven", market: ["Equities", "Crypto", "Forex"] },
  { name: "Sentiment / Contrarian", slug: "sentiment-contrarian", difficulty: "intermediate", family: "Mean Reversion", market: ["Equities", "Crypto"] },
  { name: "Market Making", slug: "market-making", difficulty: "advanced", family: "Institutional", market: ["Equities", "Crypto"] },
  { name: "ML / AI-Driven", slug: "ml-ai-driven", difficulty: "advanced", family: "Systematic/Passive", market: ["Forex", "Equities", "Crypto"] },
];

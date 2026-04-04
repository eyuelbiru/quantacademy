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
  {
    id: 9, name: "Day Trading", slug: "day-trading",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Open and close all positions within the same trading day. Avoid overnight risk by capturing intraday price movements using technical patterns and volume analysis.",
    indicators: "VWAP, 9/20 EMA, volume profile, opening range, 5-15min charts, RSI",
    risk_management: "Flat at market close. Max 2-3% daily loss limit. Position size 1-2% risk. Set daily profit target and stop.",
    family: "Time-Frame Based",
    steps: ["Identify pre-market levels and volume", "Wait for opening range to form", "Trade breakouts or reversals with volume", "Close all positions before market close"],
    quiz_questions: [
      { question: "Key advantage of day trading?", options: ["No overnight risk", "Higher returns", "Lower tax", "Less screen time"], correct_index: 0, explanation: "Day traders close all positions before market close, eliminating overnight gap risk." },
      { question: "What is the opening range?", options: ["Previous day close", "First 15-30min price range", "Pre-market high", "Average price"], correct_index: 1, explanation: "The opening range is typically the high/low of the first 15-30 minutes, used as reference for trades." },
      { question: "Most important metric for day trading?", options: ["Fundamentals", "Sentiment", "Volume", "Dividends"], correct_index: 2, explanation: "Volume confirms legitimacy of intraday price moves and breakouts." },
    ],
  },
  {
    id: 10, name: "Carry Trade", slug: "carry-trade",
    market: ["Forex"], difficulty: "intermediate",
    concept: "Borrow in a low-interest currency and invest in a higher-interest currency, profiting from the interest rate differential (swap). Works best in stable low-volatility environments.",
    indicators: "Central bank rate differentials, yield curves, currency pair correlation, ADX for trend strength",
    risk_management: "Watch for central bank policy changes. Use wide ATR stops. Hedge with options on volatile pairs. Monitor correlation with risk sentiment.",
    family: "Institutional",
    steps: ["Identify high-yield and low-yield currencies", "Verify stable trend and rate differential", "Enter long the high-yield currency pair", "Earn swap daily, exit on rate change"],
    quiz_questions: [
      { question: "What determines carry trade profit?", options: ["Price movement only", "Interest rate differential", "Trading volume", "Spread size"], correct_index: 1, explanation: "The core profit comes from the interest rate difference between the two currencies." },
      { question: "Biggest risk of carry trades?", options: ["Low returns", "Sudden currency reversal on rate change", "Wide spreads", "News events"], correct_index: 1, explanation: "If the high-yield currency drops sharply or rates change, losses can wipe out months of swap income." },
      { question: "Best environment for carry trade?", options: ["High volatility", "Low volatility", "Crashing markets", "News releases"], correct_index: 1, explanation: "Carry trades thrive in low-volatility environments with stable trends." },
    ],
  },
  {
    id: 11, name: "Arbitrage", slug: "arbitrage",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Exploit price discrepancies of the same asset across different exchanges or markets. Buy on the cheaper venue, sell simultaneously on the more expensive one for a risk-free profit.",
    indicators: "Bid-ask spread monitoring, latency measurement, order book depth, exchange API speeds, cross-exchange price feeds",
    risk_management: "Transfer risk is critical. Fast execution required. Watch for slippage and exchange fees. Only trade liquid assets with wide spreads.",
    family: "Institutional",
    steps: ["Monitor prices across multiple exchanges", "Identify price discrepancy above fee threshold", "Execute simultaneous buy and sell orders", "Capture spread minus transaction costs"],
    quiz_questions: [
      { question: "What makes arbitrage risk-free?", options: ["Large position sizes", "Simultaneous buy and sell at different prices", "Long holding period", "High leverage"], correct_index: 1, explanation: "Arbitrage locks in profits by buying and selling the same asset simultaneously at different prices." },
      { question: "Biggest risk in arbitrage?", options: ["Directional risk", "Transfer and execution risk", "Counterparty risk", "All of the above"], correct_index: 3, explanation: "Arbitrage carries transfer risk, execution risk, slippage, and counterparty risk despite no directional exposure." },
      { question: "Why is speed critical?", options: ["For fun", "Price gaps close quickly", "To get better spreads", "To avoid fees"], correct_index: 1, explanation: "Price discrepancies are fleeting and close within milliseconds to seconds." },
    ],
  },
  {
    id: 12, name: "Statistical Arbitrage", slug: "statistical-arbitrage",
    market: ["Equities", "Crypto"], difficulty: "advanced",
    concept: "Use quantitative models to identify pairs or baskets of securities where historical price relationships have diverged. Trade the reversion to mean using statistical significance tests.",
    indicators: "Z-score, cointegration tests, rolling correlation, Hurst exponent, Kalman filters, mean-reversion models",
    risk_management: "Model risk is the biggest danger. Set max position limits. Use regime detection. Apply circuit breakers during flash crashes.",
    family: "Institutional",
    steps: ["Identify historically cointegrated asset pairs", "Calculate Z-score of current spread", "Enter when Z-score exceeds 2 standard deviations", "Exit when spread reverts to mean"],
    quiz_questions: [
      { question: "What is cointegration?", options: ["Same price movement", "Long-term equilibrium relationship", "Same sector stocks", "High correlation"], correct_index: 1, explanation: "Cointegration means two series maintain a long-term equilibrium relationship even if short-term deviations occur." },
      { question: "What Z-score threshold is common?", options: ["0.5", "2.0", "3.0", "5.0"], correct_index: 1, explanation: "Z-score of 2.0 means the spread is 2 standard deviations from its mean, suggesting a statistically significant deviation." },
      { question: "Biggest risk in stat arb?", options: ["Directional risk", "Model failure during regime change", "Wide spreads", "Low returns"], correct_index: 1, explanation: "Stat arb models can fail spectacularly when market regimes change and historical relationships break down." },
    ],
  },
  {
    id: 13, name: "Pairs Trading", slug: "pairs-trading",
    market: ["Equities", "Crypto", "Forex"], difficulty: "advanced",
    concept: "Long one asset and short a correlated asset when their price ratio diverges from historical norms. Profit from convergence regardless of market direction.",
    indicators: "Rolling correlation, spread chart, Bollinger Bands on spread, ratio chart, Z-score",
    risk_management: "Hedge ratio must be dynamic. Both legs carry overnight risk. Size positions using beta-neutral approach. Set max drawdown limit.",
    family: "Institutional",
    steps: ["Find two historically correlated assets", "Calculate the historical spread and ratios", "When spread widens beyond normal, go long the underperformer and short the outperformer", "Close when spread normalizes"],
    quiz_questions: [
      { question: "Why pairs trade market-neutral?", options: ["Both legs move together", "Long and short offset market risk", "Uses no leverage", "Only trades one direction"], correct_index: 1, explanation: "By going long one asset and short a correlated one, market direction risk is hedged." },
      { question: "When to exit a pairs trade?", options: ["After a day", "When spread normalizes", "On any divergence", "After a week"], correct_index: 1, explanation: "Exit when the spread reverts to its historical mean, confirming the relationship is restored." },
      { question: "How to size positions?", options: ["Equal dollar amount", "Beta-neutral weighting", "Random allocation", "Max leverage"], correct_index: 1, explanation: "Beta-neutral sizing accounts for different volatilities to create a truly hedged position." },
    ],
  },
  {
    id: 14, name: "Momentum", slug: "momentum",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Buy assets that have been performing well and sell those that have been performing poorly. Momentum persists because of behavioral biases like underreaction and herding.",
    indicators: "RSI, ROC (Rate of Change), Ichimoku, volume surge, 52-week high proximity, ADX > 30",
    risk_management: "Use trailing stops on momentum trends. Scale out at targets. Avoid entering late in overextended moves. Set tight stops if momentum stalls.",
    family: "Trend/Momentum",
    steps: ["Identify asset breaking out to new levels", "Confirm with strong volume and indicators", "Enter in the direction of momentum", "Trail stops to lock in gains"],
    quiz_questions: [
      { question: "Why does momentum persist?", options: ["Random", "Behavioral biases like underreaction", "News only", "Large institutions"], correct_index: 1, explanation: "Momentum persists because investors underreact to new information and herd behavior amplifies moves." },
      { question: "Best entry for momentum?", options: ["At the top", "Early in the move with confirmation", "After reversal", "During consolidation"], correct_index: 1, explanation: "Early entry with volume and indicator confirmation gives best risk-reward." },
      { question: "What kills momentum traders?", options: ["Trend continuation", "Sudden reversals without warning", "Low volume", "High volume"], correct_index: 1, explanation: "V-shape reversals can quickly erase gains from momentum positions." },
    ],
  },
  {
    id: 15, name: "Smart Money (SMC)", slug: "smc",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Trade like institutional players by identifying where 'smart money' is accumulating and distributing positions. Focus on liquidity pools, market structure, and premium/discount pricing.",
    indicators: "Order blocks, breaker blocks, fair value gaps, liquidity sweeps, market structure shift (MSS), premium/discount zones",
    risk_management: "Invalidation when order block is reclaimed. Position size 1-2%. Target 1:3 minimum RR. Never chase a sweep without confirmation.",
    family: "SMC/ICT",
    steps: ["Identify key liquidity pools above/below structure", "Wait for liquidity sweep and market structure shift", "Find the order block or FVG left behind", "Enter at the order block with stop beyond the sweep"],
    quiz_questions: [
      { question: "What is a liquidity sweep?", options: ["Breakout", "Stop hunt that takes liquidity then reverses", "Volume surge", "Gap fill"], correct_index: 1, explanation: "A liquidity sweep takes out obvious stop losses before reversing in the true intended direction." },
      { question: "What is an order block?", options: ["Any candle", "Last opposing candle before strong move", "A gap", "Support line"], correct_index: 1, explanation: "An order block is the last bear/bull candle before an impulsive move, representing institutional entry zone." },
      { question: "What defines premium/discount?", options: ["News sentiment", "50% Fib of dealing range", "RSI level", "Moving average"], correct_index: 1, explanation: "In SMC, the 50% Fib of the dealing range separates premium (expensive = sell zone) from discount (cheap = buy zone)." },
    ],
  },
  {
    id: 16, name: "ICT Method", slug: "ict-method",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Inner Circle Trader methodology combining time-based price delivery with market maker models. Focus on kill zones, optimal trade entries, and algorithmic price movements.",
    indicators: "Fair value gaps, breaker blocks, optimal trade entry (OTE), kill zones (London/NY), daily bias analysis",
    risk_management: "Time-based entries reduce exposure. Stop below the displacement leg. 1:3 RR minimum. Trade only during kill zones.",
    family: "SMC/ICT",
    steps: ["Determine daily directional bias", "Wait for London or NY kill zone", "Look for liquidity sweep + displacement creating FVG", "Enter at OTE retracement (62-79% Fib)"],
    quiz_questions: [
      { question: "What is a kill zone?", options: ["Any trade time", "Specific high-liquidity trading sessions (London/NY)", "High volatility periods", "News release times"], correct_index: 1, explanation: "Kill zones are specific sessions (London open: 2-5am EST, NY open: 7-10am EST) where smart money is most active." },
      { question: "What is OTE?", options: ["Original trade entry", "Optimal trade entry at 62-79% Fib retracement", "Open the entry", "Order trade event"], correct_index: 1, explanation: "Optimal Trade Entry is the Fibonacci retracement level between 62% and 79% of the displacement leg." },
      { question: "Why time-based entry?", options: ["Random benefit", "Smart money is most active during kill zones", "It doesn't matter", "Only for forex"], correct_index: 1, explanation: "ICT relies on the concept that the interbank algorithm manipulates price most during specific sessions." },
    ],
  },
  {
    id: 17, name: "Wyckoff Method", slug: "wyckoff-method",
    market: ["Equities", "Crypto", "Forex"], difficulty: "advanced",
    concept: "Analyze the accumulation and distribution phases of large operators (Composite Man). Trade through four phases: Accumulation, Markup, Distribution, Markdown.",
    indicators: "Volume analysis, support/resistance, spring/upthrust patterns, creeks/resistance lines, composite man theory",
    risk_management: "Invalidation if price closes below creek/support. Wait for spring confirmation. Position size 1-2%. Target full markup phase.",
    family: "Pattern-Based",
    steps: ["Identify the trading phase (accumulation/distribution)", "Wait for spring (shakeout) test", "Enter on sign of strength (SOS)", "Ride the markup phase, exit at distribution signs"],
    quiz_questions: [
      { question: "What is a Spring?", options: ["Bull breakout", "False breakdown below support before markup", "Any shakeout", "Gap up"], correct_index: 1, explanation: "A Spring is a false breakdown that shakes out weak hands before the real markup phase begins." },
      { question: "What are the 4 phases?", options: ["Start, middle, end, done", "Accumulation, Markup, Distribution, Markdown", "Buy, hold, sell, exit", "None of the above"], correct_index: 1, explanation: "Wyckoff identified four market phases: Accumulation, Markup, Distribution, and Markdown." },
      { question: "What is SOS?", options: ["Stop on strategy", "Sign of Strength — strong volume break", "System of signals", "Standard operating strategy"], correct_index: 1, explanation: "A Sign of Strength (SOS) is strong upward movement on increasing volume confirming institutional buying." },
    ],
  },
  {
    id: 18, name: "Elliott Wave", slug: "elliott-wave",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Markets move in repetitive five-wave impulse patterns followed by three-wave corrections. Use wave counting to identify where price is in the cycle and predict future moves.",
    indicators: "Wave counting, Fibonacci extensions (Wave 3 = 1.618x Wave 1), degree identification, alternation principle, channeling",
    risk_management: "Invalidation below Wave 2 low for impulse count. Wave 3 cannot be shortest. Use Fibonacci for targets. Count is always subjective — have alternative counts.",
    family: "Pattern-Based",
    steps: ["Identify the degree of the wave pattern", "Count the five-wave impulse structure", "Measure Wave 3 target (1.618x Wave 1)", "Enter on Wave 2 correction for impulse trade"],
    quiz_questions: [
      { question: "How many waves in impulse?", options: ["3", "5", "8", "13"], correct_index: 1, explanation: "An Elliott Wave impulse pattern consists of 5 waves: 3 motive waves (1,3,5) and 2 corrective waves (2,4)." },
      { question: "Rule for Wave 3?", options: ["Always shortest", "Cannot be the shortest of 1,3,5", "Always longest", "Always equals Wave 1"], correct_index: 1, explanation: "Wave 3 can never be the shortest among waves 1, 3, and 5." },
      { question: "What happens after Wave 5?", options: ["Continues up", "Three-wave ABC correction", "Sideways", "Random movement"], correct_index: 1, explanation: "After a 5-wave impulse, the market typically enters a 3-wave corrective ABC pattern in the opposite direction." },
    ],
  },
  {
    id: 19, name: "Supply & Demand", slug: "supply-demand",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Identify zones where large institutional orders created imbalances between buyers and sellers. Trade fresh zones with unfulfilled limit orders still resting.",
    indicators: "Supply/demand zone identification, rally-base-drop patterns, drop-base-rally patterns, zone freshness, time compression",
    risk_management: "Only trade fresh zones. Invalidation if zone is reclaimed on close. Set stop beyond zoner edge. Scale out at opposite zone.",
    family: "Volume-Based",
    steps: ["Identify strong impulsive moves that left imbalance zones", "Mark the base candles as supply/demand zones", "Wait for price to return to zone", "Enter at zone edge with confirmation from price action"],
    quiz_questions: [
      { question: "What makes a zone fresh?", options: ["Newly drawn", "Has not been retested yet", "Strong candle", "Volume spike"], correct_index: 1, explanation: "A fresh zone has not been retested, meaning there are likely still unfulfilled orders remaining." },
      { question: "What creates a demand zone?", options: ["Consolidation", "Strong rally leaving imbalance", "News event", "Low volume"], correct_index: 1, explanation: "Demand zones form when institutional buying creates an aggressive rally, leaving unfilled buy orders." },
      { question: "Where to place stop?", options: ["At midpoint", "Beyond zone edge", "At entry", "No stop needed"], correct_index: 1, explanation: "Stop placed beyond the zone edge protects against zone failure and provides a clear invalidation point." },
    ],
  },
  {
    id: 20, name: "Order Flow", slug: "order-flow",
    market: ["Forex", "Equities"], difficulty: "advanced",
    concept: "Read the actual buy/sell orders flowing into the market through the order book. Make decisions based on real-time supply/demand imbalances rather than lagging indicators.",
    indicators: "Level 2 / depth of market, time and sales (tape), footprint charts, volume delta, absorption patterns, iceberg orders",
    risk_management: "Tight stops if order flow flips. Scale out at large resting orders. Watch for spoofing. Max risk 1% per trade.",
    family: "Volume-Based",
    steps: ["Watch Level 2 for large resting orders", "Read tape for momentum and absorption", "Identify imbalances in buy/sell aggression", "Enter with dominant order flow direction"],
    quiz_questions: [
      { question: "What is absorption?", options: ["Price drops", "Large orders being filled without price moving", "Volume surge", "Spread widening"], correct_index: 1, explanation: "Absorption occurs when large limit orders absorb all market orders at that level without price moving — a supply/demand signal." },
      { question: "What is delta?", options: ["Price change", "Net difference between buying and selling volume", "Spread width", "Time to expiry"], correct_index: 1, explanation: "Delta is the difference between aggressive buying and selling volume, showing who controls the market." },
      { question: "What is spoofing?", options: ["Legitimate trading", "Placing and canceling large orders to manipulate perception", "Large market order", "News-based trading"], correct_index: 1, explanation: "Spoofing is placing large orders with intent to cancel, creating false pressure to trick other traders." },
    ],
  },
  {
    id: 21, name: "Volume Profile", slug: "volume-profile",
    market: ["Equities", "Crypto"], difficulty: "intermediate",
    concept: "Analyze where volume has been traded at specific price levels (not time-based). High-volume nodes act as support/resistance, low-volume nodes as fast-move corridors.",
    indicators: "Volume Profile (visible range, session, fixed), Point of Control (POC), Value Area, Value Area High/Low, volume nodes",
    risk_management: "Trade from high-volume back to high-volume. Invalidation if price closes through POC. Use low-volume areas as fast targets.",
    family: "Volume-Based",
    steps: ["Identify the Volume Profile for the session", "Mark POC, VAH, and VAL levels", "Trade reversions from extremes back to POC", "Use low-volume gaps as targets for fast moves"],
    quiz_questions: [
      { question: "What is POC?", options: ["Highest price", "Point of Control — price with most volume traded", "Price open", "Price change"], correct_index: 1, explanation: "POC is the price level where the most volume was traded, acting as a magnet for price." },
      { question: "What is a low-volume node?", options: ["Low price area", "Price area with little volume traded — fast move corridor", "Boring chart", "No trading"], correct_index: 1, explanation: "Low-volume nodes have thin liquidity, meaning price can move through them quickly when entered." },
      { question: "Where is Value Area?", options: ["Anywhere", "70% of volume around POC", "High volume only", "At the edges"], correct_index: 1, explanation: "Value Area is the range where 70% of the total volume was traded, centered around POC." },
    ],
  },
  {
    id: 22, name: "Price Action", slug: "price-action",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Trade based on raw price movement, candlestick formations, and market structure rather than indicators. Read the story that price is telling through its own behavior.",
    indicators: "None — clean chart. Candlestick patterns, support/resistance, supply/demand zones, break of structure, higher highs/lower lows.",
    risk_management: "Stop beyond signal candle high/low. Risk 1-2%. Trade only clear setups. No trade is better than forced trade.",
    family: "Trend/Momentum",
    steps: ["Identify market context (trend/range)", "Mark key support/resistance levels", "Wait for signal at key level", "Enter with confirmation candle"],
    quiz_questions: [
      { question: "What is the best indicator for price action?", options: ["RSI", "MACD", "Price itself", "Moving average"], correct_index: 2, explanation: "Price action traders use the raw price chart without indicators — price is the only non-lagging source." },
      { question: "What defines a pinbar?", options: ["Small candle", "Long wick with small body showing rejection", "Any inside bar", "Gap candle"], correct_index: 1, explanation: "A pinbar has a long wick and small body, showing price was rejected from a level aggressively." },
      { question: "What is an inside bar?", options: ["Large candle", "Candle completely within previous candle's range", "Gap candle", "Doji"], correct_index: 1, explanation: "An inside bar shows consolidation and compression, often preceding an explosive breakout." },
    ],
  },
  {
    id: 23, name: "Candlestick Patterns", slug: "candlestick-patterns",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Identify specific candle formations that signal reversals, continuations, or indecision. These patterns emerge from collective market psychology.",
    indicators: "Candlestick formation recognition — doji, hammer, engulfing, morning star, shooting star, three white soldiers, dark cloud cover",
    risk_management: "Always confirm at support/resistance. Stop below pattern low. Position size 1-2%. Don't trade candlesticks in isolation.",
    family: "Pattern-Based",
    steps: ["Wait for candle at key level", "Identify the pattern (hammer, engulfing, etc)", "Confirm with volume and context", "Enter on close of signal candle"],
    quiz_questions: [
      { question: "What does a doji signal?", options: ["Strong trend", "Indecision between buyers and sellers", "Buy signal", "Sell signal only"], correct_index: 1, explanation: "A doji (open = close) shows indecision — neither bulls nor bears are in control." },
      { question: "What is a bullish engulfing?", options: ["Small green candle", "Green candle completely covers previous red candle", "Doji", "Long wick down"], correct_index: 1, explanation: "A bullish engulfing forms when a green candle's body completely engulfs the previous red candle's body." },
      { question: "What makes candle patterns reliable?", options: ["Pattern alone", "Confluence with support/resistance and volume", "Any timeframe", "Only on daily charts"], correct_index: 1, explanation: "Candle patterns are most reliable when they occur at key levels with volume confirmation." },
    ],
  },
  {
    id: 24, name: "Support & Resistance", slug: "support-resistance",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Identify price levels where buying or selling pressure historically overpowers the opposing force. Buy at support, sell at resistance, trade the break of either.",
    indicators: "Horizontal levels from swing highs/lows, trendlines, round numbers, pivot points, psychological levels",
    risk_management: "Stop beyond the level. False breaks happen — wait for candle close confirmation. Scale in at levels. Reduce risk on breakout trades.",
    family: "Trend/Momentum",
    steps: ["Mark obvious swing highs and lows as levels", "Watch price behavior as it approaches", "Buy at support / sell at resistance", "Trade breakout when level breaks with volume"],
    quiz_questions: [
      { question: "What makes a level stronger?", options: ["Fewer touches", "More touches and rejections", "Old levels only", "Round numbers only"], correct_index: 1, explanation: "More bounces from a level confirms that many traders respect it, making it stronger." },
      { question: "What happens when resistance breaks?", options: ["Nothing", "Resistance becomes support", "Price always reverses", "Volume drops"], correct_index: 1, explanation: "Broken resistance often becomes support — this is the principle of 'role reversal'." },
      { question: "How to confirm a break?", options: ["Any touch", "Wait for candle close beyond level with volume", "News confirmation", "Moving average"], correct_index: 1, explanation: "A candle close beyond the level (not just a wick) with volume confirms a genuine break." },
    ],
  },
  {
    id: 25, name: "MA Crossover", slug: "ma-crossover",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Use the crossover of two moving averages as trade signals. When the faster MA crosses above the slower, it signals a bullish trend. When it crosses below, signal bearish.",
    indicators: "Fast MA (9, 20) and slow MA (50, 200), EMA or SMA, golden cross (50 crosses above 200), death cross (50 crosses below 200)",
    risk_management: "Fails in ranging markets — use ADX filter. Set stop below recent swing after crossover. Position size 1-2%. Take partial profits at extreme.",
    family: "Trend/Momentum",
    steps: ["Set up fast and slow moving averages", "Wait for fast MA to cross slow MA", "Enter in crossover direction", "Exit when MAs cross back"],
    quiz_questions: [
      { question: "What is a golden cross?", options: ["Any cross", "50 MA crosses above 200 MA", "RSI crosses 50", "MACD cross"], correct_index: 1, explanation: "A golden cross occurs when the 50 MA crosses above the 200 MA, signaling potential long-term bullish trend." },
      { question: "When do crossover strategies fail most?", options: ["Trending markets", "Ranging/choppy markets", "High volume", "News events"], correct_index: 1, explanation: "Crossover strategies generate false signals in ranging markets where MAs repeatedly cross." },
      { question: "How to filter false signals?", options: ["Ignore", "Use ADX to confirm trend strength", "Trade more", "Remove MAs"], correct_index: 1, explanation: "ADX filter ensures you only take crossover signals when there's actual trend strength." },
    ],
  },
  {
    id: 26, name: "RSI Divergence", slug: "rsi-divergence",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Spot divergences between price making new highs/lows and RSI making opposite highs/lows. This momentum divergence signals weakening trend and potential reversal.",
    indicators: "RSI (14) on same timeframe, divergence scanner, swing point mapping, hidden divergence vs regular divergence",
    risk_management: "Wait for confirmation candle. Divergence can persist far longer than expected. Invalidation if price continues making new extreme. Risk 1-2%.",
    family: "Mean Reversion",
    steps: ["Identify if price is making higher highs", "Check if RSI is making lower highs (bearish)", "Wait for bearish candle confirmation", "Enter short with stop above swing high"],
    quiz_questions: [
      { question: "What is bearish RSI divergence?", options: ["Price lower high, RSI higher high", "Price higher high, RSI lower high", "Price higher low, RSI higher low", "Random"], correct_index: 1, explanation: "Bearish divergence: price makes higher highs but RSI makes lower highs, indicating weakening momentum." },
      { question: "What is hidden divergence?", options: ["Same as regular", "Divergence within trend continuation", "Not real", "Only on daily charts"], correct_index: 1, explanation: "Hidden divergence occurs within a trend and signals continuation rather than reversal." },
      { question: "Main risk with RSI divergence?", options: ["Works too well", "Can persist while price keeps extending", "No risk", "Only works in crypto"], correct_index: 1, explanation: "Divergence can persist for many periods while price continues its move — don't enter too early." },
    ],
  },
  {
    id: 27, name: "MACD Strategies", slug: "macd-strategies",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Use the Moving Average Convergence Divergence for trend direction, momentum shifts, and entry signals. The MACD crossover, zero-line cross, and histogram divergence are key signals.",
    indicators: "MACD (12,26,9), histogram pattern recognition, signal line crossovers, zero-line cross, MACD divergence",
    risk_management: "Stop beyond recent swing after MACD confirmation. Histogram divergence is early warning — wait for cross. Risk 1-2%. Avoid in ranging markets.",
    family: "Trend/Momentum",
    steps: ["Wait for price at key level or trend", "Look for MACD signal line crossover", "Confirm with histogram direction change", "Enter with stop beyond recent swing"],
    quiz_questions: [
      { question: "What does MACD histogram show?", options: ["Price levels", "Strength of momentum difference", "Volume", "Support levels"], correct_index: 1, explanation: "The histogram shows the difference between MACD and signal lines, representing momentum strength." },
      { question: "What is a bull MACD cross?", options: ["Signal crosses below", "MACD crosses above signal", "Zero line cross", "Any cross"], correct_index: 1, explanation: "Bullish MACD cross: MACD line crosses above the signal line, indicating bullish momentum shift." },
      { question: "What does crossing zero line mean?", options: ["Reversal", "Trend direction confirmation", "Volume change", "Nothing"], correct_index: 1, explanation: "MACD crossing zero confirms the short-term moving average has crossed the long-term, confirming trend." },
    ],
  },
  {
    id: 28, name: "Bollinger Bands", slug: "bollinger-bands",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "Use BB (20,2) to identify overbought/oversold levels, squeeze breakouts, and mean reversion targets. Price touching outer bands signals extremes; squeeze signals upcoming volatility explosion.",
    indicators: "Bollinger Bands (20,2), Band Width indicator, %B, W-Bottoms, W-tops, squeeze patterns",
    risk_management: "Don't fade bands in trends. Use squeeze wait for direction. Stop beyond opposite band. Risk 1-2%. Targets are opposite band.",
    family: "Mean Reversion",
    steps: ["Identify if bands are expanding or squeezed", "During squeeze, wait for break above/below", "During trend, trade pullbacks to middle band", "Target opposite band in range"],
    quiz_questions: [
      { question: "What does a squeeze mean?", options: ["Trend continues", "Low volatility — big move coming", "Reversal", "No signal"], correct_index: 1, explanation: "A Bollinger Band squeeze means volatility is extremely low, often preceding a significant breakout." },
      { question: "What does %B show?", options: ["Price percentage", "Where price sits in the bands (0-1)", "Band width", "Time to close"], correct_index: 1, explanation: "%B shows where current price sits relative to the bands. 1 = upper band, 0 = lower band." },
      { question: "When to avoid mean reversion on BB?", options: ["During range", "During strong trend", "On daily charts", "During squeeze"], correct_index: 1, explanation: "During strong trends, price can 'walk the bands' and continue extending — fading is dangerous." },
    ],
  },
  {
    id: 29, name: "Ichimoku Cloud", slug: "ichimoku-cloud",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "A comprehensive trend system showing support/resistance, momentum, and trend direction in a single view. Cloud (Kumo) acts as dynamic S/R. Price above cloud = bullish trend. TK cross + cloud break = signal.",
    indicators: "Tenkan-sen, Kijun-sen, Senkou Span A/B (cloud), Chikou Span, Cloud thickness and color changes, TK cross",
    risk_management: "Stop below cloud for longs. Invalidation if price re-enters cloud. Target Kijun-sen for pullbacks. Risk 1-2%. Avoid when price inside cloud.",
    family: "Trend/Momentum",
    steps: ["Check if price is above or below cloud", "Wait for Tenkan/Kijun cross in trend direction", "Confirm Chikou span is above price (for longs)", "Enter with stop below cloud"],
    quiz_questions: [
      { question: "Price above the cloud means?", options: ["Bearish", "Bullish trend", "Sideways", "No signal"], correct_index: 1, explanation: "Price above the cloud indicates the overall trend is bullish." },
      { question: "What is the Kijun-sen?", options: ["Fast line", "Baseline (26-period midpoint) — major support/resistance", "Cloud edge", "Chikou span"], correct_index: 1, explanation: "Kijun-sen is the 26-period baseline — a key support/resistance and mean-reversion target." },
      { question: "When is Ichimoku useless?", options: ["Trending markets", "When price is inside the cloud", "Strong trends", "Clean charts"], correct_index: 1, explanation: "When price is inside the cloud, the market is in equilibrium/noise — Ichimoku gives no clear signals." },
    ],
  },
  {
    id: 30, name: "Harmonic Patterns", slug: "harmonic-patterns",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Identify specific geometric Fibonacci patterns (Gartley, Butterfly, Bat, Crab) that signal high-probability reversals at the Potential Reversal Zone (PRZ).",
    indicators: "Fibonacci ratios (0.618, 0.786, 0.886, 1.272, 1.618), XABCD pattern recognition, PRZ calculation, confluence zones",
    risk_management: "Stop beyond the PRZ. Risk 1-2%. Pattern invalidation if 1.13X extension breaks. Take targets at Fibonacci extensions of BC leg.",
    family: "Pattern-Based",
    steps: ["Identify XABCD structure in the chart", "Measure Fibonacci ratios for each leg", "Calculate the PRZ where all ratios converge", "Enter at PRZ with reversal candle confirmation"],
    quiz_questions: [
      { question: "What is the PRZ?", options: ["Price zone", "Potential Reversal Zone where Fib ratios converge", "Random zone", "Support zone only"], correct_index: 1, explanation: "PRZ is the area where multiple Fibonacci measurements converge, creating high-probability reversal zone." },
      { question: "What defines a Gartley?", options: ["Any pattern", "B at 0.618 XA, D at 0.786 XA", "No Fibs", "Random shape"], correct_index: 1, explanation: "A Gartley pattern has B retracing 61.8% of XA, and D completing at 78.6% retracement of XA." },
      { question: "Main risk at harmonic patterns?", options: ["Too accurate", "Pattern can extend beyond PRZ", "No risk", "Only works on forex"], correct_index: 1, explanation: "Patterns can overshoot the PRZ before reversing — stop must be placed beyond the invalidation level." },
    ],
  },
  {
    id: 31, name: "Fair Value Gaps", slug: "fair-value-gaps",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "FVGs are three-candle patterns where a large impulsive move leaves an imbalance gap. These gaps act as magnets for price and high-probability entry zones when price returns.",
    indicators: "FVG identification (3-candle pattern with no overlap), premium/discount zones, displacement candles, liquidity sweep confirmation",
    risk_management: "Invalidation if FVG is violated. Stop beyond FVG. Target liquidity above/below. Risk 1-2%. FVGs work best after liquidity sweeps.",
    family: "SMC/ICT",
    steps: ["Identify large displacement candle with gap before/after", "Mark the gap as an FVG zone", "Wait for price to return to FVG", "Enter at FVG fill with stop beyond the zone"],
    quiz_questions: [
      { question: "What creates an FVG?", options: ["Small candles", "Large impulsive move with no overlap between candle 1 and 3", "Sideways market", "Gap up on news"], correct_index: 1, explanation: "An FVG forms when a large candle's wick doesn't overlap with the adjacent candle's wick, showing imbalance." },
      { question: "Why do FVGs attract price?", options: ["Random", "Institutional orders remain unfilled", "Support and resistance", "Moving average"], correct_index: 1, explanation: "FVGs represent zones where institutional orders weren't filled, making price return to fill them." },
      { question: "Best FVG to trade?", options: ["Any FVG", "FVG after liquidity sweep and MSS", "Old FVGs", "Random FVGs"], correct_index: 1, explanation: "FVGs following a liquidity sweep and market structure shift have highest probability of filling." },
    ],
  },
  {
    id: 32, name: "Order Blocks", slug: "order-blocks",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Order blocks are specific candle zones where institutional buying/selling occurred before a significant move. These zones become high-probability areas for price to return and react.",
    indicators: "Last bear candle before bullish impulse (bullish OB), last bull candle before bearish impulse (bearish OB), displacement confirmation, liquidity analysis",
    risk_management: "Invalidation if OB is reclaimed on strong close. Stop below OB low for bullish OB. Risk 1-2%. Target next liquidity pool.",
    family: "SMC/ICT",
    steps: ["Identify strong impulsive moves", "Mark the last opposing candle before impulse as OB", "Wait for price to return to OB", "Enter with confirmation at OB zone"],
    quiz_questions: [
      { question: "What is a bullish order block?", options: ["Any red candle", "Last bear candle before strong bullish displacement", "First bull candle", "Green candle only"], correct_index: 1, explanation: "A bullish OB is the last bear candle before a strong bullish move — institutional sell orders that will be defended." },
      { question: "What confirms an order block?", options: ["Small candle", "Strong displacement in opposite direction", "Volume only", "News event"], correct_index: 1, explanation: "A strong displacement (large impulsive candle) after the OB confirms institutional activity." },
      { question: "Where to place stop on OB trade?", options: ["At entry", "Below OB zone for longs", "Above entry", "No stop"], correct_index: 1, explanation: "Stop placed below the OB zone protects against zone failure — if price violates OB, thesis is wrong." },
    ],
  },
  {
    id: 33, name: "Liquidity Sweeps", slug: "liquidity-sweeps",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Price briefly pierces a key level (equal highs/lows, trendline) to trigger stop losses and liquidity, then aggressively reverses. The sweep traps traders in the wrong direction. Trade the reversal.",
    indicators: "Equal highs/lows, trendline liquidity, stop hunt candles, wick rejections, volume surge on sweep, immediate reversal pattern",
    risk_management: "Invalidation if price reclaims beyond the sweep level. Stop below sweep low (for long entries). Risk 1-2%. Must see immediate reversal confirmation.",
    family: "SMC/ICT",
    steps: ["Identify areas with obvious liquidity (equal highs/lows)", "Wait for sweep — price takes level then reverses quickly", "Enter with confirmation candle", "Target the opposite side liquidity"],
    quiz_questions: [
      { question: "What is a liquidity sweep?", options: ["Breakout", "False break that takes stops then reverses", "Volume surge", "Trend continuation"], correct_index: 1, explanation: "A sweep is a false break that triggers stops and traps traders before price reverses in the true direction." },
      { question: "Where is obvious liquidity?", options: ["Random prices", "Equal highs, equal lows, trendlines", "News levels", "Moving averages"], correct_index: 1, explanation: "Traders cluster stops at equal highs/lows and trendlines, making these areas rich with liquidity." },
      { question: "Most important confirmation?", options: ["Volume only", "Immediate reversal with displacement", "Any wick", "Time of day"], correct_index: 1, explanation: "The sweep must be followed by an immediate strong reversal candle to confirm it wasn't a genuine break." },
    ],
  },
  {
    id: 34, name: "Change of Character", slug: "change-of-character",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "CoC signals when the market's personality shifts from bullish to bearish or vice versa. It's the first break of structure in the new direction on the lower timeframe.",
    indicators: "Market structure analysis, swing point breaks, lower timeframe confirmation, displacement after CoC, volume on break",
    risk_management: "Invalidation if price reclaims broken structure. Stop above/below CoC candle. Risk 1-2%. Trade with higher timeframe bias.",
    family: "SMC/ICT",
    steps: ["Identify current higher timeframe trend", "Watch for first swing point break on LTF", "Confirm with displacement", "Enter on retrace to new structure level"],
    quiz_questions: [
      { question: "What signals bearish CoC?", options: ["Higher high", "First break of recent higher low", "Equal highs", "Sideways"], correct_index: 1, explanation: "A bearish CoC occurs when price breaks the most recent higher low, signaling potential trend change." },
      { question: "CoC vs BOS — what's the difference?", options: ["Same thing", "CoC is first break signaling trend change, BOS is continuation break", "None", "CoC is weaker"], correct_index: 1, explanation: "CoC is the first structure break signaling a potential reversal; BOS confirms trend continuation." },
      { question: "Why use LTF for CoC?", options: ["Any TF works", "LTF gives early entry signal", "LTF only", "HTF only"], correct_index: 1, explanation: "CoC on lower timeframe provides earliest signal of trend change while HTF confirms direction." },
    ],
  },
  {
    id: 35, name: "Break of Structure", slug: "break-of-structure",
    market: ["Forex", "Equities", "Crypto"], difficulty: "intermediate",
    concept: "BOS confirms trend continuation by breaking the most recent swing high (in uptrend) or swing low (in downtrend). It validates the trend is healthy and provides pullback entry opportunities.",
    indicators: "Swing point mapping, trend structure analysis, volume on break, displacement confirmation, retest probability",
    risk_management: "Stop below broken structure level. BOS can fail — wait for retest. Risk 1-2%. Target next swing level.",
    family: "SMC/ICT",
    steps: ["Identify current trend and swing points", "Wait for price to break recent swing (BOS)", "Mark the break level as new support/resistance", "Enter on retest with confirmation"],
    quiz_questions: [
      { question: "What confirms bullish BOS?", options: ["Lower high", "Break above recent swing high with volume", "Equal highs", "Doji"], correct_index: 1, explanation: "Bullish BOS: price breaks above recent swing high showing the uptrend is continuing." },
      { question: "Best entry after BOS?", options: ["Immediately", "Wait for retest of broken level", "After 10 candles", "At opposite level"], correct_index: 1, explanation: "Waiting for retest of the broken structure level provides better risk-reward and confirmation." },
      { question: "When is BOS strongest?", options: ["Low volume", "With strong volume and displacement", "During range", "News events"], correct_index: 1, explanation: "Volume and displacement confirm genuine institutional participation behind the break." },
    ],
  },
  {
    id: 36, name: "Gap Trading", slug: "gap-trading",
    market: ["Equities"], difficulty: "intermediate",
    concept: "Trade the gap between today's open and yesterday's close. Gaps create imbalances that either get filled quickly (gap fill trade) or signal strong continuation (breakaway gap).",
    indicators: "Gap identification (common, breakaway, runaway, exhaustion), opening range, volume comparison, VWAP, pre-market levels",
    risk_management: "Gap fills aren't guaranteed. Stop beyond gap boundaries. Avoid gap fill if breakaway gap confirmed. Risk 1-2%. Time stop by midday if no fill.",
    family: "Event-Driven",
    steps: ["Classify the gap type at open", "For common gaps: fade and target the fill", "For breakaway gaps: trade in gap direction", "Set stops and time limits"],
    quiz_questions: [
      { question: "What is a breakaway gap?", options: ["Any gap", "Gap at end of consolidation signaling new trend", "Small gap", "News gap"], correct_index: 1, explanation: "Breakaway gaps occur at the start of new trends after consolidation — don't fade these." },
      { question: "What type of gap fills most often?", options: ["Breakaway gaps", "Common gaps", "Runaway gaps", "Exhaustion gaps"], correct_index: 1, explanation: "Common gaps tend to fill as they're not associated with major trend changes." },
      { question: "Why time stop on gap fill?", options: ["No reason", "If not filling by midday, likely won't fill", "Always fills", "Never fills"], correct_index: 1, explanation: "Most gap fill attempts happen in the first 1-2 hours. If not filled by then, the thesis is weakening." },
    ],
  },
  {
    id: 37, name: "News Trading", slug: "news-trading",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Trade around scheduled high-impact events (NFP, CPI, FOMC, earnings). Price explodes in one direction after the release, or whipsaws both sides before choosing direction.",
    indicators: "Economic calendar, consensus vs actual, NFP, CPI, FOMC, earnings surprises, sentiment gauges, VIX spike monitoring",
    risk_management: "Widen stops before release. Consider entering after initial spike settles. Never hold through news without wide stops. Risk 0.5-1%. Avoid if outcome is 50/50 coin flip.",
    family: "Event-Driven",
    steps: ["Identify upcoming high-impact event", "Mark pre-news levels", "Enter in direction after initial spike confirmation", "Target next levels or trail stops"],
    quiz_questions: [
      { question: "What is the biggest risk of news trading?", options: ["Low returns", "Whipsaw/spike both directions", "Wide spreads", "No volatility"], correct_index: 1, explanation: "News often spikes both ways before direction, triggering stops in both directions." },
      { question: "Best approach for news?", options: ["Enter before release", "Wait for initial spike to settle, then enter", "Random entry", "Don't trade news"], correct_index: 1, explanation: "Waiting for initial chaos to settle provides clearer direction with less risk." },
      { question: "What to trade NFP?", options: ["Only crypto", "EUR/USD and gold react most", "Only stocks", "Nothing reacts"], correct_index: 1, explanation: "EUR/USD and XAU/USD are most sensitive to NFP releases." },
    ],
  },
  {
    id: 38, name: "Volatility Trading", slug: "volatility-trading",
    market: ["Equities", "Crypto", "Forex"], difficulty: "advanced",
    concept: "Trade changes in volatility itself rather than price direction. Use options (straddles, strangles) during low IV periods expecting expansion, or sell premium during high IV expecting contraction.",
    indicators: "Implied Volatility (IV) vs Historical Volatility (HV), IV Rank, VIX, ATR expansion, Bollinger Band width, volatility cone",
    risk_management: "Options have time decay — manage theta risk. IV crush after events. Spread positions for defined risk. Risk 1-2% per position.",
    family: "Institutional",
    steps: ["Measure IV vs HV to identify mispricing", "During low IV: buy straddles/strangles", "During high IV: sell premium with defined risk", "Adjust or roll positions as IV changes"],
    quiz_questions: [
      { question: "When to buy options for volatility?", options: ["When IV is high", "When IV is low (expecting expansion)", "Always buy", "Never buy"], correct_index: 1, explanation: "Buying options when IV is low gives cheap entry before volatility expansion." },
      { question: "What is IV crush?", options: ["Volatility surge", "Volatility collapsing after event, destroying option value", "Price crash", "Market close"], correct_index: 1, explanation: "IV crush is the rapid drop in implied volatility after an event, destroying option premiums." },
      { question: "What is straddle?", options: ["Directional trade", "Buy call and put at same strike", "Sell options", "Spread"], correct_index: 1, explanation: "A straddle involves buying both a call and put at the same strike, profiting from large moves in either direction." },
    ],
  },
  {
    id: 39, name: "Grid Trading", slug: "grid-trading",
    market: ["Forex", "Crypto"], difficulty: "intermediate",
    concept: "Place multiple buy and sell orders at predefined intervals (grid) above and below current price. Profits from oscillating markets by capturing small moves at each grid level.",
    indicators: "Grid spacing (ATR-based or fixed), ATR for grid sizing, support/resistance for grid range, trend detection (avoid trending with grid)",
    risk_management: "Grid fails in strong trends. Set max grid levels and total exposure cap. Have a stop-loss beyond the grid boundaries. Consider hedging at max drawdown.",
    family: "Systematic/Passive",
    steps: ["Define the price range and grid spacing", "Place buy orders below and sell orders above current price", "Each filled order targets next grid level", "Monitor and adjust grid on trend change"],
    quiz_questions: [
      { question: "Grid trading works best in?", options: ["Strong trends", "Ranges / sideways markets", "Volatile markets", "One direction moves"], correct_index: 1, explanation: "Grid trading profits from price oscillating through grid levels in a range." },
      { question: "Biggest grid trading risk?", options: ["Small profits", "Strong directional trend breaking through grid", "Low fees", "High frequency"], correct_index: 1, explanation: "Grid traders lose money when the market trends strongly in one direction, filling all orders on the wrong side." },
      { question: "How to protect grid?", options: ["No protection", "Stop beyond grid boundaries and max exposure", "More grids", "Leverage"], correct_index: 1, explanation: "Stops and exposure caps protect against catastrophic losses from trending markets." },
    ],
  },
  {
    id: 40, name: "DCA", slug: "dca",
    market: ["Forex", "Equities", "Crypto"], difficulty: "beginner",
    concept: "Dollar Cost Averaging: invest a fixed amount at regular intervals regardless of price. This smooths out your average entry price over time and removes emotion from investing.",
    indicators: "No technical indicators — just calendar-based execution. Track average cost basis vs current price. Monitor portfolio allocation percentage.",
    risk_management: "Choose assets with long-term uptrend bias. Never DCA into dying assets. Set a max allocation %. Exit DCA plan if fundamentals change.",
    family: "Systematic/Passive",
    steps: ["Choose asset and investment amount", "Set schedule (daily, weekly, monthly)", "Execute regardless of price", "Monitor and rebalance periodically"],
    quiz_questions: [
      { question: "DCA main benefit?", options: ["Max returns", "Emotion-free investing at average price", "Easy to manipulate", "Guaranteed profit"], correct_index: 1, explanation: "DCA removes timing emotions and naturally averages your entry price." },
      { question: "When does DCA fail?", options: ["Always", "In long bear markets on dying assets", "In bull markets", "Never"], correct_index: 1, explanation: "DCA loses money if the asset has no long-term recovery — choose assets with long-term uptrend." },
      { question: "How often to DCA?", options: ["Only at bottom", "Regular intervals (weekly, monthly)", "Only on dips", "Only on peaks"], correct_index: 1, explanation: "The key to DCA is regularity — invest consistently at fixed intervals." },
    ],
  },
  {
    id: 41, name: "Seasonality", slug: "seasonality",
    market: ["Equities", "Crypto", "Forex"], difficulty: "intermediate",
    concept: "Certain assets exhibit recurring patterns at specific times of year due to institutional flows, tax seasons, harvest cycles, and holiday demand. Trade these time-based tendencies.",
    indicators: "Historical seasonal patterns, calendar spreads, month-over-month analysis, quarterly trends, Santa rally, sell-in-May effect",
    risk_management: "Seasonality is a tendency, not a guarantee. Combine with technical confirmation. Risk 1%. Use as bias overlay, not sole signal.",
    family: "Event-Driven",
    steps: ["Research historical seasonal pattern for asset", "Align with technical setup", "Enter in expected direction", "Exit before the seasonal window closes"],
    quiz_questions: [
      { question: "What is the Santa Rally?", options: ["Gift trading", "Stock market tendency to rise in December", "Holiday bonus", "Year-end crash"], correct_index: 1, explanation: "The Santa Rally is a well-documented seasonal tendency for equities to rise during the last week of December." },
      { question: "Can you trade seasonality alone?", options: ["Yes", "No — use as bias overlay with technicals", "Always", "Only crypto"], correct_index: 1, explanation: "Seasonality should be one factor in your analysis, confirmed by technicals." },
      { question: "Why do seasonal patterns exist?", options: ["Random", "Institutional flows, tax, harvest, holiday demand", "Government policy", "Weather only"], correct_index: 1, explanation: "Seasonal patterns emerge from recurring institutional behaviors, not magic." },
    ],
  },
  {
    id: 42, name: "Sentiment / Contrarian", slug: "sentiment-contrarian",
    market: ["Equities", "Crypto"], difficulty: "intermediate",
    concept: "When extreme fear or greed dominates, the crowd is usually wrong at extremes. Trade against the herd when sentiment reads are max fear (buy) or max greed (sell).",
    indicators: "Fear & Greed Index, put/call ratio, AAII sentiment survey, funding rates, social media volume, VIX extremes",
    risk_management: "Extreme sentiment can persist. Don't fade too early. Wait for confirmation. Risk 1-2%. Use wide stops — crowds stay irrational longer than you stay solvent.",
    family: "Mean Reversion",
    steps: ["Monitor sentiment indicators for extremes", "Wait for reversal candle or structure break", "Enter against sentiment extreme", "Target mean or contrarian move"],
    quiz_questions: [
      { question: "When Fear & Greed Index is 'Extreme Fear'?", options: ["Sell more", "Potential buying opportunity", "Do nothing", "Short more"], correct_index: 1, explanation: "Extreme fear often marks market bottoms — a contrarian buys when others panic." },
      { question: "Biggest risk in contrarian trading?", options: ["Wrong entry", "Sentiment can stay extreme much longer", "No risk", "Spread"], correct_index: 1, explanation: "Markets can remain irrational longer than you can remain solvent — don't enter too early." },
      { question: "Which metric for crypto sentiment?", options: ["VIX only", "Funding rates + Fear & Greed Index", "RSI only", "MACD"], correct_index: 1, explanation: "Crypto-specific sentiment is best measured by funding rates (perp swaps) and the Crypto Fear & Greed Index." },
    ],
  },
  {
    id: 43, name: "Market Making", slug: "market-making",
    market: ["Equities", "Crypto"], difficulty: "advanced",
    concept: "Provide liquidity by simultaneously placing bid and ask orders, profiting from the spread. Requires fast execution and tight inventory management to avoid directional risk.",
    indicators: "Bid-ask spread monitoring, order book depth, inventory management, queue position, adverse selection detection",
    risk_management: "Tight inventory limits. Auto-widen spread during volatility. Circuit breakers for large adverse moves. Never hold directional inventory overnight.",
    family: "Institutional",
    steps: ["Identify liquid instrument with wide enough spread", "Place simultaneous bid and ask orders", "Manage inventory as orders fill", "Adjust spread based on volatility and position"],
    quiz_questions: [
      { question: "What do market makers profit from?", options: ["Directional moves", "Bid-ask spread", "Volume surge", "News events"], correct_index: 1, explanation: "Market makers profit from the difference between bid and ask prices." },
      { question: "Biggest market making risk?", options: ["Spread", "Adverse selection — being picked off by informed traders", "Time decay", "None"], correct_index: 1, explanation: "If one side fills while price moves against you, you've been 'picked off' by someone with better information." },
      { question: "What to do during high volatility?", options: ["Tighten spread", "Widen spread and reduce position", "Do nothing", "Increase inventory"], correct_index: 1, explanation: "During high volatility, widen spreads to compensate for risk and reduce inventory exposure." },
    ],
  },
  {
    id: 44, name: "ML / AI-Driven", slug: "ml-ai-driven",
    market: ["Forex", "Equities", "Crypto"], difficulty: "advanced",
    concept: "Use machine learning models to find predictive patterns in price, volume, alternative data, and macro indicators. Train on historical data, validate out-of-sample, and deploy with robust risk management.",
    indicators: "Feature engineering (price, volume, sentiment), model types (Random Forest, XGBoost, LSTM, Transformers), walk-forward validation, SHAP feature importance",
    risk_management: "Model decay is inevitable. Rebuild models regularly. Max drawdown limits. Ensemble models for robustness. Never risk more than 2% per prediction.",
    family: "Systematic/Passive",
    steps: ["Collect and engineer features from data", "Train model with walk-forward validation", "Deploy with paper trading first", "Monitor performance, retrain on decay"],
    quiz_questions: [
      { question: "What is walk-forward validation?", options: ["Train/test split", "Continuous retraining and testing on future data", "Random split", "Cross-validation"], correct_index: 1, explanation: "Walk-forward validation trains on historical data and tests on progressively newer data, mimicking real trading." },
      { question: "What causes model decay?", options: ["Better data", "Market regime changes making old patterns obsolete", "Overfitting only", "Bad data"], correct_index: 1, explanation: "Markets are non-stationary — the patterns that worked yesterday may not work tomorrow." },
      { question: "Why ensemble models?", options: ["Fun", "Reduces variance and improves robustness vs single model", "Faster", "Simpler"], correct_index: 1, explanation: "Ensemble models combine multiple models' predictions, reducing the risk of any single model failing." },
    ],
  },
  {
    id: 45, name: "Gold Session Trading", slug: "gold-session-trading",
    market: ["Forex", "Commodities"], difficulty: "intermediate",
    concept: "Gold (XAU/USD) has distinct behavioral patterns during specific trading sessions. London open sees the biggest moves, New York overlaps with London for peak volatility, and Asian session is typically range-bound with smaller moves. Trade each session's unique character.",
    indicators: "Session timing (London: 3am-12pm EST, NY: 8am-5pm EST, Asian: 7pm-4am EST), daily open, session highs/lows, VWAP, ATR by session, previous day high/low",
    risk_management: "Wider stops for gold's volatility. Risk 1-2%. Avoid trading during low-liquidity rollover hours (5pm EST). Set daily loss limit. Gold can move $20-40 in minutes during news.",
    family: "Time-Frame Based",
    steps: ["Mark previous day high/low and session open", "London open: look for false break then trend, false break then trend", "NY overlap peak volatility — trade breakouts or reversals", "Asian session: trade range boundaries"],
    quiz_questions: [
      { question: "Which session has biggest gold moves?", options: ["Asian session", "London open and NY overlap", "Aftermarket", "Weekend"], correct_index: 1, explanation: "London open and NY/London overlap (8am-12pm EST) sees the most volume and largest gold price movements." },
      { question: "What is the Asian session behavior?", options: ["Very volatile", "Range-bound and slow", "Always bullish", "Always bearish"], correct_index: 1, explanation: "Asian session for gold tends to be range-bound with lower volume — ideal for range trading strategies." },
      { question: "When to avoid trading gold?", options: ["London open", "NY session", "Rollover hours (5pm EST)", "Asian session"], correct_index: 2, explanation: "Rollover hours have extremely low liquidity and wide spreads — dangerous and expensive to trade." },
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
  { name: "Gold Session Trading", slug: "gold-session-trading", difficulty: "intermediate", family: "Time-Frame Based", market: ["Forex", "Commodities"] },
];

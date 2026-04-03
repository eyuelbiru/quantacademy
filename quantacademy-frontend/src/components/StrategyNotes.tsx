"use client";

interface StrategyNotesProps {
  slug: string;
  name: string;
  family: string;
}

interface Note {
  plain: string;
  example: string;
  mistakes: string[];
  conditions: string;
}

const NOTES: Record<string, Note> = {
  "trend-following": {
    plain: "Trend Following is the foundational approach to trading — you identify the direction the market is already moving (up or down) and trade in that same direction. The core insight is that markets tend to persist: once a trend starts, it often continues longer than most traders expect. You do NOT try to predict tops or bottoms; instead, you ride the wave.",
    example: "EUR/USD has been making higher highs and higher lows for 3 weeks. Price pulls back to the 50-day moving average and forms a bullish engulfing candle. You enter long, trail your stop below each new swing low, and ride the trend until structure breaks.",
    mistakes: [
      "Trying to pick the exact top/bottom (counter-trend trading)",
      "Entering during choppy sideways markets with no clear trend",
      "Setting stops too tight and getting shaken out by normal pullbacks",
      "Not using trailing stops, giving back profits when trend reverses",
    ],
    conditions: "Works best in strongly trending markets (ADX > 25). Struggles in range-bound/choppy environments.",
  },
  "mean-reversion": {
    plain: "Mean Reversion is built on the idea that prices tend to return to their average over time. When price moves too far, too fast, it becomes overextended and likely to snap back. Traders identify extreme readings on oscillators (RSI above 70 or below 30) or price at outer Bollinger Bands, then trade opposite.",
    example: "Gold drops 3% in two sessions, RSI hits 25 (deeply oversold), and price is 2.5 standard deviations below the 20-day average. Wait for a bullish hammer, then buy with tight stop below the low. Target is the 20-day moving average.",
    mistakes: [
      "Entering too early before reversal confirmation (catching falling knives)",
      "Ignoring the mean itself can shift during strong trends",
      "Using mean reversion in a trending market without adjustment",
      "Not setting a time stop — reversion can take very long",
    ],
    conditions: "Best in range-bound/consolidating markets. Dangerous during strong trending phases.",
  },
  "breakout": {
    plain: "Breakout trading involves entering when price moves decisively through a key support or resistance level. Once these levels break, trapped traders are forced to cover, and new momentum builds, pushing price further in the breakout direction.",
    example: "Bitcoin consolidates between $60,000 and $65,000 for two weeks. Volume drops during consolidation, then a candle closes above $65,200 with 3x average volume. Enter long on the breakout, stop at $64,500 (just inside the range).",
    mistakes: [
      "Entering on first touch of breakout level (often false breakout)",
      "Ignoring volume — low-volume breakouts fail more often",
      "Not having a clear invalidation point",
      "Chasing breakouts after the move has already run far",
    ],
    conditions: "Best after tight consolidation with declining volume. Most reliable during market opens.",
  },
  "range-trading": {
    plain: "Range trading capitalizes on markets that move sideways between well-defined support and resistance. You buy near the bottom, sell near the top, 'ping-ponging' between boundaries. The edge comes from the statistical fact that range-bound markets tend to oscillate between extremes.",
    example: "AUD/USD bounces between 0.6500 and 0.6580 for a month. Each time it hits 0.6500, Stochastic goes below 20 and a bullish candle forms. Buy at 0.6505, stop below 0.6480, exit near 0.6575.",
    mistakes: [
      "Trading without clearly identifying range boundaries first",
      "Ignoring ranges tend to break eventually",
      "Entering middle of range (worest risk/reward)",
      "Not reducing size as range tests more times",
    ],
    conditions: "Best in sideways markets with clear S/R levels. Fails during trending phases.",
  },
  "scalping": {
    plain: "Scalping involves many very short-duration trades (seconds to minutes), capturing tiny price movements. The philosophy is that small, frequent, high-probability profits add up over the day. Requires low costs (tight spreads), fast execution, and excellent discipline.",
    example: "Trading EUR/USD on 1-min chart. 5-EMA crosses above 9-EMA with increasing bid volume. Enter long for 3 pips, exit, set up for next setup. Repeat 20-30 times per day.",
    mistakes: [
      "Trading high-spread environments — costs eat your edge",
      "Letting losing trades run instead of cutting immedately",
      "Emotional trading after losing streaks",
      "Trading illiquid instruments or during low-volume sessions",
    ],
    conditions: "Requires highly liquid instruments during peak sessions (London/NY overlap). Needs tight spreads.",
  },
  "swing-trading": {
    plain: "Swing trading captures multi-day to multi-week price moves within broader trends. Sits between day and position trading — hold through overnight swings but don't stay months. Advantage is analyzing 4H/daily charts where signals are cleaner and less noisy.",
    example: "AAPL in uptrend on daily chart. Pulls back to 61.8% Fib level with bullish RSI divergence (price lower, RSI higher). Enter with stop below swing low, target previous high, hold 5-10 trading days.",
    mistakes: [
      "Using too-small timeframes (caught in noise)",
      "Not having clear exit plan beyond entry",
      "Letting swings turn into unintentional long-term holds",
      "Overleveraging — swings can be quite large",
    ],
    conditions: "Works across all markets. Best on 4H/Daily charts with clear trend structure.",
  },
  "position-trading": {
    plain: "Position trading takes the longest view — holding trades for weeks to months based on fundamental analysis combined with long-term technicals. Looking for the 'big moves': major trends developing over months. Filters out most market noise. Requires patience and conviction.",
    example: "Fed likely to cut rates over the next quarter, should weaken USD. Weekly chart shows USD/JPY bearish divergence at major resistance. Establish short with wide stop, target 2-3 month decline.",
    mistakes: [
      "Mistaking position trading for 'buy and hold' — need thesis invalidation",
      "Ignoring macro fundamentals in long-term thesis",
      "Letting emotion cause early exit on pullback",
      "Not adjusting stops as the thesis develops",
    ],
    conditions: "Best for markets with clear macro drivers (interest rates, commodity cycles). Requires patience and tolerance for drawdowns.",
  },
  "fibonacci-retracement": {
    plain: "Fibonacci Retracement uses the golden ratio to identify where pullbacks in a trend are likely to reverse. After a significant price move, draw Fib levels from swing low to swing high (or vice versa). Key levels — 38.2%, 50%, 61.8% — act as 'magnets' where price tends to find support/resistance.",
    example: "Gold rallied from $1,900 to $2,050. Draw Fib from low to high. Price pulls back and bounces exactly at 61.8% level ($1,957). Enter long with stop below 78.6%, target retest of $2,050 and then $2,100 (161.8% extension).",
    mistakes: [
      "Drawing Fib from wrong swing points (must be significant swing)",
      "Treating any Fib level as guaranteed without confirmation",
      "Ignoring multiple Fib levels may cluster — wait for confluence",
      "Using Fib in isolation — always confirm with candlesticks",
    ],
    conditions: "Best in trending markets where clear swing highs/lows exist. Most powerful at 61.8% 'Golden Ratio'.",
  },
  "wyckoff-method": {
    plain: "The Wyckoff Method analyzes how 'smart money' (large institutions) accumulates and distributes positions. It identifies four phases: Accumulation (institutions building positions quietly), Markup (price rises as demand exceeds supply), Distribution (institutions selling at highs), and Markdown (price falls). Enter during Accumulation before Markup begins.",
    example: "Stock declines for months, enters sideways range (Accumulation). Selling springs are absorbed — price dips to new lows but quickly recovers (Spring). Volume increases on up-bars, decreases on down-bars. Enter as price breaks above the range (Creek), targeting the Markup phase.",
    mistakes: [
      "Entering too early during Accumulation (can last months)",
      "Misidentifying the phase — Accumulation vs Distribution look similar early",
      "Ignoring volume analysis (volume is crucial for Wyckoff)",
      "Not waiting for the Spring test confirmation",
    ],
    conditions: "Works across all timeframes and markets. Best on daily+ charts where institutional activity is visible.",
  },
  "smc": {
    plain: "Smart Money Concepts (SMC) focuses on identifying where institutional traders have placed their orders. Key concepts include Order Blocks (specific candles where institutions entered), Liquidity Sweeps (price briefly taking out obvious stops before reversing), and Break of Structure (BOS, confirming a new trend direction). By understanding where 'smart money' operates, you can align your trades with dominant players.",
    example: "EUR/USD drops below a previous swing low, triggering retail stops — but then immediately reverses with a strong bullish candle. This is a Liquidity Sweep. Identify the Order Block (last down-candle before the sweep) and enter on retest of that block, targeting the opposite side's liquidity pool.",
    mistakes: [
      "Drawing too many Order Blocks (focus on cleanest ones)",
      "Trading sweeps without BOS confirmation",
      "Ignoring higher timeframe context",
      "Overcomplicating — SMC is refined price action, not magic",
    ],
    conditions: "Works on all timeframes. Most reliable on 1H-4H. Requires patience for full setup (sweep + BOS + retest).",
  },
  "ict-method": {
    plain: "The ICT (Inner Circle Trader) method, developed by Michael Huddleston, builds on SMC with specific entry models and timing concepts. Key elements include Fair Value Gaps (FVG, imbalances where price moved too fast), Optimal Trade Entry (OTE), and Kill Zones (specific times of day when institutional flows are strongest — London Open, New York Open).",
    example: "At the London Kill Zone (2-5 AM EST), EUR/USD drops rapidly creating a Fair Value Gap (three candles where the middle candle's wicks don't overlap the adjacent candles). Price then retraces to fill the FVG. Enter in direction of higher timeframe trend, targeting nearest liquidity pool.",
    mistakes: [
      "Trading outside Kill Zones (ICT relies heavily on time-of-day)",
      "Entering before the FVG is actually tested",
      "Ignoring the higher timeframe bias",
      "Treating every gap as tradable — only specific FVG setups",
    ],
    conditions: "Requires strict time discipline (Kill Zones). Best on Forex during London/NY sessions. Works on 5min-1H charts.",
  },
  "day-trading": {
    plain: "Day trading involves opening and closing all positions within the same trading day — you never hold overnight. This eliminates overnight gap risk and lets you capitalize on intraday volatility. Day traders typically use 5-15 minute charts and take 2-5 trades per day, focusing on the most liquid sessions.",
    example: "Trade the NY Open (9:30-10:30 AM EST) on SPY. Price gaps up on pre-market, watch the opening range (first 5 min) to form. When price breaks above the opening range high with volume, enter long, targeting 1:2 R:R. Close before lunch to avoid the midday chop.",
    mistakes: [
      "Overtrading out of boredom after the morning session",
      "Not having defined entry and exit rules — trading on gut feeling",
      "Ignoring the market open and close — these are the best liquidity windows",
      "Holding losers hoping they'll come back",
    ],
    conditions: "Best during market opens (London 3AM EST, NY 9:30AM EST). Requires 2-3 hours of focused screen time.",
  },
  "carry-trade": {
    plain: "A Carry Trade involves buying (going long) a currency with a higher interest rate and selling (going short) a currency with a lower interest rate. You earn the interest rate differential daily, on top of any price appreciation. It's one of the foundational Forex strategies.",
    example: "Australian interest rate is 4.5% and Japan's is 0.1%. Buy AUD/JPY, earning roughly 4.4% annualized from the rate differential, plus any appreciation in the pair. Target 6-12 month holds.",
    mistakes: [
      "Ignoring that exchange rate moves can wipe out interest gains",
      "Not monitoring central bank policy shifts",
      "Using too much leverage (interest gains are annual, losses mark-to-market)",
      "Entering when the rate differential is narrowing",
    ],
    conditions: "Works as a medium-to-long term Forex strategy during stable/trending markets. Fails during risk-off events.",
  },
  "arbitrage": {
    plain: "Arbitrage exploits price differences of the same asset across different markets. If Bitcoin is $80,000 on Exchange A but $80,050 on Exchange B, you buy on A and sell on B for a risk-free $50 profit per BTC. In practice, execution speed and fees make pure arbitrage challenging for retail traders.",
    example: "EUR/USD trades at 1.08500 on Broker A and 1.08505 on Broker B. Buy on A and sell on B simultaneously, capturing 5 micro-pips. Over many repetitions, this compounds.",
    mistakes: [
      "Ignoring transaction costs that eat away the spread",
      "Assuming execution is instant — latency matters enormously",
      "Not accounting for withdrawal/deposit fees between platforms",
      "Competing against HFT firms with nanosecond advantages",
    ],
    conditions: "Requires multiple market access points, fast execution, and low fees. Best suited for crypto (more fragmented markets).",
  },
  "statistical-arbitrage": {
    plain: "Statistical arbitrage (stat arb) extends arbitrage by using quantitative models to find temporary pricing dislocations between related instruments. Instead of identical assets, it trades correlated pairs — when the spread between them deviates from its statistical norm, you bet on convergence.",
    example: "Coca-Cola and Pepsi historically move together. Over 30 days, their price ratio averages 1.25 with a standard deviation of 0.02. Today the ratio is 1.30 (2.5 sigma from mean). Short the expensive stock and long the cheap one, targeting a reversion to 1.25.",
    mistakes: [
      "Assuming correlation equals causation",
      "Not monitoring if the statistical relationship has structurally broken",
      "Ignoring transaction costs on frequent rebalancing",
      "Overlooking that mean reversion can be very slow",
    ],
    conditions: "Works best with highly correlated, fundamentally similar instruments. Requires statistical tools and continuous monitoring.",
  },
  "pairs-trading": {
    plain: "Pairs trading is a specific form of statistical arbitrage where you identify two historically correlated assets and trade their price spread. When the relationship breaks down (spread widens), you long the underperformer and short the overperformer, betting on convergence.",
    example: "Gold and Silver historically trade at an 80:1 ratio. Today it's 88:1 — silver is cheap relative to gold. Buy silver and short gold in dollar-neutral amounts. When the ratio normalizes to 82:1, close both legs for a profit regardless of market direction.",
    mistakes: [
      "Not ensuring the pair has a long, stable correlation",
      "Forgetting to hedge market exposure (beta neutrality matters)",
      "Not having a maximum spread limit (correlation can break)",
      "Ignoring that one leg can gap against you overnight",
    ],
    conditions: "Works in any market but most reliable with commodities (gold/silver) and sector equities. Requires a statistical approach.",
  },
  "momentum": {
    plain: "Momentum trading is based on the observation that assets that have performed well recently tend to continue performing well, and vice versa. Unlike trend following (which uses moving averages), momentum focuses on relative velocity and acceleration of price movement.",
    example: "Screen for stocks that have gained the most over the past 20 days. NVDA is up 18% in 2 weeks with increasing volume and RSI above 60 but not yet overbought. Enter long, using the 8-EMA as trailing stop, and hold as long as momentum persists.",
    mistakes: [
      "Entering after the momentum has already peaked",
      "Confusing momentum with overbought conditions",
      "Not having a clear exit rule — momentum can reverse violently",
      "Ignoring volume as confirmation of momentum strength",
    ],
    conditions: "Works in trending markets with clear momentum leaders. Best on daily charts. Avoid choppy/sideways regimes.",
  },
  "elliott-wave": {
    plain: "The Elliott Wave Theory proposes that markets move in recognizable wave patterns: five waves in the direction of the main trend (impulse waves 1-2-3-4-5), followed by three counter-trend waves (corrective waves A-B-C). Key rules: Wave 2 never retraces 100% of Wave 1, Wave 3 is never the shortest, and Wave 4 never enters Wave 1's price territory.",
    example: "Bitcoin rallies from $28,000 to $40,000 (Wave 1), pulls back to $34,000 (Wave 2, 50% retracement). Enter long as Wave 3 begins, targeting $50,000+ (Wave 3 is typically the longest and strongest). After Wave 3, take partial profits and prepare for Wave 4.",
    mistakes: [
      "Miscounting waves — Elliott Wave is highly subjective after Wave 1",
      "Forcing a count that doesn't fit the rules",
      "Not waiting for Wave 2 completion before entering for Wave 3",
      "Ignoring that extensions can produce complex subwaves",
    ],
    conditions: "Works on all timeframes but most reliable on 4H+. Best after clear trend initiation.",
  },
  "supply-demand": {
    plain: "Supply and Demand trading focuses on zones where significant buying or selling previously occurred, creating imbalances. These zones appear as areas where price moved sharply away (leaving an imbalance). When price returns to these zones, the unfilled orders at those levels tend to cause a reaction.",
    example: "Price rallies sharply from $150 to $165, leaving a Demand Zone at $148-$152 (the base where buyers accumulated). When price returns to $150, enter long. Institutions still have unfilled buy orders at those levels.",
    mistakes: [
      "Drawing zones that are too wide (not specific enough)",
      "Treating all old zones as still valid — zones weaken with retests",
      "Not confirming with price action before entering at a zone",
      "Ignoring fresh zones in favor of old ones",
    ],
    conditions: "Works across all markets and timeframes. Best on 1H-4H with fresh, untested supply/demand areas.",
  },
  "order-flow": {
    plain: "Order flow trading focuses on the actual flow of buy and sell orders in the market, not just price. By reading the order book, Level 2 data, and time and sales (tape), you can see where large orders are waiting, where absorption is occurring, and whether buyers or sellers are in control at each price level.",
    example: "A large limit buy order at $3,975 on the order book for ES futures. Price approaches $3,975 and the bid size is absorbing all selling pressure. Aggressive market buys start hitting, enter long above $3,978, targeting the next liquidity cluster at $3,990.",
    mistakes: [
      "Reading Level 2 naively — spoofing (fake orders) is common",
      "Not understanding market vs limit order dynamics",
      "Overlooking that order flow is only part of the puzzle",
      "Focusing too much on small details and missing the big picture",
    ],
    conditions: "Requires Level 2 data and tape reading. Best for highly liquid futures and equity markets during active sessions.",
  },
  "volume-profile": {
    plain: "Volume Profile shows where trading volume has occurred at each price level over a specified period, rather than over time. The Point of Control (POC) is the price level with the most volume. High Volume Nodes (HVN) act as support/resistance, while Low Volume Nodes (LVN) are areas where price tends to move quickly.",
    example: "On daily Volume Profile for AAPL, POC at $185 and LVN at $180. Price approaches $185 from below — this is the magnet. Enter long targeting POC. If price breaks through the HVN, the next LVN above becomes the target.",
    mistakes: [
      "Using timeframe too short for the profile to be meaningful",
      "Treating the POC as an impenetrable barrier",
      "Ignoring the broader market context",
      "Not updating the profile as new data comes in",
    ],
    conditions: "Works on any market with volume data. Most effective on daily+ profiles.",
  },
  "price-action": {
    plain: "Price Action trading relies purely on reading raw price movement on the chart — candlestick formations, chart patterns (flags, triangles, head and shoulders), and market structure (support/resistance, trendlines, breakouts) — without heavy reliance on indicators. The idea is that price already incorporates all available information.",
    example: "Price forms a bullish flag after a strong green move. The flag consolidation shows declining volume (sellers tired). Enter when price breaks above the upper flag line with increasing volume. Stop below the flag low. Target is the measured move (flag pole height added to breakout).",
    mistakes: [
      "Seeing patterns everywhere — not all flag patterns are valid",
      "Entering before the breakout confirmation (anticipation)",
      "Not using volume as confirmation",
      "Relying on a single pattern without context",
    ],
    conditions: "Works on all markets and timeframes. Most reliable with clear trends and consolidations on 1H+ charts.",
  },
  "candlestick-patterns": {
    plain: "Candlestick patterns use the open, high, low, and close of price bars to identify potential reversals and continuations. Key reversal patterns include Hammer, Shooting Star, Engulfing, Doji, and Morning/Evening Star. The strength of these patterns comes from the market psychology they represent.",
    example: "After a 5-day decline in BTC/USD to $60,000, you see a Hammer candle: the open and close are near the high, with a long lower wick showing sellers pushed price down to $58,000 but buyers drove it back up. Enter long next candle, stop below the wick, target nearest resistance.",
    mistakes: [
      "Trading single candles without context (where it forms matters)",
      "Not waiting for the next candle for confirmation",
      "Ignoring the overall trend — reversal candles in strong trends often fail",
      "Focusing only on body patterns and ignoring wick information",
    ],
    conditions: "Most reliable at key support/resistance levels and after strong moves. Requires confirmation from the next candle.",
  },
  "support-resistance": {
    plain: "Support and Resistance form the bedrock of all technical analysis. Support is a price level where buying is strong enough to prevent further decline. Resistance is where selling prevents further rise. The more times a level has held, the stronger it becomes. When broken, these levels often flip roles.",
    example: "Gold has tested $2,000 three times, bouncing each time — this is strong support. On the fourth test, enter long at $2,005 with stop at $1,995. When price later breaks below $1,995, that level becomes resistance for future rallies.",
    mistakes: [
      "Drawing too many levels and being unable to make decisions",
      "Treating zones as exact prices — they are ranges, not lines",
      "Not adapting when levels break (support/resistance flip)",
      "Ignoring that older levels lose significance over time",
    ],
    conditions: "Universal strategy — works on all markets, all timeframes. Most reliable when aligned across multiple timeframes.",
  },
  "ma-crossover": {
    plain: "Moving Average Crossover is one of the simplest trend-following signals. Use a fast moving average (e.g., 20-period) and a slow moving average (e.g., 50-period). When the fast MA crosses above the slow MA, it's a bullish signal (Golden Cross). When it crosses below, it's bearish (Death Cross).",
    example: "On EUR/USD daily chart, the 50 MA crosses below the 200 MA (Death Cross). This confirms a major bearish shift. Enter short on the next open, placing stop above the recent swing high and trailing below each swing high as the downtrend develops.",
    mistakes: [
      "Getting whipsawed in sideways markets — MAs lag in ranges",
      "Using periods too short for noisy markets",
      "Not filtering signals — not all crossovers are equal",
      "Ignoring the overall trend context",
    ],
    conditions: "Works best on daily+ charts in trending markets. Use ADX > 25 to confirm trend strength first.",
  },
  "rsi-divergence": {
    plain: "RSI Divergence occurs when price makes a new high/low but the RSI indicator does not confirm. Bearish divergence: price makes a higher high but RSI makes a lower high (momentum weakening). Bullish divergence: price makes a lower low but RSI makes a higher low (selling pressure easing). A powerful reversal signal.",
    example: "ETH makes a new high at $3,900, but RSI peaks at 65 compared to 75 on the previous high. The higher price with lower RSI signals weakening momentum. Short with a stop above the ATH, targeting a 5-8% correction.",
    mistakes: [
      "Confusing divergence with regular RSI overbought/oversold",
      "Entering divergence too early — price can extend far beyond",
      "Not distinguishing regular divergence (reversal) from hidden divergence (continuation)",
      "Relying solely on RSI without other confirmations",
    ],
    conditions: "Most reliable after extended trends with clear divergence formation. Works on 1H+ charts.",
  },
  "macd-strategies": {
    plain: "The MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator. The MACD line (12 EMA - 26 EMA) crossing above/below the Signal line (9 EMA of MACD) generates buy/sell signals. The histogram shows the difference between MACD and Signal, indicating momentum acceleration/deceleration.",
    example: "On GBP/USD 4H chart, MACD crosses above the Signal line from below zero. The histogram bars are expanding upward, confirming bullish momentum. Enter long on the cross, placing stop below the recent swing low.",
    mistakes: [
      "Trading MACD crosses in choppy markets (too many false signals)",
      "Not combining with trend direction — avoid counter-trend signals",
      "Ignoring that MACD is lagging — it confirms, doesn't predict",
      "Overloading with too many MACD variations",
    ],
    conditions: "Works well on 4H-Daily charts in trending markets. Best combined with support/resistance.",
  },
  "bollinger-bands": {
    plain: "Bollinger Bands consist of a 20-period SMA with bands placed 2 standard deviations above and below. Price touching or exceeding the bands signals the market is at an extreme. The 'squeeze' (bands contracting) signals low volatility before an expansion. Price 'walking the bands' shows strong trends.",
    example: "After weeks of Bollinger Band squeeze on a stock chart, price closes above the upper band with 2x average volume. Enter long, expecting the volatility expansion to continue. Stop is the middle band (20 SMA).",
    mistakes: [
      "Assuming touching the upper band = always sell (price walks the bands)",
      "Trading the squeeze direction without confirmation break",
      "Not monitoring the squeeze-to-expansion phase timing",
      "Using default 20,2 settings without considering instrument characteristics",
    ],
    conditions: "Works across all markets. Squeeze plays work best after extended consolidation periods.",
  },
  "ichimoku-cloud": {
    plain: "The Ichimoku Cloud is a comprehensive indicator system showing support/resistance, trend direction, momentum, and entry signals all at once. The Cloud (Kumo) represents future support/resistance. Price above cloud = bullish, below = bearish. Key signals include TK Cross (Tenkan/Kijun), Kumo Breakout, and Chikou Span confirmation.",
    example: "Price breaks above the Ichimoku Cloud on the daily chart. TK Cross confirms bullish (Tenkan above Kijun). The Chikou Span is also above price from 26 periods ago, confirming strength. Enter long with a target at the next resistance, cloud's top as dynamic support.",
    mistakes: [
      "Treating Ichimoku as standalone without context",
      "Not waiting for all three confirmations (price, TK, Chikou)",
      "Ignoring the lagging nature of some components",
      "Using in choppy markets without adjustments",
    ],
    conditions: "Works best on 4H-Daily charts. All three confirmations must align.",
  },
  "harmonic-patterns": {
    plain: "Harmonic Trading uses Fibonacci ratios to identify precise reversal zones called Potential Reversal Zones (PRZ). Patterns like Gartley, Butterfly, Bat, and Crab use specific Fibonacci measurements of price swings to predict where reversals will occur with high precision.",
    example: "A Bullish Gartley pattern on XAUUSD: XA down move, AB 61.8% retracement, BC 38.2%-88.6% of AB, CD 127.2%-161.8% extension of BC, completing at 78.6% of XA. Enter long at the PRZ with tight stop below the pattern, targeting A and X.",
    mistakes: [
      "Not measuring exact Fibonacci ratios — each pattern has specific requirements",
      "Ignoring pattern completion and entering too early",
      "Not using a stop — patterns fail and can extend beyond the PRZ",
      "Only looking at one pattern type without scanning all",
    ],
    conditions: "Works on 1H-4H charts in markets with clear impulse movements. Requires patience for exact ratio completions.",
  },
  "fair-value-gaps": {
    plain: "Fair Value Gaps (FVG) are three-candle patterns where the middle candle's wicks don't overlap with the adjacent candles, creating an 'imbalance'. Price tends to return to fill these gaps before continuing in the original direction. FVGs represent areas where price moved too fast, leaving unfilled orders.",
    example: "EUR/USD drops rapidly creating a FVG between 1.0920-1.0935. Price then retraces to 1.0925 and fills the gap. Enter in the direction of the higher timeframe trend, targeting the nearest liquidity pool above.",
    mistakes: [
      "Trading FVGs against the higher timeframe trend",
      "Entering before the gap is actually filled",
      "Ignoring that not all FVGs get filled",
      "Not combining with other confluence factors (OB, BOS)",
    ],
    conditions: "Works best on 5min-4H charts during trending markets. Most reliable when FVG coincides with an Order Block.",
  },
  "order-blocks": {
    plain: "Order Blocks are specific candles where smart money entered their positions — the last move in one direction before a strong reversal. When price returns to these blocks, the original institutional orders may still have resting liquidity, causing a reaction.",
    example: "A strong bullish move in GBP/JPY from 188.00 to 188.50 leaves a bullish Order Block at the last down candle (187.80-187.90) before the rally. When price later pulls back to 187.85, enter long, targeting 188.50 and beyond.",
    mistakes: [
      "Drawing too many blocks — focus on strongest (most displacement)",
      "Not combining with liquidity analysis",
      "Entering order blocks without BOS confirmation",
      "Treating all blocks equally — only fresh, untested ones matter",
    ],
    conditions: "Works on 1H-4H charts. Best when order block coincides with other confluence factors.",
  },
  "liquidity-sweeps": {
    plain: "Liquidity Sweeps occur when price briefly moves beyond an obvious level (previous high/low) to trigger stops and take out liquidity pools, then reverses sharply. Smart money orchestrates these moves to fill their large orders by running retail stops. The sweep then becomes a strong reversal signal.",
    example: "EUR/USD has a previous swing low at 1.0800. Price drops to 1.0795, triggering all stops below 1.0800, then immediately rallies back above 1.0810 within the same 15-minute bar. The sweep is confirmed. Enter long targeting the opposite side's liquidity pool at 1.0880.",
    mistakes: [
      "Entering before the sweep is confirmed (price can continue through)",
      "Not distinguishing between a sweep and a genuine breakout",
      "Ignoring the higher timeframe context",
      "Not waiting for the reversal confirmation candle",
    ],
    conditions: "Works on all timeframes. Most reliable on 1H+ with clear previous structure.",
  },
  "change-of-character": {
    plain: "Change of Character (ChoCh) signals a potential trend reversal by showing the market structure has shifted. Unlike BOS which confirms trend continuation, ChoCh indicates a change in trend direction — from making higher highs/higher lows to lower highs/lower lows (or vice versa).",
    example: "EUR/USD has been making higher highs and higher lows (uptrend). Suddenly, price breaks below the most recent higher low, failing to make a new high. This ChoCh signals the uptrend is breaking down. Prepare for short entries on pullbacks to former support (now resistance).",
    mistakes: [
      "Confusing ChoCh with temporary pullbacks — must see structural break",
      "Trading ChoCh without higher timeframe confirmation",
      "Not waiting for the pullback and BOS on the opposite side",
      "Entering immediately on the ChoCh without confirmation",
    ],
    conditions: "Works best on 1H-4H with clear structure before the change. Most powerful when multiple timeframes show ChoCh.",
  },
  "break-of-structure": {
    plain: "Break of Structure (BOS) confirms trend continuation. In an uptrend, BOS occurs when price breaks above the previous significant high. In a downtrend, BOS is when price breaks below the previous significant low. BOS is used to confirm entries in the direction of the trend after pullbacks.",
    example: "In an uptrend, price pulls back to an Order Block. Wait for price to break above the previous swing high. This BOS confirms the uptrend is resuming. Enter long on the BOS retest, targeting the next high.",
    mistakes: [
      "Calling every new high a BOS — must break a significant structure level",
      "Not distinguishing BOS from liquidity sweeps",
      "Entering on BOS without understanding broader market structure",
      "Not confirming BOS across multiple timeframes",
    ],
    conditions: "Works across all timeframes. Most reliable on 4H+ with clear trend structure.",
  },
  "gap-trading": {
    plain: "Gap Trading capitalizes on price gaps that occur when a market opens significantly higher or lower than the previous close. Gaps create imbalances that often get filled (price returns to pre-gap level). The three types are Breakaway Gaps (trend change), Measuring Gaps (continuation), and Exhaustion Gaps (reversal).",
    example: "Apple opens $5 higher after positive earnings. Avoid the chase. On day 2-3, price fades back toward the gap. Identify the gap fill target at the previous close. If price reaches the gap fill and shows support, enter long for a bounce.",
    mistakes: [
      "Assuming all gaps will fill — some are breakaway gaps that trend",
      "Chasing gap-ups without a proper entry setup",
      "Not classifying the gap type before trading",
      "Ignoring that gap fills can take days or weeks",
    ],
    conditions: "Most reliable on equity markets (overnight gaps). Gap fill trading works on daily charts.",
  },
  "news-trading": {
    plain: "News Trading involves capitalizing on volatility when economic events create sudden price movements. Key events include NFP, CPI, central bank decisions, and earnings. The strategy is to either trade the initial spike or wait for the dust to settle and trade the aftermath.",
    example: "The Fed unexpectedly raises rates higher than expected. USD/CAD spikes up 50 pips in 30 seconds. Instead of chasing the spike, wait 5-15 minutes. The initial overreaction settles, a pullback forms, enter in the direction of the fundamental shift.",
    mistakes: [
      "Trading the initial spike (slippage, false moves, spread widens)",
      "Not having a pre-defined entry and exit plan",
      "Ignoring spreads can widen dramatically during news",
      "Trading every news event — some create chop that cuts both sides",
    ],
    conditions: "Requires fast execution and acceptance of slippage. Best on high-impact events (NFP, CPI, central bank decisions).",
  },
  "volatility-trading": {
    plain: "Volatility Trading focuses on profiting from changes in implied or realized volatility, not just price direction. You can trade volatility expansions (vol going up) or contractions (vol going down). Commonly done through VIX products, options, or using Bollinger Band squeeze/expansion patterns.",
    example: "Implied volatility on SPX options is at a 10-year low at 15%, but the market has been consolidating. Earnings season approaches and vol typically expands. Buy straddles (long call + long put), expecting volatility expansion to make options more expensive.",
    mistakes: [
      "Confusing implied and realized volatility",
      "Not understanding that options have time decay",
      "Buying vol when it's already extremely high",
      "Not hedging directional exposure properly",
    ],
    conditions: "Works with options, futures, or spot markets using vol indicators. Best entering low-vol environments before expansion.",
  },
  "grid-trading": {
    plain: "Grid Trading places a series of buy and sell orders at regular intervals (grid lines) above and below the current price. In a range, the strategy automatically buys low and sells high as price oscillates between grid levels. Systematic and emotion-free, but can suffer in strong trends.",
    example: "EUR/USD is ranging 1.0800-1.1000. Set grid lines every 20 pips: 1.0800, 1.0820, 1.0840... up to 1.1000. Place buy orders below current price and sell orders above it. As price oscillates, each grid line triggers a trade.",
    mistakes: [
      "Running grids in strong trending markets (one-direction moves cause losses)",
      "Not having a maximum drawdown limit",
      "Ignoring that grids require significant capital to maintain",
      "Not adjusting grid spacing for the instrument's volatility",
    ],
    conditions: "Works best in sideways/range-bound markets. Requires consistent oscillation. Best for automated systems.",
  },
  "dca": {
    plain: "Dollar-Cost Averaging (DCA) involves investing fixed dollar amounts at regular intervals regardless of price. Over time, you buy more units when prices are low and fewer when high, lowering your average cost. It's the simplest long-term strategy and removes timing risk.",
    example: "Invest $500 into Bitcoin every month, regardless of whether it's $60,000 or $80,000. Over 12 months, your average entry price smooths out the volatility. This removes the stress of timing and builds positions consistently.",
    mistakes: [
      "Not having a clear investment horizon (minimum 1-2 years)",
      "Abandoning the strategy during downturns when DCA buys most efficiently",
      "Forgetting to rebalance your portfolio periodically",
      "DCAing into declining assets with no fundamentals",
    ],
    conditions: "Works for long-term investments across all markets. Best for crypto and broad market indices.",
  },
  "seasonality": {
    plain: "Seasonality trading identifies recurring patterns that tend to occur at specific times of the year. Examples include the Santa Claus Rally (stocks tend to rise in December), January Effect (small caps outperform), and September weakness (historically worst month for equities).",
    example: "Historical data shows gold tends to rally from December through February due to Asian festival demand. Analyze 20 years of data, find 85% probability, enter long in late November. Target January/February highs.",
    mistakes: [
      "Trading seasonality in isolation without other confirmation",
      "Ignoring seasonal patterns can reverse or disappear over time",
      "Not accounting for other factors (earnings, macro events)",
      "Small sample size on some seasonal patterns",
    ],
    conditions: "Works with large historical datasets. Must be combined with trend and volume confirmation.",
  },
  "sentiment-contrarian": {
    plain: "Contrarian trading involves going against the crowd. When everyone is bullish, you look to sell. When everyone is bearish, you look to buy. Use sentiment readings (Fear & Greed, Put/Call ratio, COT reports) to identify extremes. The market tends to be wrong at extremes, and extreme sentiment is often a contrarian signal.",
    example: "Fear & Greed Index hits 10 (Extreme Fear), social media is full of doom predictions, funding rate on perpetuals is deeply negative. Enter a contrarian long BTC, expecting a relief rally back to neutral. Stop goes below the capitulation low.",
    mistakes: [
      "Being contrarian too early (trend can remain extreme longer than expected)",
      "Confusing contrarian with 'catching falling knives'",
      "Not waiting for a reversal signal before entering",
      "Going against sentiment without data (gut feeling is not enough)",
    ],
    conditions: "Works best at extreme fear/greed readings. Best when combined with other reversal signals (divergence, candlesticks).",
  },
  "market-making": {
    plain: "Market Making involves providing liquidity to the market by continuously quoting both buy and sell prices. Profit comes from the bid-ask spread. Market makers must manage inventory risk — they're exposed to adverse price moves while holding positions.",
    example: "Post buy orders at $1.0851 and sell orders at $1.0853 on EUR/USD, making 2 pips per round turn. Edge is providing liquidity in both directions consistently. Over many repetitions, this compounds to steady profits.",
    mistakes: [
      "Not managing inventory risk — directional exposure can wipe out spread gains",
      "Ignoring that spreads can widen during volatility",
      "Not accounting for transaction costs",
      "Overtrading in low-liquidity environments",
    ],
    conditions: "Works in highly liquid, range-bound markets. Requires fast execution and low fees. Best for automated systems.",
  },
  "ml-ai-driven": {
    plain: "AI-Driven strategies use machine learning models to identify patterns in market data that humans can't easily see. These include neural networks predicting price direction, clustering algorithms identifying regime changes, or reinforcement learning for position sizing.",
    example: "Train a Random Forest classifier on 10 years of daily data, using features like RSI, MACD, ATR, and volume patterns. The model predicts tomorrow's direction. Backtest, find a 58% hit rate, deploy it, and monitor performance live.",
    mistakes: [
      "Overfitting — model works perfectly on past data but fails on new data",
      "Not having a clear validation set (out-of-sample testing)",
      "Ignoring markets change — models need constant retraining",
      "Treating AI predictions as 100% accurate (always use risk management)",
    ],
    conditions: "Works best with high-quality data, computational power, and ML expertise. Requires continuous model monitoring.",
  },
};

export default function StrategyNotes({ slug }: StrategyNotesProps) {
  const note = NOTES[slug];
  if (!note) {
    return (
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16, color: "#a3a3a3" }}>Deep Dive</h2>
        <p style={{ color: "#737373", fontStyle: "italic" }}>More detailed notes coming soon for this strategy.</p>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16, color: "#a3a3a3" }}>Deep Dive</h2>
      <div style={{ padding: 20, borderRadius: 12, background: "#111", border: "1px solid #222" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e5e5e5" }}>How It Works</h3>
        <p style={{ lineHeight: 1.8, color: "#d4d4d4", margin: "0 0 20px" }}>{note.plain}</p>

        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e5e5e5" }}>Example Trade</h3>
        <p style={{ lineHeight: 1.8, color: "#d4d4d4", margin: "0 0 20px", fontStyle: "italic" }}>{note.example}</p>

        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e5e5e5" }}>Common Mistakes to Avoid</h3>
        <ul style={{ margin: "0 0 20px", paddingLeft: 24, color: "#f87171", lineHeight: 1.8 }}>
          {note.mistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>

        <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#e5e5e5" }}>Best Market Conditions</h3>
        <p style={{ lineHeight: 1.6, color: "#22c55e" }}>{note.conditions}</p>
      </div>
    </section>
  );
}

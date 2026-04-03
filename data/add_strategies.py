import json
import os

STRATEGIES = [
    {
        "id": 17,
        "name": "Wyckoff Method",
        "slug": "wyckoff-method",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "The Wyckoff Method analyzes market cycles through accumulation, markup, distribution, and markdown phases. It focuses on understanding the relationship between price, volume, and time to identify institutional positioning.",
        "indicators": ["Price-volume analysis", "Point & Figure charts", "Composite Man concept", "Spring/Upthrust patterns"],
        "risk_management": "Invalidation at spring/upthrust failure. Trade only after phase confirmation. Use volume to validate breakouts.",
        "family": "Volume-Based",
        "steps": [
            "Identify the current market phase (accumulation, markup, distribution, markdown).",
            "Analyze volume patterns to confirm institutional participation.",
            "Look for spring or upthrust patterns as entry signals.",
            "Confirm breakouts with increasing volume.",
            "Set stops beyond the spring/upthrust extreme.",
            "Scale out at projected targets using Point & Figure analysis."
        ],
        "quiz_questions": [
            {
                "question": "What are the four phases of the Wyckoff market cycle?",
                "options": ["Accumulation, Markup, Distribution, Markdown", "Expansion, Peak, Contraction, Trough", "Uptrend, Downtrend, Sideways, Volatile", "Entry, Holding, Exit, Re-entry"],
                "correct_index": 0,
                "explanation": "The Wyckoff Method defines four market phases: Accumulation (institutions buying), Markup (price rising), Distribution (institutions selling), and Markdown (price falling)."
            },
            {
                "question": "What is a 'spring' in Wyckoff analysis?",
                "options": ["A sudden price increase above resistance", "A false breakdown below support that reverses higher", "A volume spike during an uptrend", "A moving average crossover signal"],
                "correct_index": 1,
                "explanation": "A spring is a false breakdown where price dips below a support level but quickly reverses higher, indicating institutional accumulation at lower prices."
            },
            {
                "question": "What role does volume play in Wyckoff analysis?",
                "options": ["Volume is irrelevant to price action", "Volume confirms institutional participation and validates breakouts", "High volume always signals a reversal", "Volume should only be measured at market open"],
                "correct_index": 1,
                "explanation": "Volume is critical in Wyckoff analysis because it confirms whether institutions are participating in a move, validating breakouts and signaling potential reversals."
            }
        ]
    },
    {
        "id": 18,
        "name": "Elliott Wave Theory",
        "slug": "elliott-wave",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Elliott Wave Theory identifies market psychology through wave patterns. Markets move in 5-wave impulses and 3-wave corrections, reflecting collective investor behavior.",
        "indicators": ["Wave counts", "Fibonacci extensions", "Channel theory", "Momentum divergence"],
        "risk_management": "Invalidation at wave levels. Wait for wave completion confirmation. Use multiple timeframes for wave alignment.",
        "family": "Pattern-Based",
        "steps": [
            "Identify the impulsive 5-wave sequence on the chart.",
            "Label waves according to Elliott Wave rules (wave 2 never retraces 100% of wave 1).",
            "Use Fibonacci retracements to project wave 3 and wave 5 targets.",
            "Trade the corrective 3-wave (ABC) pullback as an entry zone.",
            "Confirm wave counts with momentum divergence indicators.",
            "Set stops beyond the invalidation point of the current wave count."
        ],
        "quiz_questions": [
            {
                "question": "How many waves make up a complete Elliott Wave impulse sequence?",
                "options": ["3 waves", "5 waves", "7 waves", "8 waves"],
                "correct_index": 1,
                "explanation": "A complete Elliott Wave impulse sequence consists of 5 waves: three motive waves (1, 3, 5) in the direction of the trend and two corrective waves (2, 4) against it."
            },
            {
                "question": "Which rule must wave 2 never violate in Elliott Wave Theory?",
                "options": ["Wave 2 cannot exceed wave 1 in volume", "Wave 2 cannot retrace more than 61.8% of wave 1", "Wave 2 cannot retrace 100% of wave 1", "Wave 2 cannot be shorter than wave 4"],
                "correct_index": 2,
                "explanation": "A fundamental Elliott Wave rule: wave 2 must never retrace more than 100% of wave 1. If it does, the wave count is invalid."
            },
            {
                "question": "What is the typical corrective wave pattern after a 5-wave impulse?",
                "options": ["A 2-wave correction", "A 3-wave (ABC) correction", "A 4-wave correction", "A 6-wave correction"],
                "correct_index": 1,
                "explanation": "After a complete 5-wave impulse sequence, the market typically corrects in a 3-wave ABC pattern, reflecting profit-taking and counter-trend activity."
            }
        ]
    },
    {
        "id": 19,
        "name": "Supply and Demand",
        "slug": "supply-demand",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade from imbalanced supply and demand zones where institutional orders cluster. These zones form when price moves aggressively away from a level, leaving unfilled orders behind.",
        "indicators": ["Order flow zones", "Volume imbalance", "Base patterns", "Drop/Rally patterns"],
        "risk_management": "Stops beyond zone boundaries. Only trade fresh zones. Confirm with price action.",
        "family": "Volume-Based",
        "steps": [
            "Identify zones where price moved sharply away (drop, rally, or base patterns).",
            "Mark the supply zone (sharp drop origin) and demand zone (sharp rally origin).",
            "Wait for price to return to the zone for a potential reaction.",
            "Confirm zone validity with volume and price action at the level.",
            "Enter trades on reversal candlestick patterns at zone edges.",
            "Place stops just beyond the zone boundary with a buffer."
        ],
        "quiz_questions": [
            {
                "question": "What creates a supply or demand zone?",
                "options": ["Random price fluctuations", "Aggressive price movement leaving unfilled institutional orders", "Regular trading hours openings", "Moving average crossovers"],
                "correct_index": 1,
                "explanation": "Supply and demand zones form when price moves aggressively away from a level, indicating that large institutional orders were present and may still be unfilled at that level."
            },
            {
                "question": "Why are 'fresh' zones preferred over tested ones?",
                "options": ["Fresh zones have better chart visibility", "Untested zones have more remaining unfilled orders", "Fresh zones always reverse price", "Tested zones are harder to identify"],
                "correct_index": 1,
                "explanation": "Fresh (untested) zones are preferred because the original institutional orders are more likely to still be present and able to push price away from the level."
            },
            {
                "question": "What pattern indicates a strong demand zone?",
                "options": ["Slow gradual price decline", "Sharp rally away from the zone", "Sideways consolidation with low volume", "Equal highs and lows"],
                "correct_index": 1,
                "explanation": "A sharp rally away from a zone indicates strong buying pressure and suggests significant unfilled buy orders remain at that demand level."
            }
        ]
    },
    {
        "id": 20,
        "name": "Order Flow Trading",
        "slug": "order-flow",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Read the order book, tape, and footprint charts to understand real-time buying and selling pressure. This strategy reveals who is in control at any given moment.",
        "indicators": ["Footprint charts", "Delta divergence", "Cumulative delta", "Order book imbalance"],
        "risk_management": "Requires high liquidity. Real-time data feeds needed. Tight time stops.",
        "family": "Volume-Based",
        "steps": [
            "Set up footprint charts and order book depth indicators.",
            "Monitor cumulative delta for divergence with price action.",
            "Identify absorption patterns where large orders fail to move price.",
            "Look for order book imbalance as directional signals.",
            "Enter trades when delta confirms price movement direction.",
            "Use tight time stops since order flow signals are short-lived."
        ],
        "quiz_questions": [
            {
                "question": "What does 'delta divergence' in order flow trading indicate?",
                "options": ["Price and delta are moving in the same direction", "Price makes a new high/low but cumulative delta does not confirm", "Volume is declining across all timeframes", "The order book is imbalanced"],
                "correct_index": 1,
                "explanation": "Delta divergence occurs when price makes a new high or low but cumulative delta does not confirm it, suggesting a potential reversal due to weakening buying/selling pressure."
            },
            {
                "question": "What is 'absorption' in order flow context?",
                "options": ["Price absorbing news events", "Large market orders failing to move price due to limit order walls", "Volume being absorbed by moving averages", "Price gaps being filled over time"],
                "correct_index": 1,
                "explanation": "Absorption occurs when large market orders are placed but price does not move significantly because limit orders (iceberg orders) are absorbing the flow, often signaling a reversal."
            },
            {
                "question": "Why does order flow trading require high liquidity instruments?",
                "options": ["Low liquidity instruments have wider spreads only", "Thin order books give unreliable signals and poor fills", "Order flow only works on large-cap stocks", "High liquidity reduces the need for stops"],
                "correct_index": 1,
                "explanation": "Order flow trading depends on reading the order book and tape accurately. In thin markets, order books are unreliable, fills are poor, and signals can be easily manipulated."
            }
        ]
    },
    {
        "id": 21,
        "name": "Volume Profile",
        "slug": "volume-profile",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Analyse trading activity at specific price levels to find key support and resistance zones. Unlike time-based volume, volume profile shows where trading occurred most.",
        "indicators": ["Volume at price", "POC", "Value area", "Low volume nodes", "High volume nodes"],
        "risk_management": "Stops beyond HVN/LVN. Trade from value area edges. Confirm with other volume tools.",
        "family": "Volume-Based",
        "steps": [
            "Apply volume profile to identify high and low volume nodes.",
            "Mark the Point of Control (POC) where the most volume occurred.",
            "Identify the Value Area (70% of total volume range).",
            "Trade rejections from the edges of the value area.",
            "Use Low Volume Nodes as potential breakout/breakdown levels.",
            "Place stops beyond identified high or low volume nodes."
        ],
        "quiz_questions": [
            {
                "question": "What does the Point of Control (POC) represent in volume profile?",
                "options": ["The highest price reached during the session", "The price level with the most traded volume", "The open price of the session", "The closing price confirmed by volume"],
                "correct_index": 1,
                "explanation": "The POC is the price level where the highest volume of trading occurred during the selected period, representing the area of maximum market agreement."
            },
            {
                "question": "What is the typical percentage used to define the Value Area?",
                "options": ["50% of total volume", "68% of total volume", "70% of total volume", "90% of total volume"],
                "correct_index": 2,
                "explanation": "The Value Area is typically defined as the range of prices that contains 70% of the total traded volume, statistically representing where most trading activity occurred."
            },
            {
                "question": "Why are Low Volume Nodes (LVNs) important in volume profile?",
                "options": ["They indicate the best entry points", "Price tends to move through them quickly as they offer little resistance", "They always reverse price", "They represent areas of maximum support"],
                "correct_index": 1,
                "explanation": "Low Volume Nodes are price levels where little trading occurred, meaning there is minimal support/resistance. Price tends to move through LVNs quickly, making them good breakout/breakdown levels."
            }
        ]
    },
    {
        "id": 22,
        "name": "Price Action Trading",
        "slug": "price-action",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade purely from price structure without indicators, reading candlesticks, support and resistance, and chart patterns to make trading decisions.",
        "indicators": ["Raw price action", "Candlestick patterns", "Market structure", "Trendlines"],
        "risk_management": "Wait for confirmation candles. Use ATR for stops. Trade only clear patterns.",
        "family": "Trend/Momentum",
        "steps": [
            "Identify the overall market structure (higher highs/higher lows or lower highs/lower lows).",
            "Draw key support and resistance levels from swing points.",
            "Read candlestick patterns for entry and exit signals.",
            "Confirm trade direction with trendline analysis.",
            "Enter on confirmed breakout or reversal candlestick patterns.",
            "Use ATR-based stops and scale out at measured move targets."
        ],
        "quiz_questions": [
            {
                "question": "What defines a bullish market structure in price action?",
                "options": ["Lower highs and lower lows", "Equal highs and equal lows", "Higher highs and higher lows", "Random price movement"],
                "correct_index": 2,
                "explanation": "A bullish market structure is defined by a sequence of higher highs (HH) and higher lows (HL), indicating that buyers are in control and pushing price higher."
            },
            {
                "question": "Why should you wait for confirmation candles in price action trading?",
                "options": ["To delay entry intentionally", "To verify a pattern is valid before risking capital", "Confirmation candles always guarantee profit", "To increase position size"],
                "correct_index": 1,
                "explanation": "Confirmation candles validate that a candlestick pattern or breakout is genuine, reducing false signals and improving the probability of the trade working in your favor."
            },
            {
                "question": "What advantage does price action trading have over indicator-based strategies?",
                "options": ["Price action is always more profitable", "It provides real-time signals without lag", "Indicators are completely useless", "Price action works only in trending markets"],
                "correct_index": 1,
                "explanation": "Price action provides real-time signals directly from price movement, whereas indicators are derived from price and inherently lag behind current market conditions."
            }
        ]
    },
    {
        "id": 23,
        "name": "Candlestick Patterns",
        "slug": "candlestick-patterns",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "beginner",
        "concept": "Trade from individual candlestick patterns like doji, hammer, engulfing, and morning/evening star formations to identify potential reversals and continuations.",
        "indicators": ["Doji", "Hammer", "Engulfing", "Morning/Evening Star", "Pin bar"],
        "risk_management": "Always confirm with next candle. Combine with support/resistance levels for higher probability.",
        "family": "Pattern-Based",
        "steps": [
            "Learn to identify major candlestick patterns (doji, hammer, engulfing).",
            "Look for patterns at key support and resistance levels.",
            "Wait for the next candle to confirm the pattern direction.",
            "Enter on the confirmed signal with a stop beyond the pattern.",
            "Target the next significant support or resistance level.",
            "Avoid trading candlestick patterns in choppy, directionless markets."
        ],
        "quiz_questions": [
            {
                "question": "What does a doji candlestick pattern suggest?",
                "options": ["Strong bullish momentum", "Strong bearish momentum", "Indecision between buyers and sellers", "An imminent gap opening"],
                "correct_index": 2,
                "explanation": "A doji forms when the opening and closing prices are nearly equal, suggesting indecision between buyers and sellers and often preceding a reversal or continuation breakout."
            },
            {
                "question": "What makes an engulfing pattern valid?",
                "options": ["The second candle has higher volume", "The second candle's body completely engulfs the previous candle's body", "Both candles must be the same color", "The pattern must occur at market open"],
                "correct_index": 1,
                "explanation": "A valid engulfing pattern requires the second candle's body to completely engulf (be larger than and in the opposite direction of) the previous candle's body."
            },
            {
                "question": "Why combine candlestick patterns with support/resistance levels?",
                "options": ["Candlestick patterns are unreliable on their own", "Patterns at S/R levels have higher probability of success", "It doubles the number of signals", "S/R levels eliminate all risk"],
                "correct_index": 1,
                "explanation": "Candlestick patterns at key support/resistance levels have a higher probability of success because the level adds additional confirmation that price may reverse or break out."
            }
        ]
    },
    {
        "id": 24,
        "name": "Support and Resistance",
        "slug": "support-resistance",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "beginner",
        "concept": "Identify and trade from key support and resistance levels where price is expected to react. These levels are formed by previous swing highs, swing lows, and areas of consolidation.",
        "indicators": ["Horizontal S/R", "Trendline S/R", "Pivot points", "Round numbers"],
        "risk_management": "Stops just beyond support/resistance. Wait for confirmation at level. Be aware of false breaks.",
        "family": "Trend/Momentum",
        "steps": [
            "Identify key horizontal support and resistance levels from swing points.",
            "Draw trendline S/R connecting multiple touch points.",
            "Mark round number psychological levels as potential S/R.",
            "Wait for price to approach these levels with reduced momentum.",
            "Enter on reversal confirmation (candlestick pattern) at the level.",
            "Place stops just beyond the S/R level, accounting for potential false breaks."
        ],
        "quiz_questions": [
            {
                "question": "What happens when a resistance level is broken?",
                "options": ["It becomes irrelevant", "It often becomes new support (role reversal)", "Price will always gap through it", "Volume will decrease permanently"],
                "correct_index": 1,
                "explanation": "When resistance is broken, it often becomes new support due to role reversal. Traders who missed the breakout look to buy on pullbacks to the former resistance level."
            },
            {
                "question": "What is a 'false break' of support/resistance?",
                "options": ["A break confirmed by volume", "Price crosses the level but quickly reverses back", "A break that occurs on low volume", "When S/R levels converge"],
                "correct_index": 1,
                "explanation": "A false break (or fakeout) occurs when price crosses a support/resistance level but quickly reverses back, trapping traders who entered on the breakout."
            },
            {
                "question": "Why are round numbers significant as support/resistance?",
                "options": ["They are mathematical pivots", "Psychological levels where many traders place orders", "They always reverse price", "Algorithms specifically target round numbers"],
                "correct_index": 1,
                "explanation": "Round numbers are psychological levels where many retail and institutional traders place orders, creating natural clusters of buying and selling pressure."
            }
        ]
    },
    {
        "id": 25,
        "name": "Moving Average Crossover",
        "slug": "ma-crossover",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "beginner",
        "concept": "Trade crossovers between two moving averages as trend change signals. When a faster MA crosses above a slower MA, it generates a bullish signal, and vice versa.",
        "indicators": ["SMA 9/21", "EMA 12/26", "Golden/Death Cross", "Multiple MA alignment"],
        "risk_management": "Whipsaw risk in ranging markets. Use longer MAs for filter. Trail stops on trends.",
        "family": "Trend/Momentum",
        "steps": [
            "Select two moving averages with different periods (fast and slow).",
            "Enter long when the fast MA crosses above the slow MA.",
            "Enter short when the fast MA crosses below the slow MA.",
            "Filter signals using a longer-term MA for trend direction.",
            "Trail stops using the slow MA as a dynamic support/resistance.",
            "Avoid trading crossover signals in sideways, choppy markets."
        ],
        "quiz_questions": [
            {
                "question": "What is a 'Golden Cross'?",
                "options": ["A 20-day MA crossing below a 50-day MA", "A 50-day MA crossing above a 200-day MA", "Any bullish candlestick pattern", "Price crossing above a moving average"],
                "correct_index": 1,
                "explanation": "A Golden Cross occurs when the 50-day moving average crosses above the 200-day moving average, signaling a potential long-term bullish trend change."
            },
            {
                "question": "Why are MA crossovers risky in ranging markets?",
                "options": ["Moving averages do not work in ranges", "They generate whipsaw signals with frequent false entries", "Ranges always reverse at MAs", "MAs only work on daily timeframes"],
                "correct_index": 1,
                "explanation": "In ranging markets, price oscillates around the moving averages, causing frequent crosses back and forth (whipsaws) that generate losing signals."
            },
            {
                "question": "What is the main disadvantage of using moving average crossovers?",
                "options": ["They are leading indicators", "They are lagging indicators that signal after the move begins", "They require expensive software", "They only work on one timeframe"],
                "correct_index": 1,
                "explanation": "Moving averages are lagging indicators because they are calculated from past prices, meaning crossover signals occur after the trend change has already begun."
            }
        ]
    },
    {
        "id": 26,
        "name": "RSI Divergence",
        "slug": "rsi-divergence",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade divergences between RSI and price as early reversal signals. Regular divergence signals reversals while hidden divergence signals trend continuation.",
        "indicators": ["Regular divergence", "Hidden divergence", "RSI period settings", "Multi-timeframe RSI"],
        "risk_management": "Wait for divergence confirmation candle. Combine with support/resistance for higher probability.",
        "family": "Mean Reversion",
        "steps": [
            "Set RSI to standard 14-period or adjust based on trading style.",
            "Identify regular divergence: price makes new high/low but RSI does not.",
            "Identify hidden divergence for trend continuation entries.",
            "Wait for a confirmation candle in the divergence direction.",
            "Enter at the confirmation candle close with stop beyond the swing.",
            "Combine divergence signals with S/R levels for higher probability trades."
        ],
        "quiz_questions": [
            {
                "question": "What is regular bearish RSI divergence?",
                "options": ["Price makes a lower low while RSI makes a higher low", "Price makes a higher high while RSI makes a lower high", "RSI crosses above 70 while price is stable", "RSI and price move in the same direction"],
                "correct_index": 1,
                "explanation": "Regular bearish divergence occurs when price makes a higher high but RSI makes a lower high, indicating weakening upward momentum and a potential reversal down."
            },
            {
                "question": "What does hidden bullish divergence signal?",
                "options": ["Trend reversal to the downside", "Trend continuation to the upside", "Market consolidation", "A change in volatility regime"],
                "correct_index": 1,
                "explanation": "Hidden bullish divergence occurs when price makes a higher low but RSI makes a lower low, suggesting the uptrend will continue despite a temporary pullback."
            },
            {
                "question": "Why wait for a confirmation candle after spotting divergence?",
                "options": ["RSI is always wrong initially", "Divergence can persist for extended moves without reversal", "Confirmation candles eliminate all risk", "It allows time to increase position size"],
                "correct_index": 1,
                "explanation": "Divergence can persist through strong trending moves, so waiting for a confirmation candle ensures the reversal momentum is actually starting before entering the trade."
            }
        ]
    },
    {
        "id": 27,
        "name": "MACD Strategies",
        "slug": "macd-strategies",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Use MACD histogram and signal line crosses for trend identification and reversals. MACD combines trend following with momentum measurement.",
        "indicators": ["MACD histogram", "Signal line cross", "Zero line cross", "Center line rejection"],
        "risk_management": "MACD is lagging. Use in trending markets. Combine with price action for entries.",
        "family": "Trend/Momentum",
        "steps": [
            "Configure MACD with standard settings (12, 26, 9) or adjust for your timeframe.",
            "Watch for signal line crosses as primary entry signals.",
            "Use zero-line crosses to confirm trend direction changes.",
            "Trade histogram contraction as a sign of weakening momentum.",
            "Combine MACD signals with price action patterns for precise entries.",
            "Avoid MACD signals in sideways markets where whipsaws occur."
        ],
        "quiz_questions": [
            {
                "question": "What does a MACD signal line cross indicate?",
                "options": ["A guaranteed trend reversal", "Potential change in short-term momentum direction", "Volume increase confirmation", "A support level breach"],
                "correct_index": 1,
                "explanation": "A MACD signal line cross occurs when the MACD line crosses above or below its signal line, indicating a potential change in short-term momentum direction."
            },
            {
                "question": "What does the MACD crossing the zero line signal?",
                "options": ["Price has reached its maximum", "The long-term trend direction may be changing", "Volume is at its peak", "The market is about to consolidate"],
                "correct_index": 1,
                "explanation": "When MACD crosses the zero line, the shorter-term average has crossed the longer-term average, suggesting the underlying trend direction may be changing."
            },
            {
                "question": "Why combine MACD with price action for entries?",
                "options": ["Price action eliminates all MACD lag", "MACD alone may give late signals; price action provides precise entry timing", "MACD only works with candlestick patterns", "It creates more trade opportunities"],
                "correct_index": 1,
                "explanation": "MACD is a lagging indicator that confirms trends after they begin. Combining it with price action provides precise entry timing on confirmation candles."
            }
        ]
    },
    {
        "id": 28,
        "name": "Bollinger Bands",
        "slug": "bollinger-bands",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade volatility squeezes and mean reversion using Bollinger Bands. Bands expand and contract based on volatility, identifying potential breakouts and overextended conditions.",
        "indicators": ["Standard deviation bands", "Squeeze patterns", "Band walking", "BB width percent"],
        "risk_management": "Avoid trading inside bands in strong trends. Wait for close beyond band confirmation.",
        "family": "Mean Reversion",
        "steps": [
            "Apply standard Bollinger Bands (20 SMA, 2 standard deviations).",
            "Identify squeeze patterns where bands contract significantly.",
            "Trade mean reversion when price touches bands in ranging markets.",
            "Trade breakout when price closes beyond bands after a squeeze.",
            "Watch for 'band walking' as a trend strength indicator.",
            "Use BB width percent to measure volatility regime changes."
        ],
        "quiz_questions": [
            {
                "question": "What does a Bollinger Band squeeze indicate?",
                "options": ["Low volatility that often precedes a significant price move", "A guaranteed reversal is coming", "The trend is ending permanently", "Volume is about to collapse"],
                "correct_index": 0,
                "explanation": "A Bollinger Band squeeze occurs when bands contract due to low volatility, often preceding a significant breakout or breakdown move as volatility expands."
            },
            {
                "question": "What is 'band walking' in Bollinger Bands?",
                "options": ["Price oscillating between upper and lower bands", "Price continuously riding along one band during a strong trend", "Bands widening symmetrically", "Price bouncing off the middle band"],
                "correct_index": 1,
                "explanation": "Band walking occurs when price continuously rides along the upper or lower Bollinger Band during a strong trend, indicating strong momentum that should not be faded."
            },
            {
                "question": "Why avoid mean reversion trades at bands during strong trends?",
                "options": ["Bands become unreliable in trends", "Price can 'walk the band' for extended moves against your position", "Bands widen too quickly in trends", "Mean reversion only works on daily charts"],
                "correct_index": 1,
                "explanation": "During strong trends, price can walk along the bands for extended periods, making mean reversion trades extremely dangerous as the trend can continue well past expected reversal points."
            }
        ]
    },
    {
        "id": 29,
        "name": "Ichimoku Cloud",
        "slug": "ichimoku-cloud",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Ichimoku Kinko Hyo is a comprehensive system that defines support/resistance, trend direction, momentum, and entry signals all in one chart view using five calculated lines.",
        "indicators": ["Tenkan/Kijun cross", "Cloud (Kumo)", "Chikou Span", "Kumo breakout"],
        "risk_management": "Wait for price to confirm cloud breakout. Use multiple timeframe alignment.",
        "family": "Trend/Momentum",
        "steps": [
            "Apply the full Ichimoku indicator to the chart (all five lines).",
            "Determine trend direction: price above cloud is bullish, below is bearish.",
            "Watch for Tenkan-Sen (conversion) and Kijun-Sen (base) line crosses.",
            "Use the cloud (Kumo) thickness as a measure of support/resistance strength.",
            "Confirm signals with the Chikou Span (lagging line) position relative to price.",
            "Enter only when multiple Ichimoku elements align in the same direction."
        ],
        "quiz_questions": [
            {
                "question": "What does price positioning relative to the Ichimoku cloud indicate?",
                "options": ["Above cloud = bullish, below cloud = bearish", "Inside cloud = strong trend", "Cloud color determines entry direction", "Position has no significance"],
                "correct_index": 0,
                "explanation": "Price above the cloud indicates a bullish trend with the cloud acting as support, while price below the cloud indicates a bearish trend with the cloud acting as resistance."
            },
            {
                "question": "What is the Chikou Span in Ichimoku analysis?",
                "options": ["The leading indicator line", "Current price plotted 26 periods back to confirm signals", "The cloud boundary line", "A moving average crossover signal"],
                "correct_index": 1,
                "explanation": "The Chikou Span is the current closing price plotted 26 periods backward, used to confirm signals by checking whether current price is above or below past price."
            },
            {
                "question": "What does cloud thickness represent in Ichimoku?",
                "options": ["A measure of time remaining in the trend", "The strength of support/resistance at that level", "Volume at the projected price level", "Momentum of the current move"],
                "correct_index": 1,
                "explanation": "Cloud thickness represents the strength of support/resistance. A thicker cloud indicates stronger support/resistance, making it harder for price to break through."
            }
        ]
    },
    {
        "id": 30,
        "name": "Harmonic Patterns",
        "slug": "harmonic-patterns",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Trade geometric price patterns based on precise Fibonacci ratios like Gartley, Butterfly, Bat, Crab, and Cypher patterns to identify high-probability reversal zones.",
        "indicators": ["Gartley", "Butterfly", "Bat", "Crab", "Cypher"],
        "risk_management": "Strict Fibonacci precision required. Wait for pattern completion confirmation.",
        "family": "Pattern-Based",
        "steps": [
            "Learn the specific Fibonacci ratios for each harmonic pattern type.",
            "Identify X, A, B, C, and D points based on swing highs and lows.",
            "Measure Fibonacci retracements and extensions between points.",
            "Confirm the pattern matches the required precision ratios.",
            "Enter trades at the Potential Reversal Zone (PRZ) at point D.",
            "Place stops beyond point X with targets at the 38.2% and 61.8% extensions."
        ],
        "quiz_questions": [
            {
                "question": "What makes harmonic patterns different from other chart patterns?",
                "options": ["They use volume instead of price", "They require precise Fibonacci ratio measurements", "They only work on daily timeframes", "They predict exact price targets"],
                "correct_index": 1,
                "explanation": "Harmonic patterns require precise Fibonacci ratio measurements between specific swing points, making them more objective and mathematically defined than traditional chart patterns."
            },
            {
                "question": "What is the 'Potential Reversal Zone' (PRZ) in harmonic trading?",
                "options": ["Any area where price reverses", "The confluence area at point D where multiple Fibonacci levels align", "The zone between support and resistance", "A volatility zone identified by Bollinger Bands"],
                "correct_index": 1,
                "explanation": "The PRZ is the confluence area at point D where multiple Fibonacci retracement and extension levels align, creating a high-probability zone for price to reverse."
            },
            {
                "question": "Why is precision critical in harmonic pattern trading?",
                "options": ["Imprecise patterns are not patterns at all", "Even small ratio deviations significantly change the pattern's reliability", "Precision is only needed for the Gartley pattern", "Software requires exact numbers"],
                "correct_index": 1,
                "explanation": "Harmonic patterns are mathematically defined. Even small deviations from the required Fibonacci ratios can invalidate the pattern and significantly reduce its reliability."
            }
        ]
    },
    {
        "id": 31,
        "name": "Fair Value Gaps",
        "slug": "fair-value-gaps",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade imbalances between adjacent candle bodies where price is likely to return for filling. FVGs represent inefficient price delivery that the market seeks to rebalance.",
        "indicators": ["FVG identification", "Mitigation blocks", "Displacement candles", "Premium/discount zones"],
        "risk_management": "Wait for FVG to be tested. Trade in trend direction. Stop beyond FVG boundary.",
        "family": "SMC/ICT",
        "steps": [
            "Identify displacement candles with large bodies and small wicks.",
            "Mark the gap between the first candle's high/low and third candle's low/high.",
            "Classify FVGs as bullish (below price) or bearish (above price).",
            "Wait for price to retrace into the FVG for a potential entry.",
            "Enter in the direction of the original displacement candle.",
            "Place stops beyond the FVG boundary with a small buffer."
        ],
        "quiz_questions": [
            {
                "question": "What creates a Fair Value Gap?",
                "options": ["Two consecutive candles overlapping completely", "A three-candle sequence where the first and third candles leave a gap", "News events causing price gaps at open", "When volume drops to zero"],
                "correct_index": 1,
                "explanation": "An FVG is created in a three-candle sequence when the first candle's high/low does not overlap with the third candle's low/high, leaving an imbalance zone between them."
            },
            {
                "question": "Why do Fair Value Gaps tend to get filled?",
                "options": ["Market makers force price back", "They represent inefficient price areas the market seeks to rebalance", "Algorithmic trading fills all gaps automatically", "It is a self-fulfilling prophecy with no real cause"],
                "correct_index": 1,
                "explanation": "FVGs represent areas where price moved too quickly in one direction without fair two-sided trading. The market tends to revisit these areas to rebalance price efficiently."
            },
            {
                "question": "When is the best time to enter a trade at an FVG?",
                "options": ["Immediately when the gap forms", "When price retraces back to test the FVG in trend direction", "After the FVG has been fully filled", "Only at market open"],
                "correct_index": 1,
                "explanation": "The optimal entry is when price retraces to test the FVG in the direction of the underlying trend, providing confirmation that the zone is acting as support or resistance."
            }
        ]
    },
    {
        "id": 32,
        "name": "Order Blocks",
        "slug": "order-blocks",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Trade from institutional order blocks, the last opposing candle before a significant move. These zones represent where large players stacked orders before driving price.",
        "indicators": ["Bullish/bearish OBs", "Breaker blocks", "Mitigation zones", "Smart money levels"],
        "risk_management": "Only trade tested order blocks. Combine with market structure. Tight stop beyond block.",
        "family": "SMC/ICT",
        "steps": [
            "Identify the last opposing candle before a strong displacement move.",
            "Mark the full range of the order block candle as the trading zone.",
            "Classify blocks as bullish (last bearish candle before rally) or bearish.",
            "Wait for price to return to the order block for mitigation.",
            "Enter trades when price taps the OB with confirmation signals.",
            "Place tight stops just beyond the order block boundary."
        ],
        "quiz_questions": [
            {
                "question": "What defines a bullish order block?",
                "options": ["Any bullish candle in an uptrend", "The last bearish candle before a strong upward displacement", "A candle with the highest volume", "The candle at the market low"],
                "correct_index": 1,
                "explanation": "A bullish order block is the last bearish (down) candle before a strong upward displacement move, representing where institutional buyers placed their orders before driving price higher."
            },
            {
                "question": "Why do price return to order blocks?",
                "options": ["Random chance", "Institutions need to mitigate remaining positions at their original entry levels", "Order blocks act as magnets only", "Market makers manipulate price"],
                "correct_index": 1,
                "explanation": "Price returns to order blocks because institutions often have remaining unfilled positions at their original entry levels and need to mitigate (close or add to) these positions."
            },
            {
                "question": "What makes an order block more reliable?",
                "options": ["It is the smallest candle on the chart", "It caused a structural break with strong displacement", "It was tested multiple times already", "It occurred during low volume hours"],
                "correct_index": 1,
                "explanation": "An order block that caused a market structure break with strong displacement is more reliable, as it demonstrates that significant institutional activity drove a meaningful move."
            }
        ]
    },
    {
        "id": 33,
        "name": "Liquidity Sweeps",
        "slug": "liquidity-sweeps",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Trade after price sweeps liquidity pools (stop losses) and reverses, revealing institutional intent to move price in the opposite direction.",
        "indicators": ["Liquidity pools", "Equal highs/lows", "Stop runs", "Turtle soup"],
        "risk_management": "Wait for sweep plus reversal confirmation. Do not trade before the sweep completes.",
        "family": "SMC/ICT",
        "steps": [
            "Identify liquidity pools at equal highs, equal lows, and obvious swing points.",
            "Watch for price to sweep through these levels rapidly.",
            "Confirm the sweep is not a genuine breakout by checking reversal price action.",
            "Look for displacement in the opposite direction after the sweep.",
            "Enter on the reversal following the completed sweep.",
            "Place stops beyond the sweep extreme with confirmation of reversal."
        ],
        "quiz_questions": [
            {
                "question": "What is a liquidity sweep?",
                "options": ["A gradual accumulation of positions", "Price briefly crossing a level to trigger stop losses before reversing", "A high-volume breakout that continues", "Central bank intervention"],
                "correct_index": 1,
                "explanation": "A liquidity sweep occurs when price briefly crosses a key level (equal highs/lows) to trigger stop losses and liquidity, then reverses direction, revealing institutional market manipulation."
            },
            {
                "question": "Why do institutions sweep liquidity?",
                "options": ["To create chart patterns", "To access the liquidity needed for their large positions", "To manipulate indicators", "To confuse retail traders for fun"],
                "correct_index": 1,
                "explanation": "Institutions sweep liquidity because they need the large volume of orders at stop-loss levels to fill their own substantial positions without significantly moving price against themselves."
            },
            {
                "question": "What confirms a liquidity sweep is complete?",
                "options": ["Price staying beyond the level", "A reversal candle with displacement in the opposite direction", "Volume dropping to zero", "The RSI reaching extreme levels"],
                "correct_index": 1,
                "explanation": "A completed liquidity sweep is confirmed when price reverses sharply with displacement in the opposite direction, indicating that the stop-loss hunting was successful and the real move begins."
            }
        ]
    },
    {
        "id": 34,
        "name": "Change of Character",
        "slug": "change-of-character",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Identify when the market's underlying character changes from bullish to bearish or vice versa through structural breaks in the expected price pattern.",
        "indicators": ["Market structure shift", "CHOCH", "Trend reversal", "Higher timeframe alignment"],
        "risk_management": "Confirm with multiple signals. Wait for break and retest. Align with higher timeframe.",
        "family": "SMC/ICT",
        "steps": [
            "Establish the current market structure (bullish HH/HL or bearish LH/LL).",
            "Watch for the first break of the structure that defines the character change.",
            "Confirm the CHOCH with a strong displacement candle.",
            "Wait for a retest of the broken structure level.",
            "Enter on the retest with a stop beyond the CHOCH swing point.",
            "Align the CHOCH with higher timeframe analysis for confirmation."
        ],
        "quiz_questions": [
            {
                "question": "What is a Change of Character (CHOCH)?",
                "options": ["A change in market news sentiment", "The first structural break that signals a potential trend reversal", "A volatility spike", "A shift in trading session"],
                "correct_index": 1,
                "explanation": "CHOCH is the first break of market structure that signals the underlying market character may be changing from bullish to bearish or vice versa."
            },
            {
                "question": "How does CHOCH differ from a regular Break of Structure (BOS)?",
                "options": ["CHOCH signals reversal while BOS signals continuation", "They are the same thing", "CHOCH only occurs on daily timeframes", "BOS is more significant than CHOCH"],
                "correct_index": 0,
                "explanation": "A BOS confirms trend continuation in the current direction, while a CHOCH is the first structural break against the current trend, signaling a potential reversal."
            },
            {
                "question": "Why align CHOCH with higher timeframe analysis?",
                "options": ["Lower timeframe CHOCH is always wrong", "Higher timeframe alignment increases the probability of successful reversal", "CHOCH cannot be identified without higher timeframes", "It eliminates the need for stop losses"],
                "correct_index": 1,
                "explanation": "Aligning CHOCH signals with higher timeframe analysis increases reliability, as reversals that align with the higher timeframe context have a much higher probability of success."
            }
        ]
    },
    {
        "id": 35,
        "name": "Break of Structure",
        "slug": "break-of-structure",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade the break of key market structure levels as signals of trend continuation or reversal, focusing on confirmed breaks rather than wick-throughs.",
        "indicators": ["BOS", "Structural levels", "Trend continuation", "Break confirmation"],
        "risk_management": "Wait for candle close beyond structure. Retest as entry. Stop inside structure.",
        "family": "SMC/ICT",
        "steps": [
            "Identify key structural levels (previous swing highs in uptrend, swing lows in downtrend).",
            "Wait for a confirmed close beyond the structural level.",
            "Distinguish between a true BOS (close beyond) and false break (wick only).",
            "Enter on the retest of the broken structure level.",
            "Place stops on the inside of the broken structure.",
            "Scale out at the next major structural target level."
        ],
        "quiz_questions": [
            {
                "question": "What constitutes a confirmed Break of Structure?",
                "options": ["Price wicks beyond the level", "A candle body closes beyond the structural level", "Volume increases at the level", "Multiple indicators confirm"],
                "correct_index": 1,
                "explanation": "A confirmed BOS requires a candle body to close beyond the structural level, not just a wick. Wick-throughs often represent false breaks that reverse quickly."
            },
            {
                "question": "What does a BOS in the direction of an uptrend signal?",
                "options": ["Trend reversal is imminent", "Trend continuation with a new higher high", "The market will consolidate", "Volume will decrease"],
                "correct_index": 1,
                "explanation": "A BOS in an uptrend (breaking a previous swing high) signals that the uptrend is continuing with renewed buying pressure creating a new higher high."
            },
            {
                "question": "Why use the retest of a broken structure for entries?",
                "options": ["It provides better risk-reward by offering a tighter stop placement", "Retests always reverse", "It increases the number of trades", "It eliminates false breaks completely"],
                "correct_index": 0,
                "explanation": "Entering on the retest of a broken structure provides better risk-reward because you can place your stop just inside the broken level, offering a tighter, more logical stop placement."
            }
        ]
    },
    {
        "id": 36,
        "name": "Gap Trading",
        "slug": "gap-trading",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade opening gaps and intraday gaps as signals of strong directional movement. Different gap types (common, breakaway, runaway, exhaustion) have different implications.",
        "indicators": ["Opening gaps", "Common vs breakaway", "Gap fill probability", "Volume confirmation"],
        "risk_management": "Gap trades are time-sensitive. Cut quickly if gap fills against you.",
        "family": "Event-Driven",
        "steps": [
            "Identify the type of gap (opening, common, breakaway, runaway, exhaustion).",
            "Measure the gap size and compare to average daily range.",
            "Confirm breakaway gaps with increasing volume.",
            "Trade in the gap direction for breakaway/runaway gaps.",
            "Trade gap fills for common gaps using reversal tactics.",
            "Set tight time stops as gap trades lose relevance after the first session."
        ],
        "quiz_questions": [
            {
                "question": "What distinguishes a breakaway gap from a common gap?",
                "options": ["Breakaway gaps are smaller", "Breakaway gaps occur at key levels with trend-changing implications", "Common gaps never fill", "Breakaway gaps only occur in crypto"],
                "correct_index": 1,
                "explanation": "Breakaway gaps occur at important price levels (support/resistance breaks) and signal the potential start of a new trend, while common gaps are smaller and occur within trading ranges."
            },
            {
                "question": "Why is volume critical when trading gaps?",
                "options": ["It confirms the gap has institutional participation", "Volume is irrelevant for gap analysis", "High volume guarantees the gap will fill", "Low volume indicates a strong gap"],
                "correct_index": 0,
                "explanation": "Volume confirms whether a gap has genuine institutional interest behind it. High-volume gaps are more likely to sustain their direction than low_volume gaps."
            },
            {
                "question": "Why are gap trades time-sensitive?",
                "options": ["Gaps must be traded within minutes", "The directional momentum from gaps diminishes as the session progresses", "Gap fills have expiration dates", "News that caused the gap is forgotten"],
                "correct_index": 1,
                "explanation": "The directional momentum created by a gap typically diminishes as the trading session progresses. Late entries miss the strongest move and increase the risk of a gap fill against the position."
            }
        ]
    },
    {
        "id": 37,
        "name": "News Trading",
        "slug": "news-trading",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Trade high-impact economic news events and their immediate market reactions, capitalizing on the sharp moves that follow data releases like NFP, CPI, and rate decisions.",
        "indicators": ["Economic calendar", "NFP", "CPI", "Rate decisions", "Market reaction speed"],
        "risk_management": "Widen stops for volatility. Only trade liquid instruments. Be selective about events.",
        "family": "Event-Driven",
        "steps": [
            "Review the economic calendar for high-impact events during your session.",
            "Assess market consensus expectations versus potential surprises.",
            "Reduce position size to account for extreme spike volatility.",
            "Widen stops beyond normal volatility to avoid premature stop-outs.",
            "Enter after the initial spike settles and direction is clear.",
            "Exit quickly when the initial move momentum begins to fade."
        ],
        "quiz_questions": [
            {
                "question": "What is the biggest risk when trading news events?",
                "options": ["Missing the move entirely", "Extreme volatility causing slippage and widened spreads", "News events are always wrong", "Liquidity is always too high"],
                "correct_index": 1,
                "explanation": "Extreme volatility during news releases can cause severe slippage, widened spreads, and rapid price spikes that can exit positions at unfavorable levels."
            },
            {
                "question": "Why is it important to know market consensus before a news release?",
                "options": ["The market moves based on the surprise relative to consensus", "Consensus is always correct", "It eliminates trading risk", "Consensus determines position size"],
                "correct_index": 0,
                "explanation": "Markets price in expected outcomes before the release. The actual price move depends on the deviation from consensus, not the absolute number released."
            },
            {
                "question": "Why enter after the initial spike rather than during it?",
                "options": ["Initial spikes have no volume", "The initial spike often whipsaws; waiting for clarity improves entries", "It gives time to increase leverage", "News moves are always over immediately"],
                "correct_index": 1,
                "explanation": "The initial spike after news often whipsaws both directions as algos react and spreads widen. Waiting for the dust to settle provides clearer direction and better entries."
            }
        ]
    },
    {
        "id": 38,
        "name": "Volatility Trading",
        "slug": "volatility-trading",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Trade changes in implied and realized volatility, profiting from volatility expansion and contraction cycles while recognizing that volatility itself tends to mean-revert.",
        "indicators": ["ATR", "Historical volatility", "Implied volatility", "Volatility regime"],
        "risk_management": "Volatility is mean-reverting. Avoid trading during regime changes. Use options for protection.",
        "family": "Institutional",
        "steps": [
            "Measure current realized (historical) volatility using ATR and standard deviation.",
            "Compare realized volatility to implied volatility (where available).",
            "Identify the current volatility regime (low, normal, high).",
            "Trade volatility expansion during low-vol regimes and contraction during high-vol.",
            "Use volatility-based position sizing (smaller positions in high vol).",
            "Recognize mean-reversion characteristics and trade accordingly."
        ],
        "quiz_questions": [
            {
                "question": "What does ATR (Average True Range) measure?",
                "options": ["Trend direction", "Average price movement range regardless of direction", "Trading volume", "Market sentiment"],
                "correct_index": 1,
                "explanation": "ATR measures the average price movement range over a specified period, capturing volatility regardless of whether the market is moving up or down."
            },
            {
                "question": "What is the key characteristic of volatility?",
                "options": ["It always trends upward", "It is mean-reverting, returning to average levels over time", "It is constant across all instruments", "It only changes during news events"],
                "correct_index": 1,
                "explanation": "Volatility is mean-reverting by nature. Periods of high volatility tend to be followed by lower volatility, and vice versa, making it predictable in its cyclical behavior."
            },
            {
                "question": "Why avoid trading during volatility regime changes?",
                "options": ["Markets halt during regime changes", "Regime transitions create unpredictable conditions where both strategies and indicators can fail", "Spreads remain tight", "Regime changes are always profitable"],
                "correct_index": 1,
                "explanation": "During volatility regime transitions, the market character shifts unpredictably, making it difficult to determine which strategy to apply and increasing the risk of both trend and range strategies failing."
            }
        ]
    },
    {
        "id": 39,
        "name": "Grid Trading",
        "slug": "grid-trading",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Place buy and sell orders at fixed intervals creating a grid that profits from price oscillations without needing to predict market direction.",
        "indicators": ["Grid spacing", "Order placement", "Take profit levels", "Maximum drawdown"],
        "risk_management": "Set maximum grid size to limit downside. Only use in ranging markets.",
        "family": "Systematic/Passive",
        "steps": [
            "Define the upper and lower bounds of your grid range.",
            "Set evenly spaced price levels within the range for orders.",
            "Place alternating buy and sell limit orders at each grid level.",
            "Set take-profit target at the next grid level for each position.",
            "Monitor total exposure and maximum drawdown within the grid.",
            "Stop adding grid levels if price breaks decisively beyond the range."
        ],
        "quiz_questions": [
            {
                "question": "What is the primary weakness of grid trading?",
                "options": ["It requires constant monitoring", "Strong trending markets cause unlimited drawdown beyond the grid", "Grid trading has no profit potential", "It only works on daily timeframes"],
                "correct_index": 1,
                "explanation": "Grid trading's primary weakness is that a strong trending move beyond the grid range can lead to significant and potentially unlimited drawdown as accumulating positions go against you."
            },
            {
                "question": "In what market conditions does grid trading perform best?",
                "options": ["Strong trending markets", "Ranging, oscillating markets", "Gap-opening markets", "Low-liquidity markets"],
                "correct_index": 1,
                "explanation": "Grid trading performs best in ranging markets where price oscillates between established levels, allowing the grid orders to capture profit from the repeated movements."
            },
            {
                "question": "Why set a maximum grid size?",
                "options": ["To cap the total capital exposure and limit potential downside", "To make the grid visually clean", "Grid size has no impact on risk", "To comply with exchange rules"],
                "correct_index": 0,
                "explanation": "Setting a maximum grid size limits total capital at risk and prevents unlimited drawdown if price trends significantly against all accumulated grid positions."
            }
        ]
    },
    {
        "id": 40,
        "name": "Dollar Cost Averaging",
        "slug": "dca",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "beginner",
        "concept": "Dollar Cost Averaging involves investing fixed amounts at regular intervals regardless of price, reducing the impact of volatility and emotional decision-making.",
        "indicators": ["Fixed intervals", "Price averaging", "Long-term accumulation", "Position sizing"],
        "risk_management": "Avoid emotional timing. Consistent schedule beats market timing. Long-term horizon.",
        "family": "Systematic/Passive",
        "steps": [
            "Determine a fixed amount to invest at regular intervals.",
            "Set up automatic purchases at consistent intervals (weekly, monthly).",
            "Maintain the schedule regardless of market price or news.",
            "Track average entry price and total accumulated position.",
            "Avoid adjusting the schedule based on emotional reactions.",
            "Review and adjust the strategy only during planned periodic reviews."
        ],
        "quiz_questions": [
            {
                "question": "What is the primary benefit of Dollar Cost Averaging?",
                "options": ["It guarantees the best average price", "It removes emotional timing decisions and reduces volatility impact", "It always produces higher returns than lump-sum investing", "It eliminates all market risk"],
                "correct_index": 1,
                "explanation": "DCA removes the emotional challenge of timing markets and reduces the impact of volatility by automatically buying more units when prices are low and fewer when prices are high."
            },
            {
                "question": "Why should you avoid changing your DCA schedule based on market news?",
                "options": ["News is always wrong", "Emotional adjustments defeat the systematic advantage of DCA", "It violates exchange rules", "DCA only works on weekdays"],
                "correct_index": 1,
                "explanation": "Adjusting your DCA schedule based on news or emotions defeats the core advantage of the strategy, which is removing emotional decision-making and maintaining discipline through all market conditions."
            },
            {
                "question": "When is DCA most effective?",
                "options": ["During strong bullish trends only", "During volatile or declining markets where averaging reduces cost basis", "When markets are at all-time highs", "Only during quarterly rebalancing"],
                "correct_index": 1,
                "explanation": "DCA is most effective in volatile or declining markets because the regular purchases buy more units at lower prices, reducing the average cost basis over time."
            }
        ]
    },
    {
        "id": 41,
        "name": "Seasonality Trading",
        "slug": "seasonality",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade recurring calendar-based patterns like the January Effect, Sell in May, quarterly rebalancing flows, and crypto halving cycles that historically show predictable market behavior.",
        "indicators": ["Calendar effects", "Monthly patterns", "Crypto halving", "Quarterly rebalancing"],
        "risk_management": "Past seasonality does not guarantee future results. Combine with other confirmations. Use small position sizes.",
        "family": "Event-Driven",
        "steps": [
            "Research historical seasonal patterns for your chosen market.",
            "Identify calendar periods with statistically significant tendencies.",
            "Combine seasonal signals with technical analysis confirmation.",
            "Enter small positions before the expected seasonal move begins.",
            "Set stops at logical levels independent of the seasonal thesis.",
            "Exit when the seasonal window closes or the pattern fails to materialize."
        ],
        "quiz_questions": [
            {
                "question": "What is the 'January Effect' in equity markets?",
                "options": ["Markets always crash in January", "Small-cap stocks historically outperform in January", "Volatility spikes in January", "Trading volume is highest in January"],
                "correct_index": 1,
                "explanation": "The January Effect is a historical pattern where small-cap stocks tend to outperform large-caps in January, partly due to tax-loss harvesting reversals from December."
            },
            {
                "question": "Why should seasonality be combined with other confirmations?",
                "options": ["Seasonality alone has low predictive power and can be overridden by other factors", "Technical analysis is always more reliable", "Seasonality works only on weekends", "It increases transaction costs"],
                "correct_index": 0,
                "explanation": "Seasonality is a statistical tendency, not a guarantee. Combining it with technical and fundamental confirmation increases the overall probability of trade success."
            },
            {
                "question": "What drives crypto halving cycle seasonality?",
                "options": ["Seasonal weather patterns", "Reduced new supply (block reward cut) historically preceding bull markets", "Central bank policies", "Quarterly tax reporting"],
                "correct_index": 1,
                "explanation": "Crypto halving cycles reduce the rate of new supply entering the market by cutting block rewards, and historically this supply reduction has preceded significant bull market phases."
            }
        ]
    },
    {
        "id": 42,
        "name": "Sentiment Contrarian Trading",
        "slug": "sentiment-contrarian",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "intermediate",
        "concept": "Trade against extreme market sentiment by identifying overbought and oversold extremes through fear/greed indices, positioning data, and crowd sentiment indicators.",
        "indicators": ["Fear/Greed Index", "Put/call ratio", "Positioning extremes", "Crowd sentiment data"],
        "risk_management": "Wait for sentiment extremes. Do not fight strong trends. Combine with technical confirmations.",
        "family": "Mean Reversion",
        "steps": [
            "Monitor sentiment indicators (Fear/Greed, put/call, positioning reports).",
            "Identify extreme readings where sentiment is one-sided.",
            "Confirm extreme sentiment with technical overbought/oversold levels.",
            "Wait for price action confirmation that sentiment is shifting.",
            "Enter contrarian positions with tight stops beyond recent extremes.",
            "Exit when sentiment reverts to neutral levels."
        ],
        "quiz_questions": [
            {
                "question": "What does extreme fear in market sentiment suggest for a contrarian trader?",
                "options": ["Continue selling aggressively", "A potential buying opportunity as the market may be oversold", "Fear always leads to more fear", "Close all positions immediately"],
                "correct_index": 1,
                "explanation": "Extreme fear often coincides with oversold conditions where selling pressure has been exhausted, creating potential buying opportunities for contrarian traders."
            },
            {
                "question": "Why should you not fight strong trends even when sentiment is extreme?",
                "options": ["Trends can persist longer than sentiment extremes suggest", "Sentiment indicators are always wrong in trends", "It violates trading rules", "Trends never reverse"],
                "correct_index": 0,
                "explanation": "Markets can remain irrationally extreme for extended periods. Fighting a strong trend based solely on sentiment extremes is dangerous because the trend can continue much longer than expected."
            },
            {
                "question": "What does an extreme put/call ratio indicate?",
                "options": ["Equal bullish and bearish positioning", "One-sided positioning where contrarian reversal may be near", "Low market activity", "A guaranteed market direction"],
                "correct_index": 1,
                "explanation": "An extreme put/call ratio indicates one-sided positioning. When heavily skewed, it suggests crowded positioning that may be due for a contrarian reversal."
            }
        ]
    },
    {
        "id": 43,
        "name": "Market Making",
        "slug": "market-making",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Act as a liquidity provider by simultaneously placing bid and ask orders, profiting from the bid-ask spread while managing inventory risk through strict position limits.",
        "indicators": ["Bid-ask spread", "Order book depth", "Spread capture", "Inventory management"],
        "risk_management": "Requires low-latency infrastructure. Strict inventory limits. Tight risk management required at all times.",
        "family": "Institutional",
        "steps": [
            "Monitor the current bid-ask spread and order book depth.",
            "Place simultaneous buy and sell limit orders around the mid price.",
            "Capture the spread when both orders get filled.",
            "Monitor accumulated inventory and reduce directional exposure.",
            "Widen spreads during high volatility to protect against adverse moves.",
            "Immediately cut losing inventory positions that exceed risk limits."
        ],
        "quiz_questions": [
            {
                "question": "How does market making generate profit?",
                "options": ["By predicting price direction accurately", "By capturing the bid-ask spread between buy and sell orders", "By holding large directional positions", "Through arbitrage between exchanges"],
                "correct_index": 1,
                "explanation": "Market makers profit by capturing the bid-ask spread, the difference between the price at which they buy and the price at which they sell, across many repeated trades."
            },
            {
                "question": "What is the primary risk in market making?",
                "options": ["Spread narrowing to zero", "Adverse price moves creating large directional inventory exposure", "Low transaction costs", "Too many trades being executed"],
                "correct_index": 1,
                "explanation": "The primary risk is accumulating directional inventory that moves against the market maker. Unlike pure spread capture, inventory holds directional risk that can wipe out spread profits."
            },
            {
                "question": "Why widen spreads during high volatility?",
                "options": ["To discourage trading", "To protect against large adverse price moves between fills", "To comply with regulations", "High volatility means less volume"],
                "correct_index": 1,
                "explanation": "During high volatility, price can move significantly between order placement and fill, so widening spreads provides a larger buffer to protect against adverse directional moves."
            }
        ]
    },
    {
        "id": 44,
        "name": "Machine Learning and AI Trading",
        "slug": "ml-ai-driven",
        "market": ["Forex", "Equities", "Crypto"],
        "difficulty": "advanced",
        "concept": "Apply machine learning models including reinforcement learning and neural networks to identify trading patterns and generate signals from complex multi-dimensional data.",
        "indicators": ["Feature engineering", "Model selection", "Cross-validation", "Reinforcement learning"],
        "risk_management": "Overfitting is the biggest risk. Always out-of-sample test. Monitor model drift. Keep models simple.",
        "family": "Systematic/Passive",
        "steps": [
            "Engineer meaningful features from raw market data (technical, sentiment, macro).",
            "Select an appropriate ML model type for the trading objective.",
            "Split data into train, validation, and out-of-sample test sets.",
            "Train the model and validate against the validation set to detect overfitting.",
            "Test the model on unseen out-of-sample data before live deployment.",
            "Monitor model performance continuously for drift and retrain as needed."
        ],
        "quiz_questions": [
            {
                "question": "What is the biggest risk in ML-based trading systems?",
                "options": ["Model complexity being too low", "Overfitting to historical data that does not generalize to live markets", "Too few features in the model", "Lack of computing power"],
                "correct_index": 1,
                "explanation": "Overfitting is the biggest risk in ML trading because models can learn noise patterns from historical data that do not hold in live markets, leading to poor performance."
            },
            {
                "question": "Why is out-of-sample testing critical?",
                "options": ["It is a regulatory requirement", "It validates that the model generalizes to unseen market conditions", "Out-of-sample data is more accurate", "It eliminates the need for risk management"],
                "correct_index": 1,
                "explanation": "Out-of-sample testing uses data the model has never seen during training, validating that the model has learned genuine patterns rather than memorizing historical data."
            },
            {
                "question": "What is model drift in trading systems?",
                "options": ["The model code changing unexpectedly", "The statistical relationship between features and targets changing over time", "The model running too slowly", "Data collection errors"],
                "correct_index": 1,
                "explanation": "Model drift occurs when market conditions change so that the statistical relationships the model learned no longer hold, causing degraded performance that requires detection and model retraining."
            }
        ]
    },
]


def main():
    file_path = r"C:\claude\quantacademy\data\strategies.jsonl"

    # Verify file exists
    if not os.path.exists(file_path):
        print(f"ERROR: File not found: {file_path}")
        return

    # Count existing entries
    with open(file_path, "r", encoding="utf-8") as f:
        existing_lines = f.readlines()
    existing_count = len(existing_lines)
    print(f"Existing entries in file: {existing_count}")

    # Validate existing entries
    valid_existing = 0
    for i, line in enumerate(existing_lines, 1):
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
            valid_existing += 1
        except json.JSONDecodeError as e:
            print(f"WARNING: Invalid JSON on line {i}: {e}")
    print(f"Valid existing entries: {valid_existing}")

    # Append new strategies
    with open(file_path, "a", encoding="utf-8") as f:
        for strategy in STRATEGIES:
            line = json.dumps(strategy, ensure_ascii=False)
            f.write(line + "\n")

    print(f"Appended {len(STRATEGIES)} new strategies.")

    # Verify total
    with open(file_path, "r", encoding="utf-8") as f:
        all_lines = f.readlines()

    total_valid = 0
    for i, line in enumerate(all_lines, 1):
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
            total_valid += 1
        except json.JSONDecodeError as e:
            print(f"WARNING: Invalid JSON on line {i}: {e}")

    print(f"Total valid entries in file after append: {total_valid}")
    if total_valid != 44:
        print(f"WARNING: Expected 44 total entries, got {total_valid}")
    else:
        print("SUCCESS: File has exactly 44 valid entries.")

    # Print summary of appended strategies
    print("\nAppended strategies:")
    for s in STRATEGIES:
        print(f"  ID {s['id']:2d}: {s['slug']} ({s['family']}, {s['difficulty']})")


if __name__ == "__main__":
    main()

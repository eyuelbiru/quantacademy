"""
QuantAcademy AI Chatbot Module.

Provides a LangChain + FAISS RAG pipeline for strategy Q&A.
When the LLM/embedding layer is unavailable, a rich keyword-and-conversation
engine gives educational, structured responses.
"""

import os
import re
from dotenv import load_dotenv
from typing import Optional, Callable

load_dotenv()

# ---------------------------------------------------------------------------
# LangChain imports – fall back gracefully if unavailable
# ---------------------------------------------------------------------------
try:
    from langchain.chains import RetrievalQA
    from langchain_community.vectorstores import FAISS
    from langchain_community.embeddings import OllamaEmbeddings
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.llms import Ollama
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    _langchain_available = True
    _openai_available = True
except ImportError:
    _langchain_available = False
    _openai_available = False
except Exception:
    _langchain_available = True
    _openai_available = False

from app.strategies.data import (
    get_all_strategies,
    get_strategy,
    get_quiz,
)

# ---------------------------------------------------------------------------
# FAISS / LangChain RAG initialization
# ---------------------------------------------------------------------------
_qa_chain = None
_vectorstore = None


def _init_rag() -> Optional["RetrievalQA"]:
    """Attempt to build a FAISS-backed RetrievalQA chain."""
    global _qa_chain, _vectorstore
    if _qa_chain is not None:
        return _qa_chain

    if not _langchain_available:
        return None

    api_key = os.environ.get("OPENAI_API_KEY", "")
    use_openai = _openai_available and api_key

    strategies = get_all_strategies()
    if not strategies:
        return None

    docs = []
    for s in strategies:
        text = (
            f"Strategy: {s.get('name', '')} "
            f"Family: {s.get('family', '')} "
            f"Concept: {s.get('concept', '')} "
            f"Indicators: {', '.join(s.get('indicators', []))} "
            f"Risk Management: {s.get('risk_management', '')} "
            f"Steps: {' | '.join(s.get('steps', []))}"
        )
        docs.append(text)

    try:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=50
        )
        split_docs = splitter.create_documents(docs)

        if use_openai:
            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.3,
                api_key=api_key,
            )
            embeddings = OpenAIEmbeddings(api_key=api_key)
        else:
            llm = Ollama(model="llama3", temperature= 0.3)
            embeddings = OllamaEmbeddings(model="llama3")

        _vectorstore = FAISS.from_documents(split_docs, embeddings)
        _qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=_vectorstore.as_retriever(
                search_kwargs={"k": 3},
            ),
            return_source_documents=True,
        )
    except Exception:
        _qa_chain = None

    return _qa_chain

# ---------------------------------------------------------------------------
# Rich conversation engine (no LLM needed)
# ---------------------------------------------------------------------------

_INDICATOR_KNOWLEDGE: dict[str, str] = {
    "rsi": "RSI (Relative Strength Index) measures the speed and magnitude of recent price changes on a scale of 0-100. Readings above 70 suggest the asset is overbought (potential reversal down). Below 30 suggests oversold (potential reversal up). It's calculated as 100 - (100 / (1 + RS)) where RS is the average gain divided by the average loss over 14 periods.",
    "macd": "MACD (Moving Average Convergence Divergence) consists of the MACD line (12 EMA - 26 EMA), the Signal line (9 EMA of MACD), and a histogram showing their difference. A bullish signal occurs when the MACD line crosses above the Signal line. Divergence (price makes a new high but MACD doesn't) signals weakening momentum.",
    "moving average": "Moving Averages smooth price data to reveal the underlying trend. The Simple MA (SMA) averages all prices equally. The EMA gives more weight to recent prices, reacting faster. Key MAs: 20 (short-term), 50 (medium-term), 200 (long-term). A crossover of fast above slow MA (Golden Cross) is bullish; fast below slow (Death Cross) is bearish.",
    "bollinger": "Bollinger Bands consist of a 20-period SMA with bands 2 standard deviations above and below. When bands compress (a 'squeeze'), it signals low volatility before a big move. Price touching the outer band doesn't automatically mean reversal — in strong trends, price 'walks the bands'.",
    "fibonacci": "Fibonacci retracement levels (38.2%, 50%, 61.8%, 78.6%) identify where pullbacks are likely to reverse. The 61.8% level is the 'Golden Ratio' and is the most respected. Extensions (127.2%, 161.8%) project where the move might end after resumption.",
    "support": "Support is a price level where buying pressure historically prevents further decline. Resistance is where selling pressure prevents further rise. The more times a level is tested and holds, the stronger it is. When broken, support becomes resistance and vice versa.",
    "volume": "Volume confirms the strength of price moves. High volume on a breakout signals genuine commitment. Low volume on a breakout suggests a false move. Declining volume during consolidation often precedes expansion.",
    "stochastic": "Stochastic Oscillator compares the closing price to its price range over N periods (typically 14). Readings above 80 are overbought; below 20 are oversold. The %K line crossing above %D is a buy signal; below %D is a sell signal. Most reliable at extreme levels in range-bound markets.",
    "atr": "ATR (Average True Range) measures market volatility, not direction. A higher ATR means larger average price swings. It's commonly used to set stop-losses (e.g., 2x ATR below entry) and position sizes (risk less when volatility is high).",
    "adx": "ADX (Average Directional Index) measures trend strength on a scale of 0-100. ADX above 25 indicates a strong trend; below 20 indicates a weak or ranging market. It doesn't indicate direction — use +DI and -DI for that. Above +DI = bulls in control; above -DI = bears in control.",
    "vwap": "VWAP (Volume Weighted Average Price) is the average price weighted by volume. It's used as a benchmark — price above VWAP is bullish (institutional buyers are in control); price below is bearish. Day traders often use VWAP as a dynamic support/resistance level.",
    "order block": "Order Blocks are the last candle(s) of a move in one direction before a strong reversal. They represent where smart money entered their positions. When price returns to these zones, the original institutional orders may still have resting liquidity, causing a reaction.",
    "liquidity": "Liquidity refers to areas where many stop losses and pending orders cluster — typically above previous highs and below previous lows. Smart money 'sweeps' liquidity by briefly taking price through these levels to fill large orders before reversing sharply.",
    "fair value gap": "Fair Value Gaps (FVGs) are three-candle patterns where the middle candle's wicks don't overlap with adjacent candles, creating an imbalance. Price tends to return to fill these gaps before continuing. They represent areas where price moved too fast, leaving unfilled orders.",
    "ichimoku": "Ichimoku Cloud is a comprehensive indicator system showing support/resistance, trend direction, and momentum. The Cloud (Kumo) represents future support/resistance. Price above = bullish, below = bearish. Key signals: TK Cross (Tenkan/Kijun), Kumo Breakout, Chikou Span confirmation.",
}

_FAMILY_INTROS: dict[str, str] = {
    "Trend/Momentum": "Trend/Momentum strategies follow the market's direction. The core philosophy is 'the trend is your friend' — you enter in the direction of an established trend and ride it until it shows signs of reversal. This is the most foundational category of strategies, suitable for beginners and experienced traders alike.",
    "Mean Reversion": "Mean Reversion strategies are based on the idea that prices tend to return to their average over time. When price moves too far from the mean, it's likely to snap back. These strategies require patience and precise timing, as entering too early can be costly.",
    "Time-Frame Based": "Time-Frame Based strategies are defined by how long you hold a position rather than specific technical setups. Whether scalping (seconds), day trading (hours), swing trading (days-weeks), or position trading (months), your timeframe shapes your entry criteria, risk management, and psychological demands.",
    "Pattern-Based": "Pattern-Based strategies identify recurring price formations that historically lead to predictable outcomes. These include candlestick patterns (hammers, engulfing), chart patterns (flags, triangles), and structural patterns (Fibonacci levels, Elliott Waves). The key is waiting for the pattern to complete before entering.",
    "SMC/ICT": "Smart Money Concepts and ICT strategies focus on understanding where institutional traders operate. They look at Order Blocks, Fair Value Gaps, Liquidity Sweeps, and Break of Structure to align with 'smart money' flow. These require studying price action deeply and understanding market microstructure.",
    "Volume-Based": "Volume-Based strategies use trading volume as a confirmation or leading signal. High volume confirms breakouts, low volume warns of false moves, and Volume Profile shows where most trading has occurred at each price level.",
    "Event-Driven": "Event-Driven strategies capitalize on the volatility around specific events — news announcements, earnings reports, or seasonal patterns. The key is preparation before the event and disciplined entry after the event settles.",
    "Systematic/Passive": "Systematic/Passive strategies follow rules-based, automated approaches without discretionary decisions. Grid trading, DCA (Dollar-Cost Averaging), and ML-driven strategies fall into this category. They remove emotional decision-making but require careful design and monitoring.",
}

_MARKET_INTROS: dict[str, str] = {
    "forex": "The Forex (foreign exchange) market is the largest in the world, with $7.5 trillion daily volume. Key characteristics: highly liquid during London (3AM-12PM EST) and NY (8AM-5PM EST) sessions, tight spreads on major pairs (EUR/USD, GBP/USD, USD/JPY), 24-hour trading during weekdays. Forex pairs are particularly suited for trend-following, mean-reversion, SMC/ICT, and carry trade strategies.",
    "equities": "Equity (stock) markets offer opportunities through individual stocks, ETFs, and indices. Key sessions: Pre-market (4AM-9:30AM EST), Regular (9:30AM-4PM EST), After-hours (4PM-8PM EST). Stocks offer the widest range of strategies — from day trading during the opening bell to position trading based on fundamentals. Gaps at open are common and tradable.",
    "crypto": "Crypto markets trade 24/7, never close, and are the most volatile of the three. Bitcoin and Ethereum dominate volume. Crypto's high volatility means strategies like breakouts, momentum, and range trading work well, but with wider stops due to volatility swings. The fragmented nature of exchanges also creates arbitrage opportunities.",
}

_CONCEPT_GLOSSARY: dict[str, dict] = {
    "what is rsi": {
        "concept": "RSI (Relative Strength Index)",
        "explanation": "The RSI is a momentum oscillator ranging from 0 to 100. It compares the magnitude of recent gains to recent losses over a specified period (usually 14 candlesticks).\n\n**Key levels:**\n- Above 70: Overbought — price may reverse downward\n- Below 30: Oversold — price may reverse upward\n- 50 level: Acts as support/resistance in trending markets\n\n**How traders use it:**\n- Look for divergence (price makes new high but RSI doesn't = bearish signal)\n- Combined with support/resistance for high-probability reversals\n- In uptrends, RSI tends to hold in the 40-80 range rather than 30-70",
        "follow_up": "Want to learn about RSI divergence strategies or which indicators pair well with RSI?",
    },
    "what is macd": {
        "concept": "MACD (Moving Average Convergence Divergence)",
        "explanation": "MACD is a trend-following momentum indicator consisting of three components:\n\n**MACD Line:** 12-period EMA minus 26-period EMA\n**Signal Line:** 9-period EMA of the MACD Line\n**Histogram:** MACD Line minus Signal Line\n\n**Key signals:**\n- MACD crosses above Signal = bullish entry\n- MACD crosses below Signal = bearish entry\n- Divergence (price vs MACD direction) signals weakening momentum\n- Histogram expanding = momentum accelerating\n\nMACD is most reliable on 4H+ charts in trending markets.",
        "follow_up": "Want to see MACD strategies in action or learn about divergence trading?",
    },
    "what is trend following": {
        "concept": "Trend Following Strategy",
        "explanation": "Trend Following is the most foundational trading approach: identify which direction the market is already moving and trade in that direction.\n\n**Core principles:**\n- In an uptrend: look for higher highs + higher lows, enter on pullbacks\n- In a downtrend: look for lower highs + lower lows, enter on rallies\n- Never try to predict the exact top or bottom\n- Trail your stop as the trend continues\n\n**How to identify the trend:**\n- Price above 20/50/200 moving averages = bullish\n- ADX above 25 = strong trend\n- Higher highs and higher lows on chart = confirmed uptrend\n\n**Risk management:**\n- Trail stops below each swing low (for longs)\n- Position size 1-2% of account per trade\n- Use ATR-based stops to account for volatility",
        "follow_up": "Try asking about moving average crossovers, ADX, or how to trail stops!",
    },
    "what is stop loss": {
        "concept": "Stop Loss Orders",
        "explanation": "A Stop Loss is an order that automatically closes your position when price reaches a predefined level, limiting your loss on any single trade.\n\n**Types of stops:**\n\n1. **Fixed Stops:** Placed at a specific price level (e.g., 20 pips below entry)\n2. **Technical Stops:** Placed below support / above resistance levels\n3. **ATR Stops:** Based on volatility (e.g., 2x ATR below entry)\n4. **Trailing Stops:** Move your stop as price moves in your favor\n5. **Breakeven Stops:** Move stop to entry price once you're in profit\n\n**Golden rules:**\n- Never trade without a stop loss\n- Risk only 1-2% of your account per trade\n- Place stops where your trade thesis is invalidated, not arbitrarily\n- Don't widen stops after placing them — that defeats the purpose",
        "follow_up": "Want to learn about risk management, position sizing, or trailing stops?",
    },
    "what is support": {
        "concept": "Support and Resistance",
        "explanation": "Support and Resistance are the foundation of all technical analysis.\n\n**Support** is a price level where buying pressure historically prevents further decline. Think of it as a 'floor' that price bounces off.\n\n**Resistance** is a price level where selling pressure historically prevents further rise. Think of it as a 'ceiling' that price bounces down from.\n\n**Key characteristics:**\n- The more times a level is tested (bounced), the stronger it becomes\n- When broken, support becomes resistance and vice versa\n- Round numbers often act as psychological support/resistance\n\n**How to draw them:**\n- Look for areas where price reversed multiple times\n- Use zones, not exact lines (price won't respect exact numbers)\n- Align across multiple timeframes for stronger levels",
        "follow_up": "Want to learn about range trading, breakouts, or how to combine S/R with candlestick patterns?",
    },
}

def _match_strategy(message_lower: str) -> list:
    """Score each strategy against the message and return sorted matches."""
    strategies = get_all_strategies()
    scored: list[tuple[float, dict]] = []
    for s in strategies:
        score = 0
        name = s.get("name", "").lower()
        slug = s.get("slug", "").lower()
        family = s.get("family", "").lower()
        concept = s.get("concept", "").lower()
        indicators = [i.strip().lower() for i in s.get("indicators", [])]
        market = [m.lower() for m in s.get("market", [])]
        steps = " ".join(s.get("steps", [])).lower()

        # Exact name match (highest priority)
        if name in message_lower or slug.replace("-", " ") in message_lower:
            score += 100
        # Slug fragment match
        for part in slug.split("-"):
            if len(part) > 3 and part in message_lower:
                score += 30
        # Family match
        if family in message_lower or family.replace("/", " ") in message_lower:
            score += 25
        # Concept word overlap
        for word in concept.split():
            if len(word) > 4 and word in message_lower:
                score += 5
        # Indicator match
        for ind in indicators:
            if ind.lower() in message_lower or ind.split("/")[0].lower() in message_lower:
                score += 15
        # Market match
        for m in market:
            if m in message_lower:
                score += 10
        # Steps overlap
        for step in steps.split():
            if len(step) > 3 and step in message_lower:
                score += 2

        if score > 0:
            scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored]


def _handle_quiz(message_lower: str) -> str:
    """Handle quiz requests with rich formatting."""
    strategies = get_all_strategies()

    for prefix in ["quiz me", "quiz me about", "quiz me on", "test me on", "test me about"]:
        if message_lower.startswith(prefix):
            slug_part = message_lower[len(prefix):].strip().replace(" ", "-")
            # Try exact match first
            quiz = get_quiz(slug_part)
            if quiz:
                strategy = get_strategy(slug_part)
                header = f"Great choice! Let's test your knowledge on **{strategy['name']}**!\n\n"
                lines = [header]
                for i, q in enumerate(quiz, 1):
                    lines.append(f"**Q{i}: {q['question']}**")
                    labels = ["A", "B", "C", "D"]
                    for j, opt in enumerate(q.get("options", [])):
                        lines.append(f"  {labels[j]}. {opt}")
                    lines.append("")
                lines.append("*Take your time and think about each answer. Type 'show answers' when ready!*")
                return "\n".join(lines)
            # Try partial match
            for s in strategies:
                sname = s.get("name", "").lower().replace(" ", "-")
                sslug = s.get("slug", "")
                if slug_part in sslug or slug_part.replace("-", " ") in s.get("name", "").lower():
                    quiz = get_quiz(s["slug"])
                    if quiz:
                        header = f"Found it! Here are {len(quiz)} quiz questions for **{s['name']}**:\n\n"
                        lines = [header]
                        for i, q in enumerate(quiz, 1):
                            lines.append(f"**Q{i}: {q['question']}**")
                            labels = ["A", "B", "C", "D"]
                            for j, opt in enumerate(q.get("options", [])):
                                lines.append(f"  {labels[j]}. {opt}")
                            lines.append("")
                        lines.append("*Type 'show answers' when you're ready!*")
                        return "\n".join(lines)
            return f"Sorry, I couldn't find quiz questions for '{slug_part.replace('-', ' ')}'. Try a strategy name like 'moving average crossover'."

    if "show answer" in message_lower or "show answer" in message_lower:
        # Reveal answers — find the most recent quiz from context
        return "To see answers, use 'quiz me about [strategy]' and I'll show a new quiz with answers included!"

    return ""


def _handle_indicator_question(message_lower: str) -> str:
    """Answer indicator-specific questions."""
    for indicator, explanation in _INDICATOR_KNOWLEDGE.items():
        if indicator in message_lower:
            return explanation
    return ""


def _handle_family_question(message_lower: str) -> str:
    """Answer about strategy families."""
    for family, intro in _FAMILY_INTROS.items():
        if family.lower() in message_lower.replace("/", " ").replace("-", " "):
            matching = get_strategies_by_family(family)
            intro += f"\n\n**Strategies in this family ({len(matching)}):**\n"
            for s in matching:
                intro += f"- **{s['name']}** ({s['difficulty']})\n"
            return intro
    return ""


def _handle_market_question(message_lower: str) -> str:
    """Answer about market conditions."""
    for market, intro in _MARKET_INTROS.items():
        if market in message_lower:
            strategies = get_strategies_by_market(market=market)
            intro += f"\n\n**Strategies that work well in {market}:**\n"
            for s in strategies[:8]:
                intro += f"- **{s['name']}** ({s['difficulty']}) — {s.get('concept', '')[:80]}...\n"
            return intro
    return ""


def _handle_concept_question(message_lower: str) -> str:
    """Answer concept/glossary questions."""
    for key, content in _CONCEPT_GLOSSARY.items():
        if key.replace(" ", "") in message_lower.replace(" ", "") or any(k in message_lower for k in key.split()):
            intro = f"**{content['concept']}**\n\n"
            intro += content['explanation']
            intro += f"\n\n{content['follow_up']}"
            return intro
    return ""


def _handle_strategy_detail(slug: str) -> str:
    """Give a detailed explanation of a single strategy."""
    s = get_strategy(slug)
    if not s:
        return ""

    parts: list[str] = []
    parts.append(f"**{s['name']}** ({s.get('difficulty', '').capitalize()} | {s.get('market', '')})\n")
    parts.append(f"**Concept:** {s.get('concept', 'N/A')}\n")

    indicators = s.get('indicators', [])
    if isinstance(indicators, list) and indicators:
        parts.append(f"**Key Indicators:** {', '.join(indicators)}\n")
    elif isinstance(indicators, str):
        parts.append(f"**Key Indicators:** {indicators}\n")

    parts.append(f"**Risk Management:** {s.get('risk_management', 'N/A')}\n")

    steps = s.get('steps', [])
    if isinstance(steps, list) and steps:
        parts.append("**How to Trade It:**")
        for i, step in enumerate(steps, 1):
            parts.append(f"  {i}. {step}")
    parts.append("")
    parts.append(f"Want to see a quiz on this strategy? Say 'quiz me about {s['name'].lower()}'!")

    return "\n".join(parts)


def _handle_greeting(message_lower: str) -> str:
    """Handle greetings."""
    greetings = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon"]
    if any(g in message_lower for g in greetings):
        return (
            "Hey there! Welcome to QuantAcademy! 👋\n\n"
            "I'm your AI trading mentor. I can help you with:\n\n"
            "📊 **Strategy Details** — Tell me about any strategy (Try: 'trend following', 'RSI', 'SMC')\n"
            "❓ **Indicators** — Ask how RSI, MACD, Bollinger Bands etc. work\n"
            "🧠 **Quiz** — Test your knowledge: 'Quiz me about trend following'\n"
            "📈 **Markets** — Ask about Forex, Equities, or Crypto trading\n"
            "👨‍🏫 **Concepts** — Support/resistance, stop losses, risk management\n\n"
            "What would you like to learn about?"
        )
    # Check for thank you
    thanks = ["thank", "thanks", "cheers"]
    if any(t in message_lower for t in thanks):
        return "You're welcome! Keep learning and trading smart. What else would you like to explore?"
    return ""


def _handle_general_question(message_lower: str) -> str:
    """Handle common trading questions."""
    # Best strategy questions
    if "best strategy" in message_lower or "what should i" in message_lower or "how do i start" in message_lower:
        return (
            "Great question! The 'best' strategy depends on your experience, available time, and risk tolerance:\n\n"
            "**Beginner (start here):**\n"
            "- **Trend Following** — Simple, intuitive, follow the market direction\n"
            "- **Support & Resistance** — Foundation of all technical analysis\n"
            "- **Range Trading** — Great for learning price action\n\n"
            "**Intermediate:**\n"
            "- **Fibonacci Retracement** — Precise entry points\n"
            "- **Swing Trading** — Capture multi-day moves without intraday stress\n"
            "- **Bollinger Bands** — Volatility-based entries\n\n"
            "**Advanced:**\n"
            "- **Smart Money Concepts (SMC)** — Institutional order flow\n"
            "- **ICT Method** — Time-based entries\n"
            "- **Elliott Wave** — Wave pattern analysis\n\n"
            "I recommend starting with a strategy you understand conceptually, then practicing it in a simulator. Which one sounds interesting to you?"
        )
    # Risk management
    if "risk management" in message_lower or "position size" in message_lower or "how much to risk" in message_lower:
        return (
            "**Risk management is the #1 skill that separates profitable traders from losers.**\n\n"
            "**The 1% Rule:** Never risk more than 1-2% of your total account on a single trade. If you have a $10,000 account, that's $100-200 max risk per trade.\n\n"
            "**Position Sizing Formula:**\n"
            "Position Size = Account Risk / (Entry - Stop)\n\n"
            "Example: $10,000 account, 1% risk ($100), entry at $50, stop at $48.\n"
            "Position Size = $100 / ($50 - $48) = 50 shares.\n\n"
            "**More rules:**\n"
            "1. Always use a stop loss — every single trade\n"
            "2. Use ATR-based stops for volatility-adjusted positioning\n"
            "3. Never trade without a defined target\n"
            "4. Maximum 3-5 concurrent positions to avoid overexposure\n"
            "5. Set daily loss limits and stick to them\n\n"
            "Want to learn about specific stop loss strategies?"
        )
    # Psychology
    if "psychol" in message_lower or "discipline" in message_lower or "emotional" in message_lower or "stress" in message_lower:
        return (
            "**Trading Psychology: The Hidden Edge**\n\n"
            "Most traders fail not because their strategy is wrong, but because they can't follow it.\n\n"
            "**Common psychological traps:**\n"
            "1. **FOMO** — Jumping in late after a big move, buying at the top\n"
            "2. **Revenge trading** — Increasing size after a loss to 'make it back'\n"
            "3. **Analysis paralysis** — Overthinking and missing valid setups\n"
            "4. **Greed** — Not taking profits when targets are hit\n"
            "5. **Fear** — Not entering valid setups or exiting too early\n\n"
            "**How to fix these:**\n"
            "- Write down your trading plan and **follow it mechanically**\n"
            "- Keep a trading journal to review mistakes\n"
            "- Use predefined entry/exit rules (remove discretion after entering)\n"
            "- Set a maximum daily loss (e.g., 3%) and STOP trading when you hit it\n"
            "- Practice in a simulator before risking real money\n\n"
            "Want to explore a specific strategy to practice?"
        )
    # Difference between strategies
    if "difference" in message_lower:
        strategies = get_all_strategies()
        # Try to identify two strategies being compared
        found: list[dict] = []
        for s in strategies:
            name = s.get("name", "").lower()
            if name.replace(" ", "") in message_lower.replace(" ", "") or any(p in message_lower for p in name.split()):
                found.append(s)
                if len(found) >= 2: break

        if len(found) >= 2:
            a, b = found[0], found[1]
            return (
                f"**{a['name']} vs {b['name']}**\n\n"
                f"**{a['name']}**: {a.get('concept', 'N/A')[:200]}...\n\n"
                f"**{b['name']}**: {b.get('concept', 'N/A')[:200]}...\n\n"
                f"**Key difference:** {a['name']} is in the {a.get('family', 'N/A')} family, "
                f"while {b['name']} is in the {b.get('family', 'N/A')} family.\n\n"
                f"Want detailed breakdowns of either strategy?"
            )
    # Help
    if "help" in message_lower or "what can you" in message_lower or "show me" == message_lower.strip():
        return (
            "Here's what I can help you with:\n\n"
            "1. **Strategy Details** — 'Tell me about trend following', 'Explain SMC'\n"
            "2. **Indicators** — 'How does RSI work?', 'What is MACD?'\n"
            "3. **Quizzes** — 'Quiz me about Fibonacci', 'Test me on range trading'\n"
            "4. **Markets** — 'How does Forex work?', 'Best crypto strategies'\n"
            "5. **Concepts** — 'What is a stop loss?', 'Risk management'\n"
            "6. **Strategy Families** — 'Tell me about SMC strategies', 'Wyckoff methods'\n\n"
            "Just ask naturally — I'll figure out what you mean!"
        )

    return ""


def _build_smart_response(message: str, history: list[dict]) -> str:
    """Generate a rich response without LLM using layered matching."""
    lower = message.strip().lower()

    # 1. Check for quiz requests first (highest priority)
    result = _handle_quiz(lower)
    if result:
        return result

    # 2. Handle greetings
    result = _handle_greeting(lower)
    if result:
        return result

    # 3. Match strategy (exact or strong match)
    strategies = _match_strategy(lower)
    if strategies:
        best = strategies[0]
        score_threshold = 100 if best.get("name", "").lower() in lower else 30
        if strategies[0] and any(t in lower for t in ["tell me", "about", "explain", "how", "what is", "describe"]):
            detail = _handle_strategy_detail(best["slug"])
            if detail:
                return detail

    # 4. If multiple strategies matched, show comparison
    if len(strategies) > 0 and not any(t in lower for t in ["tell me", "about", "explain", "how", "what is"]):
        top = strategies[:3]
        parts: list[str] = []
        for s in top:
            parts.append(f"**{s['name']}** ({s.get('difficulty', '').capitalize()} | {s.get('family', 'N/A')})")
            parts.append(f"  {s.get('concept', 'N/A')}")
            parts.append(f"  Indicators: {', '.join(s.get('indicators', ['N/A']))}")
            parts.append(f"  Risk: {s.get('risk_management', 'N/A')}")
            parts.append("")
        return "Here's what I found:\n\n" + "\n".join(parts) + "Want detailed info on any of these? Just say 'tell me about [strategy name]'!"

    # 5. Check indicator knowledge
    result = _handle_indicator_question(lower)
    if result:
        return result

    # 6. Check family knowledge
    result = _handle_family_question(lower)
    if result:
        return result

    # 7. Check market knowledge
    result = _handle_market_question(lower)
    if result:
        return result

    # 8. Check concept questions
    result = _handle_concept_question(lower)
    if result:
        return result

    # 9. General questions
    result = _handle_general_question(lower)
    if result:
        return result

    # 10. Final fallback
    return (
        "Welcome to QuantAcademy! I'm your AI trading mentor. Here's what I can help with:\n\n"
        "📊 **Strategy Details** — 'Tell me about trend following', 'Explain SMC'\n"
        "❓ **Indicators** — 'How does RSI work?', 'What is MACD?'\n"
        "🧠 **Quizzes** — 'Quiz me about breakout', 'Test me on Fibonacci'\n"
        "📈 **Markets** — 'How does Forex work?', 'Best crypto strategies'\n"
        "👨‍💼 **Concepts** — 'What is support/resistance?', 'Risk management'\n"
        "🔄 **Comparisons** — 'Difference between trend following and mean reversion'\n\n"
        "Try asking naturally — I'll understand! What would you like to learn?"
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def chat(message: str, history: list[dict] | None = None) -> tuple[str, list[str]]:
    """Process a chat message and return (response_text, sources_list)."""
    if history is None:
        history = []

    qa_chain = _init_rag()
    if qa_chain:
        try:
            result = qa_chain({"query": message})
            answer = result.get("result", "")
            sources: list[str] = []
            for doc in result.get("source_documents", []):
                meta = doc.metadata
                src = meta.get("source", meta.get("strategy", "unknown"))
                if src not in sources:
                    sources.append(src)
            return answer, sources
        except Exception:
            pass

    answer = _build_smart_response(message, history)
    return answer, []

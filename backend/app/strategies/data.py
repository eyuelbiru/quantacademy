import json
import os
from typing import Optional

# Path to the strategies JSONL data file
DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "data",
    "strategies.jsonl",
)

_loaded_strategies: list[dict] = []


def _load() -> list[dict]:
    global _loaded_strategies
    if not _loaded_strategies:
        if not os.path.exists(DATA_FILE):
            _loaded_strategies = []
            return _loaded_strategies
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    _loaded_strategies.append(json.loads(line))
    return _loaded_strategies


def get_all_strategies() -> list[dict]:
    """Return all available trading strategies."""
    return _load()


def get_strategy(slug: str) -> Optional[dict]:
    """Return a single strategy by slug, or None if not found."""
    for s in _load():
        if s.get("slug") == slug:
            return s
    return None


def get_quiz(slug: str) -> Optional[list[dict]]:
    """Return quiz questions for a strategy by slug, or None if not found."""
    strategy = get_strategy(slug)
    if strategy and "quiz_questions" in strategy:
        return strategy["quiz_questions"]
    return None


def get_strategies_by_market(market: str) -> list[dict]:
    """Filter strategies by market (e.g., 'forex', 'equities', 'crypto')."""
    return [s for s in _load() if market.lower() in [m.lower() for m in s.get("market", [])]]


def get_strategies_by_difficulty(difficulty: str) -> list[dict]:
    """Filter strategies by difficulty level (e.g., 'beginner', 'intermediate', 'advanced')."""
    return [s for s in _load() if s.get("difficulty", "").lower() == difficulty.lower()]


def get_strategy_families() -> list[str]:
    """Return a list of unique strategy family names."""
    families = set()
    for s in _load():
        family = s.get("family")
        if family:
            families.add(family)
    return sorted(families)


def get_strategies_by_family(family: str) -> list[dict]:
    """Return all strategies in a given family."""
    return [s for s in _load() if s.get("family", "") == family]

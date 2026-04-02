"""Pydantic models for QuantAcademy API schemas."""

from pydantic import BaseModel
from typing import Optional


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str


class StrategyResponse(BaseModel):
    id: int
    name: str
    slug: str
    market: list[str]
    difficulty: str
    concept: str
    indicators: list[str]
    risk_management: str
    family: str
    steps: list[str]
    quiz_questions: list[QuizQuestion]


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []


class QuizRequest(BaseModel):
    strategy_slug: str


class QuizResponse(BaseModel):
    score: int
    total: int
    questions: list[dict]
    answers: list[Optional[int]]


class QuizSubmission(BaseModel):
    """Client's answers for a strategy quiz."""
    strategy_slug: str = ""
    answers: list[Optional[int]] = []


class QuizResult(BaseModel):
    """Scored quiz result."""
    score: int
    total: int
    percentage: float
    passed: bool
    details: list[dict]


class ProgressResponse(BaseModel):
    """User progress data."""
    completed_strategies: list[str] = []
    quiz_scores: dict[str, int] = {}


class ProgressUpdate(BaseModel):
    """Partial progress update from client."""
    strategy_slug: Optional[str] = None
    quiz_score: Optional[int] = None
    action: Optional[str] = None


class StrategyCategory(BaseModel):
    name: str
    count: int
    strategies: list[dict]


class ProgressData(BaseModel):
    completed_strategies: list[str] = []
    quiz_scores: dict[str, int] = {}

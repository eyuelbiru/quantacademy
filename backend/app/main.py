"""FastAPI application for QuantAcademy backend."""

import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    QuizRequest,
    QuizResponse,
)
from app.strategies.data import (
    get_all_strategies,
    get_strategy,
    get_quiz,
    get_strategies_by_market,
    get_strategies_by_difficulty,
    get_strategy_families,
)
from app.chatbot import chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="QuantAcademy API",
    description="Backend API for the QuantAcademy trading education platform",
    version="0.1.0",
)

# CORS – allow the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Strategies – list / filter
# ---------------------------------------------------------------------------
@app.get("/api/strategies")
async def list_strategies(market: str | None = None, difficulty: str | None = None):
    try:
        if market:
            strategies = get_strategies_by_market(market)
        elif difficulty:
            strategies = get_strategies_by_difficulty(difficulty)
        else:
            strategies = get_all_strategies()
        return strategies
    except Exception as e:
        logger.error("Error listing strategies: %s", e)
        return []


@app.get("/api/strategies/families")
async def list_families():
    try:
        families = get_strategy_families()
        groups = []
        for family in families:
            strategies = get_all_strategies()
            matching = [
                {"name": s["name"], "slug": s["slug"], "difficulty": s["difficulty"]}
                for s in strategies
                if s.get("family", "") == family
            ]
            groups.append({"name": family, "count": len(matching), "strategies": matching})
        return groups
    except Exception as e:
        logger.error("Error listing families: %s", e)
        return []


@app.get("/api/strategies/{slug}")
async def get_strategy_detail(slug: str):
    strategy = get_strategy(slug)
    if not strategy:
        raise HTTPException(status_code=404, detail=f"Strategy '{slug}' not found")
    return strategy


# ---------------------------------------------------------------------------
# Chat (REST)
# ---------------------------------------------------------------------------
@app.post("/api/chat", response_model=ChatResponse)
async def chat_rest(request: ChatRequest):
    try:
        response, sources = chat(request.message, request.history)
        return ChatResponse(response=response, sources=sources)
    except Exception as e:
        logger.error("Chat error: %s", e)
        return ChatResponse(
            response="Sorry, I encountered an error processing your message.",
            sources=[],
        )


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------
@app.get("/api/quiz/{slug}", response_model=QuizResponse)
async def quiz_strategy(slug: str):
    questions = get_quiz(slug)
    if not questions:
        raise HTTPException(
            status_code=404,
            detail=f"No quiz available for strategy '{slug}'",
        )

    # Return the questions with empty/None answers for the client to fill
    return QuizResponse(
        score=0,
        total=len(questions),
        questions=questions,
        answers=[None] * len(questions),
    )


# ---------------------------------------------------------------------------
# Chat – streaming (WebSocket)
# ---------------------------------------------------------------------------
@app.websocket("/ws/chat")
async def chat_stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                payload = {"message": data, "history": []}
            message = payload.get("message", data)
            history = payload.get("history", [])

            response, sources = chat(message, history)

            await ws.send_json({
                "response": response,
                "sources": sources,
            })
    except WebSocketDisconnect:
        logger.info("Chat WebSocket disconnected")
    except Exception as e:
        logger.error("WebSocket error: %s", e)
        try:
            await ws.send_json({"error": "An error occurred"})
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Chat – streaming (REST, Server-Sent-Events style)
# ---------------------------------------------------------------------------
@app.post("/api/chat-stream")
async def chat_stream_rest(request: ChatRequest):
    try:
        response, sources = chat(request.message, request.history)
        return ChatResponse(response=response, sources=sources)
    except Exception as e:
        logger.error("Chat-stream error: %s", e)
        return ChatResponse(
            response="Sorry, I encountered an error processing your message.",
            sources=[],
        )

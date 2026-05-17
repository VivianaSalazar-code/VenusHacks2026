"""FastAPI entrypoint for the HeartHealth nutrition backend."""
from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routes.profile import router as profile_router  # noqa: E402
from routes.nutrition import router as nutrition_router  # noqa: E402
from routes.chat import router as chat_router  # noqa: E402

app = FastAPI(
    title="HeartHealth Nutrition API",
    version="0.1.0",
    description="Clinical-grade nutrition advisor with DASH-diet tracking for biological-female cardiovascular health.",
)

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
from fastapi.middleware.cors import CORSMiddleware

# Find where app = FastAPI() is defined, and make sure this block is right below it:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allows ANY frontend port to connect
    allow_credentials=False,  # Must be False when origins is "*"
    allow_methods=["*"],      # Allows all types of requests (GET, POST, OPTIONS)
    allow_headers=["*"],      # Allows all headers
)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "service": "HeartHealth Nutrition API"}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


app.include_router(profile_router, prefix="/api")
app.include_router(nutrition_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

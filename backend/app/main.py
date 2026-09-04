import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import applications, loans, merchants, verifications, scheme_config, billing, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Credence API",
    description="Backend for the Credence government lender officer dashboard",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://credence-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(loans.router)
app.include_router(merchants.router)
app.include_router(verifications.router)
app.include_router(scheme_config.router)
app.include_router(billing.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "credence-api"}





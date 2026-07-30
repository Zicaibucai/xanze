from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

REQUEST_ID_HEADER = "X-Request-ID"
REQUEST_ID_PATTERN = re.compile(r"[^A-Za-z0-9._:-]")

app = FastAPI(
    title="Xanze Agent API",
    version="0.1.0",
    description="阶段 1 Agent 服务骨架；本阶段不开放 Agent 调用。",
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next: Any) -> JSONResponse:
    raw_request_id = request.headers.get(REQUEST_ID_HEADER, "")
    if not raw_request_id or len(raw_request_id) > 128:
        request_id = str(uuid4())
    else:
        request_id = REQUEST_ID_PATTERN.sub("_", raw_request_id)
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers[REQUEST_ID_HEADER] = request_id
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exception: HTTPException) -> JSONResponse:
    return error_response(
        request=request,
        status=exception.status_code,
        code="HTTP_ERROR",
        message=str(exception.detail),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exception: RequestValidationError,
) -> JSONResponse:
    details = {
        ".".join(str(part) for part in error["loc"]): error["msg"]
        for error in exception.errors()
    }
    return error_response(
        request=request,
        status=422,
        code="VALIDATION_FAILED",
        message="请求参数校验失败",
        details=details,
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, _: Exception) -> JSONResponse:
    return error_response(
        request=request,
        status=500,
        code="INTERNAL_ERROR",
        message="服务暂时不可用",
    )


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {
        "status": "UP",
        "service": "xanze-agent",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def error_response(
    request: Request,
    status: int,
    code: str,
    message: str,
    details: dict[str, str] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "request_id": getattr(request.state, "request_id", str(uuid4())),
            "code": code,
            "message": message,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )

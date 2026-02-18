from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import pandas as pd
import io
import os
from typing import Optional

# Azure Blob Storage
from azure.storage.blob import BlobServiceClient

app = FastAPI(
    title="CSV / Excel File Reader API",
    description="Read CSV or Excel files from **Azure Blob Storage** or a **direct file upload**.",
    version="1.0.0",
)

# ── Azure Blob config (set via environment variables) ──────────────────────────
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_CONTAINER_NAME    = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "data-files")


# ── Shared helpers ─────────────────────────────────────────────────────────────

def parse_file_bytes(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse CSV or Excel bytes into a DataFrame."""
    ext = os.path.splitext(filename)[-1].lower()
    buffer = io.BytesIO(file_bytes)

    if ext in (".xlsx", ".xls"):
        return pd.read_excel(buffer)
    elif ext == ".csv":
        return pd.read_csv(buffer)
    else:
        # Graceful fallback – try CSV
        try:
            return pd.read_csv(buffer)
        except Exception:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{ext}'. Accepted: .csv, .xlsx, .xls",
            )


def read_from_blob(blob_path: str) -> tuple[bytes, str]:
    """Download a blob and return (raw bytes, filename)."""
    if not AZURE_CONNECTION_STRING:
        raise HTTPException(
            status_code=500,
            detail=(
                "Azure Storage connection string is not configured. "
                "Set the AZURE_STORAGE_CONNECTION_STRING environment variable."
            ),
        )
    try:
        service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        blob_client    = service_client.get_blob_client(
            container=AZURE_CONTAINER_NAME, blob=blob_path
        )
        data     = blob_client.download_blob().readall()
        filename = os.path.basename(blob_path)
        return data, filename
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Could not retrieve '{blob_path}' from blob storage: {exc}",
        )


def df_to_payload(df: pd.DataFrame) -> dict:
    """Serialise a DataFrame to a JSON-safe dict."""
    df = df.where(pd.notnull(df), None)   # NaN → null
    return {
        "total_records": len(df),
        "columns":       df.columns.tolist(),
        "data":          df.to_dict(orient="records"),
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    """Simple liveness check."""
    return {"status": "ok"}


# ── Route 1 : Blob Storage ─────────────────────────────────────────────────────
@app.post(
    "/api/read-file/blob",
    tags=["File Reader"],
    summary="Read file from Azure Blob Storage",
    description=(
        "Pass the **blob file path** as a form field "
        "(e.g. `reports/errors/sampleErrorData.xlsx`). "
        "The file is fetched from the configured Azure Blob container and parsed."
    ),
)
async def read_file_from_blob(
    file_path: str = Form(
        ...,
        description="Path of the file inside the Azure Blob container.",
        example="reports/sampleErrorData.xlsx",
    ),
):
    file_bytes, filename = read_from_blob(file_path)
    df = parse_file_bytes(file_bytes, filename)
    return JSONResponse(content={
        "source":    "blob_storage",
        "file_path": file_path,
        **df_to_payload(df),
    })


# ── Route 2 : Direct File Upload ───────────────────────────────────────────────
@app.post(
    "/api/read-file/upload",
    tags=["File Reader"],
    summary="Read an uploaded CSV / Excel file",
    description=(
        "Upload a `.csv`, `.xlsx`, or `.xls` file directly as **multipart/form-data**. "
        "The file is parsed in memory and all rows are returned as JSON."
    ),
)
async def read_file_from_upload(
    file: UploadFile = File(
        ...,
        description="CSV or Excel file to parse (.csv / .xlsx / .xls).",
    ),
):
    file_bytes = await file.read()
    df = parse_file_bytes(file_bytes, file.filename)
    return JSONResponse(content={
        "source":    "upload",
        "filename":  file.filename,
        **df_to_payload(df),
    })

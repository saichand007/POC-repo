from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import io
import os
from typing import List, Any, Dict, Optional

# Azure Blob Storage
from azure.storage.blob import BlobServiceClient

app = FastAPI(
    title="CSV / Excel File Reader & Updater API",
    description="Read, update, and write back CSV or Excel files via Azure Blob Storage or direct upload.",
    version="2.0.0",
)

# ── Azure Blob config (set via environment variables) ──────────────────────────
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_CONTAINER_NAME    = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "data-files")

STATUS_COL       = "status"
STATUS_APPROVED  = "AI Approved"
STATUS_CORRECTED = "Corrected"
ROW_ID_COL       = "rowid"           # expected key in each UI payload object


# ── Pydantic models ────────────────────────────────────────────────────────────

class UpdateRequest(BaseModel):
    """
    Payload sent by the UI to update rows.

    ┌─ Mode 1 (Blob) ─────────────────────────────────────────────────────────┐
    │ Provide `file_path` → file is read from blob, edits applied,           │
    │ status column added, and the file is written back to blob storage.     │
    └─────────────────────────────────────────────────────────────────────────┘
    ┌─ Mode 2 (In-memory / no blob) ──────────────────────────────────────────┐
    │ Omit `file_path` → a brand-new CSV is generated in memory              │
    │ directly from the `updates` array. Every row gets status = AI Approved │
    │ (there is nothing to compare against, so nothing is "Corrected").      │
    └─────────────────────────────────────────────────────────────────────────┘

    Example – blob mode:
    {
        "file_path": "reports/sampleErrorData.xlsx",
        "updates": [
            { "rowid": 0, "Ticker": "AAPL", "CCY": "USD" },
            { "rowid": 1, "Error_type": "Fixed" }
        ]
    }

    Example – in-memory mode (no file_path):
    {
        "updates": [
            { "rowid": 0, "Ticker": "AAPL",  "CCY": "USD", "Error_type": "Missing" },
            { "rowid": 1, "Ticker": "MSFT",  "CCY": "GBP", "Error_type": "Mismatch" }
        ]
    }
    """
    file_path: Optional[str] = None
    updates: List[Dict[str, Any]]


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
        try:
            return pd.read_csv(buffer)
        except Exception:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{ext}'. Accepted: .csv, .xlsx, .xls",
            )


def get_blob_client(blob_path: str):
    if not AZURE_CONNECTION_STRING:
        raise HTTPException(
            status_code=500,
            detail="Azure Storage connection string is not configured. Set AZURE_STORAGE_CONNECTION_STRING.",
        )
    service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    return service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=blob_path)


def read_from_blob(blob_path: str) -> tuple[bytes, str]:
    try:
        data     = get_blob_client(blob_path).download_blob().readall()
        filename = os.path.basename(blob_path)
        return data, filename
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Could not retrieve '{blob_path}': {exc}")


def write_to_blob(blob_path: str, file_bytes: bytes) -> None:
    try:
        get_blob_client(blob_path).upload_blob(file_bytes, overwrite=True)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to write to blob storage: {exc}")


def df_to_bytes(df: pd.DataFrame, filename: str) -> bytes:
    ext = os.path.splitext(filename)[-1].lower()
    buffer = io.BytesIO()
    if ext in (".xlsx", ".xls"):
        df.to_excel(buffer, index=False)
    else:
        df.to_csv(buffer, index=False)
    buffer.seek(0)
    return buffer.read()


def df_to_payload(df: pd.DataFrame) -> dict:
    df = df.where(pd.notnull(df), None)
    return {
        "total_records": len(df),
        "columns":       df.columns.tolist(),
        "data":          df.to_dict(orient="records"),
    }


def build_df_from_updates(updates: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Build a brand-new DataFrame from the updates array when no file_path is provided.
    - Strips 'rowid' from the data columns.
    - Adds status = 'AI Approved' to every row (nothing to compare against).
    """
    if not updates:
        raise HTTPException(status_code=422, detail="'updates' array is empty — nothing to generate.")

    rows = []
    for obj in updates:
        if ROW_ID_COL not in obj:
            raise HTTPException(
                status_code=422,
                detail=f"Every update object must contain a '{ROW_ID_COL}' key.",
            )
        row = {k: v for k, v in obj.items() if k != ROW_ID_COL and k != STATUS_COL}
        row[STATUS_COL] = STATUS_APPROVED    # No original to compare → always AI Approved
        rows.append(row)

    return pd.DataFrame(rows)


def apply_updates_and_status(df: pd.DataFrame, updates: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Apply UI row edits to an existing DataFrame and compute the 'status' column.

    Rules:
    - Each object MUST have a 'rowid' key (0-based integer).
    - All other keys are column → new_value pairs.
    - If ANY value differs from the original → status = 'Corrected'.
    - Rows not in the update list → status = 'AI Approved'.
    """
    update_map: Dict[int, Dict[str, Any]] = {}
    for obj in updates:
        if ROW_ID_COL not in obj:
            raise HTTPException(
                status_code=422,
                detail=f"Every update object must contain a '{ROW_ID_COL}' key.",
            )
        row_id = int(obj[ROW_ID_COL])
        update_map[row_id] = {k: v for k, v in obj.items() if k != ROW_ID_COL}

    # Default every row to AI Approved
    df[STATUS_COL] = STATUS_APPROVED

    for row_id, col_updates in update_map.items():
        if row_id not in df.index:
            raise HTTPException(
                status_code=422,
                detail=f"rowid {row_id} does not exist (valid range: 0–{len(df) - 1}).",
            )
        is_corrected = False
        for col, new_val in col_updates.items():
            if col in (STATUS_COL,):
                continue                      # Protect the status column
            if col not in df.columns:
                continue                      # Skip unknown columns silently
            current_val = df.at[row_id, col]
            if str(current_val).strip() != str(new_val).strip():
                df.at[row_id, col] = new_val
                is_corrected = True
        if is_corrected:
            df.at[row_id, STATUS_COL] = STATUS_CORRECTED

    return df


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── Route 1 : Read from Blob ───────────────────────────────────────────────────
@app.post(
    "/api/read-file/blob",
    tags=["File Reader"],
    summary="Read file from Azure Blob Storage",
)
async def read_file_from_blob(
    file_path: str = Form(..., example="reports/sampleErrorData.xlsx"),
):
    file_bytes, filename = read_from_blob(file_path)
    df = parse_file_bytes(file_bytes, filename)
    return JSONResponse(content={"source": "blob_storage", "file_path": file_path, **df_to_payload(df)})


# ── Route 2 : Direct File Upload ───────────────────────────────────────────────
@app.post(
    "/api/read-file/upload",
    tags=["File Reader"],
    summary="Read an uploaded CSV / Excel file",
)
async def read_file_from_upload(
    file: UploadFile = File(..., description="CSV or Excel file (.csv / .xlsx / .xls)"),
):
    file_bytes = await file.read()
    df = parse_file_bytes(file_bytes, file.filename)
    return JSONResponse(content={"source": "upload", "filename": file.filename, **df_to_payload(df)})


# ── Route 3 : Update rows → status column → optional blob write ────────────────
@app.put(
    "/api/update-file",
    tags=["File Updater"],
    summary="Apply row edits, add status column, and optionally save to Blob Storage",
    description="""
Apply row edits from the UI and compute a `status` column automatically.

---

### Mode 1 — Blob file (provide `file_path`)
- File is downloaded from Azure Blob Storage.
- Each row is compared against its **original value** in the file.
- Changed rows → `"Corrected"` | Unchanged rows → `"AI Approved"`.
- Updated file is written back to blob storage.

### Mode 2 — In-memory / no blob (omit `file_path`)
- No file is read; a **fresh CSV is built** directly from the `updates` array.
- All rows get `"AI Approved"` (nothing to compare against).
- The generated CSV is returned in the response as a downloadable base64 string.

---

### Status column logic
| Scenario | status |
|---|---|
| Row value(s) changed | `Corrected` |
| Row unchanged or not in update list | `AI Approved` |

---

### Request body examples

**Blob mode:**
```json
{
  "file_path": "reports/sampleErrorData.xlsx",
  "updates": [
    { "rowid": 0, "Ticker": "AAPL", "CCY": "USD" },
    { "rowid": 1, "Error_type": "Fixed value" }
  ]
}
```

**In-memory mode (no file_path):**
```json
{
  "updates": [
    { "rowid": 0, "Ticker": "AAPL", "CCY": "USD",  "Error_type": "Missing" },
    { "rowid": 1, "Ticker": "MSFT", "CCY": "GBP",  "Error_type": "Mismatch" }
  ]
}
```
""",
)
async def update_file(request: UpdateRequest):

    # ── Mode 2: No file_path → generate CSV from updates array ────────────────
    if not request.file_path:
        df = build_df_from_updates(request.updates)

        # Convert to CSV and encode as base64 so the UI can trigger a download
        csv_buffer = io.BytesIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        import base64
        csv_b64 = base64.b64encode(csv_buffer.read()).decode("utf-8")

        return JSONResponse(content={
            "source":      "generated",
            "message":     "CSV generated from provided data (no blob file path given).",
            "csv_base64":  csv_b64,          # UI can use this to download the file
            **df_to_payload(df),
        })

    # ── Mode 1: file_path provided → read from blob, apply edits, write back ──
    file_bytes, filename = read_from_blob(request.file_path)
    df = parse_file_bytes(file_bytes, filename)
    df = apply_updates_and_status(df, request.updates)

    updated_bytes = df_to_bytes(df, filename)
    write_to_blob(request.file_path, updated_bytes)

    return JSONResponse(content={
        "source":    "blob_storage",
        "message":   "File updated successfully in blob storage.",
        "file_path": request.file_path,
        **df_to_payload(df),
    })

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any, Optional
import pandas as pd
import io
import os
from azure.storage.blob import BlobServiceClient

app = FastAPI(title="CSV Correction API")

# Azure Blob Storage connection string from environment variable
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")


class CorrectionRow(BaseModel):
    rowId: int
    # Allow any additional columns dynamically
    model_config = {"extra": "allow"}


class ProcessCSVRequest(BaseModel):
    container_name: Optional[str] = None
    file_path: Optional[str] = None
    corrections: list[CorrectionRow]


def build_df_from_corrections(corrections: list[CorrectionRow]) -> pd.DataFrame:
    """
    When no blob source is provided, construct a DataFrame purely from the
    corrections payload. Each correction becomes one row; rowId is preserved
    as a column and all extra fields become columns.
    """
    if not corrections:
        raise HTTPException(status_code=400, detail="No corrections provided and no file source specified.")

    rows = []
    for correction in corrections:
        row = {"rowId": correction.rowId}
        row.update(correction.model_extra or {})
        rows.append(row)

    # Ensure consistent column ordering: rowId first, then all other columns
    all_cols = ["rowId"] + sorted({k for r in rows for k in r if k != "rowId"})
    df = pd.DataFrame(rows, columns=all_cols).set_index("rowId").reset_index()
    # Re-index to 0-based so userstatus logic works uniformly
    df.index = df["rowId"]
    return df


@app.post("/process-csv", summary="Download CSV from Blob Storage, apply corrections, and return updated CSV")
async def process_csv(request: ProcessCSVRequest):
    """
    Two modes depending on whether `container_name` + `file_path` are supplied:

    **Mode 1 – Blob source provided:**
    Downloads the CSV from Azure Blob Storage, applies corrections to the
    matching rows, adds `userstatus`, and returns the updated file.

    **Mode 2 – No blob source (container_name / file_path omitted or null):**
    Builds a brand-new CSV directly from the `corrections` array. Every row
    in the payload becomes a row in the output; `userstatus` is set to
    `"User Corrected"` for all of them since they are all explicitly supplied.

    **corrections** format:
    ```json
    [
      { "rowId": 0, "CCY": "USD" },
      { "rowId": 2, "TICKER": "124GF" }
    ]
    ```
    """
    has_source = bool(request.container_name and request.file_path)

    if has_source:
        # --- Download from Azure Blob Storage ---
        try:
            blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
            blob_client = blob_service_client.get_blob_client(
                container=request.container_name,
                blob=request.file_path
            )
            blob_data = blob_client.download_blob().readall()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to download blob: {str(e)}")

        # --- Parse CSV ---
        try:
            df = pd.read_csv(io.BytesIO(blob_data))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

        # --- Apply corrections to existing rows ---
        corrected_row_ids = set()

        for correction in request.corrections:
            row_id = correction.rowId

            if row_id < 0 or row_id >= len(df):
                raise HTTPException(
                    status_code=400,
                    detail=f"rowId {row_id} is out of range. CSV has {len(df)} rows (0-indexed)."
                )

            extra_fields = correction.model_extra or {}

            for col, value in extra_fields.items():
                if col not in df.columns:
                    df[col] = ""
                df.at[row_id, col] = value

            corrected_row_ids.add(row_id)

        # --- Add userstatus column ---
        df["userstatus"] = df.index.map(
            lambda i: "User Corrected" if i in corrected_row_ids else "AI Approved"
        )

        filename = os.path.basename(request.file_path).replace(".csv", "_corrected.csv")

    else:
        # --- No blob source: generate CSV from corrections payload ---
        df = build_df_from_corrections(request.corrections)

        # All rows are explicitly provided by the user → "User Corrected"
        df["userstatus"] = "User Corrected"

        filename = "corrections_export.csv"

    # --- Stream CSV response ---
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/health")
async def health():
    return {"status": "ok"}

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
    container_name: str
    file_path: str
    corrections: list[CorrectionRow]


@app.post("/process-csv", summary="Download CSV from Blob Storage, apply corrections, and return updated CSV")
async def process_csv(request: ProcessCSVRequest):
    """
    Downloads a CSV file from Azure Blob Storage, applies user corrections to specified rows,
    adds a 'userstatus' column, and returns the updated CSV for download.

    - **container_name**: Azure Blob Storage container name
    - **file_path**: Path to the CSV file within the container
    - **corrections**: List of row corrections. Each object must include `rowId` plus
      any column-value pairs to update (e.g. `{"rowId": 0, "CCY": "USD"}`).
      Rows with corrections get `userstatus = "User Corrected"`, all others get `"AI Approved"`.
    """
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

    # --- Build a set of corrected row IDs ---
    corrected_row_ids = set()

    for correction in request.corrections:
        row_id = correction.rowId

        if row_id < 0 or row_id >= len(df):
            raise HTTPException(
                status_code=400,
                detail=f"rowId {row_id} is out of range. CSV has {len(df)} rows (0-indexed)."
            )

        # Get all extra fields beyond rowId
        extra_fields = correction.model_extra or {}

        if not extra_fields:
            # No column updates, but still mark as corrected
            corrected_row_ids.add(row_id)
            continue

        for col, value in extra_fields.items():
            if col not in df.columns:
                # Add new column if it doesn't exist, fill with empty string
                df[col] = ""
            df.at[row_id, col] = value

        corrected_row_ids.add(row_id)

    # --- Add userstatus column ---
    df["userstatus"] = df.index.map(
        lambda i: "User Corrected" if i in corrected_row_ids else "AI Approved"
    )

    # --- Return as downloadable CSV ---
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    filename = os.path.basename(request.file_path).replace(".csv", "_corrected.csv")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/health")
async def health():
    return {"status": "ok"}

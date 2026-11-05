"""
Image upload router.
Accepts multipart/form-data with a file field named "file".
Uploads it directly to the Supabase Storage bucket using the service-role key
(bypassing RLS) and returns the public URL.
"""
import os
import logging
import mimetypes
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from backend.app.core.security import get_current_user
from backend.app.models.all_models import Profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/images", tags=["Image Upload"])

BUCKET_NAME = "quotation-images"

# Allowed MIME types
ALLOWED_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "image/gif", "image/bmp", "image/tiff"
}
MAX_FILE_SIZE_MB = 10


def _get_supabase_client():
    """Return a supabase-py client using the service-role key (bypasses RLS)."""
    try:
        from supabase import create_client, Client
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment")
        return create_client(url, key)
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="supabase-py is not installed. Run: pip install supabase"
        )


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Query("kleanmaxpro", description="Sub-folder inside the bucket"),
    current_user: Profile = Depends(get_current_user),
):
    """
    Upload an image file to Supabase Storage and return the public URL.
    """
    # Validate MIME type
    content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Allowed: {', '.join(ALLOWED_TYPES)}"
        )

    # Read bytes
    contents = await file.read()

    # Validate file size
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large: {size_mb:.1f} MB. Maximum allowed is {MAX_FILE_SIZE_MB} MB."
        )

    # Build a unique path in the bucket
    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    import time, random, string
    rand_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    dest_path = f"{folder.strip('/')}/{int(time.time())}_{rand_part}{ext}"

    try:
        sb = _get_supabase_client()
        response = sb.storage.from_(BUCKET_NAME).upload(
            path=dest_path,
            file=contents,
            file_options={"content-type": content_type, "upsert": "true"},
        )
        # Get public URL
        url_resp = sb.storage.from_(BUCKET_NAME).get_public_url(dest_path)
        public_url = url_resp if isinstance(url_resp, str) else str(url_resp)
        logger.info(f"Image uploaded by {current_user.email}: {public_url}")
        return {"url": public_url, "path": dest_path, "bucket": BUCKET_NAME}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Supabase upload error: {exc}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(exc)}")


@router.delete("/delete")
def delete_image(
    path: str = Query(..., description="Storage path inside the bucket (e.g. kleanmaxpro/xxx.jpg)"),
    current_user: Profile = Depends(get_current_user),
):
    """Delete an image from Supabase Storage by its bucket path."""
    try:
        sb = _get_supabase_client()
        sb.storage.from_(BUCKET_NAME).remove([path])
        return {"message": "Image deleted", "path": path}
    except Exception as exc:
        logger.exception(f"Supabase delete error: {exc}")
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(exc)}")


from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import require_roles
from backend.app.models.all_models import AuditLog, Profile
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

class AuditLogResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    action: str
    performed_by_name: Optional[str] = None
    changes_json: Optional[dict] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin", "manager"]))
):
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    results = []
    for log in logs:
        res = AuditLogResponse(
            id=str(log.id),
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            action=log.action,
            performed_by_name=log.performed_by.full_name if log.performed_by else "System",
            changes_json=log.changes_json,
            ip_address=log.ip_address,
            timestamp=log.timestamp
        )
        results.append(res)
    return results

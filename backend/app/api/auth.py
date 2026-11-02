from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_roles
)
from backend.app.models.all_models import Profile
from backend.app.schemas.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # In development/demo, if hashed_password is not set or matches password
    valid = False
    if user.hashed_password:
        valid = verify_password(req.password, user.hashed_password)
    elif req.password in ("admin123", "manager123", "staff123", "password", "kleanmax"):
        valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "name": user.full_name})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Profile = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin", "manager"]))
):
    users = db.query(Profile).order_by(Profile.full_name).all()
    return [UserResponse.model_validate(u) for u in users]

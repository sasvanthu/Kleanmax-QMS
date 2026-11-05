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

COMPANY_ACCOUNTS = {
    "superadmin": {
        "passwords": ["superadmin", "admin123"],
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "superadmin@kleanmaxpro.com",
        "full_name": "Super Admin",
        "role": "admin",
        "company_code": "all",
    },
    "admin": {
        "passwords": ["superadmin", "admin123"],
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "admin@kleanmaxpro.com",
        "full_name": "Super Admin",
        "role": "admin",
        "company_code": "all",
    },
    "kleanmaxpro": {
        "passwords": ["kleanmaxpro"],
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "kleanmaxpro@kleanmaxpro.com",
        "full_name": "Klean Max Pro Staff",
        "role": "staff",
        "company_code": "kleanmaxpro",
    },
    "kleanmax": {
        "passwords": ["kleanmax"],
        "id": "33333333-3333-3333-3333-333333333333",
        "email": "kleanmax@kleanmax.com",
        "full_name": "Kleanmax Staff",
        "role": "staff",
        "company_code": "kleanmax",
    },
    "uniquepainters": {
        "passwords": ["uniquepainters"],
        "id": "44444444-4444-4444-4444-444444444444",
        "email": "uniquepainters@uniquepainters.com",
        "full_name": "Unique Painters Staff",
        "role": "staff",
        "company_code": "uniquepainters",
    },
    "cleantech": {
        "passwords": ["cleantech"],
        "id": "55555555-5555-5555-5555-555555555555",
        "email": "cleantech@cleantech.com",
        "full_name": "Cleantech Staff",
        "role": "staff",
        "company_code": "cleantech",
    },
}


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    input_str = req.email.lower().strip()

    # 1. Match company or superadmin accounts
    matched_acc = None
    for key, acc in COMPANY_ACCOUNTS.items():
        if input_str == key or input_str == acc["email"].lower():
            matched_acc = acc
            break

    if matched_acc:
        if req.password not in matched_acc["passwords"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = db.query(Profile).filter(Profile.email == matched_acc["email"]).first()
        if not user:
            user = db.query(Profile).filter(Profile.id == matched_acc["id"]).first()

        if not user:
            user = Profile(
                id=matched_acc["id"],
                email=matched_acc["email"],
                full_name=matched_acc["full_name"],
                role=matched_acc["role"],
                company_code=matched_acc["company_code"],
                hashed_password=get_password_hash(req.password),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.company_code = matched_acc["company_code"]
            db.commit()

        access_token = create_access_token(data={
            "sub": user.email,
            "role": user.role,
            "name": user.full_name,
            "company_code": matched_acc["company_code"]
        })
        user_resp = UserResponse.model_validate(user)
        user_resp.company_code = matched_acc["company_code"]
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_resp
        )

    # 2. Regular DB profile lookup fallback
    user = db.query(Profile).filter(Profile.email == input_str).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    valid = False
    if user.hashed_password:
        valid = verify_password(req.password, user.hashed_password)
    elif req.password in ("admin123", "manager123", "staff123", "password", "superadmin", "kleanmax"):
        valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    access_token = create_access_token(data={
        "sub": user.email,
        "role": user.role,
        "name": user.full_name,
        "company_code": user.company_code
    })
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

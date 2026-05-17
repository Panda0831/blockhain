from typing import Generator, List
from fastapi import Depends, HTTPException, status, Header
from src.db.session import SessionLocal
from src.db.models import User
from sqlalchemy.orm import Session

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_current_user(public_key: str = Header(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.public_key == public_key).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non authentifié",
        )
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé pour ce rôle"
            )
        return user

# routers/projects.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, models
from database import get_db
from utils.auth import get_current_user # Ensure this points to your actual auth utility

router = APIRouter(tags=["Projects"])

@router.post("/", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new project linked to the logged-in user."""
    new_proj = models.Project(
        user_id=current_user.id,
        **project.dict()
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return new_proj

@router.get("/", response_model=list[schemas.ProjectOut])
def list_user_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Return only the projects created by the logged-in user."""
    return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()
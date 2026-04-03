from pydantic import BaseModel
from typing import List, Optional
from app.models.academic_model import Question

class AcademicAnalysisSchema(BaseModel):
    document_title: str
    summary: str
    main_objectives: List[str] = []
    main_ideas: List[str] = []
    key_points: List[str] = []
    insights: List[str] = []
    conclusions: Optional[str] = ""
    authors: List[str] = []
    questions: List[Question] = []
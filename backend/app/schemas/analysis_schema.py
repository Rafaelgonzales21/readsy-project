# Esquemas de Pydantic para validar entrada y salida de la API

from pydantic import BaseModel
from typing import List

class QuestionSchema(BaseModel):
    number: int
    q_type: str
    difficulty: str
    question: str
    suggested_answer: str

class AcademicAnalysisSchema(BaseModel):
    document_tittle: str
    document_type: str
    authors: str
    summary: str
    main_ideas: List[str]
    key_concepts: List[str]
    conclusions: str
    questions: List[QuestionSchema]

    class Config:
        orm_mode = True
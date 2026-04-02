from dataclasses import dataclass
from typing import List, Any

@dataclass
class Question:
    number: int
    type: str
    difficulty: str
    question: str
    suggested_answer: str

@dataclass
class AcademicAnalysis:
    document_tittle: str
    document_type: str
    authors: str
    summary: str
    main_objectives: List[str]
    key_concepts: List[str]
    conclusions: str
    questions: List[Question]
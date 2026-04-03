from dataclasses import dataclass
from typing import List, Any

@dataclass
class Question:
    number: int
    q_type: str
    difficulty: str
    question: str
    suggested_answer: str

@dataclass
class AcademicAnalysis:
    document_title: str
    summary: str
    main_ideas: List[str]
    main_objectives: List[str]
    key_points: List[str]
    insights: str
    conclusions: str
    authors: List[str]
    questions: List[Question]
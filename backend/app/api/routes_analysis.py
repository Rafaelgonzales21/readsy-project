# Rutas relacionadas con el análisis académico

from fastapi import APIRouter, UploadFile, File, Form
from services.pdf_processor import extract_text_from_pdf
from services.academic_evaluator import evaluate_document
from schemas.analysis_schema import AcademicAnalysisSchema

router = APIRouter()

@router.post("/analize", response_model=AcademicAnalysisSchema)
async def analyze_document(
    pdf: UploadFile = File(...),
    depth: str = Form(...),
    questions: int = Form(...)
):
    
    file_bytes = await pdf.read()
    extracted_text = extract_text_from_pdf(file_bytes)

    if extracted_text.startswith("Error"):
        return AcademicAnalysisSchema(
           document_title="Error",
            document_type="Unknown",
            authors="",
            summary=extracted_text,
            main_ideas=[],
            key_concepts=[],
            conclusions="",
            questions=[] 
        )
    
    analysis = evaluate_document(extracted_text, depth, questions)

    return AcademicAnalysisSchema(
        document_title=analysis.document_title,
        document_type=analysis.document_type,
        authors=analysis.authors,
        summary=analysis.summary,
        main_ideas=analysis.main_ideas,
        key_concepts=analysis.key_concepts,
        conclusions=analysis.conclusions,
        questions=[
            {
                "number": q.number,
                "q_type": q.q_type,
                "difficulty": q.difficulty,
                "question": q.question,
                "suggested_answer": q.suggested_answer
            }
            for q in analysis.questions
        ]
    )
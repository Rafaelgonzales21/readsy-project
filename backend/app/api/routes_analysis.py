# Rutas relacionadas con el análisis académico

from fastapi import APIRouter, UploadFile, File, Form
from app.services.pdf_processor import extract_text_from_pdf
from app.services.academic_evaluator import evaluate_document
from app.schemas.analysis_schema import AcademicAnalysisSchema

router = APIRouter()

@router.post("/analyze", response_model=AcademicAnalysisSchema)
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
    summary=analysis.summary,
    main_objectives=analysis.main_objectives,
    main_ideas=analysis.main_ideas,
    key_points=analysis.key_points,
    insights=analysis.insights,
    conclusions=analysis.conclusions,
    authors=analysis.authors,
    questions=analysis.questions
)
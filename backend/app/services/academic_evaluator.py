import os
import json
from dotenv import load_dotenv
from groq import Groq
from app.models.academic_model import AcademicAnalysis, Question

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def safe_json_loads(text: str):
    """
    Intenta cargar JSON. Si falla, intenta reparar el texto.
    """
    try:
        return json.loads(text)
    except:
        # Intento de reparación básica
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            cleaned = text[start:end]
            return json.loads(cleaned)
        except:
            raise ValueError("Groq no devolvió JSON válido:\n" + text)


def evaluate_document(text: str, depth: str, num_questions: int, pdf_title: str) -> AcademicAnalysis:
    """
    Evalúa un documento académico usando Groq y devuelve un análisis estructurado.
    """

    prompt = f"""
    Eres un evaluador académico experto. Analiza el siguiente documento:

    --- CONTENIDO DEL DOCUMENTO ---
    {text}
    -------------------------------

    Nivel de profundidad: {depth}
    Número de preguntas: {num_questions}

    Proporciona la salida ESTRICTAMENTE en JSON válido con la siguiente estructura:

    {{
        "summary": "...",
        "main_objectives": ["...", "..."],
        "main_ideas": ["...", "..."],
        "key_points": ["...", "..."],
        "insights": ["...", "..."],
        "questions": [
            {{
                "number": 1,
                "q_type": "comprehension",
                "difficulty": "medium",
                "question": "...",
                "suggested_answer": "..."
            }}
        ]
    }}

    REGLAS:
    - No añadas explicaciones.
    - No utilices markdown.
    - No incluyas texto antes o después del JSON.
    - Devuelve únicamente JSON VÁLIDO.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Eres un evaluador académico experto."},
            {"role": "user", "content": prompt}
        ],
    temperature=0.3,
    )

    raw_output = response.choices[0].message.content

    # Intentar cargar JSON de forma segura
    data = safe_json_loads(raw_output)

    # Construcción de preguntas
    questions = [
        Question(
            number=q.get("number", 0),
            q_type=q.get("q_type", ""),
            difficulty=q.get("difficulty", ""),
            question=q.get("question", ""),
            suggested_answer=q.get("suggested_answer", "")
        )
        for q in data.get("questions", [])
    ]


    # Construcción del análisis final
    return AcademicAnalysis(
        document_title=pdf_title,
        summary=data.get("summary", ""),
        main_objectives=data.get("main_objectives", []),
        main_ideas=data.get("main_ideas", []),
        key_points=data.get("key_points", []),
        insights=data.get("insights", []),
        conclusions=data.get("conclusions", ""),
        authors=data.get("authors", []),
        questions=questions
    )